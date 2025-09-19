import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ClassAverage } from '@/lib/models/mongodb';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

interface ProgressRecord {
  id: string;
  student_id: string;
  class_id: string;
  school_id: string;
  subject: string;
  marks: number;
  max_marks: number;
  assessment_date: string;
}

interface ClassroomInfo {
  id: string;
  name: string;
  school_id: string;
  schools: {
    name: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers and head teachers can calculate averages
    if (!['teacher', 'head_teacher'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const supabase = await createClient();

    // Get all progress records from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: progressRecords, error: progressError } = await supabase
      .from('progress')
      .select('*')
      .gte('assessment_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('assessment_date', { ascending: false });

    if (progressError) {
      throw new Error(`Failed to fetch progress: ${progressError.message}`);
    }

    // Get classroom information
    const { data: classrooms, error: classroomError } = await supabase
      .from('classrooms')
      .select(`
        id,
        name,
        school_id,
        schools:school_id (
          name
        )
      `);

    if (classroomError) {
      throw new Error(`Failed to fetch classrooms: ${classroomError.message}`);
    }

    // Create a map of classroom info
    const classroomMap = new Map<string, ClassroomInfo>();
    classrooms?.forEach((classroom: any) => {
      classroomMap.set(classroom.id, classroom);
    });

    // Group progress by class and subject
    const classSubjectGroups = new Map<string, ProgressRecord[]>();

    progressRecords?.forEach((record: any) => {
      const key = `${record.class_id}_${record.subject}`;
      if (!classSubjectGroups.has(key)) {
        classSubjectGroups.set(key, []);
      }
      classSubjectGroups.get(key)!.push(record);
    });

    const currentPeriod = new Date().toISOString().split('T')[0].substring(0, 7); // YYYY-MM format
    let classesProcessed = 0;

    // Calculate averages for each class-subject combination
    for (const [key, records] of classSubjectGroups) {
      const [classId, subject] = key.split('_');
      const classroom = classroomMap.get(classId);

      if (!classroom) continue;

      // Calculate average score
      const totalMarks = records.reduce((sum, record) => {
        return sum + (record.marks / record.max_marks) * 100;
      }, 0);
      
      const averageScore = totalMarks / records.length;
      const uniqueStudents = new Set(records.map(r => r.student_id)).size;

      // Check if we already have an average for this period
      const existingAverage = await ClassAverage.findOne({
        class_id: classId,
        subject: subject,
        assessment_period: currentPeriod,
      });

      const averageData = {
        class_id: classId,
        class_name: classroom.name,
        school_id: classroom.school_id,
        school_name: classroom.schools.name,
        subject: subject,
        average_score: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
        total_students: uniqueStudents,
        assessment_period: currentPeriod,
        calculated_at: new Date(),
      };

      if (existingAverage) {
        // Update existing record
        await ClassAverage.findByIdAndUpdate(existingAverage._id, averageData);
      } else {
        // Create new record
        await ClassAverage.create(averageData);
      }

      classesProcessed++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully calculated averages for ${classesProcessed} class-subject combinations`,
      classesProcessed,
      period: currentPeriod,
    });

  } catch (error) {
    console.error('Error calculating averages:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
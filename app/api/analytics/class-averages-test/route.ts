import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-safe';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all classrooms with schools
    const { data: classrooms } = await supabase
      .from('classrooms')
      .select(`
        id,
        name,
        school_id,
        schools:school_id (
          name
        )
      `);

    const results = [];

    // Calculate averages for each classroom
    for (const classroom of classrooms || []) {
      // Get all progress records for this classroom
      const { data: progress } = await supabase
        .from('progress')
        .select(`
          marks,
          max_marks,
          subject,
          student_id
        `)
        .eq('class_id', classroom.id);

      if (!progress || progress.length === 0) {
        continue;
      }

      // Group by subject and calculate averages
      const subjectGroups = progress.reduce((acc: any, record) => {
        if (!acc[record.subject]) {
          acc[record.subject] = {
            totalMarks: 0,
            totalMaxMarks: 0,
            assessmentCount: 0,
            students: new Set()
          };
        }
        
        acc[record.subject].totalMarks += record.marks;
        acc[record.subject].totalMaxMarks += record.max_marks;
        acc[record.subject].assessmentCount += 1;
        acc[record.subject].students.add(record.student_id);
        
        return acc;
      }, {});

      // Create class average records for each subject
      for (const [subject, data] of Object.entries(subjectGroups)) {
        const subjectData = data as any;
        const averageScore = (subjectData.totalMarks / subjectData.totalMaxMarks) * 100;

        const classAverage = {
          _id: `${classroom.id}-${subject}`,
          classId: classroom.id,
          className: classroom.name,
          schoolId: classroom.school_id,
          schoolName: (classroom.schools as any)?.name || 'Unknown School',
          subject: subject,
          averageScore: parseFloat(averageScore.toFixed(2)),
          totalStudents: subjectData.students.size,
          totalAssessments: subjectData.assessmentCount,
          lastUpdated: new Date().toISOString(),
          calculatedBy: 'test-mode'
        };

        results.push(classAverage);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      userRole: user.role,
      appliedFilters: {},
      mode: 'test-without-mongodb'
    });

  } catch (error) {
    console.error('Error calculating test averages:', error);
    return NextResponse.json(
      { error: 'Failed to calculate test averages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // For testing, just return the GET response
  return GET(request);
}
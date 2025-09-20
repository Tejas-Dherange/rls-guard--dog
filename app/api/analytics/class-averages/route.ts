import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb/connection';
import ClassAverage from '@/lib/mongodb/models/ClassAverage';
import { getCurrentUser } from '@/lib/auth-safe';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const schoolId = searchParams.get('schoolId');
    const subject = searchParams.get('subject');

    const query: Record<string, unknown> = {};

    // Apply filters based on user role and query parameters
    if (user.role === 'teacher') {
      // Teachers can only see averages for their classes
      // Note: We should validate that the teacher actually teaches these classes
      if (classId) {
        query.classId = classId;
      }
    } else if (user.role === 'head_teacher') {
      // Head teachers can see all data
      if (classId) query.classId = classId;
      if (schoolId) query.schoolId = schoolId;
    } else {
      // Students cannot access class averages
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (subject) {
      query.subject = subject;
    }

    const averages = await ClassAverage.find(query)
      .sort({ lastUpdated: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: averages,
      count: averages.length,
      userRole: user.role,
      appliedFilters: query
    });

  } catch (error) {
    console.error('Error fetching class averages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class averages' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !['teacher', 'head_teacher'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate averages directly without Edge Function as fallback
    console.log('Guard Dog: Calculating class averages directly from API...');
    
    try {
      // Try Edge Function first
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        const response = await fetch(`${supabaseUrl}/functions/v1/calculate-class-averages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ triggeredBy: user.id, userRole: user.role })
        });

        if (response.ok) {
          const result = await response.json();
          return NextResponse.json({
            success: true,
            message: 'Class averages calculation triggered via Edge Function',
            method: 'edge-function',
            edgeFunctionResult: result
          });
        }
      }
    } catch {
      console.log('Edge Function not available, using direct calculation...');
    }

    // Fallback: Calculate directly
    await connectMongoDB();
    const { createClient } = await import('@/lib/supabase/server');
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

    console.log(`Found ${classrooms?.length || 0} classrooms to process`);

    const results = [];

    // Calculate averages for each classroom
    for (const classroom of classrooms || []) {
      console.log(`Processing classroom: ${classroom.name}`);

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
        console.log(`No progress records found for ${classroom.name}`);
        continue;
      }

      // Group by subject and calculate averages
      const subjectGroups = progress.reduce((acc: Record<string, { totalMarks: number; totalMaxMarks: number; count: number; assessmentCount: number; students: Set<string> }>, record) => {
        if (!acc[record.subject]) {
          acc[record.subject] = {
            totalMarks: 0,
            totalMaxMarks: 0,
            count: 0,
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
        const subjectData = data as { totalMarks: number; totalMaxMarks: number; count: number; assessmentCount: number; students: Set<string> };
        const averageScore = (subjectData.totalMarks / subjectData.totalMaxMarks) * 100;

        const classAverage = {
          classId: classroom.id,
          className: classroom.name,
          schoolId: classroom.school_id,
          schoolName: (classroom.schools as { name: string }[] | undefined)?.[0]?.name || 'Unknown School',
          subject: subject,
          averageScore: parseFloat(averageScore.toFixed(2)),
          totalStudents: subjectData.students.size,
          totalAssessments: subjectData.assessmentCount,
          lastUpdated: new Date(),
          calculatedBy: 'api-direct'
        };

        results.push(classAverage);
        console.log(`${classroom.name} - ${subject}: ${averageScore.toFixed(1)}% (${subjectData.students.size} students, ${subjectData.assessmentCount} assessments)`);
      }
    }

    // Save to MongoDB
    if (results.length > 0) {
      await ClassAverage.deleteMany({});
      await ClassAverage.insertMany(results);
      console.log(`Saved ${results.length} class average records to MongoDB`);
    }

    return NextResponse.json({
      success: true,
      message: 'Class averages calculated successfully (direct method)',
      method: 'api-direct',
      classroomsProcessed: classrooms?.length || 0,
      averagesCalculated: results.length,
      results: results
    });

  } catch (error) {
    console.error('Error calculating class averages:', error);
    return NextResponse.json(
      { error: 'Failed to calculate class averages: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
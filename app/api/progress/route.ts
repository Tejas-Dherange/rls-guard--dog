import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth-safe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user || !['teacher', 'head_teacher'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    
    const studentId = formData.get('student_id') as string;
    const classId = formData.get('class_id') as string;
    const subject = formData.get('subject') as string;
    const marks = parseFloat(formData.get('marks') as string);
    const maxMarks = parseFloat(formData.get('max_marks') as string);
    const assessmentDate = formData.get('assessment_date') as string;

    if (!studentId || !classId || !subject || isNaN(marks) || isNaN(maxMarks) || !assessmentDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get school_id from the classroom
    const { data: classroom } = await supabase
      .from('classrooms')
      .select('school_id')
      .eq('id', classId)
      .single();

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Insert progress record (RLS will ensure teacher can only add for their students)
    const { data, error } = await supabase
      .from('progress')
      .insert({
        student_id: studentId,
        class_id: classId,
        school_id: classroom.school_id,
        subject,
        marks,
        max_marks: maxMarks,
        assessment_date: assessmentDate
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding progress:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Progress record added successfully',
      data: data,
      redirect: '/teacher?success=progress_added'
    });
  } catch (error) {
    console.error('Error in progress API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
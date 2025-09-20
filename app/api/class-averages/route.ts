import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { ClassAverage } from '@/lib/models/mongodb';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers and head teachers can view averages
    if (!['teacher', 'head_teacher'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('class_id');
    const schoolId = searchParams.get('school_id');
    const subject = searchParams.get('subject');

    // Build query
    const query: Record<string, string> = {};
    
    if (classId) {
      query.class_id = classId;
    }
    
    if (schoolId) {
      query.school_id = schoolId;
    }
    
    if (subject) {
      query.subject = subject;
    }

    // If user is a teacher, restrict to their classes only
    if (user.role === 'teacher') {
      // This would require additional logic to get teacher's classes
      // For now, we'll allow teachers to see all averages
      // In production, you'd want to join with Supabase data to filter
    }

    const averages = await ClassAverage.find(query)
      .sort({ calculated_at: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      averages,
      count: averages.length,
    });

  } catch (error) {
    console.error('Error fetching class averages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
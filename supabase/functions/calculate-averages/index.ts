import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mongodbUri = Deno.env.get('MONGODB_URI')!;

    if (!supabaseUrl || !supabaseServiceKey || !mongodbUri) {
      throw new Error('Missing required environment variables');
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['teacher', 'head_teacher'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get progress records from the last 30 days
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
    const averagesToInsert = [];

    // Calculate averages for each class-subject combination
    for (const [key, records] of classSubjectGroups) {
      const [classId, subject] = key.split('_');
      const classroom = classroomMap.get(classId);

      if (!classroom) continue;

      // Calculate average score
      const totalMarks = records.reduce((sum: number, record: ProgressRecord) => {
        return sum + (record.marks / record.max_marks) * 100;
      }, 0);
      
      const averageScore = totalMarks / records.length;
      const uniqueStudents = new Set(records.map(r => r.student_id)).size;

      averagesToInsert.push({
        class_id: classId,
        class_name: classroom.name,
        school_id: classroom.school_id,
        school_name: classroom.schools.name,
        subject: subject,
        average_score: Math.round(averageScore * 100) / 100,
        total_students: uniqueStudents,
        assessment_period: currentPeriod,
        calculated_at: new Date(),
      });
    }

    // Connect to MongoDB and insert/update averages
    if (averagesToInsert.length > 0) {
      // For the Edge Function, we'll make an HTTP request to our Next.js API
      // since Deno doesn't have native MongoDB driver support that's as mature
      const response = await fetch(`${req.url.split('/functions/')[0]}/api/calculate-averages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ data: averagesToInsert }),
      });

      if (!response.ok) {
        throw new Error('Failed to save averages to MongoDB');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully calculated averages for ${averagesToInsert.length} class-subject combinations`,
        classesProcessed: averagesToInsert.length,
        period: currentPeriod,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in calculate-averages function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
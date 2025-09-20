import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClassAverage {
  classId: string
  className: string
  schoolId: string
  schoolName: string
  subject: string
  averageScore: number
  totalStudents: number
  totalAssessments: number
  lastUpdated: Date
  calculatedBy: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Connect to MongoDB
    const mongoClient = new MongoClient()
    await mongoClient.connect(Deno.env.get('MONGODB_URI') ?? '')
    const db = mongoClient.database('guard_dog_analytics')
    const classAveragesCollection = db.collection<ClassAverage>('class_averages')

    console.log('Guard Dog: Starting class averages calculation...')

    // Get all classrooms with their schools
    const { data: classrooms, error: classroomsError } = await supabaseClient
      .from('classrooms')
      .select(`
        id,
        name,
        school_id,
        schools:school_id (
          name
        )
      `)

    if (classroomsError) {
      throw new Error(`Failed to fetch classrooms: ${classroomsError.message}`)
    }

    console.log(`Found ${classrooms?.length || 0} classrooms to process`)

    const results: ClassAverage[] = []

    // Calculate averages for each classroom
    for (const classroom of classrooms || []) {
      console.log(`Processing classroom: ${classroom.name}`)

      // Get all progress records for this classroom, grouped by subject
      const { data: progress, error: progressError } = await supabaseClient
        .from('progress')
        .select(`
          marks,
          max_marks,
          subject,
          student_id,
          students:student_id (
            id,
            name
          )
        `)
        .eq('class_id', classroom.id)

      if (progressError) {
        console.error(`Error fetching progress for ${classroom.name}:`, progressError)
        continue
      }

      if (!progress || progress.length === 0) {
        console.log(`No progress records found for ${classroom.name}`)
        continue
      }

      // Group by subject and calculate averages
      const subjectGroups = progress.reduce((acc: any, record) => {
        if (!acc[record.subject]) {
          acc[record.subject] = {
            totalMarks: 0,
            totalMaxMarks: 0,
            assessmentCount: 0,
            students: new Set()
          }
        }
        
        acc[record.subject].totalMarks += record.marks
        acc[record.subject].totalMaxMarks += record.max_marks
        acc[record.subject].assessmentCount += 1
        acc[record.subject].students.add(record.student_id)
        
        return acc
      }, {})

      // Create class average records for each subject
      for (const [subject, data] of Object.entries(subjectGroups)) {
        const subjectData = data as any
        const averageScore = (subjectData.totalMarks / subjectData.totalMaxMarks) * 100

        const classAverage: ClassAverage = {
          classId: classroom.id,
          className: classroom.name,
          schoolId: classroom.school_id,
          schoolName: classroom.schools?.name || 'Unknown School',
          subject: subject,
          averageScore: parseFloat(averageScore.toFixed(2)),
          totalStudents: subjectData.students.size,
          totalAssessments: subjectData.assessmentCount,
          lastUpdated: new Date(),
          calculatedBy: 'edge-function'
        }

        results.push(classAverage)

        console.log(`${classroom.name} - ${subject}: ${averageScore.toFixed(1)}% (${subjectData.students.size} students, ${subjectData.assessmentCount} assessments)`)
      }
    }

    // Save to MongoDB
    if (results.length > 0) {
      // Clear existing records and insert new ones
      await classAveragesCollection.deleteMany({})
      await classAveragesCollection.insertMany(results)
      
      console.log(`Saved ${results.length} class average records to MongoDB`)
    }

    // Close MongoDB connection
    await mongoClient.close()

    const summary = {
      success: true,
      message: 'Guard Dog: Class averages calculated successfully',
      classroomsProcessed: classrooms?.length || 0,
      averagesCalculated: results.length,
      timestamp: new Date().toISOString(),
      results: results
    }

    console.log('Class averages calculation completed!')

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in calculate-class-averages function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
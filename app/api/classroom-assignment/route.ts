import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { classroomId, teacherId } = await request.json()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is head teacher
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'head_teacher') {
      return NextResponse.json({ error: 'Forbidden - Head teacher access required' }, { status: 403 })
    }

    // Update classroom assignment
    const { error } = await supabase
      .from('classrooms')
      .update({ teacher_id: teacherId })
      .eq('id', classroomId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to assign classroom' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const classroomId = searchParams.get('classroomId')

    if (!classroomId) {
      return NextResponse.json({ error: 'Classroom ID required' }, { status: 400 })
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is head teacher
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'head_teacher') {
      return NextResponse.json({ error: 'Forbidden - Head teacher access required' }, { status: 403 })
    }

    // Unassign classroom
    const { error } = await supabase
      .from('classrooms')
      .update({ teacher_id: null })
      .eq('id', classroomId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to unassign classroom' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
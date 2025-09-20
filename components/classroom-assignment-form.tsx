'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface Teacher {
  id: string
  full_name: string
  email: string
}

interface Classroom {
  id: string
  name: string
  grade_level: number
  school_id: string
  teacher_id: string | null
  teacher?: {
    full_name: string
    email: string
  }
  school?: {
    name: string
  }
}

interface ClassroomAssignmentFormProps {
  classrooms: Classroom[]
  teachers: Teacher[]
}

export function ClassroomAssignmentForm({ classrooms, teachers }: ClassroomAssignmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassroom || !selectedTeacher) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('classrooms')
        .update({ teacher_id: selectedTeacher })
        .eq('id', selectedClassroom)

      if (error) {
        console.error('Error assigning classroom:', error)
        alert('Error assigning classroom. Please try again.')
      } else {
        alert('Classroom assigned successfully!')
        setSelectedClassroom('')
        setSelectedTeacher('')
        router.refresh()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error assigning classroom. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnassign = async (classroomId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('classrooms')
        .update({ teacher_id: null })
        .eq('id', classroomId)

      if (error) {
        console.error('Error unassigning classroom:', error)
        alert('Error unassigning classroom. Please try again.')
      } else {
        alert('Classroom unassigned successfully!')
        router.refresh()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error unassigning classroom. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Assignment Form */}
      <form onSubmit={handleAssignment} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="classroom" className="block text-sm font-medium mb-2">
              Select Classroom
            </label>
            <select
              id="classroom"
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a classroom...</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name} (Grade {classroom.grade_level}) - {classroom.school?.name}
                  {classroom.teacher ? ` - Currently: ${classroom.teacher.full_name}` : ' - Unassigned'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="teacher" className="block text-sm font-medium mb-2">
              Select Teacher
            </label>
            <select
              id="teacher"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a teacher...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name} ({teacher.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit" disabled={loading || !selectedClassroom || !selectedTeacher}>
          {loading ? 'Assigning...' : 'Assign Classroom'}
        </Button>
      </form>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Quickly unassign classrooms or bulk operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {classrooms
              .filter(classroom => classroom.teacher_id)
              .map((classroom) => (
                <div key={classroom.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{classroom.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      → {classroom.teacher?.full_name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnassign(classroom.id)}
                    disabled={loading}
                  >
                    Unassign
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
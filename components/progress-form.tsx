"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  student_number: string;
}

interface ProgressFormProps {
  classId: string;
  schoolId: string;
  students: Student[];
}

export function ProgressForm({ classId, schoolId, students }: ProgressFormProps) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [marks, setMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('progress')
        .insert({
          student_id: selectedStudent,
          class_id: classId,
          school_id: schoolId,
          subject,
          marks: parseFloat(marks),
          max_marks: parseFloat(maxMarks),
          assessment_date: assessmentDate,
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Progress record added successfully!' });
      
      // Reset form
      setSelectedStudent('');
      setSubject('');
      setMarks('');
      setMaxMarks('100');
      setAssessmentDate(new Date().toISOString().split('T')[0]);
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error adding progress:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Progress Record</CardTitle>
        <CardDescription>Record student assessment results</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <select
                id="student"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                required
                aria-label="Select student"
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.student_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Science"
                required
              />
            </div>

            <div>
              <Label htmlFor="marks">Marks Obtained</Label>
              <Input
                id="marks"
                type="number"
                min="0"
                step="0.01"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="maxMarks">Maximum Marks</Label>
              <Input
                id="maxMarks"
                type="number"
                min="0"
                step="0.01"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                placeholder="100"
                required
              />
            </div>

            <div>
              <Label htmlFor="assessmentDate">Assessment Date</Label>
              <Input
                id="assessmentDate"
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                required
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? 'Adding...' : 'Add Progress Record'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
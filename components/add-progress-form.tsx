"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Student {
  id: string;
  name: string;
  student_number: string;
  [key: string]: unknown;
}

interface Classroom {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface AddProgressFormProps {
  students: Student[];
  classrooms: Classroom[];
}

export function AddProgressForm({ students, classrooms }: AddProgressFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Success - redirect to refresh the page
        window.location.href = '/teacher?success=progress_added';
      } else {
        // Error - show error message
        alert('Error: ' + (result.error || 'Failed to add progress record'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error: Failed to submit form');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="student_id">Student *</Label>
          <select id="student_id" name="student_id" required className="w-full p-2 border rounded" title="Select a student to add assessment for">
            <option value="">Select a student</option>
            {students.map((student: Student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.student_number})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="class_id">Classroom *</Label>
          <select id="class_id" name="class_id" required className="w-full p-2 border rounded" title="Select the classroom for this assessment">
            <option value="">Select a classroom</option>
            {classrooms.map((classroom: Classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Input id="subject" name="subject" required placeholder="e.g., Mathematics" />
        </div>
        
        <div>
          <Label htmlFor="marks">Marks Scored *</Label>
          <Input id="marks" name="marks" type="number" step="0.1" min="0" required placeholder="85.5" />
        </div>
        
        <div>
          <Label htmlFor="max_marks">Max Marks *</Label>
          <Input id="max_marks" name="max_marks" type="number" step="0.1" min="0" required placeholder="100" defaultValue="100" />
        </div>
      </div>
      
      <div>
        <Label htmlFor="assessment_date">Assessment Date *</Label>
        <Input id="assessment_date" name="assessment_date" type="date" required />
      </div>
      
      <Button type="submit" className="w-full">
        Add Assessment Record
      </Button>
    </form>
  );
}
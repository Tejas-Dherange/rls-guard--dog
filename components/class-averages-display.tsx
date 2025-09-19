"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ClassAverage {
  _id: string;
  class_id: string;
  class_name: string;
  school_id: string;
  school_name: string;
  subject: string;
  average_score: number;
  total_students: number;
  assessment_period: string;
  calculated_at: string;
}

export function ClassAveragesDisplay() {
  const [averages, setAverages] = useState<ClassAverage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAverages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/class-averages');
      if (!response.ok) throw new Error('Failed to fetch averages');
      
      const data = await response.json();
      setAverages(data.averages || []);
    } catch (error) {
      console.error('Error fetching averages:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load class averages' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverages = async () => {
    setIsCalculating(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/calculate-averages', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to calculate averages');
      
      const data = await response.json();
      setMessage({ 
        type: 'success', 
        text: `Successfully calculated averages for ${data.classesProcessed || 0} classes` 
      });
      
      // Refresh the averages display
      await fetchAverages();
    } catch (error) {
      console.error('Error calculating averages:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to calculate averages' 
      });
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    fetchAverages();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Class Averages</CardTitle>
            <CardDescription>
              View calculated class averages stored in MongoDB
            </CardDescription>
          </div>
          <Button 
            onClick={calculateAverages} 
            disabled={isCalculating}
            className="ml-4"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Averages'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {message && (
          <div className={`p-3 rounded-md mb-4 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading class averages...</p>
          </div>
        ) : averages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No class averages calculated yet. Click "Calculate Averages" to generate data.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {averages.map((average) => (
                <div key={average._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{average.class_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {average.school_name}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {average.subject}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-lg font-bold text-blue-600">
                        {average.average_score.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="text-lg font-bold">
                        {average.total_students}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Period</p>
                      <p className="text-sm">
                        {average.assessment_period}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Calculated</p>
                      <p className="text-sm">
                        {new Date(average.calculated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                onClick={fetchAverages} 
                variant="outline" 
                size="sm"
              >
                Refresh Data
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
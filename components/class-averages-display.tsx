"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart3, TrendingUp, Users, BookOpen, RefreshCw } from 'lucide-react';

interface ClassAverage {
  _id: string;
  classId: string;
  className: string;
  schoolId: string;
  schoolName: string;
  subject: string;
  averageScore: number;
  totalStudents: number;
  totalAssessments: number;
  lastUpdated: string;
  calculatedBy: string;
}

interface ClassAveragesData {
  success: boolean;
  data: ClassAverage[];
  count: number;
  userRole: string;
  appliedFilters: Record<string, unknown>;
}

export function ClassAveragesDisplay() {
  const [averages, setAverages] = useState<ClassAverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchAverages = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Try MongoDB version first, fallback to test version
      let response = await fetch('/api/analytics/class-averages');
      let data: ClassAveragesData = await response.json();
      
      // If MongoDB version fails, try test version
      if (!data.success || data.data.length === 0) {
        console.log('Trying test version without MongoDB...');
        response = await fetch('/api/analytics/class-averages-test');
        data = await response.json();
      }
      
      if (data.success) {
        setAverages(data.data);
        if (data.data.length > 0) {
          setLastUpdated(data.data[0].lastUpdated);
        }
      } else {
        setError('Failed to fetch class averages');
      }
    } catch (err) {
      setError('Error fetching class averages');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const triggerCalculation = async () => {
    try {
      setCalculating(true);
      setError(null);
      
      // Try MongoDB version first, fallback to test version
      let response = await fetch('/api/analytics/class-averages', {
        method: 'POST',
      });
      
      let result = await response.json();
      
      // If MongoDB version fails, try test version
      if (!result.success) {
        console.log('Trying test calculation without MongoDB...');
        response = await fetch('/api/analytics/class-averages-test', {
          method: 'POST',
        });
        result = await response.json();
      }
      
      if (result.success) {
        // Wait a moment then refresh the data
        setTimeout(() => {
          fetchAverages(true);
        }, 1000);
      } else {
        setError('Failed to trigger calculation: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      setError('Error triggering calculation');
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    fetchAverages();
  }, []);

  // Group averages by class and calculate overall statistics
interface ClassGroupData {
  className: string;
  schoolName: string;
  subjects: ClassAverage[];
  totalStudents: number;
  totalAssessments: number;
  overallAverage: number;
}

  const groupedByClass = averages.reduce((acc: Record<string, ClassGroupData>, avg) => {
    if (!acc[avg.classId]) {
      acc[avg.classId] = {
        className: avg.className,
        schoolName: avg.schoolName,
        subjects: [],
        totalStudents: avg.totalStudents,
        totalAssessments: 0,
        overallAverage: 0
      };
    }
    
    acc[avg.classId].subjects.push(avg);
    acc[avg.classId].totalAssessments += avg.totalAssessments;
    
    return acc;
  }, {});

  // Calculate overall averages for each class
  Object.keys(groupedByClass).forEach(classId => {
    const classData = groupedByClass[classId];
    const totalScore = classData.subjects.reduce((sum: number, subject: ClassAverage) => 
      sum + subject.averageScore, 0);
    classData.overallAverage = totalScore / classData.subjects.length;
  });

  const totalClasses = Object.keys(groupedByClass).length;
  const totalStudents = averages.reduce((sum, avg) => sum + avg.totalStudents, 0);
  const totalAssessments = averages.reduce((sum, avg) => sum + avg.totalAssessments, 0);
  const overallSystemAverage = averages.length > 0 
    ? averages.reduce((sum, avg) => sum + avg.averageScore, 0) / averages.length 
    : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading analytics...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Class Analytics (MongoDB + Edge Functions)
            </CardTitle>
            <CardDescription>
              Performance analytics powered by Supabase Edge Functions and MongoDB
              {lastUpdated && (
                <span className="block mt-1 text-xs">
                  Last calculated: {new Date(lastUpdated).toLocaleString()}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => fetchAverages(true)} 
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button 
              onClick={triggerCalculation} 
              disabled={calculating}
              className="flex items-center gap-2"
            >
              {calculating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {calculating ? 'Calculating...' : 'Recalculate'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600 flex items-center gap-2">
              Error: {error}
            </p>
          </CardContent>
        </Card>
      )}

      {averages.length === 0 && !loading ? (
        <Card>
          <CardContent className="text-center p-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground mb-4">
              Add some progress records and click &quot;Recalculate&quot; to generate analytics.
            </p>
            <Button onClick={triggerCalculation} disabled={calculating}>
              {calculating ? 'Calculating...' : 'Generate Analytics'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalClasses}</p>
                <p className="text-sm text-muted-foreground">With analytics</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total enrolled</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Assessments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalAssessments}</p>
                <p className="text-sm text-muted-foreground">Total recorded</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  System Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{overallSystemAverage.toFixed(1)}%</p>
                <Badge variant={overallSystemAverage >= 80 ? "default" : "secondary"}>
                  {overallSystemAverage >= 80 ? "Excellent" : overallSystemAverage >= 70 ? "Good" : "Needs Improvement"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Class Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Class Performance Breakdown</h3>
            {Object.entries(groupedByClass).map(([classId, classData]: [string, ClassGroupData]) => (
              <Card key={classId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {classData.className}
                    </span>
                    <Badge variant={classData.overallAverage >= 80 ? "default" : "secondary"}>
                      {classData.overallAverage.toFixed(1)}% Overall
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {classData.schoolName} • {classData.totalStudents} students • {classData.totalAssessments} total assessments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classData.subjects.map((subject: ClassAverage) => (
                      <div key={subject._id} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">{subject.subject}</h4>
                          <Badge variant={subject.averageScore >= 80 ? "default" : "secondary"}>
                            {subject.averageScore.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Students:</span>
                            <span className="font-medium">{subject.totalStudents}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Assessments:</span>
                            <span className="font-medium">{subject.totalAssessments}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Updated:</span>
                            <span className="font-medium">{new Date(subject.lastUpdated).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Source:</span>
                            <Badge variant="outline" className="text-xs">
                              {subject.calculatedBy}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
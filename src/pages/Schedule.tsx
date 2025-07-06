
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Grid3X3, List, Download, Sparkles } from 'lucide-react';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { ScheduleCalendar } from '@/components/ScheduleCalendar';
import { OptimizationPanel } from '@/components/OptimizationPanel';

const Schedule = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    // Simulate optimization process
    setTimeout(() => {
      setIsOptimizing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Schedule Optimizer
            </h1>
            <p className="text-xl text-gray-600">
              View and optimize your class schedules
            </p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Schedule
            </Button>
            <Button 
              onClick={handleOptimize} 
              disabled={isOptimizing}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4" />
              {isOptimizing ? 'Optimizing...' : 'Optimize Schedule'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Optimization Panel */}
          <div className="xl:col-span-1">
            <OptimizationPanel isOptimizing={isOptimizing} />
          </div>

          {/* Schedule Views */}
          <div className="xl:col-span-3">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Current Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="grid" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="grid" className="flex items-center gap-2">
                      <Grid3X3 className="w-4 h-4" />
                      Grid View
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Calendar
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <List className="w-4 h-4" />
                      List View
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="grid">
                    <ScheduleGrid />
                  </TabsContent>
                  <TabsContent value="calendar">
                    <ScheduleCalendar />
                  </TabsContent>
                  <TabsContent value="list">
                    <div className="text-center py-12 text-gray-500">
                      List view coming soon...
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;

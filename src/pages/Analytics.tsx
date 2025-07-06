
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Clock, Target } from 'lucide-react';
import { AttendanceChart } from '@/components/AttendanceChart';
import { ClassPerformanceChart } from '@/components/ClassPerformanceChart';
import { HeatmapChart } from '@/components/HeatmapChart';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Deep insights into your class performance and attendance patterns
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Attendance</p>
                  <p className="text-3xl font-bold">2,847</p>
                  <p className="text-blue-100 text-xs">+12% from last month</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Average Utilization</p>
                  <p className="text-3xl font-bold">78%</p>
                  <p className="text-green-100 text-xs">+5% from last month</p>
                </div>
                <Target className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Peak Hours</p>
                  <p className="text-3xl font-bold">6-8 PM</p>
                  <p className="text-purple-100 text-xs">Highest demand</p>
                </div>
                <Clock className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Growth Rate</p>
                  <p className="text-3xl font-bold">+18%</p>
                  <p className="text-orange-100 text-xs">Month over month</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">Attendance Trends</TabsTrigger>
            <TabsTrigger value="performance">Class Performance</TabsTrigger>
            <TabsTrigger value="heatmap">Time Heatmap</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
                <CardDescription>
                  Weekly attendance patterns over the last 3 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceChart />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
                <CardDescription>
                  Compare performance across different class types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClassPerformanceChart />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="heatmap">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Time & Day Heatmap</CardTitle>
                <CardDescription>
                  Visualize demand patterns by time of day and day of week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapChart />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;

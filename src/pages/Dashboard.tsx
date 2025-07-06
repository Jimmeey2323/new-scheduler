
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Calendar, BarChart3, Settings, Building2 } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { StatsCards } from '@/components/StatsCards';
import { QuickActions } from '@/components/QuickActions';

const Dashboard = () => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ClassOptimizer Pro
          </h1>
          <p className="text-xl text-gray-600">
            Transform your class schedules with data-driven optimization
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions onUploadClick={() => setShowUpload(true)} />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Schedule Performance Overview
                </CardTitle>
                <CardDescription>
                  Key insights from your recent scheduling data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">Yoga Classes</p>
                      <p className="text-sm text-green-600">85% average attendance</p>
                    </div>
                    <div className="text-2xl font-bold text-green-700">↗ 12%</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-blue-800">HIIT Training</p>
                      <p className="text-sm text-blue-600">92% average attendance</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">↗ 8%</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-orange-800">Pilates</p>
                      <p className="text-sm text-orange-600">67% average attendance</p>
                    </div>
                    <div className="text-2xl font-bold text-orange-700">↘ 5%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* File Upload Modal */}
        {showUpload && (
          <FileUpload onClose={() => setShowUpload(false)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

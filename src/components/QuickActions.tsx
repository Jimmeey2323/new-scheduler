
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Sparkles, FileText, Settings } from 'lucide-react';

interface QuickActionsProps {
  onUploadClick: () => void;
}

export const QuickActions = ({ onUploadClick }: QuickActionsProps) => {
  const actions = [
    {
      title: 'Upload Data',
      description: 'Import your class attendance data',
      icon: Upload,
      onClick: onUploadClick,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Optimize Schedule',
      description: 'Generate optimized class schedule',
      icon: Sparkles,
      onClick: () => {},
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Generate Report',
      description: 'Create performance report',
      icon: FileText,
      onClick: () => {},
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Configure Rules',
      description: 'Set optimization parameters',
      icon: Settings,
      onClick: () => {},
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to get you started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              onClick={action.onClick}
              variant="outline"
              className="w-full h-auto p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

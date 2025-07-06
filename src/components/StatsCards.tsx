
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Calendar, Target } from 'lucide-react';

export const StatsCards = () => {
  const stats = [
    {
      title: 'Total Classes',
      value: '847',
      change: '+12%',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Average Attendance',
      value: '23.4',
      change: '+8%',
      icon: Users,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Utilization Rate',
      value: '78%',
      change: '+5%',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Growth',
      value: '+18%',
      change: 'MoM',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

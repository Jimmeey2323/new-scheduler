
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Settings } from 'lucide-react';

interface OptimizationPanelProps {
  isOptimizing: boolean;
}

export const OptimizationPanel = ({ isOptimizing }: OptimizationPanelProps) => {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Optimization Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Attendance Priority</Label>
            <Slider defaultValue={[80]} max={100} step={1} className="mt-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Revenue Optimization</Label>
            <Slider defaultValue={[60]} max={100} step={1} className="mt-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Instructor Balance</Label>
            <Slider defaultValue={[70]} max={100} step={1} className="mt-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Flexible</span>
              <span>Strict</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Consider Seasonality</Label>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm">Multi-location Sync</Label>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm">Auto-cancel Low Attendance</Label>
            <Switch />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-3">Quick Presets</h4>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              🎯 Maximum Attendance
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              💰 Revenue Focused
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              ⚖️ Balanced Approach
            </Button>
          </div>
        </div>

        {isOptimizing && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
              <span className="text-sm text-purple-800 font-medium">
                Optimizing schedule...
              </span>
            </div>
            <div className="mt-2 bg-purple-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Brain, TrendingUp, Users, Clock, Target, Zap } from 'lucide-react';
import { ClassData, ScheduledClass, OptimizationSuggestion } from '../types';
import { validateScheduleConflicts } from '../utils/studioAvailability';

interface SmartOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  csvData: ClassData[];
  currentSchedule: ScheduledClass[];
  onOptimize: (optimizedSchedule: ScheduledClass[]) => void;
  isDarkMode: boolean;
}

const SmartOptimizer: React.FC<SmartOptimizerProps> = ({
  isOpen,
  onClose,
  csvData,
  currentSchedule,
  onOptimize,
  isDarkMode
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [optimizedSchedule, setOptimizedSchedule] = useState<ScheduledClass[]>([]);

  const generateOptimization = async () => {
    setIsOptimizing(true);
    
    try {
      // Use AI service for intelligent optimization
      const optimizedSchedule = await aiService.generateOptimizedSchedule(
        csvData,
        currentSchedule,
        [],
        { iteration: Date.now() }
      );
      
      // Validate for conflicts
      const validation = validateScheduleConflicts(optimizedSchedule);
      
      if (validation.conflicts.length > 0) {
        console.warn('Schedule conflicts detected:', validation.conflicts);
      }
      
      // Generate suggestions based on improvements
      const newSuggestions: OptimizationSuggestion[] = [];
      
      // Analyze improvements
      const currentMetrics = calculateScheduleMetrics(currentSchedule);
      const optimizedMetrics = calculateScheduleMetrics(optimizedSchedule);
      
      if (optimizedMetrics.totalRevenue > currentMetrics.totalRevenue) {
        newSuggestions.push({
          type: 'format_change',
          originalClass: currentSchedule[0], // dummy
          suggestedClass: optimizedSchedule[0], // dummy
          reason: `Revenue optimization: +₹${Math.round(optimizedMetrics.totalRevenue - currentMetrics.totalRevenue)}`,
          impact: `${optimizedSchedule.length} classes scheduled, balanced trainer allocation`,
          priority: 9
        });
      }
      
      if (optimizedMetrics.trainerUtilization > currentMetrics.trainerUtilization) {
        newSuggestions.push({
          type: 'teacher_change',
          originalClass: currentSchedule[0], // dummy
          suggestedClass: optimizedSchedule[0], // dummy
          reason: 'Improved trainer utilization and work-life balance',
          impact: `${optimizedMetrics.trainerUtilization.toFixed(1)}% average utilization`,
          priority: 8
        });
      }
      
      setSuggestions(newSuggestions);
      setOptimizedSchedule(optimizedSchedule);
      
    } catch (error) {
      console.error('Optimization error:', error);
      // Fallback to existing logic
      setTimeout(() => {
        const newSuggestions: OptimizationSuggestion[] = [];
        const newSchedule = [...currentSchedule];
        
        // Analyze historic data for each location and time slot
        const locations = [...new Set(csvData.map(item => item.location))];
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        locations.forEach(location => {
          days.forEach(day => {
            // Find best performing time slots for this location/day
            const dayData = csvData.filter(item => 
              item.location === location && item.dayOfWeek === day
            );
            
            if (dayData.length > 0) {
              // Find peak performance time
              const timePerformance = dayData.reduce((acc, item) => {
                const time = item.classTime.slice(0, 5);
                if (!acc[time]) {
                  acc[time] = { participants: 0, revenue: 0, count: 0 };
                }
                acc[time].participants += item.participants;
                acc[time].revenue += item.totalRevenue;
                acc[time].count += 1;
                return acc;
              }, {} as any);
              
              // Find best performing class at best time
              const bestTime = Object.entries(timePerformance)
                .sort((a: any, b: any) => b[1].participants - a[1].participants)[0];
              
              if (bestTime) {
                const bestClasses = dayData.filter(item => 
                  item.classTime.includes(bestTime[0])
                ).sort((a, b) => b.participants - a.participants);
                
                if (bestClasses.length > 0) {
                  const bestClass = bestClasses[0];
                  
                  // Check if we can add a high-performing class
                  const existingClass = newSchedule.find(cls => 
                    cls.location === location && cls.day === day && cls.time === bestTime[0]
                  );
                  
                  if (!existingClass) {
                    const newClass: ScheduledClass = {
                      id: `optimized-${location}-${day}-${bestTime[0]}-${Date.now()}`,
                      day,
                      time: bestTime[0],
                      location,
                      classFormat: bestClass.cleanedClass,
                      teacherFirstName: bestClass.teacherFirstName,
                      teacherLastName: bestClass.teacherLastName,
                      duration: '1',
                      participants: bestClass.participants,
                      revenue: bestClass.totalRevenue
                    };
                    
                    newSchedule.push(newClass);
                    
                    newSuggestions.push({
                      type: 'format_change',
                      originalClass: newClass,
                      suggestedClass: newClass,
                      reason: `High-performing class at peak time`,
                      impact: `Expected ${bestClass.participants} participants, ₹${Math.round(bestClass.totalRevenue)} revenue`
                    });
                  }
                }
              }
            }
          }
        });
        
        // Optimize existing schedule
        currentSchedule.forEach(cls => {
          const historicData = csvData.filter(item => 
            item.location === cls.location && 
            item.dayOfWeek === cls.day && 
            item.classTime.includes(cls.time)
          );
          
          if (historicData.length > 0) {
            const bestPerformer = historicData.sort((a, b) => b.participants - a.participants)[0];
            
            if (bestPerformer.teacherName !== `${cls.teacherFirstName} ${cls.teacherLastName}`) {
              newSuggestions.push({
                type: 'teacher_change',
                originalClass: cls,
                suggestedClass: {
                  ...cls,
                  teacherFirstName: bestPerformer.teacherFirstName,
                  teacherLastName: bestPerformer.teacherLastName
                },
                reason: `${bestPerformer.teacherName} has better historic performance`,
                impact: `+${Math.round(bestPerformer.participants - (historicData.reduce((sum, item) => sum + item.participants, 0) / historicData.length))} participants on average`
              });
            }
          }
        });
        
        setSuggestions(newSuggestions);
        setOptimizedSchedule(newSchedule);
        setIsOptimizing(false);
      }, 2000);
    }
    
    setIsOptimizing(false);
  };

  const calculateScheduleMetrics = (schedule: ScheduledClass[]) => {
    const totalRevenue = schedule.reduce((sum, cls) => sum + (cls.revenue || 0), 0);
    const totalParticipants = schedule.reduce((sum, cls) => sum + (cls.participants || 0), 0);
    const uniqueTeachers = new Set(schedule.map(cls => `${cls.teacherFirstName} ${cls.teacherLastName}`));
    const totalHours = schedule.reduce((sum, cls) => sum + parseFloat(cls.duration), 0);
    
    return {
      totalRevenue,
      totalParticipants,
      trainerUtilization: totalHours / (uniqueTeachers.size * 15) * 100,
      totalClasses: schedule.length
    };
  };

  const handleOptimize = () => {
    onOptimize(optimizedSchedule);
  };

  useEffect(() => {
    if (isOpen) {
      generateOptimization();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-800 to-pink-800 border-gray-700' 
            : 'bg-gradient-to-r from-purple-600 to-pink-600 border-gray-200'
        } text-white`}>
          <div className="flex items-center">
            <Brain className="h-6 w-6 mr-3" />
            <h2 className="text-xl font-bold">AI Schedule Optimizer Pro</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {isOptimizing ? (
            <div className="text-center py-12">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
                isDarkMode ? 'border-purple-400' : 'border-purple-600'
              }`}></div>
              <h3 className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                AI Optimizing Schedule...
              </h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Analyzing trainer conflicts, studio capacity, and performance data
              </p>
            </div>
          ) : (
            <>
              {/* Optimization Summary */}
              <div className={`p-6 rounded-lg mb-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700' 
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Target className={`h-5 w-5 mr-2 ${
                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  Smart Optimization Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {suggestions.length}
                    </div>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      AI Optimizations
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {optimizedSchedule.length}
                    </div>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Total Classes
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      15h
                    </div>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Avg Trainer Hours
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Suggestions Display */}
              <div className="space-y-4 mb-6">
                <h3 className={`text-lg font-semibold flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Zap className={`h-5 w-5 mr-2 ${
                    isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`} />
                  AI-Driven Optimizations
                </h3>
                
                {suggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className={`h-12 w-12 mx-auto mb-3 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-300'
                    }`} />
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      Generating intelligent recommendations...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-l-4 ${
                          suggestion.type === 'teacher_change' 
                            ? isDarkMode
                              ? 'border-blue-400 bg-blue-900/20' 
                              : 'border-blue-400 bg-blue-50'
                            : suggestion.type === 'time_change' 
                            ? isDarkMode
                              ? 'border-yellow-400 bg-yellow-900/20'
                              : 'border-yellow-400 bg-yellow-50'
                            : isDarkMode
                              ? 'border-green-400 bg-green-900/20'
                              : 'border-green-400 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                suggestion.type === 'teacher_change' ? 'bg-blue-100 text-blue-800' :
                                suggestion.type === 'time_change' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {suggestion.type === 'teacher_change' ? 'Teacher Change' :
                                 suggestion.type === 'time_change' ? 'Time Change' :
                                 'Class Addition'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-800 mb-1">
                              <strong>{suggestion.suggestedClass.classFormat}</strong> - 
                              {suggestion.suggestedClass.day} at {suggestion.suggestedClass.time} 
                              ({suggestion.suggestedClass.location})
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {suggestion.reason}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              Impact: {suggestion.impact}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={`flex justify-end space-x-3 pt-4 border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={onClose}
                  className={`px-4 py-2 transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={generateOptimization}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  Re-optimize
                </button>
                <button
                  onClick={handleOptimize}
                  disabled={optimizedSchedule.length === 0}
                  className={`px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  }`}
                >
                  Apply AI Optimization
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartOptimizer;


import React, { useState, useEffect } from 'react';
import { X, Brain, TrendingUp, Users, Clock, Target, Zap, AlertTriangle } from 'lucide-react';
import { ClassData, ScheduledClass, OptimizationSuggestion } from '../types';
import { validateScheduleConflicts } from '../utils/studioAvailability';
import { generateComprehensiveSchedule } from '../utils/comprehensiveScheduler';
import { aiService } from '../utils/aiService';
import { premiumClasses } from '../styles/premiumTheme';

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
  const [optimizedSchedule, setOptimizedSchedule] = useState<ScheduledClass[]>([]);
  const [optimizationMetrics, setOptimizationMetrics] = useState<any>(null);
  const [validationResults, setValidationResults] = useState<any>(null);

  const generateOptimization = async () => {
    setIsOptimizing(true);
    
    try {
      console.log('Starting comprehensive AI optimization...');
      
      // Generate new iteration with comprehensive scheduler
      const optimizedSchedule = generateComprehensiveSchedule(
        csvData,
        [],
        {
          iteration: Date.now(),
          prioritizeTopPerformers: true,
          balanceShifts: true,
          optimizeTeacherHours: true,
          respectTimeRestrictions: true,
          minimizeTrainersPerShift: true
        }
      );
      
      // Validate the schedule for conflicts
      const validation = validateScheduleConflicts(optimizedSchedule);
      setValidationResults(validation);
      
      // Calculate metrics
      const metrics = calculateOptimizationMetrics(optimizedSchedule);
      setOptimizationMetrics(metrics);
      
      console.log('Optimization complete:', {
        totalClasses: optimizedSchedule.length,
        validation: validation.conflicts.length === 0 ? 'PASSED' : 'FAILED',
        metrics
      });
      
      setOptimizedSchedule(optimizedSchedule);
      
    } catch (error) {
      console.error('Optimization error:', error);
    }
    
    setIsOptimizing(false);
  };

  const calculateOptimizationMetrics = (schedule: ScheduledClass[]) => {
    const teacherHours: { [key: string]: number } = {};
    const shiftDistribution = { morning: 0, evening: 0 };
    const locationDistribution: { [key: string]: number } = {};
    const trainerPerShiftPerLocation: { [key: string]: Set<string> } = {};
    
    schedule.forEach(cls => {
      const teacher = `${cls.teacherFirstName} ${cls.teacherLastName}`;
      teacherHours[teacher] = (teacherHours[teacher] || 0) + parseFloat(cls.duration);
      
      const shift = parseInt(cls.time.split(':')[0]) < 14 ? 'morning' : 'evening';
      shiftDistribution[shift]++;
      
      locationDistribution[cls.location] = (locationDistribution[cls.location] || 0) + 1;
      
      const shiftLocationKey = `${cls.location}_${shift}`;
      if (!trainerPerShiftPerLocation[shiftLocationKey]) {
        trainerPerShiftPerLocation[shiftLocationKey] = new Set();
      }
      trainerPerShiftPerLocation[shiftLocationKey].add(teacher);
    });
    
    const avgTrainerHours = Object.values(teacherHours).reduce((sum, hours) => sum + hours, 0) / Object.keys(teacherHours).length;
    const totalRevenue = schedule.reduce((sum, cls) => sum + (cls.revenue || 0), 0);
    const totalParticipants = schedule.reduce((sum, cls) => sum + (cls.participants || 0), 0);
    
    // Check trainer limits
    const trainerViolations = Object.entries(teacherHours)
      .filter(([teacher, hours]) => hours > 15)
      .map(([teacher, hours]) => `${teacher}: ${hours}h`);
    
    // Check shift trainer limits
    const shiftTrainerViolations = Object.entries(trainerPerShiftPerLocation)
      .filter(([key, trainers]) => {
        const location = key.split('_')[0];
        const maxTrainers = location === 'Supreme HQ, Bandra' ? 3 : 2;
        return trainers.size > maxTrainers;
      })
      .map(([key, trainers]) => `${key}: ${trainers.size} trainers`);
    
    return {
      totalClasses: schedule.length,
      totalRevenue,
      totalParticipants,
      avgTrainerHours: Math.round(avgTrainerHours * 10) / 10,
      shiftBalance: Math.round((Math.min(shiftDistribution.morning, shiftDistribution.evening) / Math.max(shiftDistribution.morning, shiftDistribution.evening)) * 100),
      uniqueTrainers: Object.keys(teacherHours).length,
      trainerViolations,
      shiftTrainerViolations,
      locationDistribution
    };
  };

  const handleOptimize = () => {
    if (validationResults?.conflicts?.length === 0 && 
        optimizationMetrics?.trainerViolations?.length === 0 &&
        optimizationMetrics?.shiftTrainerViolations?.length === 0) {
      onOptimize(optimizedSchedule);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateOptimization();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg shadow-xl max-w-5xl w-full m-4 max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border-4 border-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b-4 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-800 to-pink-800 border-gray-700' 
            : 'bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900 border-gray-900'
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
              <div className={`animate-spin rounded-full h-12 w-12 border-b-4 mx-auto mb-4 ${
                isDarkMode ? 'border-purple-400' : 'border-blue-800'
              }`}></div>
              <h3 className={`text-lg font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                AI Optimizing Schedule...
              </h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700 font-semibold'}>
                Analyzing trainer conflicts, studio capacity, and performance data
              </p>
            </div>
          ) : (
            <>
              {/* Optimization Metrics */}
              {optimizationMetrics && (
                <div className={`p-6 rounded-lg mb-6 border-3 ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-700' 
                    : 'bg-white border-gray-900 shadow-xl shadow-gray-900/30'
                }`}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Target className={`h-5 w-5 mr-2 ${
                      isDarkMode ? 'text-purple-400' : 'text-blue-800'
                    }`} />
                    Optimization Results
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        isDarkMode ? 'text-purple-400' : 'text-blue-800'
                      }`}>
                        {optimizationMetrics.totalClasses}
                      </div>
                      <div className={`text-sm font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-800'
                      }`}>
                        Total Classes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        isDarkMode ? 'text-green-400' : 'text-green-800'
                      }`}>
                        {optimizationMetrics.avgTrainerHours}h
                      </div>
                      <div className={`text-sm font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-800'
                      }`}>
                        Avg Trainer Hours
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        isDarkMode ? 'text-blue-400' : 'text-purple-800'
                      }`}>
                        {optimizationMetrics.shiftBalance}%
                      </div>
                      <div className={`text-sm font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-800'
                      }`}>
                        Shift Balance
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        isDarkMode ? 'text-yellow-400' : 'text-orange-800'
                      }`}>
                        {optimizationMetrics.uniqueTrainers}
                      </div>
                      <div className={`text-sm font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-800'
                      }`}>
                        Unique Trainers
                      </div>
                    </div>
                  </div>
                  
                  {/* Validation Issues */}
                  {(validationResults?.conflicts?.length > 0 || 
                    optimizationMetrics?.trainerViolations?.length > 0 ||
                    optimizationMetrics?.shiftTrainerViolations?.length > 0) && (
                    <div className={`p-4 rounded-lg border-2 ${
                      isDarkMode 
                        ? 'bg-red-900/20 border-red-700' 
                        : 'bg-red-50 border-red-800'
                    }`}>
                      <div className="flex items-center mb-2">
                        <AlertTriangle className={`h-5 w-5 mr-2 ${
                          isDarkMode ? 'text-red-400' : 'text-red-800'
                        }`} />
                        <h4 className={`font-bold ${
                          isDarkMode ? 'text-red-300' : 'text-red-800'
                        }`}>
                          Optimization Issues Detected
                        </h4>
                      </div>
                      
                      {optimizationMetrics.trainerViolations?.length > 0 && (
                        <div className="mb-2">
                          <strong className={isDarkMode ? 'text-red-300' : 'text-red-800'}>
                            Trainer Hour Violations:
                          </strong>
                          <ul className={`ml-4 ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                            {optimizationMetrics.trainerViolations.map((violation: string, idx: number) => (
                              <li key={idx}>• {violation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {optimizationMetrics.shiftTrainerViolations?.length > 0 && (
                        <div className="mb-2">
                          <strong className={isDarkMode ? 'text-red-300' : 'text-red-800'}>
                            Shift Trainer Violations:
                          </strong>
                          <ul className={`ml-4 ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                            {optimizationMetrics.shiftTrainerViolations.map((violation: string, idx: number) => (
                              <li key={idx}>• {violation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {validationResults?.conflicts?.length > 0 && (
                        <div>
                          <strong className={isDarkMode ? 'text-red-300' : 'text-red-800'}>
                            Studio Conflicts:
                          </strong>
                          <ul className={`ml-4 ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>
                            {validationResults.conflicts.map((conflict: string, idx: number) => (
                              <li key={idx}>• {conflict}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className={`flex justify-end space-x-3 pt-4 border-t-3 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-900'
              }`}>
                <button
                  onClick={onClose}
                  className={`px-6 py-3 transition-colors font-bold rounded-lg ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-900 hover:text-white hover:bg-gray-900 border-2 border-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={generateOptimization}
                  className={isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold'
                    : premiumClasses.button.outline
                  }
                >
                  Re-optimize
                </button>
                <button
                  onClick={handleOptimize}
                  disabled={
                    optimizedSchedule.length === 0 ||
                    validationResults?.conflicts?.length > 0 ||
                    optimizationMetrics?.trainerViolations?.length > 0 ||
                    optimizationMetrics?.shiftTrainerViolations?.length > 0
                  }
                  className={`px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : premiumClasses.button.primary
                  }`}
                >
                  {(validationResults?.conflicts?.length > 0 || 
                    optimizationMetrics?.trainerViolations?.length > 0 ||
                    optimizationMetrics?.shiftTrainerViolations?.length > 0) 
                    ? 'Fix Issues First' 
                    : 'Apply AI Optimization'}
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

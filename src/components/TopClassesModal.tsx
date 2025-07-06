
import React, { useState, useMemo } from 'react';
import { X, TrendingUp, User, MapPin, Clock } from 'lucide-react';
import { ClassData, ScheduledClass } from '../types';
import { getTopPerformingClasses } from '../utils/classUtils';

interface TopClassesModalProps {
  isOpen: boolean;
  onClose: () => void;
  csvData: ClassData[];
  onScheduleClasses: (classes: ScheduledClass[]) => void;
  isDarkMode: boolean;
}

const TopClassesModal: React.FC<TopClassesModalProps> = ({
  isOpen,
  onClose,
  csvData,
  onScheduleClasses,
  isDarkMode
}) => {
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());

  const topClasses = useMemo(() => {
    return getTopPerformingClasses(csvData).filter(cls => cls.avgParticipants > 5.0);
  }, [csvData]);

  const handleClassToggle = (classKey: string) => {
    const newSelected = new Set(selectedClasses);
    if (newSelected.has(classKey)) {
      newSelected.delete(classKey);
    } else {
      newSelected.add(classKey);
    }
    setSelectedClasses(newSelected);
  };

  const handleScheduleSelected = () => {
    const classesToSchedule: ScheduledClass[] = [];
    
    selectedClasses.forEach(classKey => {
      const topClass = topClasses.find(cls => 
        `${cls.classFormat}_${cls.location}_${cls.day}_${cls.time}_${cls.teacher}` === classKey
      );
      
      if (topClass) {
        const [firstName, lastName] = topClass.teacher.split(' ');
        classesToSchedule.push({
          id: `top-${Date.now()}-${Math.random()}`,
          day: topClass.day,
          time: topClass.time,
          location: topClass.location,
          classFormat: topClass.classFormat,
          teacherFirstName: firstName || topClass.teacher,
          teacherLastName: lastName || '',
          duration: '1',
          participants: Math.round(topClass.avgParticipants),
          revenue: topClass.avgRevenue,
          isTopPerformer: true
        });
      }
    });
    
    onScheduleClasses(classesToSchedule);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      } rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-900 border-b-2'
        } flex justify-between items-center`}>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-500" />
              Top Performing Classes (&gt;5.0 Avg)
            </h2>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Select high-performing classes to add to your schedule
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {topClasses.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className={`h-16 w-16 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No top performing classes found with &gt;5.0 average attendance
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topClasses.map((cls) => {
                const classKey = `${cls.classFormat}_${cls.location}_${cls.day}_${cls.time}_${cls.teacher}`;
                const isSelected = selectedClasses.has(classKey);
                
                return (
                  <div
                    key={classKey}
                    onClick={() => handleClassToggle(classKey)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-blue-900 border-blue-500 shadow-lg'
                          : 'bg-blue-50 border-blue-600 shadow-lg'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 border-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg">{cls.classFormat}</h3>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        cls.avgParticipants > 8
                          ? 'bg-green-100 text-green-800'
                          : cls.avgParticipants > 6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cls.avgParticipants.toFixed(1)} avg
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{cls.teacher}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{cls.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{cls.day} at {cls.time}</span>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-300">
                        <div className="flex justify-between">
                          <span>Avg Revenue:</span>
                          <span className="font-bold">₹{cls.avgRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Frequency:</span>
                          <span className="font-bold">{cls.frequency} classes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {topClasses.length > 0 && (
          <div className={`px-6 py-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-900 border-t-2'
          } flex justify-between items-center`}>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {selectedClasses.size} classes selected
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              
              <button
                onClick={handleScheduleSelected}
                disabled={selectedClasses.size === 0}
                className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                  selectedClasses.size > 0
                    ? isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900 hover:from-blue-900 hover:via-slate-900 hover:to-black text-white shadow-lg hover:shadow-xl'
                    : isDarkMode
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Schedule Selected Classes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopClassesModal;

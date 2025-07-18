import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Calendar, 
  BarChart3, 
  Clock, 
  Settings, 
  Moon, 
  Sun, 
  TrendingUp, 
  Brain, 
  Download,
  Zap
} from 'lucide-react';
import CSVUpload from './components/CSVUpload';
import WeeklyCalendar from './components/WeeklyCalendar';
import MonthlyView from './components/MonthlyView';
import YearlyView from './components/YearlyView';
import AnalyticsView from './components/AnalyticsView';
import TeacherHourTracker from './components/TeacherHourTracker';
import ClassModal from './components/ClassModal';
import SmartOptimizer from './components/SmartOptimizer';
import DailyAIOptimizer from './components/DailyAIOptimizer';
import TopClassesModal from './components/TopClassesModal';
import ExportModal from './components/ExportModal';
import StudioSettings from './components/StudioSettings';
import { ClassData, ScheduledClass, CustomTeacher, TeacherAvailability } from './types';
import { 
  saveCSVData, 
  loadCSVData, 
  saveScheduledClasses, 
  loadScheduledClasses,
  saveCustomTeachers,
  loadCustomTeachers,
  saveTeacherAvailability,
  loadTeacherAvailability
} from './utils/dataStorage';
import { premiumClasses } from './styles/premiumTheme';

function App() {
  const [csvData, setCsvData] = useState<ClassData[]>([]);
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([]);
  const [customTeachers, setCustomTeachers] = useState<CustomTeacher[]>([]);
  const [teacherAvailability, setTeacherAvailability] = useState<TeacherAvailability>({});
  const [activeTab, setActiveTab] = useState('upload');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(null);
  const [showTopClasses, setShowTopClasses] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showAIOptimizer, setShowAIOptimizer] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedData = loadCSVData();
    const savedClasses = loadScheduledClasses();
    const savedTeachers = loadCustomTeachers();
    const savedAvailability = loadTeacherAvailability();
    
    if (savedData.length > 0) setCsvData(savedData);
    if (savedClasses.length > 0) setScheduledClasses(savedClasses);
    if (savedTeachers.length > 0) setCustomTeachers(savedTeachers);
    if (Object.keys(savedAvailability).length > 0) setTeacherAvailability(savedAvailability);
  }, []);

  const handleCSVUpload = (data: ClassData[]) => {
    setCsvData(data);
    saveCSVData(data);
  };

  const handleClassClick = (cls: ScheduledClass) => {
    setSelectedClass(cls);
  };

  const handleClassUpdate = (updatedClass: ScheduledClass) => {
    const updatedClasses = scheduledClasses.map(cls => 
      cls.id === updatedClass.id ? updatedClass : cls
    );
    setScheduledClasses(updatedClasses);
    saveScheduledClasses(updatedClasses);
    setSelectedClass(null);
  };

  const handleClassDelete = (classId: string) => {
    const updatedClasses = scheduledClasses.filter(cls => cls.id !== classId);
    setScheduledClasses(updatedClasses);
    saveScheduledClasses(updatedClasses);
    setSelectedClass(null);
  };

  const handleOptimizedSchedule = (optimizedSchedule: ScheduledClass[]) => {
    setScheduledClasses(optimizedSchedule);
    saveScheduledClasses(optimizedSchedule);
    setShowOptimizer(false);
    setShowAIOptimizer(false);
  };

  const handleCustomTeachersUpdate = (teachers: CustomTeacher[]) => {
    setCustomTeachers(teachers);
    saveCustomTeachers(teachers);
  };

  const handleTeacherAvailabilityUpdate = (availability: TeacherAvailability) => {
    setTeacherAvailability(availability);
    saveTeacherAvailability(availability);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <div className={`${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-900 border-b-4 shadow-xl shadow-gray-900/30'
      } border-b transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Studio Scheduler Pro
              </h1>
              <p className={`text-sm mt-1 font-bold ${
                isDarkMode ? 'text-gray-300' : 'text-gray-800'
              }`}>
                AI-Powered Fitness Studio Management
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-900 hover:bg-black text-yellow-400 border-2 border-gray-900'
                }`}
                title="Toggle theme"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-900 hover:bg-black text-gray-300 border-2 border-gray-900'
                }`}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-900 border-b-4 shadow-lg shadow-gray-900/20'
      } border-b transition-colors duration-300`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 py-4">
            {[
              { id: 'upload', label: 'Data Upload', icon: Upload },
              { id: 'weekly', label: 'Weekly View', icon: Calendar },
              { id: 'monthly', label: 'Monthly View', icon: Calendar },
              { id: 'yearly', label: 'Yearly View', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'tracker', label: 'Teacher Hours', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                    isActive
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-lg'
                        : premiumClasses.tab.active
                      : isDarkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : premiumClasses.tab.inactive
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* CSV Upload Section */}
            <div className={isDarkMode ? 'bg-gray-800 border-gray-700' : premiumClasses.card.premium}>
              <CSVUpload onDataUpload={handleCSVUpload} isDarkMode={isDarkMode} />
            </div>

            {csvData.length > 0 && (
              <>
                {/* Quick Actions */}
                <div className={isDarkMode ? 'bg-gray-800 border-gray-700' : premiumClasses.card.elevated}>
                  <h3 className={`text-xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Smart Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setShowTopClasses(true)}
                      className={isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors'
                        : premiumClasses.button.primary
                      }
                    >
                      <TrendingUp className="h-5 w-5 inline mr-2" />
                      Top Classes (&gt;5.0)
                    </button>
                    
                    <button
                      onClick={() => setShowOptimizer(true)}
                      className={isDarkMode
                        ? 'bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors'
                        : premiumClasses.button.secondary
                      }
                    >
                      <Brain className="h-5 w-5 inline mr-2" />
                      AI Optimize
                    </button>
                    
                    <button
                      onClick={() => setShowAIOptimizer(true)}
                      className={isDarkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors'
                        : 'bg-gradient-to-r from-purple-800 via-purple-900 to-slate-900 hover:from-purple-900 hover:via-slate-900 hover:to-black text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-purple-800'
                      }
                    >
                      <Zap className="h-5 w-5 inline mr-2" />
                      Daily AI Optimizer
                    </button>
                    
                    <button
                      onClick={() => setShowExportModal(true)}
                      className={isDarkMode
                        ? 'border border-gray-600 text-gray-300 hover:bg-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors'
                        : premiumClasses.button.outline
                      }
                    >
                      <Download className="h-5 w-5 inline mr-2" />
                      Export Schedule
                    </button>
                  </div>
                </div>

                {/* Schedule Grid */}
                <div className={isDarkMode ? 'bg-gray-800 border-gray-700' : premiumClasses.card.default}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Current Schedule
                    </h3>
                    
                    {/* Time Slot Info */}
                    <div className={`px-4 py-2 rounded-lg font-bold ${
                      isDarkMode 
                        ? 'bg-red-900 text-red-200 border border-red-700' 
                        : 'bg-red-100 text-red-900 border-2 border-red-800'
                    }`}>
                      <span>RESTRICTED: 12:00 PM - 4:00 PM</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scheduledClasses.map(cls => (
                      <div 
                        key={cls.id}
                        onClick={() => handleClassClick(cls)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          isDarkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-800'
                        }`}
                      >
                        <h4 className="font-bold">{cls.classFormat}</h4>
                        <p className="text-sm opacity-75">{cls.day} at {cls.time}</p>
                        <p className="text-xs opacity-50">{cls.location}</p>
                        <p className="text-xs">{cls.teacherFirstName} {cls.teacherLastName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className={isDarkMode ? 'bg-gray-800 rounded-lg' : premiumClasses.card.default}>
            <WeeklyCalendar 
              scheduledClasses={scheduledClasses}
              csvData={csvData}
              location="All Locations"
              onSlotClick={() => {}}
              onClassEdit={() => {}}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className={isDarkMode ? 'bg-gray-800 rounded-lg' : premiumClasses.card.default}>
            <MonthlyView 
              scheduledClasses={scheduledClasses}
              csvData={csvData}
            />
          </div>
        )}

        {activeTab === 'yearly' && (
          <div className={isDarkMode ? 'bg-gray-800 rounded-lg' : premiumClasses.card.default}>
            <YearlyView 
              scheduledClasses={scheduledClasses}
              csvData={csvData}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={isDarkMode ? 'bg-gray-800 rounded-lg' : premiumClasses.card.default}>
            <AnalyticsView 
              csvData={csvData}
              scheduledClasses={scheduledClasses}
            />
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className={isDarkMode ? 'bg-gray-800 rounded-lg' : premiumClasses.card.default}>
            <TeacherHourTracker 
              scheduledClasses={scheduledClasses}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedClass && (
        <ClassModal
          isOpen={!!selectedClass}
          onClose={() => setSelectedClass(null)}
          selectedClass={selectedClass}
          onUpdate={handleClassUpdate}
          onDelete={handleClassDelete}
          csvData={csvData}
          isDarkMode={isDarkMode}
        />
      )}

      {showTopClasses && (
        <TopClassesModal
          isOpen={showTopClasses}
          onClose={() => setShowTopClasses(false)}
          csvData={csvData}
          onScheduleClasses={(classes) => {
            const updatedClasses = [...scheduledClasses, ...classes];
            setScheduledClasses(updatedClasses);
            saveScheduledClasses(updatedClasses);
            setShowTopClasses(false);
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {showOptimizer && (
        <SmartOptimizer
          isOpen={showOptimizer}
          onClose={() => setShowOptimizer(false)}
          csvData={csvData}
          currentSchedule={scheduledClasses}
          onOptimize={handleOptimizedSchedule}
          isDarkMode={isDarkMode}
        />
      )}

      {showAIOptimizer && (
        <DailyAIOptimizer
          isOpen={showAIOptimizer}
          onClose={() => setShowAIOptimizer(false)}
          csvData={csvData}
          currentSchedule={scheduledClasses}
          onOptimize={handleOptimizedSchedule}
          isDarkMode={isDarkMode}
        />
      )}

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          scheduledClasses={scheduledClasses}
        />
      )}

      {showSettings && (
        <StudioSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          customTeachers={customTeachers}
          onUpdateTeachers={handleCustomTeachersUpdate}
          teacherAvailability={teacherAvailability}
          onUpdateAvailability={handleTeacherAvailabilityUpdate}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}

export default App;

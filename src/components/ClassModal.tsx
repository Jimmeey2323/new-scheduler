
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Clock, Users, MapPin, User, Calendar, DollarSign } from 'lucide-react';
import { ClassData, ScheduledClass } from '../types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ScheduledClass;
  onUpdate: (updatedClass: ScheduledClass) => void;
  onDelete: (classId: string) => void;
  csvData: ClassData[];
  isDarkMode: boolean;
}

const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  classData,
  onUpdate,
  onDelete,
  csvData,
  isDarkMode
}) => {
  const [formData, setFormData] = useState<ScheduledClass>(classData);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setFormData(classData);
  }, [classData]);

  const handleInputChange = (field: keyof ScheduledClass, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  const handleDelete = () => {
    onDelete(classData.id);
  };

  if (!isOpen) return null;

  const modalBg = isDarkMode 
    ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
    : 'bg-gradient-to-br from-white to-gray-50';
  
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const inputBorder = isDarkMode ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`${modalBg} rounded-2xl shadow-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto border ${borderColor}`}>
        <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Edit Class</h2>
          <button
            onClick={onClose}
            className={`${textSecondary} hover:${textPrimary} transition-colors p-2 hover:bg-gray-700 rounded-lg`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Class Format */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Class Format
            </label>
            <input
              type="text"
              value={formData.classFormat}
              onChange={(e) => handleInputChange('classFormat', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputBorder} border focus:ring-2 focus:ring-blue-500 ${textPrimary}`}
            />
          </div>

          {/* Day and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Day
              </label>
              <select
                value={formData.day}
                onChange={(e) => handleInputChange('day', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputBorder} border focus:ring-2 focus:ring-blue-500 ${textPrimary}`}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputBorder} border focus:ring-2 focus:ring-blue-500 ${textPrimary}`}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              Location
            </label>
            <select
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputBorder} border focus:ring-2 focus:ring-blue-500 ${textPrimary}`}
            >
              <option value="Kwality House, Kemps Corner">Kwality House, Kemps Corner</option>
              <option value="Supreme HQ, Bandra">Supreme HQ, Bandra</option>
              <option value="Kenkere House">Kenkere House</option>
            </select>
          </div>

          {/* Teacher */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Teacher First Name
              </label>
              <input
                type="text"
                value={formData.teacherFirstName}
                onChange={(e) => handleInputChange('teacherFirstName', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputBorder} border focus:ring-2 focus:ring-blue-500 ${textPrimary}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Teacher Last Name
              </label>
              <input
                type="text"
                value={formData.teacherLastName}
                onChange={(e) => handleInputChange('teacherLastName', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputBorder} border focus:ring-2 focus:ring-blue-500 ${textPrimary}`}
              />
            </div>
          </div>

          {/* Duration, Participants, Revenue */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Duration (hours)
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputBorder} border focus:ring-2 focus:ring-blue-500 ${textPrimary}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Participants
              </label>
              <input
                type="number"
                value={formData.participants}
                onChange={(e) => handleInputChange('participants', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputBorder} border focus:ring-2 focus:ring-blue-500 ${textPrimary}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                Revenue (₹)
              </label>
              <input
                type="number"
                value={formData.revenue}
                onChange={(e) => handleInputChange('revenue', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputBorder} border focus:ring-2 focus:ring-blue-500 ${textPrimary}`}
              />
            </div>
          </div>

          {/* Top Performer */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isTopPerformer"
              checked={formData.isTopPerformer}
              onChange={(e) => handleInputChange('isTopPerformer', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isTopPerformer" className={`ml-2 text-sm ${textSecondary}`}>
              Mark as Top Performer
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex justify-between items-center p-6 border-t ${borderColor}`}>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Class
          </button>
          
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className={`px-6 py-2 ${textSecondary} hover:${textPrimary} transition-colors`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
            <div className={`${modalBg} p-6 rounded-xl border ${borderColor} m-4`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
                Confirm Delete
              </h3>
              <p className={`${textSecondary} mb-6`}>
                Are you sure you want to delete this class? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassModal;

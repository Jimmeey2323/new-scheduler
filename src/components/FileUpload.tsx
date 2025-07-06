
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onClose: () => void;
}

export const FileUpload = ({ onClose }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'text/csv' || file.name.endsWith('.csv')
    );
    setFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Upload successful!",
      description: `${files.length} file(s) processed successfully.`,
    });
    
    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload Attendance Data</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your CSV files here
            </p>
            <p className="text-gray-600 mb-4">
              or click to browse your files
            </p>
            <input
              type="file"
              multiple
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <Button asChild>
              <label htmlFor="file-input" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Selected Files:</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Required CSV columns:</p>
                <p>date, time, class_name, instructor, location, capacity, attendance</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={files.length === 0 || uploading}
              className="flex-1"
            >
              {uploading ? 'Processing...' : 'Upload & Process'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState, useRef, useCallback } from 'react';
import { FileText, Upload, X, Check, Loader2 } from 'lucide-react';

interface FileStatus {
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // em bytes
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  acceptedFileTypes = ['.pdf', '.txt', '.md'],
  maxFileSize = 10 * 1024 * 1024, // 10MB por padrão
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Filtrar arquivos por tipo e tamanho
      const validFiles = droppedFiles.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isValidType = acceptedFileTypes.includes(extension);
        const isValidSize = file.size <= maxFileSize;
        
        return isValidType && isValidSize;
      });
      
      processFiles(validFiles);
    },
    [acceptedFileTypes, maxFileSize]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);
        e.target.value = '';
      }
    },
    []
  );

  const processFiles = async (newFiles: File[]) => {
    const newFileStatuses = newFiles.map(file => ({
      file,
      status: 'uploading' as const,
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...newFileStatuses]);
    
    for (let i = 0; i < newFileStatuses.length; i++) {
      const fileStatus = newFileStatuses[i];
      
      try {
        // Atualizar status para 'processing'
        setFiles(prev => 
          prev.map(f => 
            f.file === fileStatus.file 
              ? { ...f, status: 'processing' as const, progress: 100 } 
              : f
          )
        );
        
        // Processar o arquivo
        await onUpload(fileStatus.file);
        
        // Atualizar status para 'completed'
        setFiles(prev => 
          prev.map(f => 
            f.file === fileStatus.file 
              ? { ...f, status: 'completed' as const } 
              : f
          )
        );
      } catch (error) {
        // Atualizar status para 'error'
        setFiles(prev => 
          prev.map(f => 
            f.file === fileStatus.file 
              ? { ...f, status: 'error' as const, error: (error as Error).message } 
              : f
          )
        );
      }
    }
  };

  const removeFile = (fileToRemove: FileStatus) => {
    setFiles(files.filter(f => f.file !== fileToRemove.file));
  };

  const getFileIcon = (fileStatus: FileStatus) => {
    switch (fileStatus.status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-xs text-gray-500">
          Tipos suportados: {acceptedFileTypes.join(', ')} (Máx: {(maxFileSize / (1024 * 1024)).toFixed(0)}MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept={acceptedFileTypes.join(',')}
          multiple
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Arquivos ({files.length})</h3>
          <ul className="divide-y divide-gray-200 border rounded-md">
            {files.map((fileStatus, index) => (
              <li key={index} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0">{getFileIcon(fileStatus)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileStatus.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(fileStatus.file.size / 1024).toFixed(0)} KB
                      {fileStatus.status === 'error' && (
                        <span className="text-red-500 ml-2">{fileStatus.error}</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(fileStatus);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 
import { useState, useRef, useEffect } from 'react';
import { X, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { CoreApiProvider } from '@/services/api/core';

export const UploadZone = ({
  label,
  image,
  setImage,
  error,
  required = false,
  accept = 'image/*',
  maxSizeMB = 5,
  hint,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (image) {
      setPreview(image);
      setUploadStatus('success');
    } else {
      setPreview(null);
      setFileInfo(null);
      setUploadStatus(null);
    }
  }, [image]);

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const validateFile = file => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    if (accept !== '*') {
      const fileType = file.type;
      const acceptTypes = accept.split(',').map(type => type.trim());

      const isAccepted = acceptTypes.some(type => {
        if (type.includes('*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(category);
        }
        return type === fileType;
      });

      if (!isAccepted) {
        toast.error(`File type not accepted. Please upload ${accept}`);
        return false;
      }
    }

    return true;
  };

  const uploadFileToServer = async file => {
    setUploadStatus('uploading');

    if (!validateFile(file)) {
      setUploadStatus('error');
      return;
    }

    try {
      const { data } = await CoreApiProvider.uploadImage(file);
      setUploadStatus('success');

      setImage(data.url);
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      toast.success('File uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('error');
      toast.error('Failed to upload file');
    }
  };

  const handleFile = file => {
    if (!file) return;

    const tempPreview = URL.createObjectURL(file);
    setPreview(tempPreview);
    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    uploadFileToServer(file);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = e => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = e => {
    if (e) e.stopPropagation();

    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(null);
    setFileInfo(null);
    setUploadStatus(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast.success('Image removed');
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const getStatusColor = () => {
    if (error || uploadStatus === 'error') return 'border-red-600';
    if (uploadStatus === 'success') return 'border-green-500';
    if (uploadStatus === 'uploading') return 'border-yellow-500';
    if (isDragging) return 'border-blue-400';
    return 'border-dark-100';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold flex items-center gap-2">
          <span className="uppercase">
            {required && <span className="mr-1">*</span>}
            {label}
          </span>
          {hint && (
            <div className="group relative inline-flex">
              <HelpCircle className="w-5 h-5 text-white/60 cursor-help" />
              <div
                className="
                  absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-steel-850 text-white text-sm rounded-lg 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-w-[360px] min-w-[200px] w-max z-10 
                  whitespace-pre-wrap break-words text-left pointer-events-none
                "
              >
                {hint}
              </div>
            </div>
          )}
        </div>
        {uploadStatus === 'uploading' && <div className="text-yellow-500 text-sm">Uploading...</div>}
      </div>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 
          ${getStatusColor()}
          flex flex-col items-center justify-center 
          bg-navy-900 min-h-64 
          ${!preview ? 'cursor-pointer' : ''}
          transition-colors duration-200
        `}
        onClick={!preview ? triggerFileInput : undefined}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} accept={accept} className="hidden" type="file" onChange={handleFileInputChange} />
        {preview ? (
          <div className="relative w-full h-full flex flex-col items-center">
            <img alt="Uploaded preview" className="w-full h-full object-contain max-h-64" src={preview} />
            <button
              aria-label="Remove image"
              className="
                absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1
                hover:bg-opacity-75 transition-all duration-200
              "
              type="button"
              onClick={removeImage}
            >
              <X color="white" size={20} />
            </button>
            {fileInfo && (
              <div className="text-sm mt-2 text-dark-100 flex items-center gap-4">
                <span>{fileInfo.name || 'Uploaded file'}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-4 rounded-full bg-transparent">
                <img alt="upload-icon" src="/assets/icons/upload.svg" />
              </div>
            </div>
            <p className="text-dark-100 mb-2">Upload image into the selected area</p>
            <p className="text-dark-100 text-xs mt-4">
              {accept !== '*' && `Accepted formats: ${accept}`}
              {maxSizeMB && ` • Max size: ${maxSizeMB}MB`}
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="text-red-600 text-sm mt-1">
          {typeof error === 'string' ? error : error.message || 'Image is required'}
        </div>
      )}
    </div>
  );
};

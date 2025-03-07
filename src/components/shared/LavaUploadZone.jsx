import { useState, useRef } from 'react';
import { X } from 'lucide-react';

export const UploadZone = ({
  label,
  image,
  setImage,
  error,
  required = false,
  accept = 'image/*',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      setImage({
        file,
        preview: e.target.result,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="py-6 px-9 bg-input-bg rounded-[10px]">
      <div className="uppercase text-[20px] font-bold mb-4">
        {required && '*'}{label}
      </div>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          error
            ? 'border-main-red'
            : isDragging
              ? 'border-blue-400'
              : 'border-gray-500'
        } flex flex-col items-center justify-center bg-navy-900 min-h-64 cursor-pointer`}
        onClick={!image ? triggerFileInput : undefined}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          accept={accept}
          className="hidden"
          type="file"
          onChange={handleFileInputChange}
        />
        {image ? (
          <div className="relative w-full h-full">
            <img
              alt="Uploaded preview"
              className="w-full h-full object-contain max-h-64"
              src={image.preview}
            />
            <button
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
            >
              <X size={20} />
            </button>
            <div className="text-sm mt-2">
              {image.name} ({Math.round(image.size / 1024)} KB)
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-4 rounded-full bg-transparent">
                <img
                  alt="upload-icon"
                  src="/assets/icons/upload.svg"
                />
              </div>
            </div>
            <p className="text-dark-100 text-[20px] mb-2">
              Upload file into the selected area
            </p>
            <p className="text-dark-100 text-sm">
              Drag and drop or click to browse
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="text-main-red text-sm mt-1">
          {typeof error === 'string' ? error : error.message || 'Upload is required'}
        </div>
      )}
    </div>
  );
};

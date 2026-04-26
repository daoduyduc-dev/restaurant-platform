import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { toast } from '../../store/toastStore';

export interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string) => void;
  uploadEndpoint?: string; // e.g., '/profile/avatar' or '/menu/{id}/image'
  accept?: string;
  maxSizeMB?: number;
  shape?: 'circle' | 'square' | 'rounded';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  className?: string;
  // For two-step upload: first create item, then upload image
  onFileSelect?: (file: File) => void; // Callback when file is selected (for later upload)
}

const SIZE_MAP = {
  sm: '80px',
  md: '120px',
  lg: '160px',
  xl: '200px',
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  uploadEndpoint,
  accept = 'image/*',
  maxSizeMB = 5,
  shape = 'rounded',
  size = 'md',
  label,
  className = '',
  onFileSelect,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // If onFileSelect callback is provided, call it instead of uploading
    // This is useful for two-step uploads (create item first, then upload image)
    if (onFileSelect) {
      onFileSelect(file);
      return;
    }

    // Upload file
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(uploadEndpoint || '/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data.data.avatarUrl || response.data.data.imageUrl;
      onImageUpload(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageUpload('');
    toast.info('Image removed');
  };

  const imageUrl = previewUrl || currentImageUrl;

  const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? 'var(--r-lg)' : 'var(--r-none)';
  const dimension = SIZE_MAP[size];

  return (
    <div className={`image-upload-container ${className}`}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          marginBottom: 'var(--sp-2)',
          color: 'var(--text-heading)',
        }}>
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          style={{
            width: dimension,
            height: dimension,
            borderRadius,
            overflow: 'hidden',
            position: 'relative',
            cursor: 'pointer',
            border: '3px solid var(--border-main)',
            background: 'var(--bg-secondary)',
          }}
          onClick={handleClick}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Upload preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              gap: 'var(--sp-2)',
            }}>
              <ImageIcon size={32} />
              <span style={{ fontSize: 'var(--text-xs)' }}>No Image</span>
            </div>
          )}

          {/* Overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              gap: 'var(--sp-2)',
            }}
          >
            <Camera size={20} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              {uploading ? 'Uploading...' : 'Change'}
            </span>
          </motion.div>

          {/* Loading overlay */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  gap: 'var(--sp-2)',
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Upload size={24} />
                </motion.div>
                <span style={{ fontSize: 'var(--text-sm)' }}>Uploading...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Remove button */}
        {imageUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--red-500)',
              color: 'white',
              border: '2px solid var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
            title="Remove image"
          >
            <X size={14} />
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </div>
    </div>
  );
};

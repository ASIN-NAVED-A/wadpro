import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, AlertCircle, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { RESUME_ENDPOINT_CONFIG } from '../../api/fieldMap';

export default function FileUpload({
  onFileParsed,
  onFileSelect,
  isParsing = false,
  uploadProgress = 0,
  onCancel,
  errorMessage = '',
  onClearError,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const maxSizeBytes = (Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024;
  const maxMb = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB) || 5;

  const validateFile = (file) => {
    if (!file) {
      return 'No file selected. Please choose a valid resume file.';
    }

    // Check file size
    if (file.size === 0) {
      return 'The selected file is empty (0 bytes). Please upload a valid document.';
    }
    if (file.size > maxSizeBytes) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the ${maxMb} MB limit.`;
    }

    // Check extension
    const name = file.name.toLowerCase();
    const hasValidExt = RESUME_ENDPOINT_CONFIG.acceptedExtensions.some((ext) => name.endsWith(ext));

    // Check MIME type
    const hasValidMime =
      !file.type ||
      RESUME_ENDPOINT_CONFIG.acceptedTypes.includes(file.type) ||
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!hasValidExt || !hasValidMime) {
      return 'Unsupported file format. Please upload a PDF (.pdf) or Microsoft Word (.docx) document.';
    }

    return null;
  };

  const handleFile = (file) => {
    setValidationError('');
    if (onClearError) onClearError();

    const err = validateFile(file);
    if (err) {
      setValidationError(err);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setValidationError('');
    if (onClearError) onClearError();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeError = validationError || errorMessage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isParsing && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${
            activeError
              ? 'var(--color-danger)'
              : dragActive
              ? 'var(--color-primary)'
              : 'var(--color-border)'
          }`,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: dragActive
            ? 'var(--color-primary-soft)'
            : 'var(--color-surface)',
          padding: '32px 20px',
          textAlign: 'center',
          cursor: isParsing ? 'default' : 'pointer',
          transition: 'all var(--transition-fast)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload resume file dropzone"
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isParsing) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={isParsing}
        />

        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <UploadCloud size={24} />
        </div>

        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Drag and drop your resume, or <span style={{ color: 'var(--color-primary)' }}>browse</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Supported formats: PDF or DOCX (Max {maxMb} MB)
          </div>
        </div>
      </div>

      {/* Selected File & Progress Card */}
      {selectedFile && (
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary-soft)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {(selectedFile.size / 1024).toFixed(0)} KB · Ready to parse
                </div>
              </div>
            </div>

            {!isParsing ? (
              <button
                type="button"
                onClick={handleReset}
                aria-label="Remove selected file"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px', minHeight: '30px' }}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Upload & Parsing Progress */}
          {isParsing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Loader2 size={13} className="spin" />
                  {uploadProgress < 100 ? 'Uploading resume...' : 'Parsing resume with AI extractor...'}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{uploadProgress}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-primary)',
                    transition: 'width 200ms ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {activeError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-soft)',
            border: '1px solid rgba(185, 28, 28, 0.2)',
            color: 'var(--color-danger)',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{activeError}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-danger)',
              display: 'flex',
            }}
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

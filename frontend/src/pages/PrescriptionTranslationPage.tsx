import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { DocumentItem } from '../types';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  CheckCircle2,
  Lock,
  Languages,
  Eye
} from 'lucide-react';

export const PrescriptionTranslationPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setError(null);
    const validExtensions = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validExtensions.includes(file.type)) {
      setError('Please choose a valid file format (PDF, JPG, JPEG, or PNG only).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size must not exceed the 15MB limit.');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a prescription file to translate.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title || selectedFile.name);

    try {
      const res = await api.post<DocumentItem>('/documents/public-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const token = res.data.access_token;
      if (token) {
        navigate(`/prescription-translation/results/${token}`);
      } else {
        throw new Error('Access token missing from response.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload prescription. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#EF2929]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#181818] border border-[#282828] text-xs font-semibold text-[#EF2929]">
          <Languages className="w-3.5 h-3.5" />
          <span>Bilingual Malayalam & English Translation</span>
          <span className="text-neutral-500">•</span>
          <span className="text-emerald-400 font-bold uppercase text-[10px]">No Account Required</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Translate Prescription
        </h1>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Upload any handwritten doctor prescription or clinic slip. Get immediate, understandable breakdowns of medicines, dosages, and schedules in English and Malayalam.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#EF2929]" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <form onSubmit={handleUpload} className="space-y-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#EF2929] bg-[#EF2929]/5 shadow-glow-red'
              : selectedFile
              ? 'border-emerald-600/60 bg-emerald-950/10'
              : 'border-[#2D2D2D] hover:border-[#EF2929]/50 bg-[#151515] hover:bg-[#1A1A1A]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#202020] border border-[#2A2A2A] text-[#EF2929] flex items-center justify-center mx-auto shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                {selectedFile ? selectedFile.name : 'Choose prescription file or drag & drop here'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Supports PDF, JPG, JPEG, and PNG files up to 15 MB
              </p>
            </div>

            {selectedFile && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready to translate ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
            )}
          </div>
        </div>

        {/* File Preview */}
        {previewUrl && (
          <div className="p-4 rounded-3xl bg-[#151515] border border-[#242424] space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-neutral-300">Prescription Preview</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
            <div className="max-h-72 overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0E0E0E] flex items-center justify-center">
              <img src={previewUrl} alt="Preview" className="max-h-72 object-contain" />
            </div>
          </div>
        )}

        <div className="p-6 rounded-3xl bg-[#151515] border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
              Title or Reference Name (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Clinic Prescription, Fever & Cough Rx"
              className="w-full px-4 py-2 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="sm:self-end px-8 py-3 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold tracking-wide shadow-glow-red hover:shadow-glow-red-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing OCR & Translation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Translate Prescription Free</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Privacy disclaimer */}
      <div className="p-4 rounded-2xl bg-[#151515] border border-[#242424] text-xs text-neutral-400 flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#EF2929] flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Public Privacy Protection:</strong> Anonymous walk-in translations generate an unguessable 32-byte cryptographic token. Your prescription is not indexed, does not appear on any public feed, and is inaccessible without your private URL.
        </p>
      </div>
    </div>
  );
};

export default PrescriptionTranslationPage;

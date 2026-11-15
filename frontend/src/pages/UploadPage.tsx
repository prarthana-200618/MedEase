import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { DocumentItem } from '../types';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  Eye,
  X,
  FileCheck2,
  Cpu,
  Binary,
  Stethoscope,
  HelpCircle,
  Languages
} from 'lucide-react';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStage, setProcessingStage] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stages = [
    { title: 'Document Uploaded', desc: 'Encrypted storage & validation', icon: FileCheck2 },
    { title: 'Image Preprocessing', desc: 'OpenCV CLAHE enhancement & deskewing', icon: Cpu },
    { title: 'Text Extraction', desc: 'OCR parsing scanned prescription lines', icon: Binary },
    { title: 'Medical Extraction', desc: 'Identifying medicines, dosages & timing', icon: Stethoscope },
    { title: 'Uncertainty Detection', desc: 'Scanning for unclear handwriting & flags', icon: HelpCircle },
    { title: 'Malayalam Explanation', desc: 'Generating bilingual clinical summary', icon: Languages },
  ];

  const handleFileChange = (file: File) => {
    setError(null);
    const validExtensions = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validExtensions.includes(file.type)) {
      setError('Please select a valid file format (PDF, JPG, JPEG, or PNG only).');
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
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setProcessingStage(1);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title || selectedFile.name);

    try {
      // Simulate visual pipeline progress stages
      const stageInterval = setInterval(() => {
        setProcessingStage((prev) => (prev < 5 ? prev + 1 : prev));
      }, 700);

      const res = await api.post<DocumentItem>('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(stageInterval);
      setProcessingStage(6);

      // Brief delay to allow the user to view completion before navigating to results
      setTimeout(() => {
        navigate(`/documents/${res.data.id}`);
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload document. Please try again.');
      setIsUploading(false);
      setProcessingStage(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#242424] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#282828] text-xs font-semibold text-[#EF2929] mb-2">
          <UploadCloud className="w-3.5 h-3.5" />
          Clinical Document Ingestion
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Medical Document</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Upload prescriptions, lab results, or discharge summaries for AI analysis and Malayalam translation.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#EF2929]" />
          <span>{error}</span>
        </div>
      )}

      {/* Processing Pipeline Animation Display */}
      {isUploading ? (
        <div className="bg-[#151515] border border-[#262626] rounded-3xl p-8 sm:p-10 shadow-card-dark space-y-8 text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-[#242424] border-t-[#EF2929] animate-spin" />
            <Sparkles className="w-6 h-6 text-[#EF2929] absolute inset-0 m-auto" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Analyzing Medical Document</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Extracting clinical entities and generating simple Malayalam explanation...
            </p>
          </div>

          {/* 6 Stages Progress Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-left">
            {stages.map((st, idx) => {
              const StageIcon = st.icon;
              const isDone = processingStage > idx + 1 || processingStage === 6;
              const isCurrent = processingStage === idx + 1;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400'
                      : isCurrent
                      ? 'bg-[#222222] border-[#EF2929] text-white shadow-glow-red'
                      : 'bg-[#181818] border-[#242424] text-neutral-500 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${isDone ? 'bg-emerald-900/40 text-emerald-300' : isCurrent ? 'bg-[#EF2929] text-white' : 'bg-[#252525] text-neutral-500'}`}>
                      <StageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{st.title}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{st.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpload} className="space-y-6">
          {/* Drag & Drop Upload Zone */}
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
                  {selectedFile ? selectedFile.name : 'Choose a file or drag & drop here'}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Supported formats: PDF, JPG, JPEG, PNG • Maximum size: 15 MB
                </p>
              </div>

              {selectedFile && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready to upload ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Image Preview if available */}
          {previewUrl && (
            <div className="p-4 rounded-3xl bg-[#151515] border border-[#242424] space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold text-neutral-300">File Preview</span>
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

          {/* Document Title Input */}
          <div className="p-6 rounded-3xl bg-[#151515] border border-[#242424] space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Document Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., General Physician Prescription, Blood Routine Test"
                className="w-full px-4 py-2.5 rounded-xl border border-[#2E2E2E] bg-[#202020] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Give this document a recognizable name for your library.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#222222]">
              <Link
                to="/documents"
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!selectedFile}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold shadow-glow-red hover:shadow-glow-red-lg transition disabled:opacity-40"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Translate</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Safety & DPDP Privacy Notice */}
      <div className="p-4 rounded-2xl bg-[#151515] border border-[#242424] text-xs text-neutral-400 flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#EF2929] flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Private Health Repository:</strong> Documents uploaded through your patient account are protected with cryptographic user isolation and stored securely in compliance with healthcare data protection standards.
        </p>
      </div>
    </div>
  );
};

export default UploadPage;

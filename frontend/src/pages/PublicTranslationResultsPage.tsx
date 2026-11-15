import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { DocumentDetail, Medication, Flag } from '../types';
import { 
  FileText, 
  Languages, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Eye, 
  ArrowLeft,
  Sparkles,
  Lock,
  ArrowRight,
  Printer,
  Share2,
  Copy,
  Check,
  Pause,
  Play
} from 'lucide-react';

export const PublicTranslationResultsPage: React.FC = () => {
  const { accessToken } = useParams<{ accessToken: string }>();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<'bilingual' | 'malayalam' | 'english'>('bilingual');
  const [activeMainTab, setActiveMainTab] = useState<'explanation' | 'medications' | 'unclear' | 'original'>('explanation');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fetchDocument = async () => {
    if (!accessToken) return;
    try {
      const res = await api.get<DocumentDetail>(`/documents/public/${accessToken}`);
      setDocument(res.data);
      if (res.data.status === 'processing' || res.data.status === 'pending') {
        setTimeout(fetchDocument, 2000);
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not load prescription results. The access link may be invalid.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [accessToken]);

  const toggleVoicePlayback = () => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = document?.explanation?.malayalam_summary || document?.explanation?.english_summary || '';
    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Check for Malayalam or South Asian voice
    const voices = window.speechSynthesis.getVoices();
    const malayalamVoice = voices.find((v) => v.lang.startsWith('ml') || v.name.toLowerCase().includes('malayalam'));
    if (malayalamVoice) {
      utterance.voice = malayalamVoice;
      utterance.lang = 'ml-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.9;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#151515] border border-[#282828] rounded-3xl p-8 text-center space-y-4 shadow-card-dark">
          <div className="w-12 h-12 border-4 border-[#EF2929] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Analyzing Prescription...</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Applying OpenCV enhancement, OCR extraction, and bilingual medical translation. This takes only a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-950/60 text-[#EF2929] flex items-center justify-center mx-auto border border-red-800/60">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Document Not Accessible</h2>
        <p className="text-xs text-neutral-400">{error || 'Prescription could not be found.'}</p>
        <Link
          to="/prescription-translation"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EF2929] text-white text-xs font-bold hover:bg-[#DC2626] transition shadow-glow-red"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Translate Another Prescription</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
        <div className="flex items-center gap-3">
          <Link
            to="/prescription-translation"
            className="p-2 rounded-xl bg-[#181818] border border-[#2A2A2A] text-neutral-400 hover:text-white transition"
            title="Upload another"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{document.title}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EF2929]/15 text-[#EF2929] border border-[#EF2929]/30">
                Bilingual Translation
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Source file: {document.original_filename} • Processed on {new Date(document.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181818] border border-[#2A2A2A] text-neutral-300 hover:text-white text-xs font-semibold transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181818] border border-[#2A2A2A] text-neutral-300 hover:text-white text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold shadow-glow-red transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Save to Account</span>
          </Link>
        </div>
      </div>

      {/* Clinical Disclaimer Notice */}
      <div className="bg-[#1A1512] border border-amber-900/50 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
          <strong>Important Clinical Disclaimer:</strong> MedEase provides translation and transcription assistance to explain medical terminology. It is NOT a clinical prescription or diagnosis. Confirm all medication details with your pharmacist or doctor before taking medicines.
        </p>
      </div>

      {/* Main Tabs (Explanation, Medications, Unclear Information, Original) */}
      <div className="flex border-b border-[#242424] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveMainTab('explanation')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeMainTab === 'explanation'
              ? 'border-[#EF2929] text-[#EF2929]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>Bilingual Translation</span>
        </button>

        <button
          onClick={() => setActiveMainTab('medications')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeMainTab === 'medications'
              ? 'border-[#EF2929] text-[#EF2929]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Medication Breakdown ({document.medications.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('unclear')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeMainTab === 'unclear'
              ? 'border-[#EF2929] text-[#EF2929]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Unclear & Flags ({document.flags.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('original')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeMainTab === 'original'
              ? 'border-[#EF2929] text-[#EF2929]'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Original OCR Text</span>
        </button>
      </div>

      {/* TAB 1: BILINGUAL EXPLANATION */}
      {activeMainTab === 'explanation' && (
        <div className="space-y-6">
          {/* Controls: Audio Playback & Language View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#151515] border border-[#262626]">
            {/* Audio Speech Component */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleVoicePlayback}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  isPlayingAudio
                    ? 'bg-[#EF2929] text-white shadow-glow-red animate-pulse'
                    : 'bg-[#202020] hover:bg-[#282828] text-white border border-[#2E2E2E]'
                }`}
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#EF2929]" />}
                <span>{isPlayingAudio ? 'Pause Speech' : 'Listen Explanation'}</span>
              </button>

              {isPlayingAudio && (
                <span className="text-xs text-neutral-400 flex items-center gap-1.5 animate-pulse">
                  <Volume2 className="w-3.5 h-3.5 text-[#EF2929]" />
                  <span>Audio synthesis active...</span>
                </span>
              )}
            </div>

            {/* Language layout selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#202020] border border-[#2E2E2E]">
              <button
                onClick={() => setActiveLangTab('bilingual')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeLangTab === 'bilingual' ? 'bg-[#EF2929] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setActiveLangTab('malayalam')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeLangTab === 'malayalam' ? 'bg-[#EF2929] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                മലയാളം Only
              </button>
              <button
                onClick={() => setActiveLangTab('english')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeLangTab === 'english' ? 'bg-[#EF2929] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                English Only
              </button>
            </div>
          </div>

          {/* Symmetrical Bilingual Card Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* English Card */}
            {(activeLangTab === 'bilingual' || activeLangTab === 'english') && (
              <div className={`p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#262626] shadow-card-dark space-y-4 ${activeLangTab === 'english' ? 'lg:col-span-2' : ''}`}>
                <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF2929]" />
                    <h2 className="text-base font-bold text-white">English Explanation</h2>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Plain Medical English
                  </span>
                </div>

                <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line space-y-3 font-sans">
                  {document.explanation?.english_summary || 'No English summary available for this document.'}
                </div>
              </div>
            )}

            {/* Malayalam Card (High readability typography) */}
            {(activeLangTab === 'bilingual' || activeLangTab === 'malayalam') && (
              <div className={`p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#262626] shadow-card-dark space-y-4 ${activeLangTab === 'malayalam' ? 'lg:col-span-2' : ''}`}>
                <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF2929]" />
                    <h2 className="text-base font-bold text-white">ലളിതമായ മലയാള വിവരണം</h2>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    MALAYALAM
                  </span>
                </div>

                <div className="text-sm text-neutral-200 leading-[2.1] whitespace-pre-line space-y-4 font-malayalam">
                  {document.explanation?.malayalam_summary || 'മലയാള വിവരണം ലഭ്യമായിട്ടില്ല.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MEDICATIONS BREAKDOWN */}
      {activeMainTab === 'medications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Identified Medicines & Dosing</h2>
            <span className="text-xs text-neutral-400">
              Total {document.medications.length} items detected
            </span>
          </div>

          {document.medications.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#151515] border border-[#242424] text-center text-neutral-400 text-sm">
              No specific medications were extracted from this document.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {document.medications.map((med, index) => (
                <div
                  key={med.id || index}
                  className="p-5 rounded-2xl bg-[#151515] border border-[#262626] shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{med.name}</h3>
                      {med.dosage && (
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#252525] text-neutral-200 text-xs font-semibold">
                          Strength: {med.dosage}
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold uppercase">
                      Confidence {(med.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222222] text-xs">
                    <div>
                      <span className="text-neutral-500 block">Frequency</span>
                      <span className="font-semibold text-white">{med.frequency || 'As directed'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Timing / Food</span>
                      <span className="font-semibold text-white">{med.timing || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Duration</span>
                      <span className="font-semibold text-white">{med.duration || 'Review with doctor'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Prescription Line</span>
                      <span className="font-mono text-[11px] text-neutral-400 truncate block">
                        {med.raw_line || med.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UNCLEAR INFORMATION & WARNING FLAGS */}
      {activeMainTab === 'unclear' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Unclear Handwriting & Verification Flags</h2>
            <span className="text-xs text-neutral-400">{document.flags.length} items flagged</span>
          </div>

          {document.flags.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#151515] border border-[#242424] text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-white">No Uncertainties Detected</p>
              <p className="text-xs text-neutral-400">All prescription entities were extracted with high OCR confidence.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {document.flags.map((flag, idx) => (
                <div
                  key={flag.id || idx}
                  className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block text-amber-300">
                      {flag.flag_type.replace(/_/g, ' ')}
                    </span>
                    <p className="text-neutral-300 mt-1 leading-relaxed">{flag.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORIGINAL OCR TEXT */}
      {activeMainTab === 'original' && (
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#262626] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
            <h2 className="text-base font-bold text-white">Raw OCR Extracted Text</h2>
            <span className="text-xs text-neutral-400 font-mono">
              {document.file_type} • {(document.file_size / 1024).toFixed(0)} KB
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-[#242424] font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {document.raw_texts && document.raw_texts.length > 0 ? (
              document.raw_texts.join('\n\n--- Page Break ---\n\n')
            ) : (
              'Raw OCR text is being indexed or was not retained.'
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicTranslationResultsPage;

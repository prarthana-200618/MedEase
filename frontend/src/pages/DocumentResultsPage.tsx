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
  Edit3, 
  Check, 
  ShieldAlert, 
  Eye, 
  ArrowLeft,
  Sparkles,
  Printer,
  Save,
  X,
  Play,
  Pause,
  Plus
} from 'lucide-react';

export const DocumentResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'explanation' | 'medications' | 'original' | 'unclear'>('explanation');
  const [activeLangMode, setActiveLangMode] = useState<'bilingual' | 'english' | 'malayalam'>('bilingual');
  const [isLoading, setIsLoading] = useState(true);
  const [editingMedId, setEditingMedId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Medication>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get<DocumentDetail>(`/documents/${id}`);
        setDocument(res.data);
      } catch (err) {
        console.error('Error fetching document details', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDoc();

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [id]);

  const toggleVoicePlayback = () => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported in this browser.');
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

  const handleConfirmMedication = async (medId: number) => {
    try {
      await api.post(`/documents/${id}/confirm`, {
        medication_id: medId,
        notes: 'Confirmed by patient after manual review',
      });
      if (document) {
        setDocument({
          ...document,
          medications: document.medications.map((m) =>
            m.id === medId ? { ...m, status: 'patient_confirmed' } : m
          ),
        });
      }
      setConfirmSuccess('Medication verified successfully.');
      setTimeout(() => setConfirmSuccess(null), 3000);
    } catch (err) {
      console.error('Error confirming medication', err);
    }
  };

  const handleSaveEdit = async (medId: number) => {
    try {
      const res = await api.patch(`/documents/${id}/fields/${medId}`, editForm);
      if (document) {
        setDocument({
          ...document,
          medications: document.medications.map((m) =>
            m.id === medId ? { ...m, ...res.data } : m
          ),
        });
      }
      setEditingMedId(null);
      setConfirmSuccess('Medication details updated.');
      setTimeout(() => setConfirmSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving field changes', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#151515] border border-[#282828] rounded-3xl p-8 text-center space-y-4 shadow-card-dark">
          <div className="w-12 h-12 border-4 border-[#EF2929] border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-xl font-bold text-white">Loading Document Analysis...</h3>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-950/60 text-[#EF2929] flex items-center justify-center mx-auto border border-red-800/60">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Document Not Found</h2>
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EF2929] text-white text-xs font-bold hover:bg-[#DC2626] transition shadow-glow-red"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Documents</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
        <div className="flex items-center gap-3">
          <Link
            to="/documents"
            className="p-2 rounded-xl bg-[#181818] border border-[#2A2A2A] text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{document.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                document.status === 'completed'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                  : 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
              }`}>
                {document.status === 'completed' ? 'Processed' : document.status}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Source file: {document.original_filename} • Added on {new Date(document.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to={`/reminders?doc=${document.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2A2A2A] text-neutral-200 text-xs font-semibold transition"
          >
            <Clock className="w-3.5 h-3.5 text-[#EF2929]" />
            <span>Create Reminders</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2A2A2A] text-neutral-200 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {confirmSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{confirmSuccess}</span>
        </div>
      )}

      {/* Safety Notice */}
      <div className="bg-[#1A1512] border border-amber-900/50 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
          <strong>Important Clinical Boundary:</strong> MedEase provides translation and transcription assistance to explain medical terminology. It is NOT a clinical prescription or diagnosis. Confirm all medication details with your pharmacist or doctor before taking medicines.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-[#242424] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('explanation')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'explanation' ? 'border-[#EF2929] text-[#EF2929]' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>Bilingual Explanation</span>
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'medications' ? 'border-[#EF2929] text-[#EF2929]' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Identified Medicines ({document.medications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('unclear')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'unclear' ? 'border-[#EF2929] text-[#EF2929]' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Unclear & Flags ({document.flags.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('original')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'original' ? 'border-[#EF2929] text-[#EF2929]' : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Original Document & OCR</span>
        </button>
      </div>

      {/* TAB 1: BILINGUAL EXPLANATION */}
      {activeTab === 'explanation' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#151515] border border-[#262626]">
            {/* Audio Speech Button */}
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
                  <span>Synthesizing voice explanation...</span>
                </span>
              )}
            </div>

            {/* Language view toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#202020] border border-[#2E2E2E]">
              <button
                onClick={() => setActiveLangMode('bilingual')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeLangMode === 'bilingual' ? 'bg-[#EF2929] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setActiveLangMode('malayalam')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeLangMode === 'malayalam' ? 'bg-[#EF2929] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                മലയാളം Only
              </button>
              <button
                onClick={() => setActiveLangMode('english')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  activeLangMode === 'english' ? 'bg-[#EF2929] text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                English Only
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* English Explanation */}
            {(activeLangMode === 'bilingual' || activeLangMode === 'english') && (
              <div className={`p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#262626] shadow-card-dark space-y-4 ${activeLangMode === 'english' ? 'lg:col-span-2' : ''}`}>
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
                  {document.explanation?.english_summary || 'No English explanation available for this document.'}
                </div>
              </div>
            )}

            {/* Malayalam Explanation */}
            {(activeLangMode === 'bilingual' || activeLangMode === 'malayalam') && (
              <div className={`p-6 sm:p-8 rounded-3xl bg-[#151515] border border-[#262626] shadow-card-dark space-y-4 ${activeLangMode === 'malayalam' ? 'lg:col-span-2' : ''}`}>
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

      {/* TAB 2: IDENTIFIED MEDICINES & REVIEW */}
      {activeTab === 'medications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Extracted Medication List</h2>
              <p className="text-xs text-neutral-400">Review details or confirm for medicine reminders</p>
            </div>
            <Link
              to={`/reminders?doc=${document.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] text-white text-xs font-bold shadow-glow-red transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Reminders</span>
            </Link>
          </div>

          <div className="space-y-4">
            {document.medications.map((med) => {
              const isEditing = editingMedId === med.id;

              return (
                <div
                  key={med.id}
                  className="p-5 rounded-3xl bg-[#151515] border border-[#262626] shadow-sm space-y-4"
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold text-neutral-400 uppercase">Medicine Name</label>
                          <input
                            type="text"
                            value={editForm.name ?? med.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333333] text-white text-xs mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-400 uppercase">Dosage / Strength</label>
                          <input
                            type="text"
                            value={editForm.dosage ?? (med.dosage || '')}
                            onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333333] text-white text-xs mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-400 uppercase">Frequency</label>
                          <input
                            type="text"
                            value={editForm.frequency ?? (med.frequency || '')}
                            onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333333] text-white text-xs mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-neutral-400 uppercase">Timing / Food</label>
                          <input
                            type="text"
                            value={editForm.timing ?? (med.timing || '')}
                            onChange={(e) => setEditForm({ ...editForm, timing: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333333] text-white text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-[#222222]">
                        <button
                          type="button"
                          onClick={() => setEditingMedId(null)}
                          className="px-3 py-1.5 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(med.id)}
                          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-[#EF2929] hover:bg-[#DC2626] text-white text-xs font-bold"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{med.name}</h3>
                            {med.dosage && (
                              <span className="px-2 py-0.5 rounded-md bg-[#222222] text-neutral-300 text-xs font-semibold">
                                {med.dosage}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 mt-1 font-mono">
                            Extracted: {med.raw_line || med.name}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            med.status === 'patient_confirmed'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                              : 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                          }`}>
                            {med.status === 'patient_confirmed' ? 'Verified by You' : 'Needs Review'}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingMedId(med.id);
                              setEditForm({
                                name: med.name,
                                dosage: med.dosage,
                                frequency: med.frequency,
                                timing: med.timing,
                              });
                            }}
                            className="p-1.5 rounded-xl bg-[#202020] border border-[#2E2E2E] text-neutral-400 hover:text-white transition"
                            title="Edit Medication"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {med.status !== 'patient_confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleConfirmMedication(med.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900 text-xs font-bold transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#222222] text-xs">
                        <div>
                          <span className="text-neutral-500 block">Frequency</span>
                          <span className="font-semibold text-white">{med.frequency || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Timing</span>
                          <span className="font-semibold text-white">{med.timing || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Duration</span>
                          <span className="font-semibold text-white">{med.duration || 'As prescribed'}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Confidence</span>
                          <span className="font-semibold text-emerald-400">
                            {(med.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: UNCLEAR INFORMATION & FLAGS */}
      {activeTab === 'unclear' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Unclear Information & Quality Flags</h2>
            <span className="text-xs text-neutral-400">{document.flags.length} items flagged</span>
          </div>

          {document.flags.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#151515] border border-[#242424] text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-white">No Uncertainties Detected</p>
              <p className="text-xs text-neutral-400">All prescription text was extracted with high confidence.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {document.flags.map((flag) => (
                <div
                  key={flag.id}
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

      {/* TAB 4: ORIGINAL DOCUMENT & RAW OCR */}
      {activeTab === 'original' && (
        <div className="p-6 rounded-3xl bg-[#151515] border border-[#262626] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
            <h2 className="text-base font-bold text-white">Raw Extracted OCR Text</h2>
            <span className="text-xs text-neutral-400 font-mono">
              {document.file_type} • {(document.file_size / 1024).toFixed(0)} KB
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-[#242424] font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {document.raw_texts && document.raw_texts.length > 0 ? (
              document.raw_texts.join('\n\n--- Page Break ---\n\n')
            ) : (
              'Raw OCR text was parsed into structured entities.'
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentResultsPage;

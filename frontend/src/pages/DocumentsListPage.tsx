import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { DocumentItem } from '../types';
import { 
  FileText, 
  Search, 
  Trash2, 
  UploadCloud, 
  Plus, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const DocumentsListPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await api.get<DocumentItem[]>('/documents', {
        params: search ? { search } : {},
      });
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [search]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter((d) => d.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete document', err);
      alert('Unable to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (statusFilter === 'all') return true;
    return doc.status === statusFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242424] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181818] border border-[#282828] text-[#EF2929] text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Medical Records Library
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Medical Documents</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Review, translate, and manage your prescriptions, lab tests, and discharge summaries.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold tracking-wide shadow-glow-red hover:shadow-glow-red-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title or file name..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#262626] bg-[#151515] text-white text-sm focus:outline-none focus:border-[#EF2929] focus:ring-1 focus:ring-[#EF2929] placeholder-neutral-500 transition shadow-inner-dark"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#151515] border border-[#262626] overflow-x-auto">
          {(['all', 'completed', 'processing', 'failed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition uppercase tracking-wider ${
                statusFilter === st
                  ? 'bg-[#252525] text-white border border-[#333333]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#151515] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#2E2E2E] space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Medical Document</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to delete this document? All extracted medications and reminders associated with it will also be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="px-5 py-2 rounded-xl bg-[#EF2929] hover:bg-[#DC2626] text-white text-xs font-bold shadow-glow-red transition disabled:opacity-50"
              >
                {deletingId === deleteConfirmId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#EF2929] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400 font-medium">Loading your medical library...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-[#151515] border border-dashed border-[#282828] rounded-3xl p-12 text-center space-y-4 shadow-card-dark">
          <div className="w-14 h-14 rounded-2xl bg-[#202020] text-[#EF2929] flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No medical documents found</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
              {search ? 'No documents matched your search query.' : 'You have not uploaded any prescriptions or medical records yet.'}
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EF2929] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white text-xs font-bold shadow-glow-red transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Your First Document</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const dateStr = new Date(doc.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const sizeKb = (doc.file_size / 1024).toFixed(0);

            return (
              <div
                key={doc.id}
                className="bg-[#151515] rounded-3xl border border-[#242424] hover:border-[#383838] shadow-card-dark hover:shadow-glow-red transition flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#202020] text-[#EF2929] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      doc.status === 'completed'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                      {doc.title || doc.original_filename}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="uppercase text-[11px] font-bold">{doc.file_type}</span>
                      <span>•</span>
                      <span>{sizeKb} KB</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3.5 bg-[#121212] border-t border-[#202020] flex items-center justify-between">
                  <Link
                    to={`/documents/${doc.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EF2929] hover:text-red-300 transition"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(doc.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-[#202020] rounded-xl transition"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentsListPage;

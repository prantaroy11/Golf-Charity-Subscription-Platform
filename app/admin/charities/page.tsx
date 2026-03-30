'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Plus,
  Pencil,
  Trash2,
  X,
  Star,
  Globe,
  ExternalLink,
} from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';

// ──────────────────────────────────────────────────────────
// Admin Charities Page — Step 11.4
// List all charities, add/edit/delete, toggle featured
// ──────────────────────────────────────────────────────────

interface Charity {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  is_featured: boolean;
  created_at: string;
}

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Charity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCharities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/charities');
      const data = await res.json();
      setCharities(data.charities || []);
    } catch (err) {
      console.error('Failed to fetch charities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharities();
  }, [fetchCharities]);

  const openAdd = () => {
    setEditingCharity(null);
    setFormName('');
    setFormDescription('');
    setFormLogoUrl('');
    setFormWebsite('');
    setFormFeatured(false);
    setModalOpen(true);
  };

  const openEdit = (charity: Charity) => {
    setEditingCharity(charity);
    setFormName(charity.name);
    setFormDescription(charity.description || '');
    setFormLogoUrl(charity.logo_url || '');
    setFormWebsite(charity.website || '');
    setFormFeatured(charity.is_featured);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);

    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || null,
        logo_url: formLogoUrl.trim() || null,
        website: formWebsite.trim() || null,
        is_featured: formFeatured,
      };

      if (editingCharity) {
        // Update
        await fetch('/api/admin/charities', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCharity.id, ...payload }),
        });
      } else {
        // Create
        await fetch('/api/admin/charities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      fetchCharities();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await fetch('/api/admin/charities', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      setDeleteTarget(null);
      fetchCharities();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const toggleFeatured = async (charity: Charity) => {
    try {
      await fetch('/api/admin/charities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: charity.id,
          is_featured: !charity.is_featured,
        }),
      });
      fetchCharities();
    } catch (err) {
      console.error('Toggle featured failed:', err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-medium text-[#F9F9F6]">
              Charity Management
            </h1>
            <p className="text-sm text-gray-500">
              {charities.length} charit{charities.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
        </div>

        <GoldButton variant="primary" icon={Plus} onClick={openAdd}>
          Add Charity
        </GoldButton>
      </div>

      {/* Charities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 animate-pulse"
            >
              <div className="h-6 bg-white/5 rounded-lg mb-3 w-2/3" />
              <div className="h-4 bg-white/5 rounded-lg mb-2 w-full" />
              <div className="h-4 bg-white/5 rounded-lg w-3/4" />
            </div>
          ))}
        </div>
      ) : charities.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-16 text-center">
          <Heart className="w-10 h-10 mx-auto mb-3 text-gray-700" />
          <p className="text-gray-500 text-sm mb-1">No charities yet</p>
          <p className="text-gray-600 text-xs mb-4">
            Add charities to populate the directory
          </p>
          <GoldButton variant="primary" icon={Plus} onClick={openAdd} size="sm">
            Add First Charity
          </GoldButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {charities.map((charity) => (
            <motion.div
              key={charity.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl border p-6 transition-all duration-200 ${
                charity.is_featured
                  ? 'bg-[#D4AF37]/[0.05] border-[#D4AF37]/15'
                  : 'bg-white/[0.03] border-white/5'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {charity.logo_url ? (
                    <img
                      src={charity.logo_url}
                      alt={charity.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-rose-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-[#F9F9F6]">
                      {charity.name}
                    </h3>
                    {charity.is_featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                        <Star className="w-3 h-3" fill="currentColor" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFeatured(charity)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      charity.is_featured
                        ? 'text-[#D4AF37] hover:bg-[#D4AF37]/10'
                        : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'
                    }`}
                    title={
                      charity.is_featured
                        ? 'Remove featured'
                        : 'Mark as featured'
                    }
                  >
                    <Star
                      className="w-4 h-4"
                      fill={charity.is_featured ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    onClick={() => openEdit(charity)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(charity)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {charity.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {charity.description}
                </p>
              )}

              {charity.website && (
                <a
                  href={charity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#D4AF37] transition-colors"
                >
                  <Globe className="w-3 h-3" />
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-[2rem] bg-[#1A2E1A] border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-medium text-[#F9F9F6]">
                  {editingCharity ? 'Edit Charity' : 'Add Charity'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#F9F9F6] hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Charity name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F9F9F6] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short description"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F9F9F6] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={formLogoUrl}
                      onChange={(e) => setFormLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F9F9F6] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F9F9F6] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <button
                    onClick={() => setFormFeatured(!formFeatured)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      formFeatured ? 'bg-[#D4AF37]' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        formFeatured ? 'left-5' : 'left-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-400">
                    Featured charity
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <GoldButton
                    variant="ghost"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 !border-white/10 !text-gray-400 hover:!text-[#F9F9F6]"
                  >
                    Cancel
                  </GoldButton>
                  <GoldButton
                    variant="primary"
                    loading={saving}
                    onClick={handleSave}
                    className="flex-1"
                    disabled={!formName.trim()}
                  >
                    {editingCharity ? 'Save Changes' : 'Add Charity'}
                  </GoldButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] bg-[#1A2E1A] border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-serif font-medium text-[#F9F9F6]">
                  Delete Charity?
                </h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Are you sure you want to delete{' '}
                <strong className="text-[#F9F9F6]">{deleteTarget.name}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <GoldButton
                  variant="ghost"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 !border-white/10 !text-gray-400"
                >
                  Keep
                </GoldButton>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

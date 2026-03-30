'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Pencil,
  X,
  Users as UsersIcon,
  ChevronDown,
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import GoldButton from '@/components/ui/GoldButton';

// ──────────────────────────────────────────────────────────
// Admin Users Page — Step 11.2
// Server-side fetch all users (uses supabaseAdmin via API)
// Sortable table, search, row actions: View, Edit, Suspend
// ──────────────────────────────────────────────────────────

interface UserWithSubscription {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  charity_id: string | null;
  charity_pct: number;
  created_at: string;
  updated_at: string;
  subscriptions: Array<{
    id: string;
    plan: string;
    status: string;
    current_period_end: string | null;
  }>;
}

type SortField = 'full_name' | 'email' | 'role' | 'created_at';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal state
  const [editUser, setEditUser] = useState<UserWithSubscription | null>(null);
  const [viewUser, setViewUser] = useState<UserWithSubscription | null>(null);
  const [editRole, setEditRole] = useState('subscriber');
  const [editSubStatus, setEditSubStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(searchTerm)}&sortBy=${sortBy}&sortDir=${sortDir}`
      );
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortBy, sortDir]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const openEdit = (user: UserWithSubscription) => {
    setEditUser(user);
    setEditRole(user.role);
    const sub = user.subscriptions?.[0];
    setEditSubStatus(sub?.status || '');
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editUser.id,
          updates: {
            role: editRole,
            subscription_status: editSubStatus || undefined,
          },
        }),
      });

      if (res.ok) {
        setEditUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#D4AF37]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#D4AF37]" />
    );
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <UsersIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-medium text-[#F9F9F6]">
              User Management
            </h1>
            <p className="text-sm text-gray-500">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="admin-users-search"
            className="w-full sm:w-72 pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F9F9F6] placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[2rem] bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                {(
                  [
                    ['full_name', 'Name'],
                    ['email', 'Email'],
                    ['role', 'Role'],
                    ['created_at', 'Joined'],
                  ] as [SortField, string][]
                ).map(([field, label]) => (
                  <th
                    key={field}
                    className="px-6 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium cursor-pointer select-none hover:text-gray-300 transition-colors"
                    onClick={() => handleSort(field)}
                  >
                    <div className="flex items-center gap-1.5">
                      {label}
                      <SortIcon field={field} />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Plan
                </th>
                <th className="px-6 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">
                  Status
                </th>
                <th className="px-6 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-white/5 rounded-lg animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-600"
                  >
                    <UsersIcon className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const sub = u.subscriptions?.[0];
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-xs font-bold text-[#D4AF37]">
                            {u.full_name
                              ? u.full_name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)
                              : u.email[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-[#F9F9F6]">
                            {u.full_name || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.role === 'admin'
                              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20'
                              : 'bg-white/5 text-gray-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {sub?.plan ? (
                          <span className="capitalize">{sub.plan}</span>
                        ) : (
                          <span className="text-gray-600">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {sub?.status ? (
                          <StatusBadge
                            status={
                              sub.status as
                                | 'active'
                                | 'cancelled'
                                | 'lapsed'
                                | 'pending'
                            }
                          />
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewUser(u)}
                            className="p-2 rounded-lg text-gray-500 hover:text-[#F9F9F6] hover:bg-white/5 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            className="p-2 rounded-lg text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── View Modal ── */}
      <AnimatePresence>
        {viewUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setViewUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] bg-[#1A2E1A] border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-medium text-[#F9F9F6]">
                  User Details
                </h3>
                <button
                  onClick={() => setViewUser(null)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#F9F9F6] hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-sm font-bold text-[#D4AF37]">
                    {viewUser.full_name
                      ? viewUser.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : viewUser.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[#F9F9F6]">
                      {viewUser.full_name || 'No name'}
                    </p>
                    <p className="text-sm text-gray-500">{viewUser.email}</p>
                  </div>
                </div>

                {[
                  ['Role', viewUser.role],
                  ['Charity %', `${viewUser.charity_pct}%`],
                  [
                    'Joined',
                    new Date(viewUser.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }),
                  ],
                  ['Plan', viewUser.subscriptions?.[0]?.plan || 'None'],
                  [
                    'Subscription Status',
                    viewUser.subscriptions?.[0]?.status || 'None',
                  ],
                  [
                    'Renewal Date',
                    viewUser.subscriptions?.[0]?.current_period_end
                      ? new Date(
                          viewUser.subscriptions[0].current_period_end
                        ).toLocaleDateString('en-GB')
                      : '—',
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-xs uppercase tracking-widest text-gray-500">
                      {label}
                    </span>
                    <span className="text-sm text-[#F9F9F6] capitalize">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-[2rem] bg-[#1A2E1A] border border-white/10 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-medium text-[#F9F9F6]">
                  Edit User
                </h3>
                <button
                  onClick={() => setEditUser(null)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#F9F9F6] hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    {editUser.full_name || editUser.email}
                  </p>
                  <p className="text-xs text-gray-600">{editUser.email}</p>
                </div>

                {/* Role select */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F9F9F6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="subscriber">Subscriber</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Subscription status select */}
                {editUser.subscriptions?.[0] && (
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                      Subscription Status
                    </label>
                    <div className="relative">
                      <select
                        value={editSubStatus}
                        onChange={(e) => setEditSubStatus(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-[#F9F9F6] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="lapsed">Lapsed</option>
                        <option value="pending">Pending</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <GoldButton
                    variant="ghost"
                    onClick={() => setEditUser(null)}
                    className="flex-1 !border-white/10 !text-gray-400 hover:!text-[#F9F9F6]"
                  >
                    Cancel
                  </GoldButton>
                  <GoldButton
                    variant="primary"
                    loading={saving}
                    onClick={handleSaveEdit}
                    className="flex-1"
                  >
                    Save Changes
                  </GoldButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

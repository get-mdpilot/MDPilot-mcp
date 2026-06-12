'use client';

import { useState } from 'react';

interface PromptRow {
  id: string; file_type: string; role: string; version: number;
  content: string; is_active: boolean;
}
interface RoleRow { role: string; scope: string; ambiguity_level: string; description: string }
interface SkillRow { skill: string; source_doc: string; tags: string[] }

export default function AdminPromptsPage() {
  const [password, setPassword]   = useState('');
  const [authed, setAuthed]       = useState(false);
  const [prompts, setPrompts]     = useState<PromptRow[]>([]);
  const [roles, setRoles]         = useState<RoleRow[]>([]);
  const [skills, setSkills]       = useState<SkillRow[]>([]);
  const [filterRole, setFilterRole]   = useState('all');
  const [filterType, setFilterType]   = useState('all');
  const [editing, setEditing]     = useState<{ fileType: string; role: string; content: string } | null>(null);
  const [status, setStatus]       = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  const headers = () => ({ 'Content-Type': 'application/json', 'x-admin-password': password });

  async function load() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/prompts', { headers: headers() });
      if (res.status === 401) { setStatus('Wrong password'); setLoading(false); return; }
      const data = await res.json();
      setPrompts(data.prompts ?? []);
      setRoles(data.roles ?? []);
      setSkills(data.skills ?? []);
      setAuthed(true);
    } catch {
      setStatus('Failed to load');
    }
    setLoading(false);
  }

  async function save() {
    if (!editing) return;
    setStatus('Saving…');
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ fileType: editing.fileType, role: editing.role, content: editing.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus(`Saved ${editing.fileType}/${editing.role} as v${data.saved.version}`);
      setEditing(null);
      await load();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Save failed');
    }
  }

  // ── Login gate ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[var(--md-dark-2)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--md-border)] bg-[var(--md-surface)] p-6">
          <h1 className="text-lg font-semibold mb-1">Admin · Prompt Library</h1>
          <p className="text-xs text-[var(--md-text-tertiary)] mb-4">Enter the admin password to manage prompts.</p>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Admin password"
            className="w-full rounded-lg border border-[var(--md-border)] bg-[var(--md-surface)] px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[var(--md-accent)]/50"
          />
          <button onClick={load} disabled={loading}
            className="w-full py-2 rounded-lg bg-[var(--md-accent)] text-[var(--md-bg)] text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {loading ? 'Checking…' : 'Unlock'}
          </button>
          {status && <p className="text-xs text-[var(--md-coral)] mt-3">{status}</p>}
        </div>
      </div>
    );
  }

  const fileTypes = Array.from(new Set(prompts.map(p => p.file_type))).sort();
  const visible = prompts.filter(p =>
    (filterRole === 'all' || p.role === filterRole) &&
    (filterType === 'all' || p.file_type === filterType),
  );

  // ── Dashboard ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--md-dark-2)] px-4 sm:px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Prompt Library</h1>
          <button onClick={() => setEditing({ fileType: 'readme', role: 'developer', content: '' })}
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--md-accent)] text-[var(--md-bg)] font-medium hover:opacity-90">
            + New prompt
          </button>
        </div>

        {status && <p className="text-xs text-[var(--md-teal)] bg-[var(--md-teal-light)] rounded-lg px-3 py-2 mb-4">{status}</p>}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="rounded-lg border border-[var(--md-border)] bg-[var(--md-surface)] px-3 py-1.5 text-xs">
            <option value="all">All file types</option>
            {fileTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="rounded-lg border border-[var(--md-border)] bg-[var(--md-surface)] px-3 py-1.5 text-xs">
            <option value="all">All roles</option>
            {roles.map(r => <option key={r.role} value={r.role}>{r.role}</option>)}
          </select>
        </div>

        {/* Prompt list */}
        <div className="flex flex-col gap-2 mb-8">
          {visible.length === 0 && (
            <p className="text-sm text-[var(--md-text-tertiary)] py-6 text-center">
              No prompts found. The app is running on hardcoded fallbacks until you seed the library.
            </p>
          )}
          {visible.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold">{p.file_type}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[5px] bg-[var(--md-surface-2)] text-[var(--md-text-tertiary)]">{p.role}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[5px] bg-[var(--md-accent)]/[0.12] text-[var(--md-accent)]">v{p.version}</span>
                  {p.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded-[5px] bg-[var(--md-teal-light)] text-[var(--md-teal)]">active</span>}
                </div>
                <p className="text-xs text-[var(--md-text-tertiary)] truncate mt-0.5 max-w-md">{p.content.slice(0, 90)}…</p>
              </div>
              <button onClick={() => setEditing({ fileType: p.file_type, role: p.role, content: p.content })}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--md-border)] hover:bg-[var(--md-surface-2)] shrink-0 ml-3">
                Edit
              </button>
            </div>
          ))}
        </div>

        {/* Roles reference */}
        <h2 className="text-sm font-semibold mb-2">Roles ({roles.length})</h2>
        <div className="flex flex-wrap gap-1.5 mb-8">
          {roles.map(r => (
            <span key={r.role} title={r.description}
              className="text-[11px] font-mono px-2 py-1 rounded-[5px] border border-[var(--md-border)] text-[var(--md-text-secondary)]">
              {r.role} · {r.ambiguity_level}
            </span>
          ))}
        </div>

        {skills.length > 0 && (
          <>
            <h2 className="text-sm font-semibold mb-2">Skills ({skills.length})</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s.skill} className="text-[11px] font-mono px-2 py-1 rounded-[5px] border border-[var(--md-border)] text-[var(--md-text-secondary)]">{s.skill}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--md-border-strong)] bg-[var(--md-dark-2)] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <select value={editing.fileType} onChange={e => setEditing({ ...editing, fileType: e.target.value })}
                className="rounded-lg border border-[var(--md-border)] bg-[var(--md-surface)] px-3 py-1.5 text-xs">
                {['readme','agents','claude','task','spec','skill','design','contributing','security','context'].map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })}
                className="rounded-lg border border-[var(--md-border)] bg-[var(--md-surface)] px-3 py-1.5 text-xs">
                {(roles.length ? roles.map(r => r.role) : ['developer']).map(r => <option key={r}>{r}</option>)}
              </select>
              <span className="text-[11px] text-[var(--md-text-tertiary)]">Saving creates a new active version</span>
            </div>
            <textarea
              value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })}
              rows={16}
              className="w-full rounded-xl border border-[var(--md-border)] bg-[var(--md-surface)] p-4 text-xs font-mono resize-none focus:outline-none focus:border-[var(--md-accent)]/50"
              placeholder="System prompt content…"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="text-xs px-4 py-2 rounded-lg border border-[var(--md-border)] hover:bg-[var(--md-surface-2)]">Cancel</button>
              <button onClick={save} className="text-xs px-4 py-2 rounded-lg bg-[var(--md-accent)] text-[var(--md-bg)] font-medium hover:opacity-90">Save new version</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

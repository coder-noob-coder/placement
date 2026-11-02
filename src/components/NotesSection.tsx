'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Send, RefreshCw, MessageSquare, Clock } from 'lucide-react';

interface NoteItem {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  timestampFormatted: string;
}

const STORAGE_KEY = 'placement_terminal_notes_v1';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function filterExpiredNotes(notes: NoteItem[]): NoteItem[] {
  const now = Date.now();
  return notes.filter((n) => {
    if (!n || !n.createdAt) return false;
    const time = new Date(n.createdAt).getTime();
    if (isNaN(time)) return false;
    return now - time < TWENTY_FOUR_HOURS_MS;
  });
}

function getTimeRemaining(createdAt?: string): string {
  if (!createdAt) return '24h left';
  const created = new Date(createdAt).getTime();
  if (isNaN(created)) return '24h left';
  const elapsed = Date.now() - created;
  const remainingMs = TWENTY_FOUR_HOURS_MS - elapsed;
  if (remainingMs <= 0) return 'Expiring';
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h left`;
  return `${mins}m left`;
}

function formatNoteTimestamp(createdAt?: string, fallback?: string): string {
  if (!createdAt) return fallback || '';
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return fallback || '';
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getLocalNotes(): NoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const active = filterExpiredNotes(parsed);
    if (active.length !== parsed.length) {
      saveLocalNotes(active);
    }
    return active;
  } catch {
    return [];
  }
}

function saveLocalNotes(notes: NoteItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const active = filterExpiredNotes(notes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export const NotesSection: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const cached = getLocalNotes();
    if (cached.length > 0) {
      setNotes(cached);
    }
  }, []);

  const fetchNotes = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const res = await fetch('/api/notes', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.notes)) {
          const valid = filterExpiredNotes(data.notes);
          setNotes((prev) => {
            const map = new Map<string, NoteItem>();
            prev.forEach((n) => map.set(n.id, n));
            valid.forEach((n: NoteItem) => map.set(n.id, n));
            const merged = Array.from(map.values());
            merged.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const activeOnly = filterExpiredNotes(merged);
            saveLocalNotes(activeOnly);
            return activeOnly;
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      if (!quiet) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes(true);
    const interval = setInterval(() => {
      fetchNotes(true);
      setNotes((prev) => {
        const purged = filterExpiredNotes(prev);
        if (purged.length !== prev.length) {
          saveLocalNotes(purged);
          return purged;
        }
        return prev;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchNotes]);

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    const trimmedText = inputText.trim();
    const author = authorName.trim() || 'Candidate';
    const now = new Date();
    const timestampFormatted = formatNoteTimestamp(now.toISOString());

    const newNote: NoteItem = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text: trimmedText,
      author,
      createdAt: now.toISOString(),
      timestampFormatted,
    };

    setNotes((prev) => {
      const updated = filterExpiredNotes([newNote, ...prev]);
      saveLocalNotes(updated);
      return updated;
    });
    setInputText('');

    try {
      setIsSubmitting(true);
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
    } catch (err) {
      console.error('Failed to sync note to server:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0c141f] border border-[#1b2737] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm shadow-black/20 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#172332]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-[#22c55e]/15 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Live Notes &amp; Prep Board
            </h2>
          </div>
          <span className="text-[10px] text-amber-400 border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 rounded-full font-semibold">
            24h Auto-Purge
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#70879d] hidden sm:inline">
            {notes.length} active
          </span>
          <button
            onClick={() => fetchNotes()}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl bg-[#131d2a] border border-[#1e2c3c] text-[#70879d] hover:text-white transition-colors cursor-pointer"
            title="Refresh Notes"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#22c55e]' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmitNote} className="space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name / handle (optional)..."
            className="w-full sm:w-56 px-3.5 py-2 rounded-xl bg-[#131d2a] text-xs text-white placeholder-[#70879d] border border-[#1e2c3c] focus:outline-none focus:border-[#22c55e]"
          />

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a note, question, tip, or announcement..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#131d2a] text-xs text-white placeholder-[#70879d] border border-[#1e2c3c] focus:outline-none focus:border-[#22c55e]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post</span>
            </button>
          </div>
        </div>
      </form>

      {/* Notes Stream */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#70879d] border border-dashed border-[#1b2737] rounded-xl">
            No active notes yet. Posts are shared in real-time and auto-delete after 24 hours.
          </div>
        ) : (
          notes.map((item) => (
            <div
              key={item.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#131d2a] border border-[#1e2c3c] hover:border-[#2a3c50] transition-colors group space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#22c55e] font-semibold">
                    {item.author}
                  </span>
                  <span className="text-[#334657]">&bull;</span>
                  <span className="text-[#70879d] text-[11px]">
                    {formatNoteTimestamp(item.createdAt, item.timestampFormatted)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium shrink-0 bg-[#0c141f] border border-[#1b2737] px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{getTimeRemaining(item.createdAt)}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                {item.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

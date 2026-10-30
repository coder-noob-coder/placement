'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Send, Trash2, RefreshCw, MessageSquare } from 'lucide-react';

interface NoteItem {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  timestampFormatted: string;
}

const STORAGE_KEY = 'placement_terminal_notes_v1';

function formatNoteTimestamp(createdAt?: string, fallback?: string): string {
  if (!createdAt) return fallback || '';
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return fallback || '';
  return d
    .toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .toUpperCase();
}

function getLocalNotes(): NoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalNotes(notes: NoteItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
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

  // 1. Initial Load from localStorage immediately on mount
  useEffect(() => {
    const cached = getLocalNotes();
    if (cached.length > 0) {
      setNotes(cached);
    }
  }, []);

  // 2. Fetch and merge with server notes
  const fetchNotes = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsRefreshing(true);
      const res = await fetch(`/api/notes?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();

      if (data.success && Array.isArray(data.notes)) {
        setNotes((prev) => {
          const currentLocal = getLocalNotes();
          // Merge server notes with local notes, deduplicating by id
          const map = new Map<string, NoteItem>();

          // Add server notes first
          data.notes.forEach((n: NoteItem) => {
            if (n && n.id) map.set(n.id, n);
          });

          // Add existing local notes
          [...prev, ...currentLocal].forEach((n: NoteItem) => {
            if (n && n.id && !map.has(n.id)) {
              map.set(n.id, n);
            }
          });

          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          saveLocalNotes(merged);
          return merged;
        });
      }
    } catch (err) {
      console.error('Failed to load notes from server:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Polling every 5 seconds for shared live updates
  useEffect(() => {
    const timer = setInterval(() => {
      fetchNotes(true);
    }, 5000);

    return () => clearInterval(timer);
  }, [fetchNotes]);

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    const trimmedText = inputText.trim();
    const author = authorName.trim() || 'Candidate';
    const now = new Date();
    const timestampFormatted = formatNoteTimestamp(now.toISOString());

    // Optimistic local note item
    const newNote: NoteItem = {
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text: trimmedText,
      author,
      createdAt: now.toISOString(),
      timestampFormatted,
    };

    // Immediately update UI and localStorage so it NEVER disappears on refresh
    setNotes((prev) => {
      const updated = [newNote, ...prev];
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

  const handleDeleteNote = async (id: string) => {
    // Immediately delete from local UI and localStorage
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveLocalNotes(updated);
      return updated;
    });

    try {
      await fetch(`/api/notes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete note on server:', err);
    }
  };

  return (
    <div className="bg-[#0a1219] border border-[#142330] rounded-xl p-4 sm:p-5 space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#142330]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#00ff66]" />
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            Placement Prep &amp; Shared Notes
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#546b80] hidden sm:inline">
            [ {notes.length} NOTES ]
          </span>
          <button
            onClick={() => fetchNotes()}
            disabled={isRefreshing}
            className="p-1 rounded bg-[#070c12] border border-[#142330] text-[#70879d] hover:text-white transition-colors cursor-pointer"
            title="Refresh Notes"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00ff66]' : ''}`}
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
            placeholder="YOUR NAME / HANDLE (OPTIONAL)..."
            className="w-full sm:w-56 px-3 py-1.5 rounded-md bg-[#070c12] text-xs text-white placeholder-[#546b80] border border-[#142330] focus:outline-none focus:border-[#00ff66]/50 uppercase tracking-wider"
          />

          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="WRITE A NOTE, INTERVIEW QUESTION, TIP, OR ANNOUNCEMENT..."
              className="flex-1 px-3 py-1.5 rounded-md bg-[#070c12] text-xs text-white placeholder-[#546b80] border border-[#142330] focus:outline-none focus:border-[#00ff66]/50 uppercase tracking-wider"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSubmitting}
              className="px-4 py-1.5 rounded-md bg-[#00ff66]/10 border border-[#00ff66]/40 text-[#00ff66] hover:bg-[#00ff66]/20 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">POST</span>
            </button>
          </div>
        </div>
      </form>

      {/* Notes Stream */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#546b80] tracking-wider border border-dashed border-[#142330] rounded-lg">
            [ NO NOTES YET. BE THE FIRST TO POST AN INTERVIEW QUESTION OR UPDATE! ]
          </div>
        ) : (
          notes.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-[#070c12] border border-[#142330] hover:border-[#1d354a] transition-colors group space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-[#00ff66] font-bold tracking-wider">
                    {item.author}
                  </span>
                  <span className="text-[#334657]">&bull;</span>
                  <span className="text-[#546b80]">
                    {formatNoteTimestamp(item.createdAt, item.timestampFormatted)}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteNote(item.id)}
                  className="text-[#546b80] hover:text-red-400 p-1 opacity-70 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {item.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

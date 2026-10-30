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

export const NotesSection: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotes = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsRefreshing(true);
      const res = await fetch(`/api/notes?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.notes)) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Polling every 4 seconds so any note written by anyone appears live!
  useEffect(() => {
    const timer = setInterval(() => {
      fetchNotes(true);
    }, 4000);

    return () => clearInterval(timer);
  }, [fetchNotes]);

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          author: authorName.trim() || 'Candidate',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInputText('');
        if (Array.isArray(data.notes)) {
          setNotes(data.notes);
        } else {
          fetchNotes(true);
        }
      }
    } catch (err) {
      console.error('Failed to submit note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notes)) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  return (
    <div className="bg-[#0a1219] border border-[#142330] rounded-xl p-4 sm:p-5 space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#142330]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#00ff66]" />
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            Live Placement Notes &amp; Prep Board
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#546b80]">
            [ <strong className="text-white">{notes.length}</strong> POSTS ]
          </span>

          <button
            onClick={() => fetchNotes()}
            disabled={isRefreshing}
            className="p-1 rounded border border-[#142330] hover:border-[#1d354a] bg-[#070c12] text-[#70879d] hover:text-white transition-colors cursor-pointer"
            title="Refresh notes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00ff66]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Write Note Input Form */}
      <form onSubmit={handleSubmitNote} className="space-y-2.5">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="TYPE QUICK PLACEMENT NOTE, INTERVIEW QUESTION, OR RECRUITMENT LOG..."
          rows={3}
          className="w-full bg-[#070c12] border border-[#142330] rounded-lg p-3 text-xs text-white placeholder-[#546b80] focus:outline-none focus:border-[#00ff66]/60 transition-colors uppercase tracking-wider"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#546b80] uppercase tracking-wider">FROM:</span>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Candidate (or name)"
              className="bg-[#070c12] border border-[#142330] rounded px-2.5 py-1 text-xs text-white placeholder-[#546b80] focus:outline-none focus:border-[#00ff66]/50 w-44"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isSubmitting}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md border border-[#00ff66] bg-[#00ff66]/10 hover:bg-[#00ff66]/20 text-[#00ff66] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3 h-3" />
            <span>{isSubmitting ? 'POSTING...' : '[ POST NOTE ]'}</span>
          </button>
        </div>
      </form>

      {/* Notes Live Feed List */}
      <div className="pt-2">
        <div className="text-[10px] font-semibold text-[#546b80] uppercase tracking-widest mb-2.5">
          SHARED LOGS &bull; REAL-TIME FEED
        </div>

        {notes.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#546b80] border border-dashed border-[#142330] rounded-lg">
            [ NO NOTES POSTED YET. WRITE ONE ABOVE! ]
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-[#070c12] border border-[#142330] hover:border-[#1d354a] rounded-lg p-3 transition-colors group"
              >
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#142330]/60 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#00ff66] text-xs">
                      {note.author}
                    </span>
                    <span className="text-[#334657]">&bull;</span>
                    <span className="text-[11px] text-[#546b80]">
                      {note.timestampFormatted}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-[#546b80] hover:text-[#ef4444] transition-colors p-0.5 cursor-pointer opacity-70 group-hover:opacity-100"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


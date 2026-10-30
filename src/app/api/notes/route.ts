import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface NoteItem {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  timestampFormatted: string;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function filterExpiredNotes(notes: NoteItem[]): NoteItem[] {
  const now = Date.now();
  return notes.filter((n) => {
    if (!n || !n.createdAt) return false;
    const time = new Date(n.createdAt).getTime();
    if (isNaN(time)) return false;
    return now - time < TWENTY_FOUR_HOURS_MS;
  });
}

// In Vercel serverless environment, filesystem is read-only except /tmp
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const dataDir = isVercel ? '/tmp' : path.resolve(process.cwd(), 'data');
const notesFilePath = path.join(dataDir, 'notes.json');

// Global memory cache to retain notes across serverless invocations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = globalThis as any;
if (!globalAny.__placement_notes) {
  globalAny.__placement_notes = [];
}

function readNotes(): NoteItem[] {
  let list: NoteItem[] = [];
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(notesFilePath)) {
      const content = fs.readFileSync(notesFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (err) {
    console.error('Error reading notes file:', err);
  }

  if (list.length === 0 && Array.isArray(globalAny.__placement_notes)) {
    list = globalAny.__placement_notes;
  }

  // Filter out any notes older than 24 hours
  const active = filterExpiredNotes(list);
  if (active.length !== list.length) {
    writeNotes(active);
  } else {
    globalAny.__placement_notes = active;
  }

  return active;
}

function writeNotes(notes: NoteItem[]): boolean {
  const active = filterExpiredNotes(notes);
  globalAny.__placement_notes = active;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(notesFilePath, JSON.stringify(active, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing notes file:', err);
    return false;
  }
}

export async function GET() {
  const notes = readNotes();
  return NextResponse.json(
    { success: true, notes },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = String(body.text || '').trim();
    const author = String(body.author || 'Candidate').trim() || 'Candidate';

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Note text cannot be empty' },
        { status: 400 }
      );
    }

    const now = new Date();
    const timestampFormatted = now
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

    const newNote: NoteItem = {
      id: body.id || `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text,
      author,
      createdAt: body.createdAt || now.toISOString(),
      timestampFormatted,
    };

    const currentNotes = readNotes();
    // Filter expired and prepend new note
    const updatedNotes = [newNote, ...currentNotes.filter((n) => n.id !== newNote.id)];
    writeNotes(updatedNotes);

    return NextResponse.json({ success: true, note: newNote, notes: updatedNotes });
  } catch (err) {
    console.error('Failed to save note:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error saving note' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing note id' },
        { status: 400 }
      );
    }

    const currentNotes = readNotes();
    const updatedNotes = currentNotes.filter((n) => n.id !== id);
    writeNotes(updatedNotes);

    return NextResponse.json({ success: true, notes: updatedNotes });
  } catch (err) {
    console.error('Failed to delete note:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error deleting note' },
      { status: 500 }
    );
  }
}

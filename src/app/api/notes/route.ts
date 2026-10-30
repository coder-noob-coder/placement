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
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(notesFilePath)) {
      const content = fs.readFileSync(notesFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalAny.__placement_notes = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading notes file:', err);
  }

  // Fallback to in-memory store
  return Array.isArray(globalAny.__placement_notes) ? globalAny.__placement_notes : [];
}

function writeNotes(notes: NoteItem[]): boolean {
  globalAny.__placement_notes = notes;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), 'utf-8');
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
    const timestampFormatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const newNote: NoteItem = {
      id: body.id || `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text,
      author,
      createdAt: now.toISOString(),
      timestampFormatted,
    };

    const currentNotes = readNotes();
    // Prevent duplicate ids
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

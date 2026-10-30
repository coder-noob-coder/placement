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

const dataDir = path.resolve(process.cwd(), 'data');
const notesFilePath = path.join(dataDir, 'notes.json');

function readNotes(): NoteItem[] {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(notesFilePath)) {
      fs.writeFileSync(notesFilePath, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const content = fs.readFileSync(notesFilePath, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading notes.json:', err);
    return [];
  }
}

function writeNotes(notes: NoteItem[]): boolean {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing notes.json:', err);
    return false;
  }
}

export async function GET() {
  const notes = readNotes();
  return NextResponse.json({ success: true, notes }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
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
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text,
      author,
      createdAt: now.toISOString(),
      timestampFormatted,
    };

    const currentNotes = readNotes();
    const updatedNotes = [newNote, ...currentNotes];
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


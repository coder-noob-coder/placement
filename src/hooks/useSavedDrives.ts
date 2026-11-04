'use client';

import { useState, useEffect, useCallback } from 'react';

export type ApplicationStage = 'Applied' | 'OA Round' | 'Interview' | 'Offered';

export interface SavedDriveRecord {
  stage: ApplicationStage;
  savedAt: number;
}

export type SavedDrivesMap = Record<string, SavedDriveRecord>;

export const SAVED_STORAGE_KEY = 'saved_placement_drives';

function readFromStorage(): SavedDrivesMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const map: SavedDrivesMap = {};
      parsed.forEach((id: string) => {
        if (id && typeof id === 'string') {
          map[id] = { stage: 'Applied', savedAt: Date.now() };
        }
      });
      return map;
    }
    if (parsed && typeof parsed === 'object') {
      const map: SavedDrivesMap = {};
      Object.entries(parsed).forEach(([key, val]) => {
        if (val && typeof val === 'object' && 'stage' in (val as Record<string, unknown>)) {
          map[key] = val as SavedDriveRecord;
        } else {
          map[key] = { stage: 'Applied', savedAt: Date.now() };
        }
      });
      return map;
    }
  } catch (err) {
    console.error('Error reading saved drives from localStorage:', err);
  }
  return {};
}

function saveToStorage(store: SavedDrivesMap) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving drives to localStorage:', err);
  }
}

let cachedStore: SavedDrivesMap = {};

export function useSavedDrives() {
  const [savedDrives, setSavedDrives] = useState<SavedDrivesMap>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    cachedStore = readFromStorage();
    setSavedDrives(cachedStore);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === SAVED_STORAGE_KEY || e.key === null) {
        cachedStore = readFromStorage();
        setSavedDrives({ ...cachedStore });
      }
    };

    const handleCustom = () => {
      setSavedDrives({ ...cachedStore });
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('saved-drives-updated', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('saved-drives-updated', handleCustom);
    };
  }, []);

  const isSaved = useCallback(
    (driveId: string, company?: string): boolean => {
      if (!mounted) return false;
      if (savedDrives[driveId]) return true;
      if (company) {
        const compKey = company.toLowerCase().trim();
        if (savedDrives[compKey]) return true;
      }
      return false;
    },
    [savedDrives, mounted]
  );

  const getStage = useCallback(
    (driveId: string, company?: string): ApplicationStage => {
      if (savedDrives[driveId]?.stage) return savedDrives[driveId].stage;
      if (company) {
        const compKey = company.toLowerCase().trim();
        if (savedDrives[compKey]?.stage) return savedDrives[compKey].stage;
      }
      return 'Applied';
    },
    [savedDrives]
  );

  const toggleSave = useCallback(
    (driveId: string, company?: string, defaultStage: ApplicationStage = 'Applied') => {
      const current = readFromStorage();
      const compKey = company ? company.toLowerCase().trim() : '';

      const matchedKey = current[driveId]
        ? driveId
        : compKey && current[compKey]
        ? compKey
        : null;

      if (matchedKey) {
        delete current[matchedKey];
        if (compKey && current[compKey]) delete current[compKey];
      } else {
        current[driveId] = {
          stage: defaultStage,
          savedAt: Date.now(),
        };
      }

      cachedStore = { ...current };
      saveToStorage(cachedStore);
      setSavedDrives(cachedStore);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('saved-drives-updated'));
      }
    },
    []
  );

  const updateStage = useCallback(
    (driveId: string, stage: ApplicationStage, company?: string) => {
      const current = readFromStorage();
      const compKey = company ? company.toLowerCase().trim() : '';

      const keyToUpdate = current[driveId]
        ? driveId
        : compKey && current[compKey]
        ? compKey
        : driveId;

      current[keyToUpdate] = {
        stage,
        savedAt: current[keyToUpdate]?.savedAt || Date.now(),
      };

      cachedStore = { ...current };
      saveToStorage(cachedStore);
      setSavedDrives(cachedStore);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('saved-drives-updated'));
      }
    },
    []
  );

  return {
    savedDrives,
    isSaved,
    getStage,
    toggleSave,
    updateStage,
    savedCount: Object.keys(savedDrives).length,
    mounted,
  };
}


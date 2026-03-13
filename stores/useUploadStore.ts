import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_QUEUE_KEY = 'snapsy_pending_uploads';

export type PendingUpload = {
  uri: string;
  eventId: string;
  uploadedBy: string;
  error?: string;
};

type UploadItem = {
  uri: string;
  progress: number;
  done?: boolean;
  error?: string;
};

type UploadStore = {
  queue: UploadItem[];
  pendingQueue: PendingUpload[];
  addToQueue: (uri: string) => void;
  setProgress: (uri: string, progress: number, done?: boolean, error?: string) => void;
  clearQueue: () => void;
  addPending: (item: PendingUpload) => void;
  removePending: (uri: string) => void;
  setPendingError: (uri: string, error: string) => void;
  clearPendingError: (uri: string) => void;
  retryAllFailed: () => void;
  setPendingQueue: (items: PendingUpload[]) => void;
  hydratePending: () => Promise<void>;
};

const persistPending = async (pending: PendingUpload[]) => {
  try {
    await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(pending));
  } catch {}
};

export const useUploadStore = create<UploadStore>((set, get) => ({
  queue: [],
  pendingQueue: [],
  addToQueue: (uri) =>
    set((s) => ({ queue: [...s.queue, { uri, progress: 0 }] })),
  setProgress: (uri, progress, done, error) =>
    set((s) => ({
      queue: s.queue.map((q) =>
        q.uri === uri ? { ...q, progress, done, error } : q
      ),
    })),
  clearQueue: () => set({ queue: [] }),
  addPending: (item) =>
    set((s) => {
      const next = [...s.pendingQueue, item];
      persistPending(next);
      return { pendingQueue: next };
    }),
  removePending: (uri) =>
    set((s) => {
      const next = s.pendingQueue.filter((p) => p.uri !== uri);
      persistPending(next);
      return { pendingQueue: next };
    }),
  setPendingError: (uri, error) =>
    set((s) => ({
      pendingQueue: s.pendingQueue.map((p) =>
        p.uri === uri ? { ...p, error } : p
      ),
    })),
  clearPendingError: (uri) =>
    set((s) => ({
      pendingQueue: s.pendingQueue.map((p) =>
        p.uri === uri ? { ...p, error: undefined } : p
      ),
    })),
  retryAllFailed: () =>
    set((s) => {
      const next = s.pendingQueue.map((p) => ({ ...p, error: undefined }));
      persistPending(next);
      return { pendingQueue: next };
    }),
  setPendingQueue: (items) => {
    set({ pendingQueue: items });
    persistPending(items);
  },
  hydratePending: async () => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
      if (raw) {
        const items = JSON.parse(raw) as PendingUpload[];
        set({ pendingQueue: items });
      }
    } catch {
      set({ pendingQueue: [] });
    }
  },
}));

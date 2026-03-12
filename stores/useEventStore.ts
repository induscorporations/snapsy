import { create } from 'zustand';

type EventStore = {
  currentEventId: string | null;
  setCurrentEventId: (id: string | null) => void;
};

export const useEventStore = create<EventStore>((set) => ({
  currentEventId: null,
  setCurrentEventId: (id) => set({ currentEventId: id }),
}));

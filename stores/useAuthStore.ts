import { create } from 'zustand';

type AuthStore = {
  convexUserId: string | null;
  setConvexUserId: (id: string | null) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  convexUserId: null,
  setConvexUserId: (id) => set({ convexUserId: id }),
}));

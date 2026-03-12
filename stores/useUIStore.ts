import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'snapsy_onboarding_done';

type UIStore = {
  createEventSheetOpen: boolean;
  setCreateEventSheetOpen: (open: boolean) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (v: boolean) => void;
  onboardingHydrated: boolean;
  hydrateOnboarding: () => Promise<void>;
  uploadSuccessSnackbar: boolean;
  setUploadSuccessSnackbar: (v: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  createEventSheetOpen: false,
  setCreateEventSheetOpen: (open) => set({ createEventSheetOpen: open }),
  hasCompletedOnboarding: false,
  onboardingHydrated: false,
  setHasCompletedOnboarding: (v) => {
    set({ hasCompletedOnboarding: v });
    AsyncStorage.setItem(ONBOARDING_KEY, v ? '1' : '0');
  },
  hydrateOnboarding: async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      set({ hasCompletedOnboarding: value === '1', onboardingHydrated: true });
    } catch {
      set({ onboardingHydrated: true });
    }
  },
  uploadSuccessSnackbar: false,
  setUploadSuccessSnackbar: (v: boolean) => set({ uploadSuccessSnackbar: v }),
}));

import { create } from "zustand";
import { IGlobalSettings } from "@/app/interfaces";

type GlobalSettingStore = {
  selectedEnvironment: string;
  setSelectedEnvironment: (value: string) => void;

  globalSettings: IGlobalSettings | null;
  setGlobalSettings: (settings: IGlobalSettings) => void;
  clearGlobalSettings: () => void;
};

export const useGlobalSetting = create<GlobalSettingStore>((set) => ({
  selectedEnvironment: "nonprod",
  setSelectedEnvironment: (value) => set({ selectedEnvironment: value }),

  globalSettings: null,
  setGlobalSettings: (settings) => set({ globalSettings: settings }),
  clearGlobalSettings: () => set({ globalSettings: null }),
}));

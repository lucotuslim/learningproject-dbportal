import { create } from "zustand";

type GlobalSettingStore = {
  selectedEnvironment: string;
  setSelectedEnvironment: (value: string) => void;
};

export const useGlobalSetting = create<GlobalSettingStore>((set) => ({
  selectedEnvironment: "",
  setSelectedEnvironment: (value) => set({ selectedEnvironment: value }),
}));
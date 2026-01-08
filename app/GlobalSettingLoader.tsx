"use client";

import { useEffect } from "react";
import { useGlobalSetting } from "@/lib/store";
import { GlobalSetting } from "@/app/appconfig";

export function GlobalSettingLoader() {
    const setGlobalSettings = useGlobalSetting(
        (s) => s.setGlobalSettings
    );

    useEffect(() => {
        GlobalSetting().then(setGlobalSettings).catch(console.error);
    }, [setGlobalSettings]);

    return null;
}

"use client";
import { columns } from "./columns"
import { DataTable } from "./data-table";
import { ICustomerSecurityGroup, ICustomerPermissionConfig } from "../interfaces";
import { getCustomerSecurityGroups } from "../serverlib";
import { useGlobalSetting } from "@/lib/store";
import { useCallback, useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { CustomerPermissionSetting } from "../appconfig"
import { toast } from "sonner";

export default function CustomerSecurityGroup() {
    const selectedEnvironment = useGlobalSetting((state) => state.selectedEnvironment);
    const globalSettings = useGlobalSetting((state) => state.globalSettings);

    const [data, setData] = useState<ICustomerSecurityGroup[]>([]);
    const [search, setSearch] = useState("");
    const [customerpermissionsetting, setcustomerpermissionsetting] = useState<ICustomerPermissionConfig>()

    // Guard to ensure config only fetches once even in Strict Mode
    const configFetched = useRef(false);

    // 1. Fetch config once at the page level
    useEffect(() => {
        if (configFetched.current) return;
        configFetched.current = true;

        CustomerPermissionSetting()
            .then(setcustomerpermissionsetting)
            .catch(err => toast.error("Failed to load settings"));
    }, []);

    const loaddata = useCallback(async () => {
        // Now we wait for customerpermissionsetting to be available before fetching data
        if (!selectedEnvironment || !globalSettings || !customerpermissionsetting) return;

        try {
            // Only clear data if we are actually about to fetch new stuff
            // to prevent unnecessary "Loading..." flickers in Cypress
            const res = await getCustomerSecurityGroups<ICustomerSecurityGroup>(
                customerpermissionsetting.customerdbserver,
                customerpermissionsetting.customerdb,
                selectedEnvironment,
                customerpermissionsetting.domainprefix
            );
            setData(res ?? []);
        } catch (err) {
            console.error("Failed to load customer security groups:", err);
            toast.error(String(err))
        }
    }, [selectedEnvironment, globalSettings, customerpermissionsetting]);

    useEffect(() => {
        loaddata();
    }, [loaddata]);

    const filteredData = data.filter((item: ICustomerSecurityGroup) => {
        const normalizedSearch = search.toLowerCase();
        const groupName = item.GroupName.toLowerCase();
        if (normalizedSearch.endsWith("%")) {
            return groupName.startsWith(normalizedSearch.slice(0, -1));
        }
        return normalizedSearch === "" ? true : groupName === normalizedSearch;
    });

    // Handle initial loading state gracefully
    if (!customerpermissionsetting || (data.length === 0 && !search)) {
        return <div className="container mx-auto py-10">Loading Security Groups...</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-4">
                <Input
                    placeholder="Search Group Name. End % for like expression"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-128"
                />
            </div>
            {/* Pass the setting into columns so ActionsCell doesn't have to fetch it */}
            <DataTable
                columns={columns(selectedEnvironment, customerpermissionsetting)}
                data={filteredData}
            />
        </div>
    );
}
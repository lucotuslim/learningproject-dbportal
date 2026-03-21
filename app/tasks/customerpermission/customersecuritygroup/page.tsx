"use client";
import { columns } from "./columns"
import { DataTable } from "./data-table";
import { ICustomerSecurityGroup, ICustomerPermissionConfig } from "../interfaces";
import { getCustomerSecurityGroups } from "../serverlib";
import { useGlobalSetting } from "@/lib/store";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { CustomerPermissionSetting } from "../appconfig"
import { toast } from "sonner";
export default function CustomerSecurityGroup() {
    const selectedEnvironment = useGlobalSetting((state) => state.selectedEnvironment);
    const globalSettings = useGlobalSetting((state) => state.globalSettings);
    console.log("Selected Environment in Customer Security Group Page:", selectedEnvironment);
    const [data, setData] = useState<ICustomerSecurityGroup[]>([]);
    const [search, setSearch] = useState("");

    const filteredData = data.filter((item: ICustomerSecurityGroup) => {
        const normalizedSearch = search.toLowerCase();
        const groupName = item.GroupName.toLowerCase();

        if (normalizedSearch.endsWith("%")) {
            const prefix = normalizedSearch.slice(0, -1); // remove %
            return groupName.startsWith(prefix);
        } else if (normalizedSearch !== "") {
            return groupName === normalizedSearch;
        } else {
            return true;
        }
    });

    const [customerpermissionsetting, setcustomerpermissionsetting] = useState<ICustomerPermissionConfig>()
    useEffect(() => {
        CustomerPermissionSetting().then(setcustomerpermissionsetting)
    }, [])

    const loaddata = useCallback(async () => {
        if (!selectedEnvironment || !globalSettings || !customerpermissionsetting) return setData([]);
        // // const ServerInventory = await GlobalSetting();

        // console.log(
        //   "Global Setting in Database Page:",
        //   ServerInventory["SERVERINVENTORY"]
        // );
        try {
            setData([]);
            const res = await getCustomerSecurityGroups<ICustomerSecurityGroup>(customerpermissionsetting.customerdbserver, customerpermissionsetting.customerdb, selectedEnvironment,
                customerpermissionsetting.domainprefix
            );
            setData(res ?? []);
        } catch (err) {
            console.error("Failed to load customer permission setting:", err);
            toast.error(String(err))
        }
    }, [selectedEnvironment, globalSettings, customerpermissionsetting]);  // dependencies used inside loaddata

    useEffect(() => {
        loaddata();
    }, [loaddata]);   // now safe

    if (!data || (data).length === 0) {
        return <div className="container mx-auto py-10">Loading...</div>;
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
            <DataTable columns={columns(selectedEnvironment)} data={filteredData} />
        </div>
    );
}

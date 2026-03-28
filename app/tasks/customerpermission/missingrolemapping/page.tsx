"use client";
import { columns } from "./columns"
import { DataTable } from "./data-table";
import { ICustomerPermissionConfig, IConnectionStringWithDbPermission } from "../interfaces";
import { getAllMissingDbPermissions } from "../serverlib";
import { useGlobalSetting } from "@/lib/store";
import { useCallback, useEffect, useState } from "react";
import { CustomerPermissionSetting } from "../appconfig"
import { toast } from "sonner";
export default function MissingRoleMappings() {
    const selectedEnvironment = useGlobalSetting((state) => state.selectedEnvironment);
    const globalSettings = useGlobalSetting((state) => state.globalSettings);
    const [loading, setLoading] = useState<boolean>(true)
    const [data, setData] = useState<IConnectionStringWithDbPermission[]>([]);
    const [customerpermissionsetting, setcustomerpermissionsetting] = useState<ICustomerPermissionConfig>()
    useEffect(() => {
        CustomerPermissionSetting().then(setcustomerpermissionsetting)
    }, [])

    const loaddata = useCallback(async () => {
        if (!selectedEnvironment || !globalSettings || !customerpermissionsetting) return setData([]);
        try {
            const res = await getAllMissingDbPermissions(customerpermissionsetting.customerdbserver, customerpermissionsetting.customerdb, customerpermissionsetting.monolilthconnectionstringdb, selectedEnvironment,
                customerpermissionsetting.domainprefix, 1
            );
            setData(res ?? []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load customer permission setting:", err);
            toast.error(String(err))
        }
    }, [selectedEnvironment, globalSettings, customerpermissionsetting]);  // dependencies used inside loaddata

    useEffect(() => {
        setLoading(true)
        loaddata();
        //setLoading(false)
    }, [loaddata]);   // now safe

    if (loading) {
        return <div className="container mx-auto py-10">Loading...</div>;
    }
    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-4">
                {/* <Input
                    placeholder="Search Group Name. End % for like expression"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-128"
                /> */}
            </div>
            <DataTable columns={columns()} data={data} />
        </div>
    );
}
"use client";
import { columns } from "./columns"
import { DataTable } from "./data-table";
import { IHCMCore, ICustomerPermissionConfig } from "../interfaces";
import { getConnectionStrings } from "../serverlib";
import { useGlobalSetting } from "@/lib/store";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { CustomerPermissionSetting } from "../appconfig"

export default function HCMCore() {
    const selectedEnvironment = useGlobalSetting((state) => state.selectedEnvironment);
    const globalSettings = useGlobalSetting((state) => state.globalSettings);
    console.log("Selected Environment in Customer Security Group Page:", selectedEnvironment);
    const [data, setData] = useState<IHCMCore[]>([]);
    const [search, setSearch] = useState("");
    const filteredData = data.filter((item: IHCMCore) => {
        if (search.endsWith("%")) {
            const prefix = search.slice(0, -1); // remove %
            return item.Namespace.startsWith(prefix);
        } else if (search !== "") {
            return item.Namespace === search;
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
        const res = await getConnectionStrings<IHCMCore>(customerpermissionsetting.monolilthconnectionstringdb, selectedEnvironment);
        setData(res ?? []);
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
            <DataTable columns={columns()} data={filteredData} />
        </div>
    );
}





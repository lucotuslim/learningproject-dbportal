"use client";
import { columns } from "./columns"
import { DataTable } from "./data-table";
import { ICustomerSecurityGroup } from "../interfaces";
import { getCustomerSecurityGroups } from "../serverlib";
import { useGlobalSetting } from "@/lib/store";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export default function CustomerSecurityGroup() {
    const selectedEnvironment = useGlobalSetting((state) => state.selectedEnvironment);
    const globalSettings = useGlobalSetting((state) => state.globalSettings);
    console.log("Selected Environment in Customer Security Group Page:", selectedEnvironment);
    const [data, setData] = useState<ICustomerSecurityGroup[]>([]);
    const [search, setSearch] = useState("");
    const filteredData = data.filter((item: ICustomerSecurityGroup) => {
        if (search.endsWith("%")) {
            const prefix = search.slice(0, -1); // remove %
            return item.GroupName.startsWith(prefix);
        } else if (search !== "") {
            return item.GroupName === search;
        } else {
            return true;
        }
    });

    const loaddata = useCallback(async () => {
        if (!selectedEnvironment || !globalSettings) return setData([]);
        // // const ServerInventory = await GlobalSetting();

        // console.log(
        //   "Global Setting in Database Page:",
        //   ServerInventory["SERVERINVENTORY"]
        // );
        const res = await getCustomerSecurityGroups<ICustomerSecurityGroup>("192.168.100.151", "CustomerPermissionDb", selectedEnvironment);
        setData(res ?? []);
    }, [selectedEnvironment, globalSettings]);  // dependencies used inside loaddata

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

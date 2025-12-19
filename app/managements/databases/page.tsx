"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table";
// import { IapiInfo } from "@/interfaces/generic";
// import {IDatabaseInfo } from "@/interfaces/databases";
// // import {getAllDatabase} from "@/lib/rxjs/databases/databases";
// import { useEventCallback } from "rxjs-hooks";
// import { startWith, switchMap, tap } from "rxjs/operators";
// import { from, of } from "rxjs";
// import { RefreshCcw } from "lucide-react";
import { Namespace } from "./interface";
import { getNamespaces } from "./serverlib";
import { useGlobalSetting } from "@/lib/store";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export default function Page() {
  const selectedEnvironment = useGlobalSetting((state) => state.selectedEnvironment);
  console.log("Selected Environment in Database Page:", selectedEnvironment);

  const [data, setData] = useState<Namespace[]>([]);
  const [search, setSearch] = useState("");

//const filteredData = data.filter((item: Namespace) => item.Namespace.startsWith(search))
const filteredData = data.filter((item: Namespace) => {
  if (search.endsWith("%")) {
    const prefix = search.slice(0, -1); // remove %
    return item.Namespace.startsWith(prefix);
  } else if (search !== "") {
    return item.Namespace === search;
  } else {
    return true; // keep all items when search is empty
  }
});

  const loaddata = useCallback(async () => {
    if (!selectedEnvironment) return setData([]);
    const res = await getNamespaces<Namespace>("ServerInventory", selectedEnvironment);
    setData(res ?? []);
  }, [selectedEnvironment]);  // dependencies used inside loaddata

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
          placeholder="Search Namespace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>
      <DataTable columns={columns()} data={filteredData} />
    </div>
  );
}

"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table";
// import { IapiInfo } from "@/interfaces/generic";
// import {IDatabaseInfo } from "@/interfaces/databases";
// import {getAllDatabase} from "@/lib/rxjs/databases/databases";
import { useEventCallback } from "rxjs-hooks";
import { startWith, switchMap, tap } from "rxjs/operators";
import { from, of } from "rxjs";
// import { RefreshCcw } from "lucide-react";
import {Namespace} from "./interface";
import {getNamespaces } from "./serverlib";
import { useGlobalSetting } from "@/lib/store";
import { useEffect, useState } from "react";

export default  function Page() {
const selectedEnvironment =  useGlobalSetting((state) => state.selectedEnvironment);
console.log("Selected Environment in Database Page:", selectedEnvironment);

const [data, setData] = useState<Namespace[]>([]);

const loaddata = async () => {
  if (!selectedEnvironment) return setData([]);
  const res = await getNamespaces<Namespace>("ServerInventory", selectedEnvironment);
  setData(res ?? []);
};

useEffect(() => { loaddata(); }, [selectedEnvironment]);

  if (!data ||  (data).length === 0) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns()} data={data} />
    </div>
  );
}

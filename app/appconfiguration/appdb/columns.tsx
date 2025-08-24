"use client"
import { ColumnDef } from "@tanstack/react-table"
import {IClientInfo} from "@/interfaces/controldb"
import { IapiInfo } from "@/interfaces/generic"

import Link from "next/link"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<IapiInfo<IClientInfo>>[] = [
   {  accessorKey: "clientName",
    header: "Client Name"
  },
  {
    accessorKey: "server",
    header: "Server",
  }
  ,
  {
    accessorKey: "database",
    header: "Database",
  },
  {
    accessorKey: "message",
    header: "Message",
  },
  {
    accessorKey: "error",
    header: "Error?",
  }
]



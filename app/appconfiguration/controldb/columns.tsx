"use client"

import { ColumnDef } from "@tanstack/react-table"
import {IapiControlDbUrl} from "@/interfaces/controldb"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<IapiControlDbUrl>[] = [
  {
    accessorKey: "Controldburl",
    header: "Control DB URL",
  }]
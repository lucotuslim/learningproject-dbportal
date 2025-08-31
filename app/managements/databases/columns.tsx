"use client"
import { ColumnDef } from "@tanstack/react-table"
import { IDatabaseInfo } from "@/interfaces/databases"
import { IapiInfo } from "@/interfaces/generic"

import Link from "next/link"

export const columns: ColumnDef<IapiInfo<IDatabaseInfo>>[] = [
	{ accessorKey: "database_id", header: "Database ID" },
	{ accessorKey: "name", header: "Name" },
	{ accessorKey: "create_date", header: "Create Date" },
	{ accessorKey: "compatibility_level", header: "Compatibility Level" },
	{ accessorKey: "collation_name", header: "Collation Name" },
	{ accessorKey: "user_access_desc", header: "User Access" },
	{ accessorKey: "state_desc", header: "State" },
	{ accessorKey: "recovery_model_desc", header: "Recovery Model" },
	{ accessorKey: "containment_desc", header: "Containment" },
]



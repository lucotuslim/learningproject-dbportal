"use client"
import { ColumnDef } from "@tanstack/react-table"
import { IDatabaseInfo } from "@/interfaces/databases"
import { IapiInfo } from "@/interfaces/generic"

import Link from "next/link"

export const columns: ColumnDef<IapiInfo<IDatabaseInfo>>[] = [
	// { accessorKey: "apiurl", header: "API URL" },
	{ accessorKey: "MachineName", header: "MachineName" },
	{ accessorKey: "database_id", header: "Database ID" },
	{ accessorKey: "name", header: "Database Name",
			 cell: ({ row }) => {
		  const dbName = row.original.name
			if (!dbName) return null
		const machineName = (row.original as any).MachineName;

			return (
				<Link
		href={`/managements/databases/${machineName}/${dbName}`}
					className="text-blue-600 hover:underline"
				>
					{dbName}
				</Link>
			)
		} },
	{ accessorKey: "create_date", header: "Create Date" },
	{ accessorKey: "compatibility_level", header: "Compatibility Level" },
	{ accessorKey: "user_access_desc", header: "User Access" },
	{ accessorKey: "state_desc", header: "State" },
	{ accessorKey: "recovery_model_desc", header: "Recovery Model" },
	{ accessorKey: "containment_desc", header: "Containment" },
	{ accessorKey: "error", header: "Error" },
	{ accessorKey: "message", header: "Message" },

]



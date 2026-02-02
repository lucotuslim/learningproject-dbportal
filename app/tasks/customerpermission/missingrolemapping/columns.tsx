"use client"
import { ColumnDef } from "@tanstack/react-table"
import { IConnectionStringWithDbPermission } from "../interfaces"
// import { ClientIDListCell, ActionsCell } from "./columnlib"

export const columns = (): ColumnDef<IConnectionStringWithDbPermission>[] =>
  [
    { accessorKey: "GroupName", header: "GroupName" },
    { accessorKey: "Namespace", header: "Namespace" },
    { accessorKey: "ConstringDatabaseName", header: "Database Name" },
    { accessorKey: "ConstringServerName", header: "Server Name" },
    { accessorKey: "ConnectionStringFound", header: "Connection String Found" },
    { accessorKey: "dbpermission", header: "Database Permission" },
    { accessorKey: "ServerPrincipalFound", header: "Server Principal Found" },
    { accessorKey: "DatabasePrincipalFound", header: "Database Principal Found" },
    { accessorKey: "DatabaseUserMappings", header: "Database User Mappings" },
    {
      accessorKey: "MissingRoleMappings", header: "Missing Role Mappings",
      cell: ({ row }) => row.original.MissingRoleMappings.length > 0 ? row.original.MissingRoleMappings.join(", ") : "None"
    }

    // dbpermission: string[]
    // serverPrincipal: string | null
    // ServerPrincipalFound: boolean | null
    // databasePrincipal: string | null
    // DatabasePrincipalFound: boolean | null
    // DatabaseUserMappings: string[]
    // MissingRoleMappings: string[]
    // error?: string



    // { accessorKey: "GroupSID", header: "GroupSID" },
    // { accessorKey: "Environment", header: "Environment" },
    // { accessorKey: "Namespace", header: "Namespace" },
    // {
    //   header: "ClientID List",
    //   cell: ({ row }) =>
    //     row.original.MetaData ? (

    //       <ClientIDListCell metaData={row.original.MetaData} Namespace={row.original.Namespace} selectedEnvironment={selectedEnvironment} />
    //     ) : (
    //       "None"
    //     )
    // },
    // { accessorKey: "CollectedTimestamp", header: "CollectedTimestamp" },
    // { accessorKey: "Permission", header: "Permission" },
    // { accessorKey: "IsDeleted", header: "IsDeleted" },
    // {
    //   id: "actions",
    //   enableHiding: false,
    //   cell: ({ row }) => (
    //     <ActionsCell customer={row.original} selectedEnvironment={selectedEnvironment} />
    //   ),
    // }
  ]



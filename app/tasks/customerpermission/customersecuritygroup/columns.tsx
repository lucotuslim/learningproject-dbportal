"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ICustomerPermissionConfig, ICustomerSecurityGroup } from "../interfaces"
import { ClientIDListCell, ActionsCell } from "./columnlib"

export const columns = (selectedEnvironment: string, customerpermissionsetting: ICustomerPermissionConfig): ColumnDef<ICustomerSecurityGroup>[] =>
  [
    { accessorKey: "GroupSID", header: "GroupSID" },
    { accessorKey: "Environment", header: "Environment" },
    { accessorKey: "Namespace", header: "Namespace" },
    { accessorKey: "GroupName", header: "GroupName" },
    {
      header: "ClientID List",
      cell: ({ row }) =>
        row.original.MetaData ? (
          <ClientIDListCell metaData={row.original.MetaData} Namespace={row.original.Namespace} selectedEnvironment={selectedEnvironment}
            ClientEnvironment={row.original.Environment}
            customerpermissionsetting={customerpermissionsetting}
          />
        ) : (
          "None"
        )
    },
    { accessorKey: "CollectedTimestamp", header: "CollectedTimestamp" },
    { accessorKey: "Permission", header: "Permission" },
    { accessorKey: "IsDeleted", header: "IsDeleted" },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <ActionsCell customer={row.original} selectedEnvironment={selectedEnvironment} customerpermissionsetting={customerpermissionsetting} />
      ),
    }
  ]



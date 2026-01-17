"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ICustomerSecurityGroup } from "../interfaces"
import { ClientIDListCell, CheckClientDbPermissionContent, ActionsCell } from "./columnlib"

import { useState } from "react"


export const columns = (): ColumnDef<ICustomerSecurityGroup>[] => [
  { accessorKey: "GroupSID", header: "GroupSID" },
  { accessorKey: "Environment", header: "Environment" },
  { accessorKey: "Namespace", header: "Namespace" },
  { accessorKey: "GroupName", header: "GroupName" },
  {
    header: "ClientID List",
    cell: ({ row }) =>
      row.original.MetaData ? (
        <ClientIDListCell metaData={row.original.MetaData} Namespace={row.original.Namespace} />
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
      <ActionsCell customer={row.original} />
    ),
  }


]



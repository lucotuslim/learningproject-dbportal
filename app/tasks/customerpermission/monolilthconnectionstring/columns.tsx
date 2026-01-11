"use client"
import { ColumnDef } from "@tanstack/react-table"
// import { IDatabaseInfo } from "@/interfaces/databases"
// import { IapiInfo } from "@/interfaces/generic"
// import { ApiRequestRxjs } from '@/lib/rxjs/generic'
// import Link from "next/link"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Button } from "@/components/ui/button"
// import { MoreHorizontal } from "lucide-react"
// import { ConfirmationDialog, useConfirmationDialog } from "@/components/confirmation-dialog"
// import { useState } from "react"
// import { toast } from "sonner"
// import { Row } from "@tanstack/react-table"
import { IConnectionString } from "../interfaces"
// Recovery Model Cell Component

// // Actions Cell Component
// function ActionsCell({ row, refreshData }: { 
//   row: Row<IapiInfo<IDatabaseInfo & { MachineName: string }>>
//   refreshData: () => void 
// }) {
//   const { open, openDialog, setOpen } = useConfirmationDialog()

//   const database = row.original
//   const machineName = row.original.MachineName

//   const handleDelete = () => {
//     console.log('deleting database', database.name, 'on server', machineName)
//     const url = `http://${machineName}api:3000/api/databases/${database.database_id}`
//     ApiRequestRxjs(url, "Database", {
//       method: "DELETE", 
//       headers: {
//         "Content-Type": "application/json",
//       }
//     }).subscribe({
//       next: () => {
//         toast("Drop Database", {
//           description: `Dropped database ${database.name} on server ${machineName}`,
//           action: {
//             label: "Close",
//             onClick: () => console.log("Undo"),
//           }
//         })
//         refreshData()
//       },
//       error: (err) => {
//         console.error("Delete error:", err)
//       }
//     })
//   }

//   return (
//     <>
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="ghost" className="h-8 w-8 p-0">
//             <span className="sr-only">Open menu</span>
//             <MoreHorizontal />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent align="end">
//           <DropdownMenuLabel>Actions</DropdownMenuLabel>
//           <DropdownMenuItem onClick={openDialog}>
//             Drop Database
//           </DropdownMenuItem>
//           <DropdownMenuSeparator />
//           <DropdownMenuItem>Migrate Database</DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>

//       <ConfirmationDialog
//         open={open}
//         onOpenChange={setOpen}
//         description={`This action cannot be undone. This will permanently delete your database <b>${database.name}</b>.`}
//         onConfirm={handleDelete}
//       />
//     </>
//   )
// }

export const columns = (): ColumnDef<IConnectionString>[] => [
  //  [CustomerSecurityGroupsId]
  //       ,[GroupSID]
  //       ,[Environment]
  //       ,[Namespace]
  //       ,[ClientId]
  //       ,[GroupName]
  //       ,[MetaData]
  //       ,[CollectedTimestamp]
  //       ,[Permission]
  //       ,[IsDeleted]
  { accessorKey: "ClientID", header: "Client ID" },
  { accessorKey: "Namespace", header: "Namespace" },
  { accessorKey: "ConstringDatabaseName", header: "Database Name" },
  { accessorKey: "ConstringServerName", header: "Server Name" },
  { accessorKey: "ISBI", header: "Is BI" },
  { accessorKey: "ConnectionType", header: "Connection Type" },
  { accessorKey: "IsDecomm", header: "Is Decomm" }


]



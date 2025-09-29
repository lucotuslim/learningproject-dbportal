"use client"
import { ColumnDef } from "@tanstack/react-table"
import { IDatabaseInfo } from "@/interfaces/databases"
import { IapiInfo } from "@/interfaces/generic"
import { ApiRequestRxjs } from '@/lib/rxjs/generic'
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { ConfirmationDialog, useConfirmationDialog } from "@/components/confirmation-dialog"
import { useState } from "react"
import { toast } from "sonner"
import { Row } from "@tanstack/react-table"

// Recovery Model Cell Component
function RecoveryModelCell({ row, refreshData }: { 
  row: Row<IapiInfo<IDatabaseInfo & { MachineName: string }>>
  refreshData: () => void 
}) {
  const { open, openDialog, setOpen } = useConfirmationDialog()
  const [pendingModel, setPendingModel] = useState<string>("")

  const currentValue = row.original.recovery_model_desc
  const machineName = row.original.MachineName
  const databaseId = row.original.database_id
  const databaseName = row.original.name

  const handleRecoveryChange = (newRecoveryModel: string) => {
    if (newRecoveryModel === currentValue) return
    setPendingModel(newRecoveryModel)
    openDialog()
  }

  const confirmRecoveryChange = () => {
    const url = `http://${machineName}api:3000/api/databases`
    ApiRequestRxjs(url, "Database", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payloadtype: "recovery", databaseId: databaseId, mode: pendingModel })
    }).subscribe({
      next: () => {
        toast("Recovery Model Updated", {
          description: `${databaseName} in ${machineName} Changed to ${pendingModel}`,
        })
        refreshData()
      },
      error: (err) => console.error("Update error:", err)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">{currentValue}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleRecoveryChange("SIMPLE")}>
            Simple
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRecoveryChange("FULL")}>
            Full
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRecoveryChange("BULK_LOGGED")}>
            Bulk-Logged
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirm Recovery Model Change"
        description={`Are you sure you want to change the recovery model of database <b>${databaseName}</b> from <b>${currentValue}</b> to <b>${pendingModel}</b>?`}
        onConfirm={confirmRecoveryChange}
      />
    </>
  )
}

// Actions Cell Component
function ActionsCell({ row, refreshData }: { 
  row: Row<IapiInfo<IDatabaseInfo & { MachineName: string }>>
  refreshData: () => void 
}) {
  const { open, openDialog, setOpen } = useConfirmationDialog()
  
  const database = row.original
  const machineName = row.original.MachineName

  const handleDelete = () => {
    console.log('deleting database', database.name, 'on server', machineName)
    const url = `http://${machineName}api:3000/api/databases/${database.database_id}`
    ApiRequestRxjs(url, "Database", {
      method: "DELETE", 
      headers: {
        "Content-Type": "application/json",
      }
    }).subscribe({
      next: () => {
        toast("Drop Database", {
          description: `Dropped database ${database.name} on server ${machineName}`,
          action: {
            label: "Close",
            onClick: () => console.log("Undo"),
          }
        })
        refreshData()
      },
      error: (err) => {
        console.error("Delete error:", err)
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={openDialog}>
            Drop Database
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Migrate Database</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        description={`This action cannot be undone. This will permanently delete your database <b>${database.name}</b>.`}
        onConfirm={handleDelete}
      />
    </>
  )
}

export const columns = (refreshData: () => void): ColumnDef<IapiInfo<IDatabaseInfo & { MachineName: string }>>[] => [
  { accessorKey: "MachineName", header: "MachineName" },
  {
    accessorKey: "name", header: "Database Name",
    cell: ({ row }) => {
      const dbName = row.original.name
      if (!dbName) return null
      const machineName = row.original.MachineName
      return (
        <Link
          href={`/managements/databases/${machineName}/${dbName}`}
          className="text-blue-600 hover:underline"
        >
          {dbName}
        </Link>
      )
    }
  },
  {accessorKey: "foundInControlDb", header: "In Control DB"},
  { accessorKey: "create_date", header: "Create Date" },
  { accessorKey: "compatibility_level", header: "Compatibility Level" },
  { accessorKey: "user_access_desc", header: "User Access" },
  { accessorKey: "state_desc", header: "State" },
  {
    accessorKey: "recovery_model_desc", header: "Recovery Model",
    cell: ({ row }) => <RecoveryModelCell row={row} refreshData={refreshData} />
  },
  { accessorKey: "containment_desc", header: "Containment" },
  { accessorKey: "error", header: "Error" },
  { accessorKey: "message", header: "Message" },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell row={row} refreshData={refreshData} />
  }
]



"use client"
import { ColumnDef } from "@tanstack/react-table"
import { IDatabaseInfo } from "@/interfaces/databases"
import { IapiInfo } from "@/interfaces/generic"
import {ApiRequestRxjs} from '@/lib/rxjs/generic';
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner"

//export const columns = (refreshData: () => void): ColumnDef<IapiInfo<IDatabaseInfo>>[] => [
export const columns = (refreshData: () => void): ColumnDef<IapiInfo<IDatabaseInfo>>[] => [
	{ accessorKey: "MachineName", header: "MachineName" },
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
	{ accessorKey: "recovery_model_desc", header: "Recovery Model", 
  cell: ({ row }) => {
    const currentValue = row.original.recovery_model_desc;
    const machineName = (row.original as any).MachineName;
    const databaseId = row.original.database_id;
    const databaseName = row.original.name;
    
    const handleRecoveryChange = (payloadtype: string, databaseid: number , databasename: string ,newRecoveryModel: string) => {
      const url = `http://${machineName}api:3000/api/databases`;
      ApiRequestRxjs(url, "Database", { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payloadtype: payloadtype, databaseId: databaseid, mode: newRecoveryModel })
      }).subscribe({
        next: () => {
          toast("Recovery Model Updated", {
            description: `${databasename} in ${machineName} Changed to ${newRecoveryModel}`,
          });
          refreshData();
        },
        error: (err) => console.error("Update error:", err)
      });
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">{currentValue}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleRecoveryChange("recovery", databaseId!, databaseName!, "SIMPLE")}>
            Simple
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRecoveryChange("recovery", databaseId!, databaseName!,"FULL")}>
            Full
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRecoveryChange("recovery", databaseId!, databaseName!,"BULK_LOGGED")}>
            Bulk-Logged
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
},
	{ accessorKey: "containment_desc", header: "Containment" },
	{ accessorKey: "error", header: "Error" },
	{ accessorKey: "message", header: "Message" },

 {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
	  const [open, setOpen] = useState(false);
      const handleDelete = (servername: string, databasename:string, databaseid: number) => {
		  console.log('deleting database', databasename, 'on server', servername);
  const url = `http://${servername}api:3000/api/databases/${databaseid}`;
  ApiRequestRxjs(url, "Database", { method: "DELETE" ,     headers: {
      "Content-Type": "application/json",
    }}).subscribe({
    next: (result) => {
        toast("Drop Database", {
          description: `Dropped database ${databasename} on server ${servername}`,
          action: {
            label: "Close",
            onClick: () => console.log("Undo"),
          }
        }
        )
        refreshData();
    },
    error: (err) => {
      // Handle error
      console.error("Delete error:", err);
    }
  });
        setOpen(false);
        // Optionally show a toast or refresh data
      };
	  const database = row.original;
	  const machineName = (row.original as any).MachineName;
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
              <DropdownMenuItem onClick={() => setOpen(true)}>
                Drop Database
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Migrate Database</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your database <b>{database.name}</b>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(machineName, database!.name!, database!.database_id!)}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  }
]



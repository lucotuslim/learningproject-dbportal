"use client"
import { IDocExportOutput } from "@/interfaces/documentextraction"
import { checkexportStatus } from "./lib"
import { toast } from "sonner"
import { createPush } from "@/lib/utils"
import {getClientData} from "@/app/api/clientdb/route"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// replace static data with GraphQL call
export function ListExtraction() {
    const [data, setData] = React.useState<IDocExportOutput[]>([])
    const [loading, setLoading] = React.useState<boolean>(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "http://localhost:3001/api/prod/dbaserver/documentations";
        const query = `query Query($db: String!) { docExportOutputs(db: $db) { env ExportGuid Password Filename sftppassword SftpUser ContainerName Namespace CreatedBy } }`;
        const variables = { db: "DocumentManagement" };

        let mounted = true
        setLoading(true)
        setError(null)

            ; (async () => {
                try {
                    const res = await fetch(endpoint, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ query, variables }),
                    })

                    const json = await res.json().catch(() => null)

                    if (!res.ok) throw new Error(`Error: ${res.status} - ${JSON.stringify(json)}`)

                    if (json?.errors?.length) {
                        const msg = json.errors.map((e: any) => e.message ?? JSON.stringify(e)).join("; ")
                        throw new Error(`GraphQL error: ${msg}`)
                    }

                    const items = json?.data?.docExportOutputs ?? []

                    if (mounted) setData(items)
                } catch (err: any) {
                    console.error("Query failed:", err)
                    if (mounted) setError(typeof err === "string" ? err : (err?.message ?? JSON.stringify(err)))
                } finally {
                    if (mounted) setLoading(false)
                }
            })()

        return () => {
            mounted = false
        }
    }, [])

    const columns: ColumnDef<IDocExportOutput>[] = [
        {
            accessorKey: "env",
            header: "Environment"
        },
        {
            accessorKey: "ExportGuid",
            header: "Export Guid"
        },
        {
            accessorKey: "Filename",
            header: "File Name"
        },
        {
            accessorKey: "SftpUser",
            header: "Sftp User"
        },
        {
            accessorKey: "ContainerName",
            header: "Container Name"
        },
        {
            accessorKey: "Namespace",
            header: "Namespace"
        },
        {
            accessorKey: "CreatedBy",
            header: "Created By"
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const document = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => checkexportStatus(document.env, document.Namespace, document.ExportGuid)}>
                                Check Export Status
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={async () => {
                                    // if (!document.Password) {
                                    //     toast.error("No password available");
                                    //     return;
                                    // }
                                    try {
                                        // Fetch and parse decrypted file password
                                        const res1 = await fetch('/api/decrypt', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({ encpassword: document.Password }),
                                        });
                                        const json1 = await res1.json();
                                        const decPassword = json1?.decPassword;

                                        // Fetch and parse decrypted SFTP password
                                        const res2 = await fetch('/api/decrypt', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({ encpassword: document.sftppassword }),
                                        });
                                        const json2 = await res2.json();
                                        const decsftppassword = json2?.decPassword;

                                        toast.success(`Decrypted File Password: ${decPassword} 
SFTP Password: ${decsftppassword}
                                            `, { duration: 10000 });
                                    } catch (err) {
                                        console.error("Failed to decrypt password:", err);
                                        toast.error("Failed to decrypt password");
                                    }
                                }}
                            >
                                Get Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={async () => {
                                    try {
                                        const res1 = await fetch('/api/decrypt', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({ encpassword: document.Password }),
                                        });
                                        const json1 = await res1.json();
                                        const decPasswordpusher = await createPush(json1?.decPassword);
                                        console.log(decPasswordpusher)
                                        // Fetch and parse decrypted SFTP password
                                        const res2 = await fetch('/api/decrypt', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({ encpassword: document.sftppassword }),
                                        });
                                        const json2 = await res2.json();
                                        const decsftppasswordpusher = await createPush(json2?.decPassword);
                                        console.log(decsftppasswordpusher)

                                        const newTab = window.open("./documentextraction/pwpusher", "_blank");

                                        // Wait a bit for the new tab to load, then send data
                                        setTimeout(() => {
                                            newTab?.postMessage({ type: "RESULT_DATA", payload: { decPassword: decPasswordpusher, decSftpPassword: decsftppasswordpusher } }, "*");
                                        }, 500);


                                        //                                         toast.success(`Decrypted File Password: ${decPassword} 
                                        // SFTP Password: ${decsftppassword}
                                        //                                             `, { duration: 10000 });
                                    } catch (err) {
                                        console.error("Failed to decrypt password:", err);
                                        toast.error("Failed to decrypt password");
                                    }


                                    //const data = await createPush('stupid');
                                }}
                            >
                                Generate Password Pusher
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter namespaces..."
                    value={(table.getColumn("Namespace")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("Namespace")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {loading && <div className="p-4">Loading...</div>}
            {error && <div className="p-4 text-red-600">Error: {error}</div>}

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">

                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

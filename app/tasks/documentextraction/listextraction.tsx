"use client"
import { DocumentExtractionTasksSetting } from "@/config/appsetting"
import { IDocExportOutput } from "@/interfaces/documentextraction"
import { checkexportStatus } from "./serverlib"
import { toast } from "sonner"
import { createPush, formatDateTime } from "@/lib/utils"
import {decryptString} from "@/lib/serverutils"
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
        const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? `${process.env.NEXT_PUBLIC_APPDBSERVERAPI}/api/prod/dbaserver/documentations`;
        const query = `query Query($db: String!) { docExportOutputs(db: $db) { env ExportGuid Password Filename sftppassword SftpUser ContainerName Namespace CreatedBy CreatedDate } }`;
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
                        const msg = json.errors.map((e: unknown) => {
                            if (typeof e === "object" && e !== null && "message" in e) {
                                return (e as { message?: string }).message ?? JSON.stringify(e);
                            }
                            return JSON.stringify(e);
                        }).join("; ")
                        throw new Error(`GraphQL error: ${msg}`)
                    }
                    const items = json?.data?.docExportOutputs ?? []

                    if (mounted) setData(items)
                } catch (err: unknown) {
                    console.error("Query failed:", err)
                    if (mounted) setError(typeof err === "string" ? err : (err instanceof Error ? err.message : JSON.stringify(err)))
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
            accessorKey: "CreatedDate",
            id: "CreatedDate",
            header: ({ column }) => {
                return (
                    <button
                        className="flex items-center gap-2"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Create Date
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        {/* show direction if sorted */}
                        {column.getIsSorted() === "asc" ? (
                            <span className="ml-1 text-sm">▲</span>
                        ) : column.getIsSorted() === "desc" ? (
                            <span className="ml-1 text-sm">▼</span>
                        ) : null}
                    </button>
                );
            },
            // return a Date object so sorting compares timestamps reliably
            accessorFn: (row: any) => {
                const v = row.CreatedDate ?? row.createdDate ?? row.Created_Date ?? null;
                if (!v) return null;
                // if already a Date, return it; else parse
                return v instanceof Date ? v : new Date(v);
            },
            // tell table how to compare two accessor values
            sortingFn: (rowA, rowB, columnId) => {
                const a = rowA.getValue(columnId) as Date | null;
                const b = rowB.getValue(columnId) as Date | null;
                const ta = a ? a.getTime() : -Infinity;
                const tb = b ? b.getTime() : -Infinity;
                return ta === tb ? 0 : ta > tb ? 1 : -1;
            },
            enableSorting: true,
            cell: ({ getValue }) => {
                const value = getValue() as Date | string | null;
                return formatDateTime(value ?? null);
            },
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
                            <DropdownMenuItem onClick={async () => {
                                const payload = await checkexportStatus(document.env, document.Namespace, document.ExportGuid);
                                const newTab = window.open("./documentextraction/report", "_blank");
                                // small fallback: wait until popup exists
                                const postPayload = () => {
                                    try {
                                        newTab?.postMessage({ type: "RESULT_DATA", payload }, "*");
                                    } catch (err) {
                                        console.error("postMessage failed:", err);
                                    }
                                };
                                // attempt immediate post then retry once after a short delay
                                postPayload();
                                setTimeout(postPayload, 500);
                            }
                            }
                            >
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
                                        // const res1 = await fetch('/api/decrypt', {
                                        //     method: 'POST',
                                        //     headers: {
                                        //         'Content-Type': 'application/json',
                                        //     },
                                        //     body: JSON.stringify({ encpassword: document.Password }),
                                        // });
                                        const decPassword = await decryptString(document.Password)
                                        //const json1 = await res1.json();
                                        //const decPassword = json1?.decPassword;

                                        // Fetch and parse decrypted SFTP password
                                        // const res2 = await fetch('/api/decrypt', {
                                        //     method: 'POST',
                                        //     headers: {
                                        //         'Content-Type': 'application/json',
                                        //     },
                                        //     body: JSON.stringify({ encpassword: document.sftppassword }),
                                        // });
                                        // const json2 = await res2.json();
                                        const decsftppassword = await decryptString(document.sftppassword)
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
                                        // const res1 = await fetch('/api/decrypt', {
                                        //     method: 'POST',
                                        //     headers: {
                                        //         'Content-Type': 'application/json',
                                        //     },
                                        //     body: JSON.stringify({ encpassword: document.Password }),
                                        // });
                                        // const json1 = await res1.json();
                                        const respassword = await decryptString(document.Password);
                                        const decPasswordpusher = await createPush(respassword);
                                        //console.log(decPasswordpusher)
                                        // Fetch and parse decrypted SFTP password
                                        // const res2 = await fetch('/api/decrypt', {
                                        //     method: 'POST',
                                        //     headers: {
                                        //         'Content-Type': 'application/json',
                                        //     },
                                        //     body: JSON.stringify({ encpassword: document.sftppassword }),
                                        // });
                                        // const json2 = await res2.json();
                                        const resdecsftppasswordpusher = await decryptString(document.sftppassword)
                                        const decsftppasswordpusher = await createPush(resdecsftppasswordpusher);
                                        //console.log(decsftppasswordpusher)

                                        const newTab = window.open("./documentextraction/pwpusher", "_blank");

                                        const envConfig = DocumentExtractionTasksSetting.find((item) => item.env === document.env);

                                        // Wait a bit for the new tab to load, then send data
                                        setTimeout(() => {
                                            newTab?.postMessage({
                                                type: "RESULT_DATA", payload: {

                                                    Filename: document.Filename,
                                                    decPassword: decPasswordpusher,
                                                    sftpHostName: envConfig?.SendDocBulkExport.sftpHostName,
                                                    SftpUser: document.SftpUser,
                                                    decSftpPassword: decsftppasswordpusher
                                                }
                                            }, "*");
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

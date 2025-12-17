"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // Default sorting: serverName asc, then databaseName asc
  // Change the ids here if your accessorKey names differ.
  const initialSorting: SortingState = [
    { id: "ConstringServerName", desc: false },
    { id: "ConstringDatabaseName", desc: false },
  ]

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>(initialSorting)

  const table = useReactTable({
    data,
    columns,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: initialSorting,
    },
  })

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // header.isPlaceholder handled in original code
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          // use the column's toggle sorting handler so clicking the header toggles sorting
                          onClick={header.column.getToggleSortingHandler()}
                          className={
                            "flex items-center gap-2 select-none " +
                            (header.column.getCanSort() ? "cursor-pointer" : "")
                          }
                        >
                          {/* header content */}
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {/* sort indicator */}
                          {{
                            asc: <span aria-hidden>▲</span>,
                            desc: <span aria-hidden>▼</span>,
                          }[header.column.getIsSorted() as "asc" | "desc"] ?? (
                            // not sorted
                            header.column.getCanSort() ? <span aria-hidden>↕</span> : null
                          )}
                        </div>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>

          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
          <button
            className="border rounded px-2 py-1 disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center gap-2 text-sm">
          <span>
            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
            <strong>{table.getPageCount()}</strong>
          </span>

          <span>| Go to page:</span>
          <input
            type="number"
            min={1}
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = Number(e.target.value) - 1
              if (!Number.isNaN(page)) table.setPageIndex(Math.max(0, page))
            }}
            className="w-16 border rounded px-2 py-1"
          />
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="border rounded px-2 py-1 bg-transparent appearance-none"
          >
            {[5, 10, 20, 30, 50].map((size) => (
              <option key={size} value={size}
                            className="border rounded px-2 py-1 bg-transparent appearance-none"
>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

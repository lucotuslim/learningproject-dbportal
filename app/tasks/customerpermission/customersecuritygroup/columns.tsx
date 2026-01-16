"use client"
import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { getClientInfo } from "../serverlib"
import { ICustomerSecurityGroup, CustomerSecurityGroupMetaData, IConnectionStringWithFound } from "../interfaces"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function ClientIDListCell({ metaData, Namespace }: { metaData?: CustomerSecurityGroupMetaData | string | null, Namespace: string }) {
  const [data, setData] = useState<IConnectionStringWithFound[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadClients = async () => {
    if (loading || data.length > 0) return

    if (!metaData) {
      setError("No MetaData")
      return
    }

    let clientIDList: string | undefined

    // ✅ handle both object & string safely
    if (typeof metaData === "string") {
      try {
        const parsed = JSON.parse(metaData)
        clientIDList = parsed?.clientIDList
      } catch {
        setError("Invalid MetaData format")
        return
      }
    } else {
      clientIDList = metaData.clientIDList
    }

    if (!clientIDList) {
      setError("No Client IDs")
      return
    }

    const clientArray = clientIDList
      .split(",")
      .map(id => Number(id.trim()))
      .filter(Boolean)

    if (clientArray.length === 0) {
      setError("No Client IDs")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getClientInfo("ServerInventory", clientArray, Namespace, "nonprod")
      setData(result);
      //getClientInfo("ServerInventory", clientArray, Namespace, "nonprod").then(setData).catch(err => setError(err.message))
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" className="p-0 h-auto" onClick={loadClients}>
          {metaData ? metaData.toString() : 'None'}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[100vw] max-w-[900px] max-h-72 overflow-auto text-sm">
        {loading && (<div className="flex justify-center py-4">
          Loading...
        </div>)}
        {error && <div className="text-red-500">{error}</div>}
        {data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>ConstringDatabaseName</TableHead>
                <TableHead>ConstringServerName</TableHead>
                <TableHead>ConnectionType</TableHead>
                <TableHead>IsDecomm</TableHead>
                <TableHead>Found?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(info => (
                <TableRow
                  key={`${info.ClientID}-${info.ConstringDatabaseName}`}
                  className={
                    !info.Found
                      ? "text-red-500"
                      : ""
                  }
                >
                  <TableCell>{info.ClientID}</TableCell>
                  <TableCell>{info.Namespace}</TableCell>
                  <TableCell>{info.ConstringDatabaseName}</TableCell>
                  <TableCell>{info.ConstringServerName}</TableCell>
                  <TableCell>{info.ConnectionType}</TableCell>
                  <TableCell>{info.IsDecomm ? "Yes" : "No"}</TableCell>
                  <TableCell>{info.Found ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PopoverContent>
    </Popover>
  )
}

export const columns = (): ColumnDef<ICustomerSecurityGroup>[] => [
  { accessorKey: "GroupSID", header: "GroupSID" },
  { accessorKey: "Environment", header: "Environment" },
  { accessorKey: "Namespace", header: "Namespace" },
  { accessorKey: "ClientId", header: "ClientId" },
  { accessorKey: "GroupName", header: "GroupName" },
  {
    accessorKey: "MetaData", header: "MetaData",
    cell: ({ row }) => row.original.MetaData ? row.original.MetaData : 'None'
  },
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
]



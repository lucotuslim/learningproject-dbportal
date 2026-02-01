"use client";
import { useEffect, useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { getClientWithDbInfo, getclientdbpermissioninfo } from "../serverlib"
import { CustomerSecurityGroupMetaData, IConnectionStringWithDbPermission, IConnectionStringWithFound, ICustomerPermissionConfig, ICustomerSecurityGroup } from "../interfaces"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CustomerPermissionSetting } from "../appconfig";

export function ActionsCell({
    customer,
    selectedEnvironment
}: {
    customer: ICustomerSecurityGroup,
    selectedEnvironment: string
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault()
                            setIsDialogOpen(true)
                        }}
                    >
                        Check DB Permission
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="mb-8 flex h-[calc(100vh-2rem)] min-w-[calc(100vw-2rem)] flex-col gap-0 p-0"
                >
                    <DialogHeader>
                        <DialogTitle>Client DB Permission Setup - {customer.GroupName}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto p-4">
                        <CheckClientDbPermissionContent
                            metaData={customer.MetaData}
                            Namespace={customer.Namespace}
                            name={customer.GroupName}
                            clientpermission={customer.Permission}
                            selectedEnvironment={selectedEnvironment}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export function CheckClientDbPermissionContent({
    metaData,
    name,
    Namespace,
    clientpermission,
    selectedEnvironment
}: {
    metaData?: CustomerSecurityGroupMetaData | string | null
    name: string
    Namespace: string
    clientpermission: string
    selectedEnvironment: string
}) {
    const [data, setData] = useState<IConnectionStringWithDbPermission[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [customerpermissionsetting, setcustomerpermissionsetting] = useState<ICustomerPermissionConfig>()
    useEffect(() => {
        CustomerPermissionSetting().then(setcustomerpermissionsetting)
    }, [])

    useEffect(() => {
        if (!metaData || !customerpermissionsetting) return

        const load = async () => {
            setLoading(true)
            try {
                const clientIDList =
                    typeof metaData === "string"
                        ? JSON.parse(metaData).clientIDList
                        : metaData.clientIDList

                const clientArray = clientIDList
                    .split(",")
                    .map(Number)
                    .filter(Boolean)

                const result = await getclientdbpermissioninfo(
                    customerpermissionsetting.monolilthconnectionstringdb,
                    clientArray,
                    Namespace,
                    name,
                    clientpermission,
                    selectedEnvironment,
                    100
                )
                setData(result)
            } catch (e) {
                setError((e as Error).message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [metaData, Namespace, clientpermission, name, selectedEnvironment, customerpermissionsetting])

    if (loading) {
        return (
            <div className="h-40 flex items-center justify-center">
                Loading…
            </div>
        )
    }
    if (error) {
        return <div className="text-red-500">{error}</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Namespace</TableHead>
                    <TableHead>Database</TableHead>
                    <TableHead>Server</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Decomm</TableHead>
                    <TableHead>CustomerGroup Permission Required</TableHead>
                    <TableHead>Database User Mappings</TableHead>
                    <TableHead>Server Principal Found?</TableHead>
                    <TableHead>Database Principal Found?</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead> Error</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {data.map(info => {
                    const missingPermissions = info.dbpermission.filter(
                        p =>
                            !info.DatabaseUserMappings
                                .map(m => m.toLowerCase())
                                .includes(p.toLowerCase())
                    )

                    return (
                        <TableRow
                            key={`${info.ClientID}-${info.ConstringDatabaseName}`}
                            className={!info.ConnectionStringFound ? "text-red-500" : ""}
                        >
                            <TableCell>{info.ClientID}</TableCell>
                            <TableCell>{info.Namespace}</TableCell>
                            <TableCell>{info.ConstringDatabaseName}</TableCell>
                            <TableCell>{info.ConstringServerName}</TableCell>
                            <TableCell>{info.ConnectionType}</TableCell>
                            <TableCell>{info.IsDecomm ? "Yes" : "No"}</TableCell>
                            <TableCell>{info.dbpermission.join(", ")}</TableCell>
                            <TableCell>{info.DatabaseUserMappings.join(", ")}</TableCell>
                            <TableCell>
                                {!info.error &&
                                    (info.ServerPrincipalFound ? (
                                        <Badge className="dark:bg-green-800" variant="secondary">Yes</Badge>
                                    ) : (
                                        <Badge variant="destructive">No</Badge>
                                    ))}
                            </TableCell>
                            <TableCell>
                                {!info.error &&
                                    (
                                        info.DatabasePrincipalFound ? (
                                            <Badge className="dark:bg-green-800" variant="secondary">Yes</Badge>
                                        ) : (
                                            <Badge variant="destructive">No</Badge>
                                        )
                                    )
                                }
                            </TableCell>
                            <TableCell>
                                {!info.error && (
                                    <div className="flex flex-col gap-1">
                                        {!info.ServerPrincipalFound && (
                                            <div className="text-red-600">
                                                No Server Principal Found
                                            </div>
                                        )}

                                        {!info.DatabasePrincipalFound && (
                                            <div className="text-red-600">
                                                No Database Principal Found
                                            </div>
                                        )}

                                        {missingPermissions.length > 0 && (
                                            <div className="text-orange-600">
                                                <div className="font-medium">Missing Permissions:</div>
                                                <ul className="list-disc list-inside text-sm">
                                                    {missingPermissions.map(p => (
                                                        <li key={p}>{p}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-red-500 whitespace-normal break-words"> {info.error}</TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table >
    )
}


export function ClientIDListCell({ metaData, Namespace, selectedEnvironment }: { metaData?: CustomerSecurityGroupMetaData | string | null, Namespace: string, selectedEnvironment: string }) {
    const [data, setData] = useState<IConnectionStringWithFound[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [customerpermissionsetting, setcustomerpermissionsetting] = useState<ICustomerPermissionConfig>()
    useEffect(() => {
        CustomerPermissionSetting().then(setcustomerpermissionsetting)
    }, [])

    const loadClients = async () => {
        if (loading || data.length > 0) return

        if (!metaData) {
            setError("No MetaData")
            return
        }
        let clientIDList: string | undefined

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
            if (!customerpermissionsetting) return
            const result = await getClientWithDbInfo(customerpermissionsetting.monolilthconnectionstringdb, clientArray, Namespace, selectedEnvironment)
            setData(result);
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

            <PopoverContent className="w-[100vw] max-w-[950px] max-h-72 overflow-auto text-sm">
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
                                <TableHead>ConnectionStringFound?</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map(info => (
                                <TableRow
                                    key={`${info.ClientID}-${info.ConstringDatabaseName}`}
                                    className={
                                        !info.ConnectionStringFound
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
                                    <TableCell>{info.ConnectionStringFound ? "Yes" : "No"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </PopoverContent>
        </Popover>
    )
}


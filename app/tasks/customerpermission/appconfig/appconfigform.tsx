// "use client"
// import { ICustomerPermissionConfig } from "../interfaces";
// import { useEffect, useState } from "react"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { useMemo } from "react"
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form"

// const schema = z.object({
//     customerdb: z.string().min(1),
//     customerdbserver: z.string().min(1),
// })

// type FormValues = z.infer<typeof schema>

// export function AppConfigForm({
//     row,
//     isAddMode,
//     onSaveAction,
//     onAddCancelAction,
// }: {
//     row?: ICustomerPermissionConfig | null,
//     isAddMode: boolean,
//     onSaveAction: (config: ICustomerPermissionConfig) => Promise<void>
//     onAddCancelAction?: () => void
// }) {
//     const [isEditing, setIsEditing] = useState<boolean>(false)
//     useEffect(() => { setIsEditing(isAddMode) }, [isAddMode])
//     // console.log("row:", row);
//     const defaultValues: ICustomerPermissionConfig = useMemo<ICustomerPermissionConfig>(() => ({
//         "customerdb": "",
//         "customerdbserver": "",
//         "monolithconnectionstringdb": ""
//     }), [])

//     const form = useForm<ICustomerPermissionConfig>({
//         resolver: zodResolver(schema),
//         defaultValues,
//         mode: "onChange",
//     })

//     useEffect(() => {
//         // if ( typeof row === "object" ) {
//         //   form.reset(row)
//         if (schema.safeParse(row).success) {
//             form.reset(row as ICustomerPermissionConfig)
//         } else {
//             form.reset(defaultValues)
//         }
//     }, [row, form, defaultValues])

//     const onSubmit = async (values: FormValues) => {
//         await onSaveAction(values)
//         setIsEditing(false)
//         // if (isAddMode) {
//         //   form.reset(values)
//         //   setIsEditing(false)
//         //   onAddCancelAction?.()
//         // } else {
//         //   setIsEditing(false)
//         // }
//     }

//     const onCancel = () => {
//         if (isAddMode) {
//             setIsEditing(false)
//             onAddCancelAction?.()
//         } else {
//             form.reset()
//             setIsEditing(false)
//         }
//     }

//     return (
//         <Form {...form}>
//             <form className="grid grid-cols-[200px_1fr] gap-x-4 gap-y-3 items-center"
//                 onSubmit={form.handleSubmit(onSubmit)}
//             >

//                 {(isAddMode || row != null) && (
//                     <>
//                         <FormLabel className="text-left col-span-1">
//                             Environment
//                         </FormLabel>
//                         <FormField
//                             control={form.control}
//                             name="customerdb"
//                             render={({ field }) => (
//                                 <FormItem className="text-left col-span-5">
//                                     <FormControl>
//                                         <Input
//                                             {...field}
//                                             placeholder="Environment (e.g. dev / staging / prod)"
//                                             disabled={!isAddMode} />
//                                     </FormControl>
//                                 </FormItem>
//                             )}
//                         />


//                         <FormLabel className="text-left col-span-1" >Get Token URL</FormLabel>
//                         <FormField
//                             control={form.control}
//                             name="customerdbserver"
//                             render={({ field }) => (
//                                 <FormItem className="text-left col-span-5">
//                                     <FormControl>
//                                         <Input {...field} disabled={!isEditing} placeholder="Token URL" />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />

//                     </>
//                 )}

//                 {/* Actions */}

//                 <div className="col-span-6 flex gap-2">
//                     {/* {!isEditing && !isAddMode ? ( */}
//                     {row && !isEditing && !isAddMode && (
//                         <Button
//                             type="button"
//                             size="sm"
//                             variant="outline"
//                             onClick={() => setIsEditing(true)}
//                         >
//                             Edit
//                         </Button>
//                     )
//                     }

//                     {isEditing && (
//                         <>
//                             <Button
//                                 type="submit"
//                                 size="sm"
//                                 disabled={!form.formState.isDirty}
//                             >
//                                 {isAddMode ? "Add" : "Save"}
//                             </Button>
//                             <Button
//                                 type="button"
//                                 size="sm"
//                                 variant="ghost"
//                                 onClick={onCancel}
//                             >
//                                 Cancel
//                             </Button>
//                         </>
//                     )
//                     }

//                 </div>
//             </form>
//         </Form>
//     )
// }

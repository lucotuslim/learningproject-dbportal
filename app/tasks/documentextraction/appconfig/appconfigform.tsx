"use client"
import { IDocumentConfig } from "../interfaces";
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMemo } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const schema = z.object({
  env: z.string().min(1),

  GetDocApiToken: z.object({
    Url: z.string().url(),
    Method: z.string().min(1),
    ContentType: z.string().min(1),
    GrantType: z.string().min(1),
    ClientId: z.string().min(1),
    Scope: z.string().min(1),
  }),

  SendDocBulkExport: z.object({
    Url: z.string().url(),
    Method: z.string().min(1),
    ContentType: z.string().min(1),
    sftpHostName: z.string().min(1),
  }),

  GetDocBulkExportStatus: z.object({
    Url: z.string().url(),
    Method: z.string().min(1),
    ContentType: z.string().min(1),
  }),
})

type FormValues = z.infer<typeof schema>

export function AppConfigForm({
  row,
  onSave,
  onAddCancel,
}: {
  row: IDocumentConfig | null
  onSave: (config: IDocumentConfig) => Promise<void>
  onAddCancel?: () => void
}) {
  const isAddMode = row === null
  const [isEditing, setIsEditing] = useState(isAddMode)
  console.log("row:", row);
  const defaultValues: IDocumentConfig  = useMemo<IDocumentConfig> (() => ({
    env: "",
    GetDocApiToken: {
      Url: "",
      Method: "POST",
      ContentType: "application/json",
      GrantType: "",
      ClientId: "",
      Scope: "",
    },
    SendDocBulkExport: {
      Url: "",
      Method: "POST",
      ContentType: "application/json",
      sftpHostName: "",
    },
    GetDocBulkExportStatus: {
      Url: "",
      Method: "GET",
      ContentType: "application/json",
    },
  } ) , [])

  const form = useForm<IDocumentConfig>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    if (row) {
      form.reset(row)
    } else {
      form.reset(defaultValues)
    }
  }, [row, form, defaultValues])

  const onSubmit = async (values: FormValues) => {
    await onSave(values)
    if (isAddMode) {
      form.reset()
      onAddCancel?.()
    } else {
      setIsEditing(false)
    }
  }

  const onCancel = () => {
    if (isAddMode) {
      onAddCancel?.()
    } else {
      form.reset()
      setIsEditing(false)
    }
  }

  return (
    <Form {...form}>
      <form className="grid grid-cols-[200px_1fr] gap-x-4 gap-y-3 items-center"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="col-span-6 font-medium text-sm text-muted-foreground">
          GetDocApiToken
        </div>

        <FormLabel className="text-left col-span-1">
          Environment
        </FormLabel>
        <FormField
          control={form.control}
          name="env"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input
                  {...field}
                  placeholder="Environment (e.g. dev / staging / prod)"
                  disabled={!isAddMode} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormLabel className="text-left col-span-1" >Get Token URL</FormLabel>
        <FormField
          control={form.control}
          name="GetDocApiToken.Url"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="Token URL" />
              </FormControl>
                    <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="text-left col-span-1">Get Token Method</FormLabel>

        <FormField
          control={form.control}
          name="GetDocApiToken.Method"
          render={({ field }) => (
            <FormItem className="col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="Token Method" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="text-left col-span-1">Get Token Content Type</FormLabel>

        <FormField
          control={form.control}
          name="GetDocApiToken.ContentType"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="Content Type" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="text-left col-span-1">Token GrantType</FormLabel>

        <FormField
          control={form.control}
          name="GetDocApiToken.GrantType"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="GrantType" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="text-left col-span-1">Token ClientId</FormLabel>

        <FormField
          control={form.control}
          name="GetDocApiToken.ClientId"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="ClientId" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="text-left col-span-1">Token Scope</FormLabel>
        <FormField
          control={form.control}
          name="GetDocApiToken.Scope"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="Token Scope" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-6 font-medium text-sm text-muted-foreground">
          SendDocBulkExport
        </div>

        <FormLabel className="text-left col-span-1">Url</FormLabel>
        <FormField
          control={form.control}
          name="SendDocBulkExport.Url"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="Url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="text-left col-span-1">Method</FormLabel>
        <FormField
          control={form.control}
          name="SendDocBulkExport.Method"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="Method" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="text-left col-span-1">ContentType</FormLabel>
        <FormField
          control={form.control}
          name="SendDocBulkExport.ContentType"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="ContentType" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel className="text-left col-span-1">sftpHostName</FormLabel>
        <FormField
          control={form.control}
          name="SendDocBulkExport.sftpHostName"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="sftpHostName" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-6 font-medium text-sm text-muted-foreground">
          GetDocBulkExportStatus
        </div>

        <FormLabel className="text-left col-span-1">Url</FormLabel>
        <FormField
          control={form.control}
          name="GetDocBulkExportStatus.Url"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="Url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormLabel className="text-left col-span-1">Method</FormLabel>
        <FormField
          control={form.control}
          name="GetDocBulkExportStatus.Method"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="Method" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormLabel className="text-left col-span-1">ContentType</FormLabel>
        <FormField
          control={form.control}
          name="GetDocBulkExportStatus.ContentType"
          render={({ field }) => (
            <FormItem className="text-left col-span-5">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="ContentType" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Actions */}
        {!isEditing && !isAddMode ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={!form.formState.isDirty}
            >
              {isAddMode ? "Add" : "Save"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}

"use client"
import { IDocumentConfig } from "../interfaces";
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
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

export  function AppConfigForm({
    row,
    onSave,
    onAddCancel,
}: {
    row: IDocumentConfig | null
    onSave: (id: string | null, values: FormValues) => Promise<void>
    onAddCancel?: () => void
}) {
    const isAddMode = row === null
    const [isEditing, setIsEditing] = useState(isAddMode)
    console.log ("row:", row);
    const defaultValues: IDocumentConfig = {
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
}

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
}, [row])

    const onSubmit = async (values: FormValues) => {
        await onSave(row?.env ?? null, values)
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
            <form className="grid grid-cols-6 gap-2 items-center"
                onSubmit={form.handleSubmit(onSubmit)}
            >
<FormField
  control={form.control}
  name="env"
  render={({ field }) => (
    <FormItem className="col-span-6">
      <FormControl>
        <Input
          {...field}
          placeholder="Environment (e.g. dev / staging / prod)"
          disabled={!isEditing || !isAddMode}
        />
      </FormControl>
    </FormItem>
  )}
/>

        <FormField
          control={form.control}
          name="GetDocApiToken.Url"
          render={({ field }) => (
            <FormItem className="col-span-6">
              <FormControl>
                <Input {...field} disabled={!isEditing} placeholder="Token URL" />
              </FormControl>
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

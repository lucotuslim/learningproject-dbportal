"use client";

import { useEffect, useState } from "react";
import { GlobalSetting } from "../../appconfig";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  ENCRYPTION_KEY: z.string().min(1, "Required"),
  PWPUSHER_API_URL: z.string().url("Invalid URL"),
  APPCONFIGDB: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

export default function Settings() {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      ENCRYPTION_KEY: "",
      PWPUSHER_API_URL: "",
      APPCONFIGDB: "",
    },
  });

  useEffect(() => {
    const load = async () => {
      const res = await GlobalSetting();
      const values = res.reduce((acc, item) => {
        return { ...acc, ...item };
      }, {} as FormValues);
      form.reset(values);
    };
    load();
  }, [form]);

  const onSubmit = async (values: FormValues) => {
    console.log("Saving:", values);
    // await onSaveAction(values)
    setIsEditing(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-[200px_1fr] gap-x-4 gap-y-3 items-center"      >
        {/* ENCRYPTION_KEY */}
        <FormLabel className="text-left col-span-1">Encryption Key</FormLabel>
        <FormField 
          control={form.control}
          name="ENCRYPTION_KEY"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormControl>
                <Input className="w-full" {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PWPUSHER_API_URL */}
        <FormLabel className="text-left col-span-1">PWPusher API URL</FormLabel>
        <FormField
          control={form.control}
          name="PWPUSHER_API_URL"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormControl>
                <Input className="w-full" {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* APPCONFIGDB */}
        <FormLabel className="text-left col-span-1">App Config DB</FormLabel>
        <FormField
          control={form.control}
          name="APPCONFIGDB"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormControl>
                <Input className="w-full" {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ACTIONS */}
        <div className="col-span-2 flex gap-2 mt-4">
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}

          {isEditing && (
            <>
              <Button type="submit" disabled={!form.formState.isDirty}>
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset();
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}

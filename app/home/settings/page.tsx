"use client";

import { useEffect, useState } from "react";
import { UpdateGlobalSetting, GlobalSetting } from "../../appconfig";
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
  SERVERINVENTORY: z.string().min(1, "Required"),
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
      SERVERINVENTORY: "",
    },
  });

  useEffect(() => {
    const load = async () => {
      const values = await GlobalSetting();
      form.reset(values);
    };
    load();
  }, [form]);

  // const onSubmit = async (values: FormValues) => {
  //   console.log("Saving:", values);
  //   // await onSaveAction(values)
  //   await UpdateGlobalSetting(values);
  //   setIsEditing(false);
  // };
  const SubmitUpdateGlobalSetting = async (key: keyof FormValues) => {
    try {

      const value = form.getValues(key);
      await UpdateGlobalSetting(key, value);
      // 🔑 This is the key line
      form.resetField(key, { defaultValue: value });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating global setting:", error);
    } finally {
      setIsEditing(false);
    }
  };

  return (

    <Form {...form}>
      <form
        onSubmit={(e) => { e.preventDefault(); }}
        className="grid grid-cols-[200px_1fr_auto] gap-x-4 gap-y-3 items-start"
      >
        {/* ENCRYPTION_KEY */}
        {/* <FormLabel className="text-left">Encryption Key</FormLabel>

        <FormField
          control={form.control}
          name="ENCRYPTION_KEY"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          disabled={
            !isEditing ||
            !form.formState.dirtyFields.ENCRYPTION_KEY ||
            !!form.formState.errors.ENCRYPTION_KEY
          }
          onClick={() => SubmitUpdateGlobalSetting("ENCRYPTION_KEY")}
        >
          Save
        </Button> */}

        {/* PWPUSHER_API_URL */}
        <FormLabel className="text-left">PWPusher API URL</FormLabel>

        <FormField
          control={form.control}
          name="PWPUSHER_API_URL"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          disabled={
            !isEditing ||
            !form.formState.dirtyFields.PWPUSHER_API_URL ||
            !!form.formState.errors.PWPUSHER_API_URL
          }
          onClick={() => SubmitUpdateGlobalSetting("PWPUSHER_API_URL")}
        >
          Save
        </Button>

        {/* SERVERINVENTORY */}
        <FormLabel className="text-left">ServerInventory</FormLabel>

        <FormField
          control={form.control}
          name="SERVERINVENTORY"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} disabled={!isEditing} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          disabled={
            !isEditing ||
            !form.formState.dirtyFields.SERVERINVENTORY ||
            !!form.formState.errors.SERVERINVENTORY
          }
          onClick={() => SubmitUpdateGlobalSetting("SERVERINVENTORY")}
        >
          Save
        </Button>

        {/* GLOBAL EDIT TOGGLE */}
        <div className="col-span-3 mt-4">
          {!isEditing ? (
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
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
          )}
        </div>
      </form>
    </Form>
  );
}

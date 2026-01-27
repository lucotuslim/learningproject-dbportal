"use client";

import { useEffect, useState } from "react";
import { UpdateCustomerPermissionSetting, CustomerPermissionSetting } from "../appconfig"
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
    customerdb: z.string().min(1, "Required"),
    customerdbserver: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

export default function Settings() {
    const [isConfigLoading, setIsConfigLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            customerdb: "",
            customerdbserver: ""
        },
    });

    useEffect(() => {
        const load = async () => {
            const values = await CustomerPermissionSetting()
            form.reset(values);
            setIsConfigLoading(false);
        };
        load();
    }, [form]);

    const SubmitUpdateCustomerPermissionSetting = async (key: keyof FormValues) => {
        try {

            const value = form.getValues(key);
            await UpdateCustomerPermissionSetting(key, value);
            // 🔑 This is the key line
            form.resetField(key, { defaultValue: value });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating global setting:", error);
        } finally {
            setIsEditing(false);
        }
    };


    if (isConfigLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <span className="text-muted-foreground">Loading configuration…</span>
            </div>
        );
    }

    return (

        <Form {...form}>
            <form
                onSubmit={(e) => { e.preventDefault(); }}
                className="grid grid-cols-[200px_1fr_auto] gap-x-4 gap-y-3 items-start"
            >

                {/* PWPUSHER_API_URL */}
                <FormLabel className="text-left">Customer Db</FormLabel>

                <FormField
                    control={form.control}
                    name="customerdb"
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
                        !form.formState.dirtyFields.customerdb ||
                        !!form.formState.errors.customerdb
                    }
                    onClick={() => SubmitUpdateCustomerPermissionSetting("customerdb")}
                >
                    Save
                </Button>

                {/* SERVERINVENTORY */}
                <FormLabel className="text-left">ServerInventory</FormLabel>

                <FormField
                    control={form.control}
                    name="customerdbserver"
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
                        !form.formState.dirtyFields.customerdbserver ||
                        !!form.formState.errors.customerdbserver
                    }
                    onClick={() => SubmitUpdateCustomerPermissionSetting("customerdbserver")}
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

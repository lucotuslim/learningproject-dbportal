"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner"

const formSchema = z.object({
    Namespace: z.string().min(1, "Namespace is required"),
    Zipname: z.string().min(1, "Zipname is required"),
    SftpUsername: z.string().min(1, "SFTP Username is required"),
    SftpPassword: z.string().min(1, "SFTP Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function UserInputForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Namespace: "",
            Zipname: "",
            SftpUsername: "",
            SftpPassword: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);
        try {
            // Example: send to your API endpoint using fetch
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) {
                const errorStatus = await res.status; // or res.json() if server returns JSON
                throw new Error(`Upload failed: ${errorStatus}`);
            }
            toast.info(`Submitted Namespace: ${values.Namespace}`)
        } catch (error) {
            toast.error((error as Error).message)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
<div className="flex gap-6 m-6">
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="Namespace">Namespace</Label>
                        <Input id="Namespace" placeholder="Enter namespace" {...form.register("Namespace")} />
                    </div>
                    <div>
                        <Label htmlFor="Zipname">Zipname</Label>
                        <Input id="Zipname" placeholder="Enter zip name" {...form.register("Zipname")} />
                    </div>
                    <div>
                        <Label htmlFor="SftpUsername">SFTP Username</Label>
                        <Input id="SftpUsername" placeholder="Enter SFTP username" {...form.register("SftpUsername")} />
                    </div>
                    <div>
                        <Label htmlFor="SftpPassword">SFTP Password</Label>
                        <Input
                            id="SftpPassword"
                            type="password"
                            placeholder="Enter SFTP password"
                            {...form.register("SftpPassword")}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </CardFooter>
            </form>

            </div>
        
    );
}

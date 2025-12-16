"use client";
import React, { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { adminLogin } from "@/lib/api_auth";
// Schema chỉ để validate UI
const formSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z
    .string()
    .min(8, "Minimum 8 characters")
    .max(256, "Password is too long"),
});

type FormValues = z.infer<typeof formSchema>;

export const AdminsignInCard = () => {
    const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const data = await adminLogin(values.email, values.password);

      // lưu token (simple)
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);
      localStorage.setItem("role", "admin");

      // redirect sang dashboard doctor (đổi path theo bạn)
      router.push("/admin");
    } catch (err: any) {
      setServerError(err?.message || "Login failed");
    }
  };

 return (
     <div className="flex min-h-screen items-center justify-center px-6 py-12 lg:px-8 bg-sky-100 bg-[url('/images/2.png')] bg-cover bg-center">
       <Card className="w-full md:w-[487px] border-none shadow-none">
         <CardHeader className="flex items-center justify-center text-center p-7">
           <CardTitle className="text-2xl">Welcome back!</CardTitle>
         </CardHeader>
 
         <div className="px-7">
           <DottedSeparator />
         </div>
 
         <CardContent className="p-7">
           <Form {...form}>
             <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
 
               {serverError && (
                 <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                   {serverError}
                 </div>
               )}
 
               <FormField
                 name="email"
                 control={form.control}
                 render={({ field }) => (
                   <FormItem>
                     <FormControl>
                       <Input
                         {...field}
                         type="email"
                         placeholder="Enter email address"
                         autoComplete="email"
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
 
               <FormField
                 name="password"
                 control={form.control}
                 render={({ field }) => (
                   <FormItem>
                     <FormControl>
                       <Input
                         {...field}
                         type="password"
                         placeholder="Enter password"
                         autoComplete="current-password"
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
 
               <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? "Logging in..." : "Login"}
               </Button>
             </form>
           </Form>
         </CardContent>
 
         <div className="px-7">
           <DottedSeparator />
         </div>
       </Card>
     </div>
   );
 };
  
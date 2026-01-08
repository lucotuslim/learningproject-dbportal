"use client";
import  Home from "./home/page";
import { toast } from "sonner";


export default function Page() {
  toast.info("Make sure you select the right environment at top left before you start.")
return (
  <Home />
  
);
}

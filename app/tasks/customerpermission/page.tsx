"use client";
import React from "react";
// import AppConfigPage from "./appconfig/appconfigpage"
import CustomerSecurityGroup from "./customersecuritygroup/page"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function Page() {

  return (
    <div className="w-full gap-6 m-6">
      <Tabs defaultValue="customersecuritygroup" className="w-full">

        <TabsList className="w-full">

          <TabsTrigger value="customersecuritygroup" className="w-full">
            Customer Security Group
          </TabsTrigger>
          {/* 
          <TabsTrigger value="appconfig" className="w-full">
            App Config
          </TabsTrigger> */}

        </TabsList>

        <TabsContent value="customersecuritygroup" className="w-full" >
          <CustomerSecurityGroup />
        </TabsContent>

        {/* 
        <TabsContent value="appconfig" className="w-full" >
          <AppConfigPage />
        </TabsContent> */}

      </Tabs>
    </div>
  );
}

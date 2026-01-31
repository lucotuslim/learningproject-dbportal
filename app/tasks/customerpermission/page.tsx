"use client";
import React from "react";
// import AppConfigPage from "./appconfig/appconfigpage"
import CustomerSecurityGroup from "./customersecuritygroup/page"
import ConnectionString from "./monolilthconnectionstring/page"
import NotAllowedList from "./notallowedlist/page";
import Settings from "./appconfig/appconfigpage"
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

          <TabsTrigger value="notallowedlist" className="w-full">
            Not Allowed List
          </TabsTrigger>

          <TabsTrigger value="customersecuritygroup" className="w-full">
            Customer Security Group
          </TabsTrigger>
          <TabsTrigger value="connectionstring" className="w-full">
            Connection String
          </TabsTrigger>
          <TabsTrigger value="settings" className="w-full">
            Settings
          </TabsTrigger>
        </TabsList>


        <TabsContent value="notallowedlist" className="w-full" >
          <NotAllowedList />
        </TabsContent>

        <TabsContent value="customersecuritygroup" className="w-full" >
          <CustomerSecurityGroup />
        </TabsContent>
        <TabsContent value="connectionstring" className="w-full" >
          <ConnectionString />
        </TabsContent>
        <TabsContent value="settings" className="w-full" >
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

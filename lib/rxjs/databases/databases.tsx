// import { getAllServer } from "@/lib/rxjs/servers/servers";
// import { IServerInfoDetails } from "@/interfaces/server";
// import { ApiRequestRxjs, getApiEndpoint } from '@/lib/rxjs/generic';
// import { mergeMap, map, catchError, tap } from 'rxjs/operators';
// import { IapiInfo } from "@/interfaces/generic";
// import { Observable, of, forkJoin } from "rxjs";

// export function getAllDatabase<T extends { MachineName?: string }>(
//   apiControlDbUrls: { apiurl: string, apitype: string }[]
// ): Observable<IapiInfo<T>[]> {
//   return getAllServer<IServerInfoDetails>(apiControlDbUrls).pipe(
//     tap(servers => console.log("All servers from control DB:", servers)),
//     mergeMap(servers => {
//       // Get distinct server names
//       const distinctServers = Array.from(
//         new Set(servers.map(server => server.MachineName).filter(Boolean))
//       );
      
//       console.log("Distinct server names:", distinctServers);

//       if (distinctServers.length === 0) return of([]);

//       // Get databases from each server API
//       const serverApiCalls = distinctServers.map(serverName =>
//         getApiEndpoint(serverName!, "databases").pipe(
//           mergeMap(api =>
//             ApiRequestRxjs<T>(api.ServerUrl, "Database").pipe(
//               map((res) => ({
//                 serverName: serverName!,
//                 databases: res.items.map((item) => ({
//                   ...item,
//                   message: res.message ?? '',
//                   error: res.error ?? false,
//                   apiurl: api.ServerUrl,
//                   apitype: 'Database',
//                   MachineName: serverName,
//                   source: 'ServerAPI'
//                 } as IapiInfo<T>))
//               })),
//               catchError((err) =>
//                 of({
//                   serverName: serverName!,
//                   databases: [{
//                     error: true,
//                     message: err.message ?? 'Unknown error',
//                     apiurl: `http://${serverName}api:3000/api/databases`,
//                     apitype: 'Database',
//                     MachineName: serverName,
//                     source: 'ServerAPI_Error'
//                   } as unknown as IapiInfo<T>]
//                 })
//               )
//             )
//           )
//         )
//       );

//       return forkJoin(serverApiCalls).pipe(
//         tap(serverResults => console.log("Server API results:", serverResults)),
//         map(serverResults => {
//           const allDatabases: IapiInfo<T>[] = [];
          
//           // Add all databases from server APIs
//           serverResults.forEach(serverResult => {
//             allDatabases.push(...serverResult.databases);
//           });

//           // Get control DB entries for comparison
//           const controlDbEntries = servers.map(server => ({
//             ...server,
//             source: 'ControlDB',
//             apitype: 'ControlDB'
//           } as unknown as IapiInfo<T>));

//           // Compare and mark databases as found/not found in control DB
//           const comparedDatabases = allDatabases.map(db => {
//             const foundInControlDb = controlDbEntries.some(ctrl => 
//               ctrl.MachineName === db.MachineName
//             );
            
//             return {
//               ...db,
//               foundInControlDb,
//               comparisonStatus: foundInControlDb ? 'Found' : 'NotFound'
//             } as IapiInfo<T>;
//           });

//           // Add control DB entries that don't have corresponding server API entries
//           const missingFromServerApi = controlDbEntries.filter(ctrl => 
//             !allDatabases.some(db => db.MachineName === ctrl.MachineName)
//           ).map(ctrl => ({
//             ...ctrl,
//             foundInServerApi: false,
//             comparisonStatus: 'MissingFromServerAPI'
//           } as IapiInfo<T>));

//           return [...comparedDatabases, ...missingFromServerApi];
//         }),
//         tap(finalResult => console.log("Final comparison result:", finalResult))
//       );
//     })
//   );
// }

// export function GetDatabase <T extends object>
// (serverName: string, 
// databaseName: string) 
// : Observable<IapiInfo<T>[]> {

//   return ApiRequestRxjs<T>(
//     `http://${serverName}api:3000/api/database/${databaseName}`, 
//     "DatabaseDetail"
//     ).pipe(
//       map(result =>
//         result.items.map(item => ({
//           ...item,
//           apitype: "Database",
//           message: result.message ?? "",
//           error: result.error ?? false,
//           apiurl: `http://${serverName}api:3000/api/database/${databaseName}/master`,
//         }) as IapiInfo<T>)
//       )
//     );
//   // return getApiEndpoint(serverName, "server").pipe(
//   //   switchMap((api) =>
//   //     ApiGetServerInfoDetails<T>(
//   //       { apiurl: api.ServerUrl, apitype: "ClientDb" },
//   //     )
//   //   )
//   // );

// }



// import { NextResponse } from "next/server";
// import { decryptString } from "@/lib/utils";

// export async function POST(req: Request) {
//   try {
//     const { encpassword } = await req.json();

//     if (!encpassword) {
//       return NextResponse.json({ error: "Missing encrypted password" }, { status: 400 });
//     }

//     const keyString = process.env.ENCRYPTION_KEY;
//     if (!keyString) {
//       console.error("ENCRYPTION_KEY is missing in environment variables");
//       return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
//     }

//     const key = Buffer.from(keyString.split(",").map(Number));
//     const decPassword = decryptString(encpassword, key);

//     return NextResponse.json({ decPassword });
//   } catch (err: any) {
//     console.error("Decryption failed:", err);
//     return NextResponse.json(
//       { error: "Failed to decrypt", details: err?.message ?? err },
//       { status: 500 }
//     );
//   }
// }

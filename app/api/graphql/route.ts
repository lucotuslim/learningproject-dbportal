import { NextRequest } from "next/server";
import { getApolloHandler } from "@/graphql/core/apolloServer";

export const dynamic = "force-dynamic";

const handler = getApolloHandler();

export async function GET(req: NextRequest) {
  return handler(req);
}

export const POST = GET;

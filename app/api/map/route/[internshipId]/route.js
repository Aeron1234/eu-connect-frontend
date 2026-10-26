import { getMapCompanyRouteResult } from "@/lib/server-actions/map-actions";
import { requestPublicRoute } from "../../requestPublicRoute.mjs";
import { createMapRouteHandler } from "../../createMapRouteHandler.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET avoids the browser Server Action queue. Server-side helpers resolve the
// cookie session/token; the backend checks staff role and current ongoing
// destination before returning a route or public-provider descriptor.
export const GET = createMapRouteHandler({ read: getMapCompanyRouteResult, route: requestPublicRoute });

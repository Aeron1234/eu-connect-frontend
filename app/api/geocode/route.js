import { getUserSession } from "@/src-copies/services";
import { NextResponse } from "next/server";

export async function GET(request) {
  const session = await getUserSession();
  if (!session?.user || !["student", "admin"].includes(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // These stay 100% secret on the server
  const backendUrl = process.env.API_BASE_URL;
  const secretKey = process.env.BACKEND_SECRET_KEY;

  let queryPath =
    lat && lon
      ? `/api/location?userId=${userId}&lat=${lat}&lon=${lon}`
      : `/api/location?userId=${userId}&q=${q}`;

  try {
    const res = await fetch(`${backendUrl}${queryPath}`, {
      headers: {
        "x-api-key": secretKey,
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}

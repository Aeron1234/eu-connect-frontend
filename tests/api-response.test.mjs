import assert from "node:assert/strict";
import { test } from "node:test";
import { getErrorMessage, parseApiResponse, throwApiError, toReadActionResult } from "../lib/api-response.js";

test("authorization errors use consistent messages without exposing backend details", async () => {
  for (const [status, expected] of [
    [401, "Your session has expired. Please log in again."],
    [403, "You don't have permission to perform this action."],
  ]) {
    const body = { error: "Internal authorization detail" };
    assert.equal(await getErrorMessage(Response.json(body, { status })), expected);
    assert.deepEqual(await parseApiResponse(Response.json(body, { status })), {
      success: false,
      error: expected,
    });
  }
});

test("rate limits use backend text when available and a safe fallback otherwise", async () => {
  assert.equal(
    await getErrorMessage(Response.json({ error: "Try again in 60 seconds" }, { status: 429 })),
    "Try again in 60 seconds",
  );
  assert.equal(
    await getErrorMessage(Response.json({ message: "Slow down" }, { status: 429 })),
    "Slow down",
  );
  assert.equal(
    await getErrorMessage(new Response("<html>rate limited</html>", { status: 429 })),
    "You're submitting too quickly. Please wait a moment and try again.",
  );
});

test("failed reads can throw a safe message with their HTTP status", async () => {
  await assert.rejects(
    throwApiError(Response.json({ error: "Please try again after 15 minutes." }, { status: 429 })),
    (error) => error.status === 429 && error.message === "Please try again after 15 minutes.",
  );
});

test("client read results retain safe API errors and hide unexpected exceptions", async () => {
  const limited = new Error("Please try again after 15 minutes.");
  limited.status = 429;
  assert.deepEqual(await toReadActionResult(async () => { throw limited; }, []), {
    error: "Please try again after 15 minutes.",
    status: 429,
  });
  assert.deepEqual(await toReadActionResult(async () => { throw new Error("DB secret"); }, []), {
    error: "Could not reach the server. Please try again.",
    status: 0,
  });
  assert.deepEqual(await toReadActionResult(async () => { throw new Error("You must be logged in."); }, []), {
    error: "Your session has expired. Please log in again.",
    status: 401,
  });
  assert.deepEqual(await toReadActionResult(async (value) => value, [null]), null);
});

test("validation errors accept both backend error and message fields", async () => {
  assert.deepEqual(
    await parseApiResponse(Response.json({ message: "Course is required." }, { status: 400 })),
    { success: false, error: "Course is required." },
  );
  assert.deepEqual(
    await parseApiResponse(Response.json({ error: "Invalid week." }, { status: 422 })),
    { success: false, error: "Invalid week." },
  );
  assert.equal(
    await getErrorMessage(Response.json({ error: { internal: true } }, { status: 400 })),
    "Something went wrong (400). Please try again.",
  );
});

test("DTR geofence rejections explain distance instead of looking like role failures", async () => {
  const error = "Clock-in rejected. You are 180m away from the designated area (Limit: 150m).";
  assert.deepEqual(
    await parseApiResponse(Response.json({ error }, { status: 422 })),
    { success: false, error },
  );
});

test("non-JSON and empty failures remain failures without exposing HTML or exceptions", async () => {
  assert.deepEqual(
    await parseApiResponse(new Response("<html>proxy error</html>", { status: 502 })),
    { success: false, error: "Something went wrong (502). Please try again." },
  );
  assert.deepEqual(
    await parseApiResponse(new Response(null, { status: 500 })),
    { success: false, error: "Something went wrong (500). Please try again." },
  );
  assert.equal(
    await getErrorMessage(Response.json({ message: "SQL connection failed" }, { status: 500 })),
    "Something went wrong (500). Please try again.",
  );
});

test("successful mutations retain backend fields and normalize missing success flags", async () => {
  assert.deepEqual(
    await parseApiResponse(Response.json({ id: 12, message: "Saved" }, { status: 201 })),
    { success: true, id: 12, message: "Saved" },
  );
  assert.deepEqual(
    await parseApiResponse(Response.json({ success: false, error: "Rejected" })),
    { success: false, error: "Rejected" },
  );
  assert.deepEqual(await parseApiResponse(new Response(null, { status: 204 })), {
    success: true,
  });
  assert.deepEqual(await parseApiResponse(Response.json([1, 2])), {
    success: true,
    data: [1, 2],
  });
  assert.deepEqual(
    await parseApiResponse(new Response("<html>unexpected</html>", { status: 200 })),
    { success: false, error: "Unexpected response from the server. Please try again." },
  );
});

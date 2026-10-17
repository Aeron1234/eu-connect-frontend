import assert from "node:assert/strict";
import { test } from "node:test";
import { getApiBaseUrl } from "../lib/api-base-url.mjs";
import nextConfig from "../next.config.mjs";

test("API base accepts canonical, root and previous deployment values", () => {
  for (const suffix of ["", "/", "/api", "/api/", "/eu-connect", "/eu-connect/", "/eu-connect/api", "/eu-connect/api/", "/api/v1", "/api/v1/"]) {
    assert.equal(getApiBaseUrl(`https://backend.example${suffix}`), "https://backend.example/api/v1");
  }
  assert.equal(getApiBaseUrl(" http://localhost:7000/eu-connect \n"), "http://localhost:7000/api/v1");
});

test("API base preserves reverse-proxy paths and does not duplicate the version", () => {
  for (const suffix of ["", "/eu-connect", "/eu-connect/api", "/api/v1"]) {
    assert.equal(getApiBaseUrl(`https://backend.example/service${suffix}`), "https://backend.example/service/api/v1");
  }
});

test("invalid API settings fail without exposing their values", () => {
  for (const value of ["", "  ", null, "localhost:7000", "/api/v1", "ftp://backend.example", "https://user:secret@backend.example", "https://backend.example?key=secret", "https://backend.example/#fragment", "https://backend.example/api/v2"]) {
    assert.throws(() => getApiBaseUrl(value), error => {
      assert.match(error.message, /API_BASE_URL/);
      assert.ok(!error.message.includes("secret"));
      return true;
    });
  }
});

test("Next proxies canonical and legacy API URLs to the versioned backend", async () => {
  const originalApi = process.env.API_BASE_URL;
  const originalSocket = process.env.NEXT_PUBLIC_SOCKET_URL;
  try {
    process.env.API_BASE_URL = "https://backend.example/eu-connect";
    process.env.NEXT_PUBLIC_SOCKET_URL = "https://socket.example";
    assert.deepEqual(await nextConfig.rewrites(), [
      { source: "/api/v1/:path*", destination: "https://backend.example/api/v1/:path*" },
      { source: "/eu-connect/api/:path*", destination: "https://backend.example/api/v1/:path*" },
    ]);
    delete process.env.API_BASE_URL;
    assert.equal((await nextConfig.rewrites())[0].destination, "https://socket.example/api/v1/:path*");
    delete process.env.NEXT_PUBLIC_SOCKET_URL;
    assert.equal((await nextConfig.rewrites())[0].destination, "http://localhost:7000/api/v1/:path*");
    // Next owns /api/reports, /api/users and /api/socket-ticket independently.
    assert.ok((await nextConfig.rewrites()).every(rule => rule.source !== "/api/:path*"));
  } finally {
    if (originalApi === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = originalApi;
    if (originalSocket === undefined) delete process.env.NEXT_PUBLIC_SOCKET_URL;
    else process.env.NEXT_PUBLIC_SOCKET_URL = originalSocket;
  }
});

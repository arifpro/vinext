import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { ViteDevServer } from "vite";
import path from "node:path";
import { startFixtureServer, fetchHtml } from "./helpers.js";

const FIXTURE_DIR = path.resolve(import.meta.dirname, "./fixtures/dual-router");

/**
 * Regression test for dual app + pages router support.
 *
 * When both app/ and pages/ directories are present, the Pages Router
 * dev middleware must fall through to the App Router (RSC plugin) for
 * requests that don't match any Pages Router route. Without this fix,
 * the Pages Router middleware intercepts all requests and returns 404
 * for App Router pages.
 */
describe("Dual router (app + pages)", () => {
  let server: ViteDevServer;
  let baseUrl: string;

  beforeAll(async () => {
    ({ server, baseUrl } = await startFixtureServer(FIXTURE_DIR));
  });

  afterAll(async () => {
    await server?.close();
  });

  it("serves App Router pages at /", async () => {
    const { res, html } = await fetchHtml(baseUrl, "/");
    expect(res.status).toBe(200);
    expect(html).toContain("App Router Home");
  });

  it("serves App Router sub-pages", async () => {
    const { res, html } = await fetchHtml(baseUrl, "/app-only");
    expect(res.status).toBe(200);
    expect(html).toContain("App Router Only");
  });

  it("serves Pages Router pages", async () => {
    const { res, html } = await fetchHtml(baseUrl, "/pages-only");
    expect(res.status).toBe(200);
    expect(html).toContain("Pages Router Only");
  });

  it("returns 404 for non-existent routes", async () => {
    const { res } = await fetchHtml(baseUrl, "/does-not-exist");
    expect(res.status).toBe(404);
  });
});

import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("Health Check", () => {
  const app = createApp();

  it("should return ok status", async () => {
    const res = await request(app).get("/health").expect(200);
    expect(res.body.status).toBe("ok");
  });
});
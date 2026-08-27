import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("health", () => {
  it("returns API status", async () => {
    const response = await request(createApp()).get("/health").expect(200);

    expect(response.body).toMatchObject({
      status: "ok",
      service: "api"
    });
  });
});

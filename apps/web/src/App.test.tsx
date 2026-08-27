import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("./lib/api", () => ({
  getHealth: () => Promise.resolve({ status: "ok", service: "api", version: "test" }),
  getMe: () => Promise.resolve({ data: null, auth: { userId: "user_test" } }),
  listCountries: () => Promise.resolve({ data: [] }),
  listRegions: () => Promise.resolve({ data: [] }),
  completeOnboarding: () => Promise.resolve({ data: null }),
  savePushToken: () => Promise.resolve()
}));

vi.mock("./lib/pushNotifications", () => ({
  registerForPushNotifications: () => Promise.resolve({ status: "unavailable" })
}));

vi.mock("./lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn()
    }
  }
}));

describe("App", () => {
  it("renders the application shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "OpenPolitics" })).toBeInTheDocument();
  });
});

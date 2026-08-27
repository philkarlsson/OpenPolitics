import type { GeographicScope, HealthResponse, OnboardingInput, Profile, PushTokenInput } from "@openpolitics/shared";
import { webConfig } from "../config";

async function request<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  const response = await fetch(`${webConfig.apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getHealth() {
  return request<HealthResponse>("/health");
}

export function listCountries() {
  return request<{ data: GeographicScope[] }>("/v1/geography/countries");
}

export function listRegions(countryCode = "DE") {
  return request<{ data: GeographicScope[] }>(`/v1/geography/regions?countryCode=${countryCode}`);
}

export function getMe(accessToken: string) {
  return request<{ data: Profile | null; auth: { userId: string; email?: string } }>("/v1/me", {}, accessToken);
}

export function completeOnboarding(accessToken: string, input: OnboardingInput) {
  return request<{ data: Profile }>(
    "/v1/me/onboarding",
    {
      method: "POST",
      body: JSON.stringify(input)
    },
    accessToken
  );
}

export function savePushToken(accessToken: string, input: PushTokenInput) {
  return request<void>(
    "/v1/me/push-tokens",
    {
      method: "PUT",
      body: JSON.stringify(input)
    },
    accessToken
  );
}

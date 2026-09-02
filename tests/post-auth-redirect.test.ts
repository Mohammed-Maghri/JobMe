import { afterEach, describe, expect, it } from "vitest";
import {
  AUTHED_HOME,
  HOME,
  isAuthRoute,
  postAuthDestination,
  providerErrorDestination,
} from "@/components/auth/redirect";
import { describeProviderError } from "@/components/auth/errors";

/** Point the module's `window.location` at a URL for one assertion. */
function at(href: string) {
  (globalThis as { window?: unknown }).window = { location: { href } };
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

/**
 * A completed sign-in has to move the visitor. The destination is decided
 * before a provider redirect leaves the app, so it must be safe on arrival.
 */
describe("post-auth destination", () => {
  it("sends a plain sign-in to the app home, not back to the landing page", () => {
    at("http://app.test/");
    expect(postAuthDestination()).toBe(AUTHED_HOME);
    expect(postAuthDestination(null)).toBe(AUTHED_HOME);
  });

  it("moves off an auth route", () => {
    at("http://app.test/signin");
    expect(postAuthDestination()).toBe(AUTHED_HOME);
    at("http://app.test/signup");
    expect(postAuthDestination()).toBe(AUTHED_HOME);
  });

  it("does not strand a visitor on a marketing page they signed in from", () => {
    at("http://app.test/privacy");
    expect(postAuthDestination()).toBe(AUTHED_HOME);
  });

  it("returns to the protected page that turned the visitor away", () => {
    at("http://app.test/?auth=signin&next=%2Fapplications");
    expect(
      postAuthDestination({ type: "navigate", href: "/applications" }),
    ).toBe("/applications");
  });

  it("stays put for a save-job intent, whose feed is on the current page", () => {
    at("http://app.test/?auth=signin#find-jobs");
    expect(postAuthDestination({ type: "save-job", jobId: "job-1" })).toBe(
      "/#find-jobs",
    );
  });

  it("strips the parameters that would re-open the modal", () => {
    at("http://app.test/?auth=signup&next=%2Fx&auth_error=google");
    expect(postAuthDestination({ type: "save-job", jobId: "j" })).toBe("/");
  });

  it("keeps unrelated query parameters when it stays put", () => {
    at("http://app.test/?ref=newsletter&auth=signin");
    expect(postAuthDestination({ type: "save-job", jobId: "j" })).toBe(
      "/?ref=newsletter",
    );
  });

  it("falls back to the landing page for a save-job on an auth route", () => {
    at("http://app.test/signin");
    expect(postAuthDestination({ type: "save-job", jobId: "j" })).toBe(HOME);
  });

  it("only ever returns a same-origin path", () => {
    at("http://app.test/?auth=signin");
    for (const intent of [
      null,
      { type: "save-job", jobId: "j" } as const,
      { type: "navigate", href: "/applications" } as const,
    ]) {
      const destination = postAuthDestination(intent);
      expect(destination.startsWith("/")).toBe(true);
      expect(destination.startsWith("//")).toBe(false);
    }
  });

  it("works during a server render, where there is no window", () => {
    expect(postAuthDestination()).toBe(AUTHED_HOME);
  });

  it("recognises only the auth routes", () => {
    expect(isAuthRoute("/signin")).toBe(true);
    expect(isAuthRoute("/signup")).toBe(true);
    expect(isAuthRoute("/")).toBe(false);
    expect(isAuthRoute("/applications")).toBe(false);
  });
});

describe("provider error destination", () => {
  it("lands somewhere the modal can reopen, not on a protected page", () => {
    at("http://app.test/?auth=signin&next=%2Fapplications");
    // No session was created, so /applications would only bounce them back.
    expect(
      providerErrorDestination("google", {
        type: "navigate",
        href: "/applications",
      }),
    ).toBe("/?auth_error=google");
  });

  it("flags the failure without stacking auth parameters", () => {
    at("http://app.test/?auth=signin");
    expect(providerErrorDestination("google")).toBe("/?auth_error=google");
  });

  it("does not duplicate an existing flag", () => {
    at("http://app.test/?auth_error=google");
    expect(providerErrorDestination("google").match(/auth_error/g)).toHaveLength(1);
  });

  it("keeps a save-job visitor on the page holding the feed", () => {
    at("http://app.test/?ref=x");
    expect(
      providerErrorDestination("google", { type: "save-job", jobId: "j" }),
    ).toBe("/?ref=x&auth_error=google");
  });
});

describe("provider error copy", () => {
  it("says the visitor is not signed in and offers a way forward", () => {
    const message = describeProviderError("google");
    expect(message).toContain("Google");
    expect(message).toMatch(/not signed in/i);
    expect(message).toMatch(/email and password/i);
  });

  it("does not diagnose a cause the URL never carried", () => {
    const message = describeProviderError("google");
    expect(message).not.toMatch(
      /wrong password|incorrect|access denied|expired|revoked|already exists/i,
    );
  });
});

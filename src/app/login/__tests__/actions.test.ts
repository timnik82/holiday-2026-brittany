// @vitest-environment node
// loginAction uses bcrypt (Node-only) and jose, which behave best in the Node
// environment — matching the other auth tests.
import bcrypt from "bcryptjs";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// `vi.mock` calls are hoisted to the top of the file by the transformer, so the
// mocks below are in place before `loginAction` is imported, even though the
// import statement sits above them textually.

// `password.ts` imports `server-only`, which throws outside a server-component
// context; stub it out so the action's dependency graph loads in the test.
vi.mock("server-only", () => ({}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

const cookieSet = vi.fn();
const cookieDelete = vi.fn();
vi.mock("next/headers", () => ({
  // The action does `await cookies().set(...)`, so cookies() must resolve to an
  // object with the cookie methods.
  cookies: vi.fn(async () => ({
    set: cookieSet,
    delete: cookieDelete,
    get: vi.fn(),
  })),
}));

import { redirect } from "next/navigation";
import { loginAction } from "../actions";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

const TEST_AUTH_SECRET = "test-secret-at-least-32-characters-long-xxxxx";
let correctHash: string;

beforeAll(async () => {
  correctHash = await bcrypt.hash("correct-pass", 10);
  process.env.SITE_PASSWORD_HASH = correctHash;
  process.env.AUTH_SECRET = TEST_AUTH_SECRET;
});

afterAll(() => {
  delete process.env.SITE_PASSWORD_HASH;
  delete process.env.AUTH_SECRET;
});

/** Builds a minimal FormData for the login form. */
function loginFormData(password: string, next?: string): FormData {
  const fd = new FormData();
  fd.set("password", password);
  fd.set("next", next ?? "/");
  return fd;
}

/** Runs the action and returns the REDIRECT:<path> message it throws. */
async function expectRedirect(formData: FormData): Promise<string> {
  let thrown: unknown;
  try {
    await loginAction(formData);
  } catch (e) {
    thrown = e;
  }
  expect(thrown).toBeInstanceOf(Error);
  const message = (thrown as Error).message;
  expect(message.startsWith("REDIRECT:")).toBe(true);
  return message;
}

describe("loginAction", () => {
  it("redirects to the login error page on a wrong password", async () => {
    const message = await expectRedirect(
      loginFormData("wrong-pass"),
    );
    expect(message).toBe("REDIRECT:/login?error=1&next=%2F");
  });

  it("treats a blank password identically to a wrong one", async () => {
    const blankMessage = await expectRedirect(loginFormData(""));
    const wrongMessage = await expectRedirect(
      loginFormData("wrong-pass"),
    );
    // The "blank == wrong" guarantee: identical redirect, so the form never
    // reveals which case occurred.
    expect(blankMessage).toBe(wrongMessage);
  });

  it("sets the session cookie and redirects to '/' on a correct password", async () => {
    cookieSet.mockClear();
    const message = await expectRedirect(
      loginFormData("correct-pass"),
    );
    expect(message).toBe("REDIRECT:/");
    expect(cookieSet).toHaveBeenCalledTimes(1);
    expect(cookieSet.mock.calls[0][0]).toBe(SESSION_COOKIE_NAME);
  });

  it("collapses an open-redirect next='//evil.com' to '/'", async () => {
    const message = await expectRedirect(
      loginFormData("correct-pass", "//evil.com"),
    );
    expect(message).toBe("REDIRECT:/");
    expect(message).not.toContain("evil.com");
  });

  it("honours a safe same-origin next path", async () => {
    const message = await expectRedirect(
      loginFormData("correct-pass", "/bases"),
    );
    expect(message).toBe("REDIRECT:/bases");
  });

  it("invokes redirect from next/navigation", () => {
    expect(redirect).toHaveBeenCalled();
  });
});

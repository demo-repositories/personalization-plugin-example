import MurmurHash3 from "imurmurhash";
import { v4 } from "uuid";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

/** Variant IDs shared across experiments - must match Studio experiment definitions */
export const EXPERIMENT_VARIANTS = [
  "control",
  "variant-a",
  "variant-b",
  "variant-c",
] as const;

/** Return logged-in user ID when auth is implemented. Stub returns undefined for now. */
function getUserIdFromSession(_request: NextRequest): string | undefined {
  // TODO: Implement when auth is added, e.g.:
  // return getServerSession()?.user?.id;
  return undefined;
}

type Experiment = Record<
  string,
  { label: string; variants: { id: string; label: string }[] }
>;

const EXPERIMENTS: Experiment = {
  "blog-title": {
    label: "Blog Title",
    variants: [
      {
        id: "control",
        label: "Control",
      },
      {
        id: "variant-a",
        label: "Variant A",
      },
    ],
  },
};

const getTestCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("ab-test")?.value;
};

export const getUserGroup = async () => {
  const testCookie = await getTestCookie();
  return testCookie ? JSON.parse(testCookie)?.userGroup : "control";
};

// mocking a fetch to an external service for getting an experiment variant
export const getExperimentValue = async (experimentName: string) => {
  const userGroup = await getUserGroup();
  return {
    variant: EXPERIMENTS[experimentName]?.variants?.find(
      (variant) => variant.id === userGroup
    ),
  };
};

export const setCookiesValue = (
  request: NextRequest,
  response: NextResponse
) => {
  if (!request.cookies.has("ab-test")) {
    // userId: session (if logged in) > persisted anonymous ID > new UUID
    const userId =
      getUserIdFromSession(request) ??
      request.cookies.get("ab-user-id")?.value ??
      v4();

    // Deterministic variant from MurmurHash (same userId → same variant)
    const hash = MurmurHash3(userId).result();
    const variantIndex = Math.abs(hash) % EXPERIMENT_VARIANTS.length;
    const userGroup = EXPERIMENT_VARIANTS[variantIndex];

    const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
    response.cookies.set("ab-test", JSON.stringify({ userGroup, userId }), {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    // Persist anonymous ID when we created a new one (update to real ID on login)
    if (
      !getUserIdFromSession(request) &&
      !request.cookies.get("ab-user-id")?.value
    ) {
      response.cookies.set("ab-user-id", userId, {
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
    }
  }

  return response;
};

// If use is part of any experiments, get the tracking call data
// This is passed into the <Tracking> client component
export const getDeferredTrackingData = async (): Promise<
  | {
      userGroup: string;
      userId: string;
    }
  | undefined
> => {
  const testCookie = await getTestCookie();
  const data = testCookie ? JSON.parse(testCookie) : undefined;
  return data;
};

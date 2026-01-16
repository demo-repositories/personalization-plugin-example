import { v4 } from "uuid";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

type Experiment = Record<
  string,
  { label: string; variants: { id: string; label: string }[] }
>;

const EXPERIMENTS: Experiment = {
  "title-value": {
    label: "Title Value",
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
    // randomly assign a user to a group
    // Uses "variant-a" to match the route-experiment schema options
    const userGroup = Math.random() > 0.5 ? "control" : "variant-a";
    // create a user ID
    const userId = v4();
    // Setting cookies on the response using the `ResponseCookies` API
    response.cookies.set("ab-test", JSON.stringify({ userGroup, userId }));
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

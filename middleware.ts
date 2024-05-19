// import { authMiddleware } from "@clerk/nextjs/server";

// export default authMiddleware({
//     publicRoutes: ['/', 'c'],
//     ignoredRoutes: ['/api/webhooks']
// });

// export const config = {
//   matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
// };


import {
  clerkMiddleware,
  createRouteMatcher
} from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/search', '/activity', '/create-post', '/communities', '/profile',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};


// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { redirectToSignIn } from "@clerk/nextjs/server";
// import { redirect } from "next/dist/server/api-utils";
// import { NextRequest, NextResponse } from "next/server";

// const isOnboardingRoute = createRouteMatcher(["/onboarding"])
// const isPublicRoute = createRouteMatcher(["/sign-in", "/onboarding", "/sign-up","/continue"]);

// export default clerkMiddleware((auth, req: NextRequest) => {
//   const { userId, sessionClaims } = auth();

//   // For users visiting /onboarding, don't try to redirect
//   if (userId && isOnboardingRoute(req)) {
//     return NextResponse.next();
//   }


//   // Catch users who do not have `onboardingComplete: true` in their publicMetadata
//   // Redirect them to the /onboading route to complete onboarding
//   if (userId && !sessionClaims?.metadata?.onboardingComplete) {
//     const onboardingUrl = new URL("/onboarding", req.url);
//     return NextResponse.redirect(onboardingUrl);
//   }

//   // If the user is logged in and the route is protected, let them view.
//   if (userId && !isPublicRoute(req)) return NextResponse.next();
// }
// );

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };
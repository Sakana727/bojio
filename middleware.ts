// import { authMiddleware } from "@clerk/nextjs/server";

// export default authMiddleware({
//     publicRoutes: ['/', '/api/webhooks/clerk'],
//     ignoredRoutes: ['/api/webhooks']
// });

// export const config = {
//   matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
// };


// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// // Define routes to be treated differently
// const publicRoutes = createRouteMatcher(["/", "/api/webhooks/clerk"]);
// const ignoredRoutes = createRouteMatcher(["/api/webhooks"]);

// export default clerkMiddleware((auth, req) => {
//   if (publicRoutes(req)) {
//     return;
//   } else if (ignoredRoutes(req)) {
//     // No action needed, just let the request pass through
//   } else {
//     auth().protect();
//   }
// });

// export const config = {
//   matcher: [
//     "/((?!.*\\..*|_next).*)",
//     "/",
//     "/(api|trpc)(.*)"
//   ],
// };

import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

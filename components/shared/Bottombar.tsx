// "use client";
// import { SMsidebarLinks } from "@/constants";
// import { useAuth } from "@clerk/nextjs";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";

// function Bottombar() {
//   const route = useRouter();
//   const pathname = usePathname();
//   return (
//     <section className="bottombar">
//       <div className="bottombar_container">
//         {SMsidebarLinks.map((link) => {
//           const isActive =
//             (pathname.includes(link.route) && link.route.length > 1) ||
//             pathname === link.route;

//           if (link.route === "/profile") link.route = `${link.route}/${userId}`;
//           return (
//             <Link
//               href={link.route}
//               key={link.label}
//               className={`bottombar_link ${isActive && "bg-primary-500 "}`}
//             >
//               <Image
//                 src={link.imgURL}
//                 alt={link.label}
//                 width={32}
//                 height={32}
//               />
//               <p className=" text-subtle-medium text-light-1 max-sm:hidden">
//                 {link.label.split(/\s+./)[0]}
//               </p>
//             </Link>
//           );
//         })}
//       </div>
//     </section>
//   );
// }

// export default Bottombar;
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { sidebarLinks } from "@/constants";

function Bottombar() {
  const pathname = usePathname();

  return (
    <section className="bottombar">
      <div className="bottombar_container">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`bottombar_link ${isActive && "bg-primary-500"}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={16}
                height={16}
                className="object-contain"
              />

              <p className="text-subtle-medium text-light-1 max-sm:hidden">
                {link.label.split(/\s+/)[0]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Bottombar;

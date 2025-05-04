"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCompass, FaPlusCircle, FaRegUser, FaLock, FaLayerGroup } from "react-icons/fa";

const navItems = [
  { label: "Explore", icon: FaCompass, href: "/explore" },
  { label: "Add", icon: FaPlusCircle, href: "/add" },
  { label: "My Posts", icon: FaLayerGroup, href: "/myposts" },
  { label: "Private", icon: FaLock, href: "/private" },
  { label: "Account", icon: FaRegUser, href: "/account" },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 shadow-md">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Active if pathname starts with the nav item's href (for all except "/")
        const isActive = item.href === "/"
          ? pathname === "/"
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center text-xs focus:outline-none"
          >
            <Icon
              className={
                isActive
                  ? "text-[color:var(--primary)] text-xl mb-1"
                  : "text-gray-500 text-xl mb-1"
              }
            />
            <span className={isActive ? "text-[color:var(--primary-dark)] font-semibold" : "text-gray-600"}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
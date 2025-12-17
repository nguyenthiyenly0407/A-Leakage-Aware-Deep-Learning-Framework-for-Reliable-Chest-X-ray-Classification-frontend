"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Patient", href: "/dashboard" },
  { label: "Analysis", href: "/analysis" },
  { label: "History", href: "/history" },
  { label: "Chart", href: "/chart" },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // clear token
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("role");

    router.push("/sign-in");
  };

  return (
    <aside className="h-screen w-64 border-r bg-white">
      <div className="px-5 py-4">
        <div className="text-lg font-semibold">Doctor Panel</div>
        <div className="text-xs text-muted-foreground">AI Dermatology System</div>
      </div>

      <nav className="px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "block rounded-md px-3 py-2 text-sm transition",
                    active
                      ? "bg-sky-100 text-sky-700 font-medium"
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t pt-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition"
          >
            Log out
          </button>
        </div>
      </nav>
    </aside>
  );
}

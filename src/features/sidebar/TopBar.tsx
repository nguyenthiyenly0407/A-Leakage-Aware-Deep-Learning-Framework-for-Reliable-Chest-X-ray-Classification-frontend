"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

function buildBreadcrumb(pathname: string) {
  // Bạn có thể chỉnh mapping theo route thật của bạn
  // Ví dụ route: /dashboard/patient, /dashboard/patient/[id]
  if (pathname.startsWith("/dashboard/patient/")) {
    return [
      { label: "Patient", href: "/dashboard/patient" },
      { label: "Patient Information" },
    ];
  }

  if (pathname === "/dashboard/patient") {
    return [
      { label: "Patient", href: "/dashboard/patient" },
      { label: "Patient List" },
    ];
  }

  if (pathname === "/dashboard/analysis") {
    return [{ label: "Analysis" }, { label: "New Analysis" }];
  }

  if (pathname === "/dashboard/history") {
    return [{ label: "History" }];
  }

  if (pathname === "/dashboard/chart") {
    return [{ label: "Chart" }];
  }

  // default
  return [{ label: "Dashboard" }];
}

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const crumbs = useMemo(() => buildBreadcrumb(pathname), [pathname]);

  // click outside to close panel
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("role");
    router.push("/sign-in");
  };

  return (
    <header className="h-14 w-full border-b bg-white px-6 flex items-center justify-between">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        {crumbs.map((c, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <div key={idx} className="flex items-center gap-2">
              {c.href && !isLast ? (
                <Link className="text-slate-600 hover:text-slate-900" href={c.href}>
                  {c.label}
                </Link>
              ) : (
                <span className={isLast ? "font-semibold text-slate-900" : "text-slate-600"}>
                  {c.label}
                </span>
              )}
              {!isLast && <span className="text-slate-400">{">"}</span>}
            </div>
          );
        })}
      </div>

      {/* Right user icon + dropdown */}
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-slate-100"
        >
          {/* Avatar giả lập */}
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
            DR
          </div>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-white shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
                DR
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-slate-900">Dr. Nguyen</div>
                <div className="text-xs text-slate-500">@doctor</div>
              </div>
            </div>

            <div className="border-t">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/dashboard/settings"); // nếu chưa có page thì bạn tạo sau
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50"
              >
                Account settings
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

// Hàm tạo breadcrumb (Giữ nguyên logic của bạn)
function buildBreadcrumb(pathname: string) {
  if (pathname.startsWith("/dashboard/patient")) {
    // Nếu có ID cụ thể (ví dụ /dashboard/patient/123) -> sau này xử lý thêm
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Patient List", href: "/dashboard" },
    ];
  }

  if (pathname.includes("/analysis")) {
    return [{ label: "Dashboard", href: "/dashboard" }, { label: "AI Analysis" }];
  }

  if (pathname.includes("/history")) {
    return [{ label: "Dashboard", href: "/dashboard" }, { label: "History" }];
  }

  if (pathname.includes("/chart")) {
    return [{ label: "Dashboard", href: "/dashboard" }, { label: "Statistics" }];
  }

  // default
  return [{ label: "Patients management", href: "/dashboard" }];
}

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // State giả lập ngày giờ
  const [dateStr, setDateStr] = useState("");

  const crumbs = useMemo(() => buildBreadcrumb(pathname), [pathname]);

  // Lấy ngày giờ hiện tại
  useEffect(() => {
    const d = new Date();
    // Format: "Wed, 18 Dec 2025"
    setDateStr(d.toLocaleDateString("en-US", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    // Tăng chiều cao lên h-20 cho cân đối với Sidebar mới
    <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b bg-white px-8 shadow-sm">
      
      {/* 1. LEFT: Breadcrumb (Style đẹp hơn) */}
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-800">
            {crumbs[crumbs.length - 1]?.label}
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          {crumbs.map((c, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <div key={idx} className="flex items-center gap-2">
                {!isLast ? (
                  <Link className="hover:text-sky-600 hover:underline transition-colors" href={c.href || "#"}>
                    {c.label}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-400">{c.label}</span>
                )}
                {!isLast && <span className="text-slate-300">/</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER: Global Search (Lấp khoảng trống) */}
      <div className="hidden md:block w-1/3">
        <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
                type="text"
                placeholder="Search patient, file, id..."
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
        </div>
      </div>

      {/* 3. RIGHT: Actions & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Date & Time */}
        <div className="hidden xl:block text-right">
            <div className="text-sm font-semibold text-slate-700">{dateStr}</div>
            <div className="text-xs text-slate-400">Available</div>
        </div>

        {/* Notification Bell */}
        <button className="relative h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition-all border border-transparent hover:border-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            {/* Red Dot */}
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200"></div>

        {/* User Dropdown */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-sky-200">
              DR
            </div>
            <div className="hidden text-left lg:block">
                <div className="text-sm font-semibold text-slate-700">Dr. Nguyen</div>
                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Dermatologist</div>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 p-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-3 border-b border-slate-50 mb-1">
                <p className="font-semibold text-slate-800">My Account</p>
                <p className="text-xs text-slate-500">doctor@dermatology.com</p>
              </div>
              
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/dashboard/profile"); 
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Profile Settings
              </button>

              <button
                 className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors"
              >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                 Support
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
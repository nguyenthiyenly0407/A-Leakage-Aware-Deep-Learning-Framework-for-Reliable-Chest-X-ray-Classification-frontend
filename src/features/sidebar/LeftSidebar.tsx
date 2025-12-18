"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// TĂNG KÍCH THƯỚC ICON Ở ĐÂY (w-7 h-7)
const navItems = [
  { 
    label: "Patient List", 
    href: "/dashboard", 
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
    )
  },
  { 
    label: "AI Analysis", 
    href: "/analysis", 
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
    )
  },
  { 
    label: "History", 
    href: "/history", 
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    )
  },
  { 
    label: "Statistics Chart", 
    href: "/chart", 
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
      </svg>
    )
  },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("role");
    router.push("/sign-in");
  };

  return (
    <aside className="flex h-screen w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl transition-all duration-300">
      
      {/* 1. Header Logo (Tăng chiều cao header lên h-24 cho thoáng) */}
      <div className="flex h-24 items-center gap-4 border-b border-slate-700/50 bg-slate-900/50 px-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 font-bold text-white text-xl shadow-lg shadow-sky-500/20">
          DP
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-white">
            Doctor Panel
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            AI Dermatology
          </span>
        </div>
      </div>

      {/* 2. Navigation Menu */}
      <nav className="flex-1 px-6 py-10"> 
        {/* Tăng space-y-6 để các mục cách xa nhau hơn */}
        <ul className="space-y-6">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  // SỬA STYLE: py-4 (nút dày hơn), text-base (chữ to hơn)
                  className={`group flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-semibold transition-all duration-200 ${
                    active
                      ? "bg-sky-600 text-white shadow-xl shadow-sky-900/20 translate-x-1" // Hiệu ứng đẩy nhẹ sang phải khi active
                      : "text-slate-400 hover:bg-white/10 hover:text-white hover:translate-x-1"
                  }`}
                >
                  <span className={`transition-colors ${active ? "text-white" : "text-slate-500 group-hover:text-white"}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 3. Footer / Logout Section */}
      <div className="border-t border-slate-700/50 bg-slate-900/30 p-6">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-base font-medium text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Log out
        </button>
      </div>
    </aside>
  );
}
"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

// Tọa độ mặc định (TP.HCM) phòng khi người dùng chặn định vị
const DEFAULT_LOCATION = {
  lat: 10.8231,
  long: 106.6297,
};

function buildBreadcrumb(pathname: string) {
  if (pathname.startsWith("/dashboard/patient")) {
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
  return [{ label: "Patients management", href: "/dashboard" }];
}

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [time, setTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  
  // State lưu tọa độ (khởi tạo bằng mặc định trước)
  const [coords, setCoords] = useState(DEFAULT_LOCATION);

  const crumbs = useMemo(() => buildBreadcrumb(pathname), [pathname]);

  // 1. ĐỒNG HỒ & CLICK OUTSIDE
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);

    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);

    return () => {
      clearInterval(timer);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // 2. XIN QUYỀN VỊ TRÍ (GEOLOCATION)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Thành công -> Cập nhật tọa độ thật
          setCoords({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Không lấy được vị trí (User denied hoặc lỗi), dùng mặc định.", error);
          // Không làm gì cả, giữ nguyên mặc định là TP.HCM
        }
      );
    }
  }, []);

  // 3. LẤY THỜI TIẾT (Chạy lại mỗi khi coords thay đổi)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.long}&current_weather=true`
        );
        const data = await res.json();
        
        if (data.current_weather) {
          setWeather({
            temp: data.current_weather.temperature,
            code: data.current_weather.weathercode,
          });
        }
      } catch (error) {
        console.error("Lỗi API thời tiết:", error);
      }
    };

    fetchWeather();
    // Refresh mỗi 30p
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [coords]); // <-- Quan trọng: coords thay đổi thì gọi lại API

  // Helper formats...
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long", day: "numeric", month: "short", year: "numeric",
    });
  };

  const getWeatherInfo = (code: number) => {
    if (code === 0) return { label: "Sunny", icon: <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> };
    if ([1, 2, 3].includes(code)) return { label: "Cloudy", icon: <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg> };
    if ([45, 48].includes(code)) return { label: "Foggy", icon: "🌫️" };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { label: "Rainy", icon: <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg> };
    if ([95, 96, 99].includes(code)) return { label: "Storm", icon: "⛈️" };
    return { label: "Clear", icon: "🌤️" };
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b bg-white px-8 shadow-sm">
      
      {/* 1. Breadcrumb */}
      <div className="flex flex-col min-w-[200px]">
        <h2 className="text-xl font-bold text-slate-800">{crumbs[crumbs.length - 1]?.label}</h2>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          {crumbs.map((c, idx) => (
             <div key={idx} className="flex items-center gap-2">
               {idx !== crumbs.length - 1 ? <Link href={c.href || "#"} className="hover:text-sky-600">{c.label}</Link> : <span>{c.label}</span>}
               {idx !== crumbs.length - 1 && <span>/</span>}
             </div>
          ))}
        </div>
      </div>

      {/* 2. CENTER: Auto Location Weather */}
      <div className="hidden md:flex flex-col items-center justify-center flex-1">
        {time ? (
          <>
            <div className="text-3xl font-bold text-slate-700 tracking-widest font-mono leading-none">
              {formatTime(time)}
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">
              <span>{formatDate(time)}</span>
              {weather && (
                  <>
                    <span className="h-3 w-px bg-slate-300"></span>
                    <span className="flex items-center gap-1.5 animate-in fade-in duration-500">
                        {getWeatherInfo(weather.code).icon} 
                        <span className="text-slate-600">{weather.temp}°C</span>
                    </span>
                  </>
              )}
            </div>
          </>
        ) : (
          <div className="h-10 w-32 bg-slate-100 rounded animate-pulse"></div>
        )}
      </div>

      {/* 3. RIGHT: Actions */}
      <div className="flex items-center gap-6 min-w-[200px] justify-end">
        <button className="relative h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-sky-600 transition-all border border-transparent hover:border-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200"></div>
        <div className="relative" ref={panelRef}>
          <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-sky-200">DR</div>
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
              <button onClick={() => { setOpen(false); router.push("/dashboard/profile"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Profile Settings
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> Support
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
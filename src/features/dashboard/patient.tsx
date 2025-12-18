"use client";

import { useMemo, useState, useEffect } from "react";
import LeftSidebar from "@/features/sidebar/LeftSidebar";
import TopBar from "@/features/sidebar/TopBar";

type PatientRow = {
  id: number;
  fullName: string;
  gender: "Male" | "Female";
  birthYear: number;
  phone: string;
};

// Mock data nhiều dòng để test phân trang
const mockPatients: PatientRow[] = Array.from({ length: 45 }).map((_, i) => ({
  id: i + 1,
  fullName: i % 2 === 0 ? `Nguyen Van A ${i + 1}` : `Tran Thi B ${i + 1}`,
  gender: i % 2 === 0 ? "Male" : "Female",
  birthYear: 2000 - (i % 5),
  phone: "0835574717",
}));

const ITEMS_PER_PAGE = 10;

export default function Patient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // form state (modal)
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"Nam" | "Nữ">("Nam");
  const [birthYear, setBirthYear] = useState("2000");
  const [phone, setPhone] = useState("");

  // 1. Lọc dữ liệu theo từ khóa
  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return mockPatients;
    return mockPatients.filter((p) =>
      [p.id, p.fullName, p.phone].some((x) => String(x).toLowerCase().includes(k))
    );
  }, [keyword]);

  // 2. Tính toán phân trang
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  const closeModal = () => setOpen(false);

  const resetForm = () => {
    setFullName("");
    setGender("Nam");
    setBirthYear("2000");
    setPhone("");
  };

  const handleSubmitAdd = () => {
    if (!fullName.trim() || !birthYear.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    alert("Thêm thành công (UI only)");
    closeModal();
    resetForm();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar đã có logic hiển thị ngày giờ bên trong */}
        <TopBar />

        <main className="flex-1 p-6 bg-slate-50 overflow-y-auto">
          {/* Page header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Patients List</h1>
              <p className="text-sm text-slate-500">Manage your patients</p>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white text-sm font-medium hover:bg-sky-700 shadow-sm transition-all active:scale-95"
            >
              <span className="text-lg leading-none">＋</span>
              Add New Patient
            </button>
          </div>

          {/* Card Table */}
          <div className="rounded-xl border bg-white shadow-sm flex flex-col">
            
            {/* --- Table Toolbar --- */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
              {/* Left: Copy */}
              <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                <span>📋</span>
                <span>Copy List</span>
              </button>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-2 border-r pr-4 mr-2 border-slate-200">
                    <button className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                      <span>📗</span>
                      <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors">
                      <span>📕</span>
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors">
                      <span>🖨️</span>
                      <span className="hidden sm:inline">Print</span>
                    </button>
                 </div>
                 
                 {/* Filter Button (Thay thế search cũ) */}
                 <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-sky-300 hover:text-sky-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    <span>Filter</span>
                 </button>
              </div>
            </div>

            {/* --- Table Content --- */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="px-5 py-3 border-b">ID</th>
                    <th className="px-5 py-3 border-b">FULLNAME</th>
                    <th className="px-5 py-3 border-b">GENDER</th>
                    <th className="px-5 py-3 border-b">BIRTH YEAR</th>
                    <th className="px-5 py-3 border-b">PHONE</th>
                    <th className="px-5 py-3 border-b text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 text-slate-700 font-medium">#{p.id}</td>
                      <td className="px-5 py-3">
                        <button className="text-sky-600 hover:underline font-medium">
                          {p.fullName}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            p.gender === 'Male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                            {p.gender}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {p.birthYear} <span className="text-slate-400 mx-1">|</span> {2025 - p.birthYear}T
                      </td>
                      <td className="px-5 py-3 text-slate-600 font-mono">{p.phone}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-sky-100 hover:text-sky-600 flex items-center justify-center transition-colors">
                            ✏️
                          </button>
                          <button className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl">🔍</span>
                            <span>No patients found matching your search.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- Pagination Footer --- */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Showing page <span className="font-semibold text-slate-900">{currentPage}</span> of <span className="font-semibold text-slate-900">{totalPages || 1}</span>
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Back
                </button>
                
                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page 
                                ? 'bg-sky-600 text-white' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Modal add patient (Giữ nguyên như cũ) */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="text-lg font-semibold text-slate-800">Add New Patient</div>
                <button onClick={closeModal} className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors">✕</button>
              </div>
              <div className="px-6 py-6 grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full h-10 rounded-lg border-slate-300 border px-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none transition-shadow" placeholder="Ex: Nguyen Van A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full h-10 rounded-lg border-slate-300 border px-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none">
                    <option value="Nam">Male</option>
                    <option value="Nữ">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Birth Year</label>
                  <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} className="w-full h-10 rounded-lg border-slate-300 border px-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none">
                    {Array.from({ length: 80 }, (_, i) => `${2025 - i}`).map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-10 rounded-lg border-slate-300 border px-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none" placeholder="090..." />
                </div>
              </div>
              <div className="px-6 py-4 border-t flex items-center justify-end gap-3 bg-slate-50 rounded-b-xl">
                <button onClick={closeModal} className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors text-sm">Cancel</button>
                <button onClick={handleSubmitAdd} className="px-5 py-2.5 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition-colors shadow-sm text-sm">Create Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
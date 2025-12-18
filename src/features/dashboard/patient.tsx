"use client";

import { useMemo, useState } from "react";
import LeftSidebar from "@/features/sidebar/LeftSidebar";
import TopBar from "@/features/sidebar/TopBar";

type PatientRow = {
  id: number;
  fullName: string;
  gender: "Male" | "Female";
  birthYear: number;
  phone: string;
 
};

const mockPatients: PatientRow[] = [
  {
    id: 1,
    fullName: "nguyen Thi B",
    gender: "Female",
    birthYear: 2000,
    phone: "0835574717",
    
  },
  
  {
    id: 2,
    fullName: "Nguyen A",
    gender: "Male",
    birthYear: 2000,
    phone: "0835574717"
   
  }
];

export default function Patient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  // form state (modal)
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"Nam" | "Nữ">("Nam");
  const [birthYear, setBirthYear] = useState("2000");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cccd, setCccd] = useState("");
  const [history, setHistory] = useState("");

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return mockPatients;
    return mockPatients.filter((p) =>
      [p.id, p.fullName, p.phone].some((x) =>
        String(x).toLowerCase().includes(k)
      )
    );
  }, [keyword]);

  const closeModal = () => setOpen(false);

  const resetForm = () => {
    setFullName("");
    setGender("Nam");
    setBirthYear("2000");
    setAddress("");
    setPhone("");
    setCccd("");
    setHistory("");
  };

  const handleSubmitAdd = () => {
    // UI only: sau này nối POST /patients
    // validate tối thiểu giống form hình
    if (!fullName.trim() || !birthYear.trim() || !address.trim()) {
      alert("Vui lòng nhập: Họ & Tên, Ngày sinh, Địa chỉ");
      return;
    }
    alert("OK (UI). Sau bước này mình sẽ nối API POST /patients cho bạn.");
    closeModal();
    resetForm();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 p-6 bg-slate-50 overflow-y-auto">
          {/* Page header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Patients List
              </h1>
              <p className="text-sm text-slate-500">Your patients list</p>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white text-sm font-medium hover:bg-sky-700"
            >
              <span className="text-lg leading-none">＋</span>
              Add New Patient
            </button>
          </div>

          {/* Card */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
  
                <div>
                  <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                    <span>📋</span>
                    <span>Copy List</span>
                  </button>
                </div>
               <div className="flex items-center gap-2 mr-2 border-r pr-4 border-slate-200">
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
                <div/>
                </div>

              </div>

              {/* Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-600">
                      <th className="text-left font-semibold py-3 border-b">ID</th>
                      <th className="text-left font-semibold py-3 border-b">Fullname</th>
                      <th className="text-left font-semibold py-3 border-b">GENDER</th>
                      <th className="text-left font-semibold py-3 border-b">BIRTH YEAR</th>
                      <th className="text-left font-semibold py-3 border-b">PHONE</th>
                      <th className="text-right font-semibold py-3 border-b">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b last:border-b-0">
                        <td className="py-3 text-slate-700">{p.id}</td>
                        <td className="py-3">
                          <button className="text-sky-600 hover:underline font-medium">
                            {p.fullName}
                          </button>
                        </td>
                        <td className="py-3 text-slate-700">{p.gender}</td>
                        <td className="py-3 text-slate-700">{p.birthYear} | 25T</td>
                        <td className="py-3 text-slate-700">{p.phone}</td>
                        
                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <button className="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200">
                              ✏️
                            </button>
                            <button className="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-500">
                            No patients found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination mock */}
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Showing page 1 / 1</span>
                <div className="flex items-center gap-3">
                  <button className="text-slate-400">Back</button>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
                    1
                  </span>
                  <button className="text-slate-400">Next</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal add patient */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl border">
              {/* header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="text-lg font-semibold">Add new patient</div>
                <button
                  onClick={closeModal}
                  className="h-9 w-9 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* body */}
              <div className="px-6 py-5 grid grid-cols-2 gap-4">
                {/* Họ tên */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                {/* Giới tính */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="mt-2 h-10 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="Nam">Male</option>
                    <option value="Nữ">Female</option>
                  </select>
                </div>

                {/* Năm sinh */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Birth year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    {Array.from({ length: 60 }, (_, i) => `${2025 - i}`).map(
                      (y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Điện thoại */}
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Phone number
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border bg-slate-50 px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="0909123456"
                  />
                </div>

                {/* CCCD */}

              </div>

              {/* footer */}
              <div className="px-6 py-4 border-t flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    closeModal();
                    resetForm();
                  }}
                  className="h-10 rounded-lg px-6 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmitAdd}
                  className="h-10 rounded-lg px-6 bg-sky-600 text-white hover:bg-sky-700 text-sm font-medium"
                >
                  Add patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

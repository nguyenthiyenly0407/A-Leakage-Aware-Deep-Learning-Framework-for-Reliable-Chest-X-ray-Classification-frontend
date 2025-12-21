"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LeftSidebar from "@/features/sidebar/LeftSidebar";
import TopBar from "@/features/sidebar/TopBar";
import { getPatients, createPatient, deletePatient, updatePatient, type Patient } from "@/lib/api_patient";

// --- IMPORT THƯ VIỆN EXPORT ---
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // 👈 Đã sửa import tại đây

const ITEMS_PER_PAGE = 10;

export default function PatientPage() {
  const searchParams = useSearchParams();
  const urlKeyword = searchParams.get("keyword") || "";
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isJustAdded, setIsJustAdded] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [birthYear, setBirthYear] = useState("2000");
  const [phone, setPhone] = useState("");
  const [keyword, setKeyword] = useState(urlKeyword);
  const loadData = async (searchKeyword: string) => {
    try {
      setLoading(true);
      const data = await getPatients(searchKeyword);
      const filteredData = data.filter((p: Patient) => {
        const birthYear = new Date(p.date_of_birth_patient).getFullYear().toString();
        return (
          p.name_patient.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (p.gender && p.gender.toLowerCase().includes(searchKeyword.toLowerCase())) ||
          birthYear.includes(searchKeyword) ||
          (p.phone_number && p.phone_number.includes(searchKeyword))
        );
      });
      setPatients(filteredData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(urlKeyword);
    setCurrentPage(1);
  }, [urlKeyword]);

  useEffect(() => {
    loadData(keyword);
  }, [keyword]);

  const totalPages = Math.ceil(patients.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return patients.slice(start, start + ITEMS_PER_PAGE);
  }, [patients, currentPage]);

  useEffect(() => {
    if (isJustAdded && patients.length > 0) {
        const newTotalPages = Math.ceil(patients.length / ITEMS_PER_PAGE);
        setCurrentPage(newTotalPages);
        setIsJustAdded(false);
    }
  }, [patients, isJustAdded]);

  const handleEditClick = (p: Patient) => {
    setEditingId(p.id_patient);
    setFullName(p.name_patient);
    setGender((p.gender as "Male" | "Female") || "Male");
    setPhone(p.phone_number || "");
    if (p.date_of_birth_patient) {
        const year = new Date(p.date_of_birth_patient).getFullYear();
        setBirthYear(String(year));
    }
    setOpen(true);
  };

  const handleSubmitForm = async () => {
    if (!fullName.trim()) {
      alert("Vui lòng nhập tên bệnh nhân");
      return;
    }
    try {
      const dobPayload = `${birthYear}-01-01`;
      const payload = {
        name_patient: fullName,
        date_of_birth_patient: dobPayload,
        gender: gender,
        phone_number: phone || null,
      };

      if (editingId) {
        await updatePatient(editingId, payload);
        alert("Cập nhật thành công!");
      } else {
        await createPatient(payload);
        alert("Thêm mới thành công!");
        setIsJustAdded(true);
      }
      setOpen(false); 
      resetForm();    
      loadData(urlKeyword); 
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bệnh nhân: ${name}?`)) {
      try {
        await deletePatient(id);
        alert("Đã xóa thành công!");
        loadData(urlKeyword);
      } catch (error: any) {
        alert("Lỗi khi xóa: " + error.message);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFullName("");
    setGender("Male");
    setBirthYear("2000");
    setPhone("");
  };

  const handleCloseModal = () => {
      setOpen(false);
      resetForm();
  }

  // --- 🔥 CHỨC NĂNG EXPORT DỮ LIỆU ---

  // 1. Export Excel (Giữ nguyên)
  const handleExportExcel = () => {
    const exportData = patients.map((p, index) => ({
      "No.": index + 1,
      "Full Name": p.name_patient,
      "Gender": p.gender,
      "Birth Year": new Date(p.date_of_birth_patient).getFullYear(),
      "Phone": p.phone_number,
      "Created At": new Date(p.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
    XLSX.writeFile(workbook, "Patients_List.xlsx");
  };

  // 2. Export PDF (✅ ĐÃ FIX)
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.text("Patients List Report", 14, 22);
    
    const tableColumn = ["No.", "Full Name", "Gender", "Birth Year", "Phone"];
    const tableRows = patients.map((p, index) => [
      index + 1,
      p.name_patient,
      p.gender,
      new Date(p.date_of_birth_patient).getFullYear(),
      p.phone_number || "--",
    ]);

    // Sử dụng autoTable như một hàm độc lập
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("Patients_List.pdf");
  };

  // 3. Print Report (Giữ nguyên)
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Print Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Patients List Report</h1>
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Full Name</th>
                <th>Gender</th>
                <th>Birth Year</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              ${patients.map((p, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${p.name_patient}</td>
                  <td>${p.gender}</td>
                  <td>${new Date(p.date_of_birth_patient).getFullYear()}</td>
                  <td>${p.phone_number || "--"}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const year = new Date(dob).getFullYear();
    return new Date().getFullYear() - year;
  };
  
  const getYear = (dob: string) => {
    if (!dob) return "";
    return new Date(dob).getFullYear();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 bg-slate-50 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Patients List</h1>
              <p className="text-sm text-slate-500">Manage your patients</p>
            </div>
            <button onClick={() => { resetForm(); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-white text-sm font-medium hover:bg-sky-700 shadow-sm transition-all active:scale-95">
              <span className="text-lg leading-none">＋</span> Add New Patient
            </button>
          </div>

          <div className="rounded-xl border bg-white shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
               <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                 <span>📋</span> Copy List
               </button>
               <div className="flex items-center gap-2">
                 <div className="flex items-center gap-2 border-slate-200">
                    <button onClick={handleExportExcel} className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">Excel</button>
                    <button onClick={handleExportPDF} className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors">PDF</button>
                    <button onClick={handlePrint} className="rounded-lg bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors">Print report</button>
                 </div>
                                  {/* ✅ Ô SEARCH INPUT CẬP NHẬT */}
                 <div className="relative">
                    <input 
                        value={keyword} 
                        onChange={(e) => setKeyword(e.target.value)} 
                        placeholder="Search name, phone, year..." 
                        className="h-9 w-64 rounded-lg border border-slate-200 pl-3 pr-8 text-sm focus:border-sky-400 outline-none transition-all" 
                    />
                    <span className="absolute right-2 top-2 text-slate-400">🔍</span>
                 </div>
               </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {loading ? (
                <div className="flex h-64 items-center justify-center text-slate-400">Loading data...</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium">
                    <tr>
                      <th className="px-5 py-3 border-b">STT</th>
                      <th className="px-5 py-3 border-b">FULLNAME</th>
                      <th className="px-5 py-3 border-b">GENDER</th>
                      <th className="px-5 py-3 border-b">BIRTH YEAR</th>
                      <th className="px-5 py-3 border-b">PHONE</th>
                      <th className="px-5 py-3 border-b text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedData.map((p, index) => (
                      <tr key={p.id_patient} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3 text-slate-700 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                        <td className="px-5 py-3">
                          <span onClick={() => handleEditClick(p)} className="text-sky-600 font-medium cursor-pointer hover:underline">{p.name_patient}</span>
                        </td>
                        <td className="px-5 py-3">{p.gender}</td>
                        <td className="px-5 py-3 text-slate-600">{getYear(p.date_of_birth_patient)} <span className="text-slate-300 mx-1">|</span> {calculateAge(p.date_of_birth_patient)}T</td>
                        <td className="px-5 py-3 text-slate-600 font-mono">{p.phone_number || "--"}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-2">
                             <button onClick={() => handleEditClick(p)} className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-sky-600 flex items-center justify-center transition-colors">✏️</button>
                             <button onClick={() => handleDelete(p.id_patient, p.name_patient)} className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedData.length === 0 && (<tr><td colSpan={6} className="py-12 text-center text-slate-400">No patients found.</td></tr>)}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500">Showing page <span className="font-semibold text-slate-900">{currentPage}</span> of <span className="font-semibold text-slate-900">{totalPages || 1}</span></span>
              <div className="flex gap-2">
                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
                 <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseModal} />
           <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-0 animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800">{editingId ? "Edit Patient Information" : "Add New Patient"}</h3>
                  <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                      <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-10 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none" placeholder="Ex: Nguyen Van A" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                      <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full h-10 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Birth Year</label>
                      <select value={birthYear} onChange={e => setBirthYear(e.target.value)} className="w-full h-10 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none">
                          {Array.from({length: 80}, (_, i) => `${2025 - i}`).map(y => (<option key={y} value={y}>{y}</option>))}
                      </select>
                  </div>
                  <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-10 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none" placeholder="090..." />
                  </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex justify-end gap-3 border-t">
                  <button onClick={handleCloseModal} className="px-5 py-2 rounded-lg text-slate-600 hover:bg-slate-200 text-sm font-medium">Cancel</button>
                  <button onClick={handleSubmitForm} className="px-5 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 text-sm font-medium">{editingId ? "Save Changes" : "Create Profile"}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
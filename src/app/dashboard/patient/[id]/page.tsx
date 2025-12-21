"use client";

import { useEffect, useState, use } from "react"; // Thêm use
import { useRouter } from "next/navigation";
import LeftSidebar from "@/features/sidebar/LeftSidebar";
import TopBar from "@/features/sidebar/TopBar";
import { getPatientById, type Patient } from "@/lib/api_patient";

// Mock data lịch sử khám (Vì chưa có API History)
const MOCK_HISTORY = [
  { id: 1, date: "12/12/2025", diagnosis: "Viêm da cơ địa (Eczema)", },
  { id: 2, date: "10/11/2025", diagnosis: "Mụn trứng cá (Acne)" },
];

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const patientId = Number(resolvedParams.id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getPatientById(patientId);
        setPatient(data);
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Không tìm thấy bệnh nhân!");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchDetail();
  }, [patientId, router]);

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Đang tải hồ sơ...</div>;
  if (!patient) return null;

  const currentYear = new Date().getFullYear();
  const birthYear = new Date(patient.date_of_birth_patient).getFullYear();
  const age = currentYear - birthYear;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <LeftSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Breadcrumb nhỏ */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <span onClick={() => router.push("/dashboard")} className="cursor-pointer hover:text-sky-600 hover:underline">Patients List</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">Patient Detail</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* === CỘT TRÁI (2 phần): LỊCH SỬ KHÁM === */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h2 className="text-lg font-bold text-slate-800">Medical History</h2>
                </div>

                {/* Table Lịch sử */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Date</th>
                                <th className="px-4 py-3">Diagnosis</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {MOCK_HISTORY.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">{item.date}</td>
                                    <td className="px-4 py-4 text-sky-600 font-medium">{item.diagnosis}</td>
                                
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {MOCK_HISTORY.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                            No medical history available.
                        </div>
                    )}
                </div>
              </div>

            </div>

            {/* === CỘT PHẢI (1 phần): THÔNG TIN BỆNH NHÂN === */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b">Patient Information</h3>

                    <div className="space-y-5">
                        {/* Họ tên */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                            <div className="w-full p-3 bg-slate-50 rounded-lg text-slate-800 font-medium border border-transparent">
                                {patient.name_patient}
                            </div>
                        </div>

                        {/* Giới tính & Năm sinh */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Gender</label>
                                <div className="w-full p-3 bg-slate-50 rounded-lg text-slate-700 border border-transparent">
                                    {patient.gender}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Age</label>
                                <div className="w-full p-3 bg-slate-50 rounded-lg text-slate-700 border border-transparent">
                                    {age} years old ({birthYear})
                                </div>
                            </div>
                        </div>

                        {/* Số điện thoại */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Phone Number</label>
                            <div className="w-full p-3 bg-slate-50 rounded-lg text-slate-700 font-mono border border-transparent">
                                {patient.phone_number || "Not updated"}
                            </div>
                        </div>

                        {/* Địa chỉ (Mock vì DB chưa có) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Address</label>
                            <div className="w-full p-3 bg-slate-50 rounded-lg text-slate-700 border border-transparent">
                                TP. Hồ Chí Minh
                            </div>
                        </div>

                        {/* Tiền căn (Mock) */}
                    </div>

                    {/* Actions Buttons */}
                    <div className="mt-8 space-y-3">
                        <button className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg shadow-sm transition-all active:scale-95">
                            Edit Information
                        </button>
                    </div>

                </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
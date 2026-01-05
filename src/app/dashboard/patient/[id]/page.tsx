"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/features/sidebar/LeftSidebar";
import TopBar from "@/features/sidebar/TopBar";
import { getPatientById, type Patient } from "@/lib/api_patient";

// 1. Định nghĩa kiểu dữ liệu cho Lịch sử (Khớp với AnalysisOut của Backend)
interface AnalysisHistory {
  id_analysis: number;
  created_at: string;
  ai_prediction: string;
  doctor_diagnosis?: string; // Có thể null nếu bác sĩ chưa chốt
  ai_confidence: number;
  
  note?: string;
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap params
  const resolvedParams = use(params);
  const patientId = Number(resolvedParams.id);

  // State lưu thông tin bệnh nhân & Lịch sử
  const [patient, setPatient] = useState<Patient | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]); // 👈 State chứa data thật
  const [loading, setLoading] = useState(true);

  // Hàm helper format ngày tháng
  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };
  // Trong file Patient Detail
// ...
const handleRowClick = (item: AnalysisHistory) => {
    // 👇 CHUYỂN HƯỚNG SANG TRANG MỚI VỪA TẠO
    router.push(`/dashboard/patient/${patientId}/analysis/${item.id_analysis}`);
};
// ...
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("Vui lòng đăng nhập!");
            router.push("/login");
            return;
        }

        // --- GỌI 2 API SONG SONG (Cho nhanh) ---
        // 1. Lấy thông tin bệnh nhân (Hàm cũ của bà)
        const patientPromise = getPatientById(patientId);
        
        // 2. Lấy lịch sử khám từ API Analysis
        const historyPromise = fetch(`http://localhost:8000/analysis/patient/${patientId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(res => {
            if (!res.ok) throw new Error("Failed to fetch history");
            return res.json();
        });

        // Chờ cả 2 xong
        const [patientData, historyData] = await Promise.all([patientPromise, historyPromise]);

        setPatient(patientData);
        setHistory(historyData); // Lưu lịch sử thật vào state

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        // alert("Có lỗi khi tải hồ sơ!");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) fetchData();
  }, [patientId, router]);

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Đang tải hồ sơ...</div>;
  if (!patient) return <div className="p-10 text-center">Không tìm thấy bệnh nhân.</div>;

  const currentYear = new Date().getFullYear();
  const birthYear = new Date(patient.date_of_birth_patient).getFullYear();
  const age = currentYear - birthYear;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <LeftSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <span onClick={() => router.push("/dashboard")} className="cursor-pointer hover:text-sky-600 hover:underline">Patients List</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">Patient Detail</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* === CỘT TRÁI: LỊCH SỬ KHÁM (DATA THẬT) === */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <h2 className="text-lg font-bold text-slate-800">Medical History</h2>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                        Total: {history.length} visits
                    </span>
                </div>

                {/* Table Lịch sử */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Date Time</th>
                                <th className="px-4 py-3">AI Prediction</th>
                                <th className="px-4 py-3">Doctor Diagnosis</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Confidence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {history.length > 0 ? (
                                history.map((item) => (
                                    <tr key={item.id_analysis} onClick={() => handleRowClick(item)} className="hover:bg-slate-50 transition-colors">
                                        {/* Ngày giờ */}
                                        <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                                            {formatDate(item.created_at)}
                                        </td>
                                        
                                        {/* AI Dự đoán */}
                                        <td className="px-4 py-4 text-slate-600">
                                            {item.ai_prediction}
                                        </td>

                                        {/* Bác sĩ chốt (Nếu có thì hiện, ko thì hiện chờ) */}
                                        <td className="px-4 py-4 font-medium">
                                            {item.doctor_diagnosis ? (
                                                <span className="text-emerald-600">{item.doctor_diagnosis}</span>
                                            ) : (
                                                <span className="text-orange-400 italic">Pending review</span>
                                            )}
                                        </td>

                                        {/* Độ tin cậy */}
                                        <td className="px-4 py-4 text-right">
                                             <span className={`px-2 py-1 rounded text-xs font-bold ${item.ai_confidence > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {item.ai_confidence.toFixed(1)}%
                                             </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-slate-400">
                                        Chưa có lịch sử khám bệnh nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </div>
            </div>

            {/* === CỘT PHẢI: THÔNG TIN BỆNH NHÂN (Giữ nguyên) === */}
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

                        {/* Giới tính & Tuổi */}
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
                                    {age} years old
                                </div>
                            </div>
                        </div>

                        {/* SĐT */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Phone Number</label>
                            <div className="w-full p-3 bg-slate-50 rounded-lg text-slate-700 font-mono border border-transparent">
                                {patient.phone_number || "N/A"}
                            </div>
                        </div>

                        {/* Ngày sinh */}
                        <div>
                             <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Date of Birth</label>
                             <div className="w-full p-3 bg-slate-50 rounded-lg text-slate-700 border border-transparent">
                                {patient.date_of_birth_patient}
                             </div>
                        </div>
                    </div>

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
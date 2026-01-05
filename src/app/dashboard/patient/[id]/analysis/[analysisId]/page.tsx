"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/features/sidebar/LeftSidebar";
import TopBar from "@/features/sidebar/TopBar";

interface AnalysisDetail {
  id_analysis: number;
  created_at: string;
  ai_prediction: string;
  ai_confidence: number;
  image_url: string;
  heatmap_url: string;
  top3_json: string;
  doctor_diagnosis?: string;
  note?: string;
  // Thông tin bệnh nhân kèm theo (Backend nên join bảng để trả về luôn)
  patient_name?: string; 
  patient_dob?: string;
}

export default function AnalysisResultPage({ params }: { params: Promise<{ id: string, analysisId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id: patientId, analysisId } = resolvedParams;

  const [data, setData] = useState<AnalysisDetail | null>(null);
  const [top3, setTop3] = useState<any[]>([]);

  // --- 1. GỌI API LẤY CHI TIẾT KẾT QUẢ ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("access_token");
        // 👇 Gọi API lấy chi tiết 1 lượt khám (Bà cần thêm API này ở Backend nếu chưa có)
        // Nếu lười viết API mới, bà có thể gọi API get list rồi filter ra item có id == analysisId
        const res = await fetch(`http://localhost:8000/analysis/${analysisId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const result = await res.json();
          setData(result);
          if (result.top3_json) setTop3(JSON.parse(result.top3_json));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDetail();
  }, [analysisId]);

  // Hàm xử lý ảnh
  const getFullUrl = (path: string) => path ? `http://localhost:8000${path}` : "";

  // Hàm in
  const handlePrint = () => {
    window.print();
  };

  if (!data) return <div>Loading...</div>;
  
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Ẩn Sidebar khi in */}
      <div className="print:hidden">
        <LeftSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="print:hidden">
          <TopBar />
        </div>

        <main className="p-8 print:p-0">
          
          {/* Header & Nút Back */}
          <div className="flex justify-between items-center mb-6 print:hidden">
             <button onClick={() => router.back()} className="text-slate-500 hover:text-sky-600 flex items-center gap-1">
                ⬅ Back to History
             </button>
             <button 
                onClick={handlePrint}
                className="bg-sky-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-sky-700 flex items-center gap-2"
             >
                🖨 Print Report
             </button>
          </div>

          {/* === NỘI DUNG BỆNH ÁN (SẼ ĐƯỢC IN) === */}
          <div className="bg-white shadow-sm border border-slate-200 p-10 max-w-4xl mx-auto print:shadow-none print:border-none print:w-full">
            
            {/* 1. Tiêu đề Bệnh án */}
            <div className="border-b pb-6 mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-wide">Medical Diagnosis Report</h1>
                    <p className="text-slate-500 mt-1">AI Dermatology Assistant System</p>
                </div>
                <div className="text-right">
                    <p className="font-mono text-sm text-slate-500">ID: #{data.id_analysis}</p>
                    <p className="font-medium text-slate-700">{new Date(data.created_at).toLocaleString('vi-VN')}</p>
                </div>
            </div>

            {/* 2. Thông tin ảnh (Quan trọng) */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                    <p className="font-bold text-slate-700 text-sm uppercase">Original Image</p>
                    <div className="border rounded-lg overflow-hidden h-64 bg-slate-100 flex items-center justify-center">
                        <img src={getFullUrl(data.image_url)} alt="Original" className="max-h-full object-contain" />
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="font-bold text-slate-700 text-sm uppercase">AI Heatmap Analysis</p>
                    <div className="border rounded-lg overflow-hidden h-64 bg-slate-100 flex items-center justify-center">
                         <img src={getFullUrl(data.heatmap_url)} alt="Heatmap" className="max-h-full object-contain" />
                    </div>
                </div>
            </div>

            {/* 3. Kết quả chẩn đoán */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 print:bg-white print:border-2">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase">AI Prediction</p>
                        <h2 className="text-2xl font-bold text-indigo-700 mt-1">{data.ai_prediction}</h2>
                        <p className="text-emerald-600 font-bold mt-1">Confidence: {data.ai_confidence.toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase">Top Possibilities</p>
                        <ul className="mt-2 space-y-1 text-sm">
                            {top3.map((t, i) => (
                                <li key={i} className="flex justify-between">
                                    <span>- {t.disease}</span>
                                    <span className="font-mono">{parseFloat(t.confidence)}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* 4. Kết luận Bác sĩ */}
            <div className="mb-12">
                <h3 className="font-bold text-slate-800 border-b pb-2 mb-4">DOCTOR'S CONCLUSION</h3>
                <div className="min-h-[100px] border border-slate-200 rounded-lg p-4 bg-white">
                    {data.doctor_diagnosis ? (
                        <p className="text-lg text-slate-800">{data.doctor_diagnosis}</p>
                    ) : (
                        <p className="text-slate-400 italic">No specific diagnosis recorded yet.</p>
                    )}
                </div>
                {data.note && (
                    <div className="mt-4">
                        <p className="font-bold text-sm text-slate-700">Notes:</p>
                        <p className="text-slate-600">{data.note}</p>
                    </div>
                )}
            </div>

            {/* Footer ký tên */}
            <div className="flex justify-end mt-20 print:flex">
                <div className="text-center">
                    <p className="font-bold text-slate-800">Attending Physician</p>
                    <div className="h-20"></div> {/* Chỗ ký tên */}
                    <p className="text-slate-500 text-sm">Dr. Nguyen (Dermatologist)</p>
                </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
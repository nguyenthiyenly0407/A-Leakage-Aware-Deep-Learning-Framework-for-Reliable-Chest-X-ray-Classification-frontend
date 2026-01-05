"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/features/sidebar/LeftSidebar";
import TopBar from "@/features/sidebar/TopBar";

// 1. Định nghĩa kiểu dữ liệu
interface Patient {
  id_patient: number;
  name_patient: string;
  date_of_birth_patient: string;
  gender?: string;
  phone_number?: string;
}

// Danh sách bệnh giống Backend để bác sĩ chọn nếu AI sai
const DISEASE_CLASSES = [
    'Acne and Rosacea Photos', 
    'Atopic Dermatitis Photos', 
    'Eczema Photos',
    'Melanoma Skin Cancer Nevi and Moles', 
    'Nail Fungus and other Nail Disease',
    'Psoriasis pictures Lichen Planus and related diseases',
    'Tinea Ringworm Candidiasis and other Fungal Infections',
    'Urticaria Hives', 
    'Warts Molluscum and other Viral Infections'
];

export default function AnalysisPage() {
  // --- STATE ---
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Loading khi save
  
  // State lưu kết quả AI gốc
  const [aiResult, setAiResult] = useState<any>(null); 
  
  // State cho luồng bác sĩ xác nhận
  const [analysisId, setAnalysisId] = useState<number | null>(null); // ID record trả về từ DB
  const [confirmStatus, setConfirmStatus] = useState<'pending' | 'yes' | 'no'>('pending');
  const [customDiagnosis, setCustomDiagnosis] = useState<string>("");
  const [doctorNote, setDoctorNote] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // --- EFFECT: LẤY DANH SÁCH BỆNH NHÂN ---
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
           console.warn("Missing token");
           return;
        }
        const res = await fetch("http://localhost:8000/patients", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setPatients(data);
        }
      } catch (error) {
        console.error("Lỗi fetch API:", error);
      }
    };
    fetchPatients();
  }, [router]);

  // --- COMPUTED STATE (QUAN TRỌNG) ---
  // Tính toán hiển thị dựa trên AI hay Bác sĩ chọn
  const displayResult = useMemo(() => {
    if (!aiResult) return null;

    // Nếu bác sĩ bảo SAI (No) và đã chọn bệnh khác -> Hiển thị bệnh đó + 100%
    if (confirmStatus === 'no' && customDiagnosis) {
        return {
            diagnosis: customDiagnosis,
            confidence: "100", // Hardcode 100% vì bác sĩ là trùm
            isDoctorDecision: true, // Cờ để đổi màu UI nếu thích
            heatmap_url: aiResult.heatmap_url,
            details: aiResult.details,
            advice: aiResult.advice
        };
    }

    // Mặc định hiển thị kết quả AI
    return {
        ...aiResult,
        isDoctorDecision: false
    };
  }, [aiResult, confirmStatus, customDiagnosis]);

  // --- HANDLERS ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      // Reset toàn bộ state kết quả cũ
      setAiResult(null);
      setAnalysisId(null);
      setConfirmStatus('pending');
      setCustomDiagnosis("");
      setDoctorNote("");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPatientId || !fileInputRef.current?.files?.[0]) return alert("Missing info!");
    setIsAnalyzing(true);

    try {
      const token = localStorage.getItem("access_token");
      const idDoctor = 1; // Fake ID doctor logic

      const formData = new FormData();
      formData.append("id_patient", selectedPatientId);
      formData.append("id_doctor", idDoctor.toString());
      formData.append("file", fileInputRef.current.files[0]);

      const res = await fetch("http://localhost:8000/analysis/detect", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      console.log("Full Response:", data);

      // Lưu ID analysis để lát update
      setAnalysisId(data.id_analysis);

      // Parse top3
      let top3 = [];
      try {
          top3 = JSON.parse(data.top3_json);
      } catch(e) { top3 = [] }

      // Set kết quả AI gốc
      setAiResult({
        diagnosis: data.ai_prediction,
        confidence: data.ai_confidence.toFixed(1),
        heatmap_url: `http://localhost:8000${data.heatmap_url}`,
        details: top3.map((item: any) => ({
            label: item.disease,
            score: parseFloat(item.confidence)
        })),
        advice: data.note || "AI Suggestion based on visual features."
      });
      
      // Auto fill note cũ nếu có
      if (data.note) setDoctorNote(data.note);

    } catch (error) {
      alert("Error: " + error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setAiResult(null);
    setAnalysisId(null);
    setConfirmStatus('pending');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // HÀM MỚI: Gọi API update chẩn đoán bác sĩ
  const handleSaveDiagnosis = async () => {
    if (!analysisId) return;
    
    // Validate logic
    if (confirmStatus === 'no' && !customDiagnosis) {
        alert("Please select the correct diagnosis from the list.");
        return;
    }

    setIsSaving(true);
    try {
        const token = localStorage.getItem("access_token");
        const payload = {
            confirm_ai: confirmStatus === 'yes' || confirmStatus === 'pending', // Pending coi như đồng ý tạm hoặc xử lý logic riêng
            custom_diagnosis: confirmStatus === 'no' ? customDiagnosis : null,
            note: doctorNote
        };

        const res = await fetch(`http://localhost:8000/analysis/${analysisId}/diagnose`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save diagnosis");

        alert("✅ Diagnosis saved to patient record successfully!");
        
        // Có thể reset hoặc redirect tùy lồng
        // handleReset(); 

    } catch (error) {
        alert("Save failed: " + error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <LeftSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">AI Skin Analysis</h1>
            <p className="text-slate-500">Dermatoscopic Image Analysis & Doctor Validation</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-10">
            {/* === CỘT TRÁI (INPUT) GIỮ NGUYÊN === */}
            <div className="lg:col-span-4 flex flex-col gap-6">
               {/* ... (Phần chọn bệnh nhân và upload ảnh giữ nguyên như code cũ) ... */}
               {/* 1. Chọn Bệnh nhân */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Patient</label>
                <select 
                    className="w-full h-11 border-slate-200 border rounded-lg px-3 focus:ring-2 focus:ring-sky-200 outline-none text-slate-700 bg-slate-50"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                    <option value="">-- Choose a patient --</option>
                    {patients.map(p => (
                        <option key={p.id_patient} value={p.id_patient}>
                            {p.name_patient} ({p.date_of_birth_patient})
                        </option>
                    ))}
                </select>
              </div>

              {/* 2. Upload Ảnh */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Dermatoscopic Image</label>
                <div 
                    className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all ${
                        imagePreview ? "border-sky-300 bg-sky-50" : "border-slate-300 hover:border-sky-400 hover:bg-slate-50"
                    }`}
                >
                    {imagePreview ? (
                        <div className="relative w-full h-full min-h-[200px]">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                            <button onClick={handleReset} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70">✕</button>
                        </div>
                    ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="text-center cursor-pointer">
                             {/* Icon upload... */}
                             <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !imagePreview}
                    className={`mt-5 w-full py-3 rounded-lg font-semibold text-white shadow-lg shadow-sky-200 transition-all ${
                        isAnalyzing || !imagePreview ? "bg-slate-300 cursor-not-allowed" : "bg-sky-600 hover:bg-sky-700"
                    }`}
                >
                    {isAnalyzing ? "Processing..." : "Run AI Diagnosis"}
                </button>
              </div>
            </div>

            {/* === CỘT PHẢI: KẾT QUẢ & CONFIRMATION === */}
            <div className="lg:col-span-8">
              {displayResult ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-800">Analysis Results</h2>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                            displayResult.isDoctorDecision 
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}>
                            {displayResult.isDoctorDecision ? "Doctor Overridden" : "AI Generated"}
                        </span>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                        
                        {/* BOX 1: KẾT QUẢ CHẨN ĐOÁN (Thay đổi theo confirmStatus) */}
                        <div className={`col-span-1 md:col-span-2 p-6 rounded-2xl border ${
                            displayResult.isDoctorDecision 
                            ? "bg-gradient-to-br from-purple-50 to-white border-purple-100" 
                            : "bg-gradient-to-br from-indigo-50 to-white border-indigo-100"
                        }`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl text-white ${displayResult.isDoctorDecision ? "bg-purple-600" : "bg-indigo-600"}`}>
                                    {/* Icon Doctor or Robot */}
                                    {displayResult.isDoctorDecision ? (
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    )}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium mb-1 ${displayResult.isDoctorDecision ? "text-purple-600" : "text-indigo-600"}`}>
                                        {displayResult.isDoctorDecision ? "Final Diagnosis (Doctor Verified)" : "AI Prediction"}
                                    </p>
                                    <h3 className="text-3xl font-bold text-slate-800 mb-2">{displayResult.diagnosis}</h3>
                                    
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-48 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${displayResult.isDoctorDecision ? "bg-purple-500" : "bg-emerald-500"}`} 
                                                style={{ width: `${displayResult.confidence}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{displayResult.confidence}% Confidence</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BOX 2: AI Breakdown (Chỉ hiện tham khảo, ko đổi) */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800">AI Probabilities</h4>
                            <div className="space-y-3">
                                {displayResult.details.map((item: any, idx: number) => (
                                    <div key={idx} className="opacity-90">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-600 truncate max-w-[200px]">{item.label}</span>
                                            <span className="font-medium text-slate-900">{item.score.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-400 rounded-full" style={{ width: `${item.score}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Hiển thị ảnh Heatmap nếu có */}
                            {displayResult.heatmap_url && (
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-slate-500 mb-2">Attention Heatmap</p>
                                    <img src={displayResult.heatmap_url} className="w-full rounded-lg border border-slate-200" alt="Heatmap" />
                                </div>
                            )}
                        </div>

                        {/* BOX 3: DOCTOR VALIDATION ZONE (PHẦN MỚI THÊM) */}
                        <div className="flex flex-col gap-4">
                             <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    👨‍⚕️ Doctor Validation
                                </h4>
                                
                                <p className="text-sm text-slate-600 mb-3">Is the AI diagnosis correct?</p>
                                <div className="flex gap-3 mb-4">
                                    <button 
                                        onClick={() => setConfirmStatus('yes')}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                                            confirmStatus === 'yes' 
                                            ? "bg-emerald-100 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500" 
                                            : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        ✅ Yes, Correct
                                    </button>
                                    <button 
                                        onClick={() => setConfirmStatus('no')}
                                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                                            confirmStatus === 'no' 
                                            ? "bg-red-100 border-red-500 text-red-800 ring-1 ring-red-500" 
                                            : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        ❌ No, Incorrect
                                    </button>
                                </div>

                                {/* Nếu chọn No -> Hiện dropdown chọn Custom */}
                                {confirmStatus === 'no' && (
                                    <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                        <label className="block text-xs font-bold text-red-600 mb-1">Select Correct Diagnosis:</label>
                                        <select 
                                            className="w-full border-red-300 border rounded-lg p-2 text-sm focus:ring-red-200 focus:border-red-500 outline-none"
                                            value={customDiagnosis}
                                            onChange={(e) => setCustomDiagnosis(e.target.value)}
                                        >
                                            <option value="">-- Select Disease --</option>
                                            {DISEASE_CLASSES.map((disease) => (
                                                <option key={disease} value={disease}>{disease}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                             </div>

                             {/* Ghi chú */}
                             <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor's Notes</label>
                                <textarea 
                                    className="w-full h-24 border-slate-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none resize-none"
                                    placeholder="Clinical observation notes..."
                                    value={doctorNote}
                                    onChange={(e) => setDoctorNote(e.target.value)}
                                ></textarea>
                             </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button onClick={handleReset} className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white font-medium">
                            Discard
                        </button>
                        <button 
                            onClick={handleSaveDiagnosis}
                            disabled={isSaving || (confirmStatus === 'no' && !customDiagnosis)}
                            className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-sm flex items-center gap-2 ${
                                isSaving || (confirmStatus === 'no' && !customDiagnosis)
                                ? "bg-slate-400 cursor-not-allowed"
                                : "bg-sky-600 hover:bg-sky-700"
                            }`}
                        >
                            {isSaving ? "Saving..." : "💾 Save Final Diagnosis"}
                        </button>
                    </div>
                </div>
              ) : (
                // Empty State
                <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 border-dashed flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-600">No Analysis Yet</h3>
                        <p className="text-sm mt-1">Upload an image to start.</p>
                    </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
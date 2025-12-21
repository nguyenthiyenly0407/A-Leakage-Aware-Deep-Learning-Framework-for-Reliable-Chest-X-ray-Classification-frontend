"use client";

import { useState, useRef } from "react";
import LeftSidebar from "@/features/sidebar/LeftSidebar";
import TopBar from "@/features/sidebar/TopBar";

// Mock data danh sách bệnh nhân để chọn nhanh
const MOCK_PATIENTS = [
  { id: 1, name: "Nguyen Van An", dob: "1990" },
  { id: 2, name: "Tran Thi Bich", dob: "1995" },
  { id: 3, name: "Le Hoang Nam", dob: "1988" },
];

export default function AnalysisPage() {
  // --- STATE ---
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null); // Lưu kết quả AI
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---
  
  // 1. Xử lý chọn ảnh
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setResult(null); // Reset kết quả cũ
    }
  };

  // 2. Giả lập gọi AI Model (Sau này thay bằng API thật)
  const handleAnalyze = () => {
    if (!selectedPatient) return alert("Please select a patient first!");
    if (!imagePreview) return alert("Please upload an image!");

    setIsAnalyzing(true);

    // Giả lập delay 2 giây như đang chạy model Python
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult({
        diagnosis: "Eczema (Viêm da cơ địa)",
        confidence: 94.5,
        severity: "Moderate",
        details: [
            { label: "Eczema", score: 94.5 },
            { label: "Psoriasis", score: 3.2 },
            { label: "Acne", score: 1.1 },
        ],
        advice: "Recommend moisturizing creams and avoiding allergens. Consider mild corticosteroids."
      });
    }, 2000);
  };

  // 3. Reset
  const handleReset = () => {
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <LeftSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">AI Skin Analysis</h1>
            <p className="text-slate-500">Upload dermatoscopic images for instant AI diagnosis assistance.</p>
          </div>

          {/* MAIN LAYOUT: GRID 2 CỘT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-10">
            
            {/* === CỘT TRÁI: INPUT (4 phần) === */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* 1. Chọn Bệnh nhân */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Patient</label>
                <select 
                    className="w-full h-11 border-slate-200 border rounded-lg px-3 focus:ring-2 focus:ring-sky-200 outline-none text-slate-700 bg-slate-50"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                >
                    <option value="">-- Choose a patient --</option>
                    {MOCK_PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.dob})</option>
                    ))}
                </select>
              </div>

              {/* 2. Upload Ảnh */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Dermatoscopic Image</label>
                
                {/* Khu vực Dropzone */}
                <div 
                    className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all ${
                        imagePreview ? "border-sky-300 bg-sky-50" : "border-slate-300 hover:border-sky-400 hover:bg-slate-50"
                    }`}
                >
                    {imagePreview ? (
                        <div className="relative w-full h-full min-h-[200px]">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                            <button 
                                onClick={handleReset}
                                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 backdrop-blur-sm"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-center cursor-pointer"
                        >
                            <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop</p>
                            <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG (Max. 5MB)</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                {/* Nút Phân Tích */}
                <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !imagePreview}
                    className={`mt-5 w-full py-3 rounded-lg font-semibold text-white shadow-lg shadow-sky-200 transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        isAnalyzing || !imagePreview 
                        ? "bg-slate-300 cursor-not-allowed shadow-none" 
                        : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
                    }`}
                >
                    {isAnalyzing ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Processing AI Model...
                        </>
                    ) : (
                        <>
                            <span>✨</span> Run AI Diagnosis
                        </>
                    )}
                </button>
              </div>
            </div>

            {/* === CỘT PHẢI: OUTPUT KẾT QUẢ (8 phần) === */}
            <div className="lg:col-span-8">
              {result ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header Kết quả */}
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Analysis Results</h2>
                            <p className="text-sm text-slate-500">AI Model v2.1 • {new Date().toLocaleTimeString()}</p>
                        </div>
                        <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200">
                            Completed
                        </span>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                        
                        {/* Box 1: Chẩn đoán chính */}
                        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-600 rounded-xl text-white">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-indigo-600 mb-1">Top Prediction</p>
                                    <h3 className="text-3xl font-bold text-slate-800 mb-2">{result.diagnosis}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-48 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${result.confidence}%` }}></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{result.confidence}% Confidence</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Box 2: Biểu đồ xác suất */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800">Possibility Breakdown</h4>
                            <div className="space-y-3">
                                {result.details.map((item: any, idx: number) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600">{item.label}</span>
                                            <span className="font-medium text-slate-900">{item.score}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${idx === 0 ? "bg-indigo-500" : "bg-slate-400"}`} 
                                                style={{ width: `${item.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Box 3: Lời khuyên của AI */}
                        <div>
                             <h4 className="font-semibold text-slate-800 mb-3">AI Suggestions</h4>
                             <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm leading-relaxed">
                                <p><strong>⚠️ Note:</strong> {result.advice}</p>
                             </div>
                             
                             <div className="mt-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor's Notes (Final Conclusion)</label>
                                <textarea 
                                    className="w-full h-24 border-slate-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none resize-none"
                                    placeholder="Enter your professional diagnosis here..."
                                ></textarea>
                             </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 font-medium transition-colors">
                            Discard
                        </button>
                        <button className="px-5 py-2.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-medium shadow-sm transition-colors">
                            💾 Save to Patient History
                        </button>
                    </div>
                </div>
              ) : (
                // --- TRẠNG THÁI CHỜ (EMPTY STATE) ---
                <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 p-10">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-600">No Analysis Yet</h3>
                    <p className="max-w-xs text-center mt-2 text-sm">Select a patient and upload an image on the left panel to generate an AI diagnosis report.</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
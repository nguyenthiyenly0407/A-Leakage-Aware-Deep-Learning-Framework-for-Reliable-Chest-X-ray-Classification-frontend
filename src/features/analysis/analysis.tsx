"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/features/sidebar/LeftSidebar";
import TopBar from "@/features/sidebar/TopBar";

interface Patient {
  id_patient: number;
  name_patient: string;
  date_of_birth_patient: string;
  gender?: string;
  phone_number?: string;
}

const API_BASE = "http://localhost:8000";

const DISEASE_CLASSES = ["COVID", "Lung_Opacity", "Normal", "Viral Pneumonia"];

type ConfirmStatus = "pending" | "yes" | "no";

type AiDetail = { label: string; score: number };

type AiResult = {
  diagnosis: string;
  confidence: string; // e.g. "90.4"
  image_url: string; // full url
  heatmap_url: string | null; // full url
  details: AiDetail[];
  advice: string;
};

function buildApiUrl(pathOrUrl: string, params?: Record<string, string>) {
  const url = new URL(pathOrUrl, API_BASE);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return url.toString();
}

function parsePercentToNumber(x: any): number {
  if (x == null) return 0;
  if (typeof x === "number") return x;
  const s = String(x).replace("%", "").trim();
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export default function AnalysisPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [aiResult, setAiResult] = useState<AiResult | null>(null);

  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<ConfirmStatus>("pending");
  const [customDiagnosis, setCustomDiagnosis] = useState<string>("");
  const [doctorNote, setDoctorNote] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        } else {
          console.error("Failed to fetch patients:", res.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchPatients();
  }, [router]);

  const displayResult = useMemo(() => {
    if (!aiResult) return null;

    if (confirmStatus === "no" && customDiagnosis) {
      return {
        diagnosis: customDiagnosis,
        confidence: "100",
        isDoctorDecision: true,
        image_url: aiResult.image_url,
        heatmap_url: aiResult.heatmap_url,
        details: aiResult.details ?? [],
        advice: aiResult.advice,
      };
    }

    return {
      ...aiResult,
      isDoctorDecision: false,
      details: aiResult.details ?? [],
    };
  }, [aiResult, confirmStatus, customDiagnosis]);

  const displayedOriginal = useMemo(() => {
    if (aiResult?.image_url) return aiResult.image_url;
    return imagePreview;
  }, [aiResult, imagePreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);

      const url = URL.createObjectURL(file);
      setImagePreview(url);

      setAiResult(null);
      setAnalysisId(null);
      setConfirmStatus("pending");
      setCustomDiagnosis("");
      setDoctorNote("");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPatientId || !fileInputRef.current?.files?.[0]) {
      return alert("Missing info!");
    }

    setIsAnalyzing(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Missing access_token");
      }

      const idDoctor = Number(localStorage.getItem("id_doctor") || "1");

      const formData = new FormData();
      formData.append("id_patient", selectedPatientId);
      formData.append("id_doctor", idDoctor.toString());
      formData.append("file", fileInputRef.current.files[0]);

      const res = await fetch(`${API_BASE}/analysis/detect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      console.log("Full Response:", data);

      if (!res.ok) {
        const msg = data?.detail || "Analysis failed";
        throw new Error(msg);
      }

      setAnalysisId(data.id_analysis);

      let top3: any[] = [];
      try {
        top3 = JSON.parse(data.top3_json);
      } catch {
        top3 = [];
      }

      const cacheKey = String(data.id_analysis ?? Date.now());

      const imageUrl = buildApiUrl(data.image_url, { v: cacheKey });

      const heatmapUrl = data.heatmap_url
        ? buildApiUrl(data.heatmap_url, {
            preview: "false",
            v: cacheKey,
          })
        : null;

      const nextAi: AiResult = {
        diagnosis: data.ai_prediction,
        confidence: Number(data.ai_confidence).toFixed(1),

        image_url: imageUrl,
        heatmap_url: heatmapUrl,

        details: top3.map((item: any) => ({
          label: item.disease,
          score: parsePercentToNumber(item.confidence),
        })),

        advice: data.note || "AI Suggestion based on visual features.",
      };

      setAiResult(nextAi);

      if (data.note) setDoctorNote(data.note);
    } catch (error: any) {
      alert("Error: " + (error?.message || error));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    setImagePreview(null);
    setAiResult(null);
    setAnalysisId(null);
    setConfirmStatus("pending");
    setCustomDiagnosis("");
    setDoctorNote("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveDiagnosis = async () => {
    if (!analysisId) return;

    if (confirmStatus === "no" && !customDiagnosis) {
      alert("Please select the correct diagnosis from the list.");
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Missing access_token");
      }

      const payload = {
        confirm_ai: confirmStatus === "yes" || confirmStatus === "pending",
        custom_diagnosis: confirmStatus === "no" ? customDiagnosis : null,
        note: doctorNote,
      };

      const res = await fetch(`${API_BASE}/analysis/${analysisId}/diagnose`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.detail || "Failed to save diagnosis";
        throw new Error(msg);
      }

      alert("Diagnosis saved to patient record successfully!");
    } catch (error: any) {
      alert("Save failed: " + (error?.message || error));
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
            <h1 className="text-2xl font-bold text-slate-800">
              AI Chest X-ray Analysis
            </h1>
            <p className="text-slate-500">
              COVID-19 Radiography Classification & Doctor Validation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-10">
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Patient
                </label>
                <select
                  className="w-full h-11 border-slate-200 border rounded-lg px-3 focus:ring-2 focus:ring-sky-200 outline-none text-slate-700 bg-slate-50"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <option value="">-- Choose a patient --</option>
                  {patients.map((p) => (
                    <option key={p.id_patient} value={p.id_patient}>
                      {p.name_patient} ({p.date_of_birth_patient})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Chest X-ray Image
                </label>

                <div
                  className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all ${
                    imagePreview
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-300 hover:border-sky-400 hover:bg-slate-50"
                  }`}
                >
                  {displayedOriginal ? (
                    <div className="relative w-full h-full min-h-[200px]">
                      <img
                        src={displayedOriginal || ""}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-lg bg-white"
                      />
                      <button
                        onClick={handleReset}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="text-center cursor-pointer"
                    >
                      <p className="text-sm font-medium text-slate-700">
                        Click to upload image
                      </p>
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

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !imagePreview}
                  className={`mt-5 w-full py-3 rounded-lg font-semibold text-white shadow-lg shadow-sky-200 transition-all ${
                    isAnalyzing || !imagePreview
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  {isAnalyzing ? "Processing..." : "Run AI Diagnosis"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-8">
              {displayResult ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">
                      Analysis Results
                    </h2>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                        displayResult.isDoctorDecision
                          ? "bg-purple-100 text-purple-700 border-purple-200"
                          : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {displayResult.isDoctorDecision
                        ? "Doctor Overridden"
                        : "AI Generated"}
                    </span>
                  </div>

                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                    <div
                      className={`col-span-1 md:col-span-2 p-6 rounded-2xl border ${
                        displayResult.isDoctorDecision
                          ? "bg-gradient-to-br from-purple-50 to-white border-purple-100"
                          : "bg-gradient-to-br from-indigo-50 to-white border-indigo-100"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl text-white ${
                            displayResult.isDoctorDecision
                              ? "bg-purple-600"
                              : "bg-indigo-600"
                          }`}
                        >
                          {displayResult.isDoctorDecision ? (
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-8 h-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>

                        <div>
                          <p
                            className={`text-sm font-medium mb-1 ${
                              displayResult.isDoctorDecision
                                ? "text-purple-600"
                                : "text-indigo-600"
                            }`}
                          >
                            {displayResult.isDoctorDecision
                              ? "Final Diagnosis (Doctor Verified)"
                              : "AI Prediction"}
                          </p>
                          <h3 className="text-3xl font-bold text-slate-800 mb-2">
                            {displayResult.diagnosis}
                          </h3>

                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-48 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  displayResult.isDoctorDecision
                                    ? "bg-purple-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${displayResult.confidence}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-bold text-slate-700">
                              {displayResult.confidence}% Confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-800">
                        AI Probabilities
                      </h4>

                      <div className="space-y-3">
                        {(displayResult.details || []).map(
                          (item: any, idx: number) => (
                            <div key={idx} className="opacity-90">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-600 truncate max-w-[200px]">
                                  {item.label}
                                </span>
                                <span className="font-medium text-slate-900">
                                  {Number(item.score).toFixed(1)}%
                                </span>
                              </div>

                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-slate-400 rounded-full"
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {aiResult?.image_url && displayResult.heatmap_url && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-slate-500 mb-2">
                            Attention Heatmap (Overlay)
                          </p>

                          <div className="relative w-full min-h-[220px] max-h-[360px] bg-black border border-slate-200 rounded-lg overflow-hidden">
                            {/* 1. Xóa ảnh gốc bên dưới (hoặc để ẩn đi), vì ảnh heatmap đã bao gồm cả ảnh gốc rồi */}
                            
                            {/* 2. Hiển thị Heatmap full, không opacity, không blend */}
                            <img
                              src={displayResult.heatmap_url}
                              className="absolute inset-0 w-full h-full object-contain" 
                              alt="Heatmap"
                            />
                          </div>
                          {/* ... */}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          👨‍⚕️ Doctor Validation
                        </h4>

                        <p className="text-sm text-slate-600 mb-3">
                          Is the AI diagnosis correct?
                        </p>

                        <div className="flex gap-3 mb-4">
                          <button
                            onClick={() => setConfirmStatus("yes")}
                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                              confirmStatus === "yes"
                                ? "bg-emerald-100 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500"
                                : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            ✅ Yes, Correct
                          </button>

                          <button
                            onClick={() => setConfirmStatus("no")}
                            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                              confirmStatus === "no"
                                ? "bg-red-100 border-red-500 text-red-800 ring-1 ring-red-500"
                                : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            ❌ No, Incorrect
                          </button>
                        </div>

                        {confirmStatus === "no" && (
                          <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                            <label className="block text-xs font-bold text-red-600 mb-1">
                              Select Correct Diagnosis:
                            </label>
                            <select
                              className="w-full border-red-300 border rounded-lg p-2 text-sm focus:ring-red-200 focus:border-red-500 outline-none"
                              value={customDiagnosis}
                              onChange={(e) =>
                                setCustomDiagnosis(e.target.value)
                              }
                            >
                              <option value="">-- Select Disease --</option>
                              {DISEASE_CLASSES.map((disease) => (
                                <option key={disease} value={disease}>
                                  {disease}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Doctor&apos;s Notes
                        </label>
                        <textarea
                          className="w-full h-24 border-slate-200 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none resize-none"
                          placeholder="Clinical observation notes..."
                          value={doctorNote}
                          onChange={(e) => setDoctorNote(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white font-medium"
                    >
                      Discard
                    </button>

                    <button
                      onClick={handleSaveDiagnosis}
                      disabled={
                        isSaving || (confirmStatus === "no" && !customDiagnosis)
                      }
                      className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-sm flex items-center gap-2 ${
                        isSaving || (confirmStatus === "no" && !customDiagnosis)
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-sky-600 hover:bg-sky-700"
                      }`}
                    >
                      {isSaving ? "Saving..." : "💾 Save Final Diagnosis"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 border-dashed flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-600">
                      No Analysis Yet
                    </h3>
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

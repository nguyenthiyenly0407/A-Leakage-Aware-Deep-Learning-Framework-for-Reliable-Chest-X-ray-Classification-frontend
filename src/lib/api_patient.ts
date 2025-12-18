// src/lib/api_patient.ts

// Sử dụng chung biến này hoặc import từ file api_auth nếu bạn muốn
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// 1. Định nghĩa Type khớp với Backend (PatientOut)
export type Patient = {
  id_patient: number;
  name_patient: string;
  date_of_birth_patient: string; // Backend trả về string "YYYY-MM-DD"
  gender: string | null;
  phone_number: string | null;
  created_at: string;
};

// 2. Định nghĩa Type để gửi đi (PatientCreate)
export type PatientCreatePayload = {
  name_patient: string;
  date_of_birth_patient: string; // Phải format dạng "YYYY-MM-DD"
  gender?: string | null;
  phone_number?: string | null;
};

// --- API FUNCTIONS ---

// Lấy danh sách bệnh nhân
export async function getPatients() {
  // Nếu có token thì lấy từ localStorage thêm vào header
  const token = localStorage.getItem("access_token");
  
  const res = await fetch(`${API_BASE_URL}/patients`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Thêm Authorization nếu backend yêu cầu login mới xem được
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch patients");
  }

  const data = await res.json();
  return data as Patient[];
}

// Thêm mới bệnh nhân
export async function createPatient(payload: PatientCreatePayload) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${API_BASE_URL}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    // data.detail thường là message lỗi từ FastAPI
    throw new Error(data.detail || "Failed to create patient");
  }

  return data as Patient;
}
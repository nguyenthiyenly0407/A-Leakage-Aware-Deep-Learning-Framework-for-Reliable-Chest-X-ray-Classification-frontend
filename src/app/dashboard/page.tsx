"use client";
import Patient from "@/features/dashboard/patient";

export default function DashboardPage() {
  return <Patient>
    <h1 className="text-2xl font-semibold mb-4">Welcome to the Dashboard</h1>
    <p>Select an option from the sidebar to get started.</p>
  </Patient>;
}
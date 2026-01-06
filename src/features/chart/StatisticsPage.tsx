"use client";
import React, { useEffect, useState } from "react";
import axios from "axios"; // Nhớ cài axios: npm install axios
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";
import { Users, CheckCircle, AlertTriangle, Clock } from "lucide-react";

// Màu mặc định cho Pie Chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// Component Card nhỏ gọn
const StatCard = ({ title, value, sub, icon: Icon, color, subColor }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      {sub && <p className={`text-xs mt-1 ${subColor || 'text-slate-400'}`}>{sub}</p>}
    </div>
    <div className={`p-4 rounded-full ${color} text-white shadow-md`}>
      <Icon size={28} />
    </div>
  </div>
);

export default function StatisticsContent() {
  // State lưu dữ liệu
  const [stats, setStats] = useState({
    totalPatients: 0,
    growth: "+0%",
    aiCorrect: 0,
    aiIncorrect: 0
  });
  
  const [visitData, setVisitData] = useState([]);
  const [diseaseData, setDiseaseData] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API khi load trang
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("http://localhost:8000/stats/chart-data", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = res.data;
        setStats(data.stats);
        setVisitData(data.visitData);
        setRecentPatients(data.recentPatients);
        
        // Map màu vào diseaseData
        const coloredDisease = data.diseaseData.map((item: any, idx: number) => ({
           ...item,
           color: COLORS[idx % COLORS.length]
        }));
        setDiseaseData(coloredDisease);
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500">Đang tải số liệu...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Thống kê hệ thống</h1>
        <p className="text-slate-500 text-sm">Tổng quan dữ liệu chẩn đoán AI</p>
      </div>

      {/* 1. Hàng Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Tổng bệnh nhân" 
          value={stats.totalPatients}
          sub={`${stats.growth} trong tháng này`}
          subColor="text-blue-600 font-semibold"
          icon={Users} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="AI Chẩn đoán đúng" 
          value={stats.aiCorrect}
          sub="Ca bệnh bác sĩ đã xác nhận"
          icon={CheckCircle} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="AI Chẩn đoán sai" 
          value={stats.aiIncorrect} 
          sub="Cần điều chỉnh lại model"
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
      </div>

      {/* 2. Hàng Giữa: Chart Tròn + List Vừa Khám */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pie Chart: Phân bố bệnh */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Phân bố loại bệnh (Top 5)</h3>
          <div className="h-64 w-full">
          {diseaseData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diseaseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {diseaseData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="middle" align="right" layout="vertical" />
              </PieChart>
            </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu bệnh lý</div>
            )}
          </div>
        </div>

        {/* List: Hoạt động gần đây */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-1">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-semibold text-slate-800">Hoạt động gần đây</h3>
                 <Clock size={18} className="text-slate-400"/>
             </div>
             
             <div className="space-y-3">
                 {recentPatients.length > 0 ? recentPatients.map((patient: any) => (
                     <div key={patient.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase">
                                 {patient.name.charAt(0)}
                             </div>
                             <div>
                                 <p className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">{patient.name}</p>
                                 <p className="text-xs text-slate-500 truncate max-w-[120px]">{patient.disease}</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                 patient.status === 'AI Đúng' 
                                 ? 'bg-emerald-100 text-emerald-700' 
                                 : (patient.status === 'AI Sai' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600')
                             }`}>
                                 {patient.status}
                             </span>
                             <p className="text-xs text-slate-400 mt-1">{patient.time}</p>
                         </div>
                     </div>
                 )) : <p className="text-center text-sm text-slate-400 mt-10">Chưa có lượt khám nào</p>}
             </div>
        </div>
      </div>

      {/* 3. Hàng Cuối: Area Chart Full Width */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Lượt khám & Chẩn đoán (7 ngày qua)</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVisits)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

    </div>
  );
}
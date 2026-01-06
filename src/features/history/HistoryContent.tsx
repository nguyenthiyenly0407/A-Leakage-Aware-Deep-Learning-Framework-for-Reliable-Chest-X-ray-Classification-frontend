"use client";
import React, { useState, useEffect } from "react";
import { 
  Search, Calendar, FileText, 
  CheckCircle, XCircle, AlertCircle, Download, ChevronLeft, ChevronRight, X 
} from "lucide-react";
import axios from "axios";

// --- INTERFACE ---
interface HistoryItem {
  id_analysis: number;
  created_at: string;
  ai_prediction: string;
  ai_confidence: number;
  doctor_diagnosis: string | null;
  name_patient: string;
  id_patient: string;
  status: 'correct' | 'incorrect' | 'pending';
}

interface PaginationState {
  page: number;
  limit: number;
  total_pages: number;
  total_records: number;
}

export default function HistoryContent() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  
  const [pagination, setPagination] = useState<PaginationState>({ 
    page: 1, limit: 10, total_pages: 1, total_records: 0 
  });
  
  // State bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // State cho ngày tháng (MỚI)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- API CALL ---
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) { setLoading(false); return; }

      const response = await axios.get("http://localhost:8000/history", {
        params: {
          keyword: searchTerm,
          status: filterStatus,
          start_date: startDate || null, // Gửi ngày bắt đầu
          end_date: endDate || null,     // Gửi ngày kết thúc
          page: pagination.page,
          limit: pagination.limit
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHistoryData(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 500); 
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus, pagination.page, startDate, endDate]); // Trigger khi chọn ngày

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('vi-VN'),
        time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
    } catch (e) { return { date: "--", time: "--" }; }
  };

  // --- CHỨC NĂNG EXPORT CSV (MỚI) ---
  const handleExportCSV = () => {
    if (historyData.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
    }

    // 1. Tạo Header
    const headers = ["ID Hồ sơ", "Thời gian", "Bệnh nhân", "AI Dự đoán", "Độ tin cậy", "Bác sĩ Chẩn đoán", "Trạng thái"];
    
    // 2. Map dữ liệu thành các dòng
    const rows = historyData.map(item => [
        item.id_analysis,
        `"${new Date(item.created_at).toLocaleString('vi-VN')}"`, // Bọc ngoặc kép để tránh lỗi format ngày
        `"${item.name_patient}"`,
        `"${item.ai_prediction}"`,
        `${item.ai_confidence}%`,
        `"${item.doctor_diagnosis || 'Chưa có'}"`,
        item.status === 'correct' ? 'Chính xác' : (item.status === 'incorrect' ? 'Sai lệch' : 'Chờ duyệt')
    ]);

    // 3. Ghép thành chuỗi CSV
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" // Thêm BOM để Excel đọc được tiếng Việt
        + [headers, ...rows].map(e => e.join(",")).join("\n");

    // 4. Tạo link tải ảo và click
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lich_su_kham_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- UI RENDER ---
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch sử Chẩn đoán</h1>
          <p className="text-slate-500 text-sm">Quản lý và đối soát kết quả chẩn đoán AI</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* NÚT EXPORT CSV - ĐÃ GẮN SỰ KIỆN */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 shadow-sm text-sm font-medium transition-colors cursor-pointer active:scale-95"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center relative z-10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc bệnh..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto relative">
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="correct">✅ AI Đúng</option>
            <option value="incorrect">❌ AI Sai</option>
            <option value="pending">⏳ Chờ xác nhận</option>
          </select>
          
          {/* NÚT CHỌN NGÀY - BẤM VÀO SẼ HIỆN INPUT */}
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                (startDate || endDate) ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar size={16} /> 
            {(startDate || endDate) ? 'Đang lọc ngày' : 'Ngày'}
          </button>

          {/* POPUP CHỌN NGÀY (Tuyệt chiêu) */}
          {showDatePicker && (
            <div className="absolute top-12 right-0 bg-white p-4 rounded-xl shadow-xl border border-slate-200 w-72 z-20 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">Lọc theo thời gian</span>
                    <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Từ ngày</label>
                    <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Đến ngày</label>
                    <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                {(startDate || endDate) && (
                    <button 
                        onClick={() => { setStartDate(""); setEndDate(""); }}
                        className="text-xs text-red-500 hover:underline mt-1 text-center"
                    >
                        Xóa bộ lọc ngày
                    </button>
                )}
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Bệnh nhân</th>
                <th className="px-6 py-4">AI Dự đoán (Confidence)</th>
                <th className="px-6 py-4">Bác sĩ Kết luận</th>
                <th className="px-6 py-4 text-center">Đánh giá AI</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex justify-center items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            Đang tải dữ liệu...
                        </div>
                    </td>
                 </tr>
              ) : historyData.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Không tìm thấy dữ liệu nào phù hợp.
                    </td>
                 </tr>
              ) : (
                historyData.map((item) => {
                    const { date, time } = formatDate(item.created_at);
                    return (
                        <tr key={item.id_analysis} className="hover:bg-slate-50/50 transition-colors group">
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">{date}</span>
                            <span className="text-xs text-slate-400">{time}</span>
                            </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-slate-700">{item.name_patient}</div>
                        </td>

                        <td className="px-6 py-4 max-w-[200px]">
                            <div className="text-sm text-slate-700 font-medium truncate" title={item.ai_prediction}>
                            {item.ai_prediction}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                className={`h-full rounded-full ${
                                    item.ai_confidence > 80 ? 'bg-emerald-500' : 
                                    item.ai_confidence > 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${item.ai_confidence}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{Math.round(item.ai_confidence)}%</span>
                            </div>
                        </td>

                        <td className="px-6 py-4 max-w-[200px]">
                            {item.doctor_diagnosis ? (
                            <span className="text-sm text-slate-700 font-medium truncate block" title={item.doctor_diagnosis}>
                                {item.doctor_diagnosis}
                            </span>
                            ) : (
                            <span className="text-xs text-slate-400 italic">Chưa xác nhận</span>
                            )}
                        </td>

                        <td className="px-6 py-4 text-center">
                            {item.status === "correct" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                <CheckCircle size={12} /> Chính xác
                            </span>
                            )}
                            {item.status === "incorrect" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                <XCircle size={12} /> Sai lệch
                            </span>
                            )}
                            {item.status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                <AlertCircle size={12} /> Chờ duyệt
                            </span>
                            )}
                        </td>

                        <td className="px-6 py-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Xem chi tiết">
                            <FileText size={18} />
                            </button>
                        </td>
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total_records)} trên tổng số {pagination.total_records} bản ghi
          </span>
          
          <div className="flex gap-2 items-center">
            <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1 px-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm text-slate-600"
            >
                <ChevronLeft size={16} /> Trước
            </button>
            
            <span className="text-sm font-medium text-slate-700 px-3 bg-slate-50 py-1 rounded border border-slate-200">
                {pagination.page} / {pagination.total_pages || 1}
            </span>

            <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                className="p-1 px-2 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm text-slate-600"
            >
                Sau <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
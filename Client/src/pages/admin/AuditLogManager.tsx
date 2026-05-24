import React, { useState, useEffect } from 'react';
import { Shield, Clock, Filter, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface IAuditLog {
  _id: string;
  user_id: {
    _id: string;
    username: string;
    email: string;
    avatar_url: string;
  };
  action: string;
  target_type: string;
  target_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

const AuditLogManager: React.FC = () => {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [actionFilter, setActionFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');

  const limit = 20;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (actionFilter) params.append('action', actionFilter);
      if (targetFilter) params.append('targetType', targetFilter);

      const data = await apiClient<any>(`/admin/audit-logs?${params.toString()}`);
      if (data) {
        setLogs(data.logs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, targetFilter]);

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (action.includes('DELETE')) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (action.includes('UPDATE')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  return (
    <div className="w-full space-y-8 my-4">
      <div className="flex justify-between items-end pb-6 border-b border-white/5">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Shield className="text-rose-500" size={32} />
            Hệ thống Nhật ký (Audit Logs) ({total} bản ghi)
          </h2>
          <p className="text-zinc-400 mt-2 text-sm font-medium">Theo dõi các hành động quan trọng trên hệ thống</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 max-w-xs relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <Filter size={16} />
          </div>
          <select 
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 outline-none focus:border-rose-500/50 transition-colors appearance-none"
          >
            <option value="">Tất cả Hành động</option>
            <option value="CREATE_COMIC">CREATE_COMIC</option>
            <option value="UPDATE_COMIC">UPDATE_COMIC</option>
            <option value="DELETE_COMIC">DELETE_COMIC</option>
            <option value="UPDATE_USER">UPDATE_USER</option>
            <option value="DELETE_USER">DELETE_USER</option>
          </select>
        </div>
        
        <div className="flex-1 max-w-xs relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <Filter size={16} />
          </div>
          <select 
            value={targetFilter}
            onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 outline-none focus:border-rose-500/50 transition-colors appearance-none"
          >
            <option value="">Tất cả Đối tượng</option>
            <option value="Comic">Truyện (Comic)</option>
            <option value="User">Người dùng (User)</option>
          </select>
        </div>
      </div>

      <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center">
             <div className="w-10 h-10 border-2 border-zinc-700 border-t-rose-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/40 text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                <th className="p-4 pl-6 font-medium w-48">Thời gian</th>
                <th className="p-4 font-medium w-48">Tài khoản</th>
                <th className="p-4 font-medium w-32">Hành động</th>
                <th className="p-4 font-medium w-32">Đối tượng</th>
                <th className="p-4 pr-6 font-medium">Chi tiết & IP</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {logs.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    <AlertCircle className="mx-auto mb-2 opacity-50" size={24} />
                    Không tìm thấy nhật ký nào
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-zinc-500" />
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-4">
                      {log.user_id ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={log.user_id.avatar_url || `https://ui-avatars.com/api/?name=${log.user_id.username}&background=random`} 
                            alt={log.user_id.username} 
                            className="w-8 h-8 rounded-full border border-white/10"
                          />
                          <div>
                            <div className="text-zinc-200 font-medium">{log.user_id.username}</div>
                            <div className="text-zinc-500 text-xs truncate max-w-[120px]">{log.user_id.email}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">Hệ thống</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300 font-medium">
                      {log.target_type}
                      {log.target_id && <div className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {log.target_id.slice(-6)}</div>}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="bg-black/30 rounded-lg p-2.5 border border-white/5 font-mono text-[11px] text-zinc-400 leading-relaxed">
                        {log.details ? JSON.stringify(log.details) : <span className="text-zinc-600">Không có chi tiết</span>}
                      </div>
                      {log.ip_address && (
                        <div className="text-[10px] text-zinc-500 mt-1.5 flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                          IP: {log.ip_address}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm font-medium text-zinc-300 disabled:opacity-50 hover:bg-zinc-800 transition-colors"
          >
            Trang trước
          </button>
          <span className="text-zinc-400 text-sm font-medium px-4">
            Trang {page} / {totalPages}
          </span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm font-medium text-zinc-300 disabled:opacity-50 hover:bg-zinc-800 transition-colors"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogManager;

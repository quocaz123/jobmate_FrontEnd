import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  CloudLightning,
  Database,
  Loader2,
  Server,
  ShieldAlert,
  TriangleAlert,
  Users,
} from 'lucide-react';
import {
  getAdminDashboardSummary,
  getAdminSystemHealth,
  getAdminTopViolationUsers,
} from '../../services/adminDashboardService';

const formatNumber = (value) => {
  if (value == null) return '0';
  try {
    return new Intl.NumberFormat('vi-VN').format(value);
  } catch {
    return String(value);
  }
};

const extractData = (response) => response?.data?.data ?? response?.data ?? response ?? null;

const statusColor = (status) => {
  switch (status) {
    case 'UP':
      return 'text-emerald-600 bg-emerald-50 border border-emerald-100';
    case 'DEGRADED':
      return 'text-amber-600 bg-amber-50 border border-amber-100';
    case 'DOWN':
      return 'text-rose-600 bg-rose-50 border border-rose-100';
    default:
      return 'text-slate-600 bg-slate-50 border border-slate-100';
  }
};

const ServiceIcon = ({ name }) => {
  if (name?.toLowerCase().includes('db') || name?.toLowerCase().includes('database')) {
    return <Database className="h-4 w-4" />;
  }
  if (name?.toLowerCase().includes('redis')) {
    return <CloudLightning className="h-4 w-4" />;
  }
  if (name?.toLowerCase().includes('kafka')) {
    return <Server className="h-4 w-4" />;
  }
  if (name?.toLowerCase().includes('s3') || name?.toLowerCase().includes('storage')) {
    return <ShieldAlert className="h-4 w-4" />;
  }
  return <Activity className="h-4 w-4" />;
};

const SummaryCard = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${accent.badge}`}>
      <Icon className="h-4 w-4" />
      {label}
    </div>
    <p className="mt-4 text-3xl font-bold text-slate-900">{formatNumber(value)}</p>
    <p className="mt-1 text-sm text-slate-500">{accent.caption}</p>
  </div>
);

const HealthStatusCard = ({ health }) => {
  if (!health) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tình trạng hệ thống</h2>
          <p className="text-sm text-slate-500">Theo dõi các dịch vụ quan trọng.</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusColor(health.overallStatus)}`}>
          {health.overallStatus === 'UP' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {health.overallStatus || 'UNKNOWN'}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {(health.services || []).map((service) => (
          <div key={service.name} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${statusColor(service.status)}`}>
                <ServiceIcon name={service.name} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 capitalize">{service.name}</p>
                <p className="text-xs text-slate-500">{service.message}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-semibold ${statusColor(service.status).replace('border', '').trim()}`}>
                {service.status}
              </p>
              <p className="text-xs text-slate-400">{new Date(service.checkedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ViolationsTable = ({ data, loading, error, onRefresh }) => (
  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Tài khoản vi phạm nhiều nhất</h2>
        <p className="text-sm text-slate-500">Theo dõi nhà tuyển dụng có rủi ro cao.</p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
        Làm mới
      </button>
    </div>

    {loading ? (
      <div className="flex items-center justify-center px-6 py-10 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang tải dữ liệu...
      </div>
    ) : error ? (
      <div className="px-6 py-6 text-sm text-rose-600">{error}</div>
    ) : data.length === 0 ? (
      <div className="px-6 py-6 text-sm text-slate-500">Không có tài khoản vi phạm.</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-slate-600">Tên/Email</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-600">Số lần vi phạm</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-600">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((user) => (
              <tr key={user.userId} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">{user.fullName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">{formatNumber(user.violationCount)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      user.status === 'BANNED'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : user.status === 'SUSPENDED'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <TriangleAlert className="h-3 w-3" />
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState({
    summary: true,
    health: true,
    violations: true,
  });
  const [error, setError] = useState({
    summary: '',
    health: '',
    violations: '',
  });

  const fetchSummary = useCallback(async () => {
    setLoading((prev) => ({ ...prev, summary: true }));
    setError((prev) => ({ ...prev, summary: '' }));
    try {
      const response = await getAdminDashboardSummary();
      setSummary(extractData(response));
    } catch (err) {
      console.error('Lỗi tải tổng quan admin:', err);
      setSummary(null);
      setError((prev) => ({
        ...prev,
        summary: err?.response?.data?.message || 'Không thể tải thống kê tổng quan.',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }));
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    setLoading((prev) => ({ ...prev, health: true }));
    setError((prev) => ({ ...prev, health: '' }));
    try {
      const response = await getAdminSystemHealth();
      setSystemHealth(extractData(response));
    } catch (err) {
      console.error('Lỗi tải tình trạng hệ thống:', err);
      setSystemHealth(null);
      setError((prev) => ({
        ...prev,
        health: err?.response?.data?.message || 'Không thể tải tình trạng hệ thống.',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, health: false }));
    }
  }, []);

  const fetchViolations = useCallback(async () => {
    setLoading((prev) => ({ ...prev, violations: true }));
    setError((prev) => ({ ...prev, violations: '' }));
    try {
      const response = await getAdminTopViolationUsers();
      const data = extractData(response);
      setViolations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách vi phạm:', err);
      setViolations([]);
      setError((prev) => ({
        ...prev,
        violations: err?.response?.data?.message || 'Không thể tải danh sách vi phạm.',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, violations: false }));
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchHealth();
    fetchViolations();
  }, [fetchSummary, fetchHealth, fetchViolations]);

  const summaryCards = useMemo(() => {
    if (!summary) return [];
    return [
      {
        key: 'totalUsers',
        label: 'Tổng người dùng',
        value: summary.totalUsers,
        icon: Users,
        caption: 'Bao gồm cả ứng viên và nhà tuyển dụng',
        badge: 'bg-indigo-50 text-indigo-600',
      },
      {
        key: 'totalEmployers',
        label: 'Nhà tuyển dụng',
        value: summary.totalEmployers,
        icon: Briefcase,
        caption: 'Đã xác minh',
        badge: 'bg-emerald-50 text-emerald-600',
      },
      {
        key: 'totalJobs',
        label: 'Tin tuyển dụng',
        value: summary.totalJobs,
        icon: ClipboardCheck,
        caption: 'Đang hoạt động trong hệ thống',
        badge: 'bg-sky-50 text-sky-600',
      },
      {
        key: 'totalReports',
        label: 'Báo cáo vi phạm',
        value: summary.totalReports,
        icon: ShieldAlert,
        caption: 'Cần xử lý',
        badge: 'bg-rose-50 text-rose-600',
      },
      {
        key: 'newUsersToday',
        label: 'Người dùng mới hôm nay',
        value: summary.newUsersToday,
        icon: Activity,
        caption: 'Trong 24 giờ qua',
        badge: 'bg-violet-50 text-violet-600',
      },
      {
        key: 'newUsersThisWeek',
        label: 'Người dùng mới tuần này',
        value: summary.newUsersThisWeek,
        icon: ArrowUpRight,
        caption: '7 ngày gần nhất',
        badge: 'bg-amber-50 text-amber-600',
      },
      {
        key: 'pendingJobs',
        label: 'Tin chờ duyệt',
        value: summary.pendingJobs,
        icon: TriangleAlert,
        caption: 'Cần phê duyệt',
        badge: 'bg-orange-50 text-orange-600',
      },
      {
        key: 'pendingReports',
        label: 'Báo cáo chờ xử lý',
        value: summary.pendingReports,
        icon: AlertTriangle,
        caption: 'Đang chờ admin phản hồi',
        badge: 'bg-yellow-50 text-yellow-600',
      },
    ];
  }, [summary]);

  const handleRefreshAll = () => {
    fetchSummary();
    fetchHealth();
    fetchViolations();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống JobMate</h1>
          <p className="text-sm text-slate-500">Theo dõi hoạt động người dùng, công việc, báo cáo và trạng thái dịch vụ.</p>
        </div>
        <button
          type="button"
          onClick={handleRefreshAll}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <Activity className="h-4 w-4" />
          Làm mới tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading.summary ? (
          <div className="col-span-full flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tải thống kê...
          </div>
        ) : error.summary ? (
          <div className="col-span-full rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">{error.summary}</div>
        ) : (
          summaryCards.map((card) => (
            <SummaryCard key={card.key} icon={card.icon} label={card.label} value={card.value} accent={{ badge: card.badge, caption: card.caption }} />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {loading.health ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang kiểm tra tình trạng hệ thống...
          </div>
        ) : error.health ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">{error.health}</div>
        ) : (
          <HealthStatusCard health={systemHealth} />
        )}

        <ViolationsTable data={violations} loading={loading.violations} error={error.violations} onRefresh={fetchViolations} />
      </div>
    </div>
  );
};

export default AdminDashboard;
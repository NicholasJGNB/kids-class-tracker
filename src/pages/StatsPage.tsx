import { useState, useMemo } from 'react';
import 'chart.js/auto';
import { Pie, Bar } from 'react-chartjs-2';
import { getSelectedChildId, getCoursesByChild, getRecordsByChild } from '../utils/storage';
import type { Course, ClassRecord } from '../types';

type Period = 'today' | 'month' | 'year' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  today: '今日',
  month: '本月',
  year: '本年',
  all: '全部',
};

function filterRecordsByPeriod(records: ClassRecord[], period: Period): ClassRecord[] {
  if (period === 'all') return records;
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStr = now.toISOString().slice(0, 7);
  const yearStr = now.getFullYear().toString();

  return records.filter((r) => {
    if (period === 'today') return r.date === todayStr;
    if (period === 'month') return r.date.startsWith(monthStr);
    if (period === 'year') return r.date.startsWith(yearStr);
    return true;
  });
}

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>('all');

  const childId = getSelectedChildId();
  const courses = useMemo(() => (childId ? getCoursesByChild(childId) : []), [childId]);
  const allRecords = useMemo(() => (childId ? getRecordsByChild(childId) : []), [childId]);
  const records = useMemo(() => filterRecordsByPeriod(allRecords, period), [allRecords, period]);

  const courseMap = useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach((c) => map.set(c.id, c));
    return map;
  }, [courses]);

  // Stats
  const totalFee = records.reduce((sum, r) => sum + r.fee, 0);
  const totalSessions = records.reduce((sum, r) => sum + r.sessions, 0);
  const activeCourseIds = new Set(records.map((r) => r.courseId));
  const courseCount = activeCourseIds.size;

  // Per-course aggregation
  const courseStats = useMemo(() => {
    const map = new Map<string, { fee: number; sessions: number }>();
    records.forEach((r) => {
      const prev = map.get(r.courseId) || { fee: 0, sessions: 0 };
      map.set(r.courseId, { fee: prev.fee + r.fee, sessions: prev.sessions + r.sessions });
    });
    return Array.from(map.entries())
      .map(([courseId, stats]) => ({
        course: courseMap.get(courseId),
        courseId,
        ...stats,
      }))
      .filter((s) => s.course)
      .sort((a, b) => b.fee - a.fee);
  }, [records, courseMap]);

  // Pie chart data
  const pieData = useMemo(() => ({
    labels: courseStats.map((s) => s.course!.name),
    datasets: [
      {
        data: courseStats.map((s) => s.fee),
        backgroundColor: courseStats.map((s) => s.course!.color),
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  }), [courseStats]);

  // Bar chart data
  const barData = useMemo(() => {
    if (period === 'today') return null;

    const now = new Date();

    if (period === 'month') {
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`);
      const data = new Array(daysInMonth).fill(0);
      const prefix = now.toISOString().slice(0, 7);
      records.forEach((r) => {
        if (r.date.startsWith(prefix)) {
          const day = parseInt(r.date.slice(8, 10), 10);
          data[day - 1] += r.fee;
        }
      });
      return {
        labels,
        datasets: [{ label: '消费金额', data, backgroundColor: '#C9B1FF', borderRadius: 4 }],
      };
    }

    if (period === 'year') {
      const labels = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
      const data = new Array(12).fill(0);
      const yearStr = now.getFullYear().toString();
      records.forEach((r) => {
        if (r.date.startsWith(yearStr)) {
          const month = parseInt(r.date.slice(5, 7), 10);
          data[month - 1] += r.fee;
        }
      });
      return {
        labels,
        datasets: [{ label: '消费金额', data, backgroundColor: '#FFB5C2', borderRadius: 4 }],
      };
    }

    // all: group by year
    if (records.length === 0) return null;
    const years = new Set(records.map((r) => r.date.slice(0, 4)));
    const sortedYears = Array.from(years).sort();
    const data = sortedYears.map((y) =>
      records.filter((r) => r.date.startsWith(y)).reduce((sum, r) => sum + r.fee, 0)
    );
    return {
      labels: sortedYears.map((y) => `${y}年`),
      datasets: [{ label: '消费金额', data, backgroundColor: '#B5EAD7', borderRadius: 4 }],
    };
  }, [period, records]);

  // Sorted records for detail list
  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : b.createdAt - a.createdAt)),
    [records]
  );

  if (!childId) {
    return (
      <div className="px-4 pt-12 text-center">
        <p className="text-5xl mb-4">👶</p>
        <p className="text-gray-400">请先添加孩子</p>
      </div>
    );
  }

  const isEmpty = records.length === 0;

  return (
    <div className="px-4 pt-4 pb-32">
      {/* Period toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
              period === p
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Data cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">总消费</p>
          <p className="text-xl font-bold text-pink-600">¥{totalFee.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">总课时</p>
          <p className="text-xl font-bold text-purple-600">{totalSessions}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">课程数</p>
          <p className="text-xl font-bold text-teal-600">{courseCount}</p>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-400 text-sm">
            {period === 'today' ? '今天还没有上课记录' : '该时间段没有上课记录'}
          </p>
        </div>
      ) : (
        <>
          {/* Pie chart */}
          {courseStats.length > 0 && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">消费占比</h3>
              <div className="mx-auto" style={{ maxWidth: 220, height: 280, position: 'relative' }}>
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            const val = ctx.parsed;
                            const pct = totalFee > 0 ? ((val / totalFee) * 100).toFixed(1) : '0';
                            return ` ¥${val.toLocaleString()} (${pct}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Bar chart */}
          {barData && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {period === 'month' ? '日消费趋势' : period === 'year' ? '月度消费趋势' : '年度消费趋势'}
              </h3>
              <div style={{ height: 220, position: 'relative' }}>
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                    y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: (v) => `¥${v}` } },
                  },
                }}
              />
              </div>
            </div>
          )}

          {/* Course ranking */}
          {courseStats.length > 0 && (
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">课程消费排行</h3>
              <div className="space-y-3">
                {courseStats.map((s, idx) => {
                  const pct = totalFee > 0 ? (s.fee / totalFee) * 100 : 0;
                  return (
                    <div key={s.courseId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: s.course!.color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{s.course!.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-gray-800">¥{s.fee.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 ml-1">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="ml-6 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: s.course!.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detail list */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">上课明细</h3>
            <div className="space-y-2">
              {sortedRecords.map((r) => {
                const course = courseMap.get(r.courseId);
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: course?.color || '#ccc' }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {course?.name || '未知课程'}
                        </p>
                        <p className="text-xs text-gray-400">{r.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">¥{r.fee}</p>
                      <p className="text-xs text-gray-400">{r.sessions}课时</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

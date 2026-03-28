import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, getRecordsByCourse, deleteRecord, updateCourse } from '../utils/storage';

export default function HistoryPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  void refreshKey;

  const course = courseId ? getCourseById(courseId) : undefined;
  const records = courseId ? getRecordsByCourse(courseId).sort((a, b) => b.createdAt - a.createdAt) : [];

  if (!course) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-gray-400">课程不存在</p>
        <button onClick={() => navigate(-1)} className="text-pink-400 mt-4">返回</button>
      </div>
    );
  }

  const handleUndo = (recordId: string, sessions: number) => {
    if (!window.confirm('确定要撤销这条上课记录吗？')) return;
    deleteRecord(recordId);
    updateCourse({
      ...course,
      usedSessions: Math.max(0, course.usedSessions - sessions),
    });
    refresh();
  };

  const totalSpent = records.reduce((s, r) => s + r.fee, 0);
  const totalSessions = records.reduce((s, r) => s + r.sessions, 0);

  return (
    <div className="px-4 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 text-lg p-1">◀</button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-3 h-8 rounded-full" style={{ backgroundColor: course.color }} />
          <h1 className="text-lg font-bold text-gray-800">{course.name}</h1>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-pink-500">{records.length}</div>
            <div className="text-xs text-gray-400 mt-1">上课次数</div>
          </div>
          <div className="w-px bg-gray-100" />
          <div>
            <div className="text-2xl font-bold text-pink-500">{totalSessions}</div>
            <div className="text-xs text-gray-400 mt-1">消耗课时</div>
          </div>
          <div className="w-px bg-gray-100" />
          <div>
            <div className="text-2xl font-bold text-pink-500">¥{totalSpent}</div>
            <div className="text-xs text-gray-400 mt-1">消费金额</div>
          </div>
        </div>
      </div>

      {/* Records list */}
      {records.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">
          <p className="text-4xl mb-3">📝</p>
          <p>暂无上课记录</p>
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record, index) => (
            <div
              key={record.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: course.color }}
                >
                  {record.sessions}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{record.date}</div>
                  <div className="text-xs text-gray-400">
                    {record.sessions} 课时 · ¥{record.fee}
                  </div>
                </div>
              </div>
              {/* Only the most recent record can be undone */}
              {index === 0 && (
                <button
                  onClick={() => handleUndo(record.id, record.sessions)}
                  className="text-xs text-red-400 bg-red-50 px-3 py-1.5 rounded-lg font-medium"
                >
                  撤销
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

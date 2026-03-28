import { Course } from '../types';
import {
  remainingSessions, spentAmount, estimateEndDate,
  progressPercent, formatWeekdays, formatTimeRange,
} from '../utils/helpers';

interface Props {
  course: Course;
  onMark: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canUndo: boolean;
  onUndo: () => void;
}

export default function CourseCard({ course, onMark, onEdit, onDelete, canUndo, onUndo }: Props) {
  const remaining = remainingSessions(course.totalSessions, course.usedSessions);
  const spent = spentAmount(course.usedSessions, course.feePerSession);
  const percent = progressPercent(course.usedSessions, course.totalSessions);
  const endDate = estimateEndDate(remaining, course.weekdays.length, course.sessionsPerClass);
  const isFinished = remaining <= 0;
  const isLow = !isFinished && remaining < course.totalSessions * 0.2;

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${isLow ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-50'}`}>
      {/* Top section with color bar */}
      <div className="flex">
        {/* Color bar */}
        <div className="w-2 shrink-0" style={{ backgroundColor: course.color }} />

        <div className="flex-1 p-4">
          {/* Course name */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{course.name}</h3>
              {(course.institution || course.teacher) && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {[course.institution, course.teacher].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            {isFinished ? (
              <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-medium">
                已用完
              </span>
            ) : isLow ? (
              <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium animate-pulse">
                课时不足
              </span>
            ) : null}
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>已消耗 {course.usedSessions} / {course.totalSessions} 课时</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  backgroundColor: percent >= 80 ? '#FF6B6B' : course.color,
                }}
              />
            </div>
          </div>

          {/* Info groups */}
          <div className="mt-3 space-y-2.5">
            {/* 课时 & 时间 */}
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <span>剩余 <span className="font-bold text-pink-500">{remaining}</span> 课时</span>
                <span className="text-gray-300">|</span>
                <span>{formatWeekdays(course.weekdays)}</span>
              </div>
              <span className="text-xs text-gray-400">{formatTimeRange(course.startTime, course.endTime)}</span>
            </div>
            {/* 费用 & 进度 */}
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <span>¥{course.feePerSession}/课时</span>
                <span className="text-gray-300">|</span>
                <span>已消费 <span className="font-semibold text-gray-700">¥{spent}</span></span>
              </div>
              <span className="text-xs text-gray-400">预计 {endDate}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            {canUndo ? (
              <button
                onClick={onUndo}
                className="flex-1 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-sm font-medium hover:bg-yellow-200 transition-colors"
              >
                ↩ 撤销上课
              </button>
            ) : (
              <button
                onClick={onMark}
                disabled={isFinished}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isFinished
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-white hover:opacity-90'
                }`}
                style={isFinished ? {} : { backgroundColor: course.color }}
              >
                ✅ 标记上课
              </button>
            )}
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-50 text-blue-500 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              编辑
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-50 text-red-400 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

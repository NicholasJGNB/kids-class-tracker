import { Course } from '../types';
import { remainingSessions, todayString } from '../utils/helpers';

interface Props {
  course: Course;
  childName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function MarkClassModal({ course, childName, onConfirm, onCancel }: Props) {
  const fee = course.sessionsPerClass * course.feePerSession;
  const remaining = remainingSessions(course.totalSessions, course.usedSessions);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">确认标记上课</h3>
        {(childName || true) && (
          <p className="text-sm text-gray-400 text-center mb-4">
            {childName && <span>{childName} · </span>}{todayString()}
          </p>
        )}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span>课程</span>
            <span className="font-medium text-gray-800">{course.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span>扣减课时</span>
            <span className="font-bold text-pink-500">{course.sessionsPerClass} 课时</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span>对应金额</span>
            <span className="font-bold text-pink-500">¥{fee}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>扣减后剩余</span>
            <span className="font-medium text-gray-800">{remaining - course.sessionsPerClass} 课时</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-pink-400 text-white rounded-xl font-medium text-sm hover:bg-pink-500 transition-colors"
          >
            确认上课
          </button>
        </div>
      </div>
    </div>
  );
}

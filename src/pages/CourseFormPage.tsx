import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getCourseById, addCourse, updateCourse,
  getSelectedChildId, generateId,
} from '../utils/storage';
import { getColorByIndex } from '../utils/mockData';
import { getCourses } from '../utils/storage';

const WEEKDAY_OPTIONS = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 0, label: '周日' },
];

export default function CourseFormPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const isEdit = !!courseId;

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [teacher, setTeacher] = useState('');
  const [totalSessions, setTotalSessions] = useState('');
  const [totalFee, setTotalFee] = useState('');
  const [sessionsPerClass, setSessionsPerClass] = useState('1');
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    if (isEdit && courseId) {
      const course = getCourseById(courseId);
      if (course) {
        setName(course.name);
        setInstitution(course.institution);
        setTeacher(course.teacher);
        setTotalSessions(String(course.totalSessions));
        setTotalFee(String(course.totalFee));
        setSessionsPerClass(String(course.sessionsPerClass));
        setWeekdays(course.weekdays);
        setStartTime(course.startTime);
        setEndTime(course.endTime);
      }
    }
  }, [isEdit, courseId]);

  const toggleWeekday = (day: number) => {
    setWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('请填写课程名称');
      return;
    }
    if (!totalSessions || Number(totalSessions) <= 0) {
      alert('请填写有效的总课时');
      return;
    }

    const total = Number(totalSessions);
    const fee = Number(totalFee) || 0;
    const perClass = Number(sessionsPerClass) || 1;
    const feePerSession = total > 0 && fee > 0 ? fee / total : 0;

    if (isEdit && courseId) {
      const existing = getCourseById(courseId);
      if (existing) {
        updateCourse({
          ...existing,
          name: name.trim(),
          institution: institution.trim(),
          teacher: teacher.trim(),
          totalSessions: total,
          totalFee: fee,
          sessionsPerClass: perClass,
          feePerSession,
          weekdays,
          startTime,
          endTime,
        });
      }
    } else {
      const childId = getSelectedChildId();
      if (!childId) {
        alert('请先选择孩子');
        return;
      }
      const colorIndex = getCourses().length;
      addCourse({
        id: generateId(),
        childId,
        name: name.trim(),
        institution: institution.trim(),
        teacher: teacher.trim(),
        totalSessions: total,
        usedSessions: 0,
        sessionsPerClass: perClass,
        totalFee: fee,
        feePerSession,
        weekdays,
        startTime,
        endTime,
        color: getColorByIndex(colorIndex),
        createdAt: Date.now(),
      });
    }
    navigate('/');
  };

  return (
    <div className="px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl text-gray-400 hover:text-gray-600 mr-3"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-800">
          {isEdit ? '编辑课程' : '添加新课程'}
        </h1>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">基本信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                课程名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="如：美术课、围棋课"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">机构名称</label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="可选"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">授课老师</label>
              <input
                type="text"
                value={teacher}
                onChange={e => setTeacher(e.target.value)}
                placeholder="可选"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>
        </div>

        {/* 课时设置 */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">课时设置</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                总课时 <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={totalSessions}
                onChange={e => setTotalSessions(e.target.value)}
                placeholder="如：48"
                min="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">每次消耗课时</label>
              <input
                type="number"
                value={sessionsPerClass}
                onChange={e => setSessionsPerClass(e.target.value)}
                placeholder="默认1"
                min="1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>
        </div>

        {/* 上课时间 */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">上课时间</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">每周上课日</label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => toggleWeekday(opt.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      weekdays.includes(opt.value)
                        ? 'bg-pink-400 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">开始时间</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">结束时间</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 费用信息 */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">费用信息</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">课程总费用（元）</label>
            <input
              type="number"
              value={totalFee}
              onChange={e => setTotalFee(e.target.value)}
              placeholder="可选，默认0"
              min="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-pink-400 hover:bg-pink-500 text-white text-lg font-semibold py-3 rounded-2xl shadow-lg transition-colors mt-4"
        >
          {isEdit ? '保存修改' : '添加课程'}
        </button>
      </div>
    </div>
  );
}

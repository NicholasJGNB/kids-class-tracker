import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course } from '../types';
import {
  getSelectedChildId, getCoursesByChild, getChildren,
  updateCourse, addRecord, generateId,
} from '../utils/storage';
import { remainingSessions, todayString } from '../utils/helpers';
import MarkClassModal from '../components/MarkClassModal';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8..21
const HOUR_HEIGHT = 60; // px per hour
const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatDateFull(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// Convert weekday: course uses 0=Sun,1=Mon..6=Sat; grid uses 0=Mon..6=Sun
function courseWeekdayToGridIndex(wd: number): number {
  return wd === 0 ? 6 : wd - 1;
}

interface CourseBlock {
  course: Course;
  dayIndex: number; // 0=Mon..6=Sun
  top: number;
  height: number;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'week' | 'day'>('week');
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date();
    return today.getDay() === 0 ? 6 : today.getDay() - 1; // grid index
  });
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [markingCourse, setMarkingCourse] = useState<Course | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);
  void refreshKey;

  const childId = getSelectedChildId() || '';
  const courses = childId ? getCoursesByChild(childId) : [];
  const childName = childId ? getChildren().find(c => c.id === childId)?.name : undefined;

  // Build course blocks for week view
  const weekBlocks = useMemo<CourseBlock[]>(() => {
    const blocks: CourseBlock[] = [];
    for (const course of courses) {
      const startMin = timeToMinutes(course.startTime);
      const endMin = timeToMinutes(course.endTime);
      const top = ((startMin - 8 * 60) / 60) * HOUR_HEIGHT;
      const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
      for (const wd of course.weekdays) {
        blocks.push({ course, dayIndex: courseWeekdayToGridIndex(wd), top, height });
      }
    }
    return blocks;
  }, [courses]);

  // Day view blocks
  const dayBlocks = useMemo(() => {
    return weekBlocks.filter(b => b.dayIndex === selectedDay);
  }, [weekBlocks, selectedDay]);

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));
  const goToday = () => {
    setWeekStart(getMonday(new Date()));
    const today = new Date();
    setSelectedDay(today.getDay() === 0 ? 6 : today.getDay() - 1);
  };

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 60) {
      if (view === 'week') {
        diff > 0 ? prevWeek() : nextWeek();
      } else {
        if (diff > 0) {
          // prev day
          if (selectedDay === 0) { prevWeek(); setSelectedDay(6); }
          else setSelectedDay(d => d - 1);
        } else {
          if (selectedDay === 6) { nextWeek(); setSelectedDay(0); }
          else setSelectedDay(d => d + 1);
        }
      }
    }
  };

  // Mark class
  const handleConfirmMark = () => {
    if (!markingCourse) return;
    const recordId = generateId();
    const fee = markingCourse.sessionsPerClass * markingCourse.feePerSession;
    addRecord({
      id: recordId, courseId: markingCourse.id, childId: markingCourse.childId,
      date: todayString(), sessions: markingCourse.sessionsPerClass, fee, createdAt: Date.now(),
    });
    updateCourse({ ...markingCourse, usedSessions: markingCourse.usedSessions + markingCourse.sessionsPerClass });
    setMarkingCourse(null);
    setDetailCourse(null);
    refresh();
  };

  const weekEndDate = addDays(weekStart, 6);
  const weekLabel = `${formatDate(weekStart)} - ${formatDate(weekEndDate)}`;

  // Check if today is in current week
  const todayStr = todayString();
  const todayGridIndex = (() => {
    for (let i = 0; i < 7; i++) {
      if (formatDateFull(addDays(weekStart, i)) === todayStr) return i;
    }
    return -1;
  })();

  return (
    <div className="flex flex-col h-full" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Top navigation */}
      <div className="px-4 pt-4 pb-2 bg-white sticky top-0 z-10 border-b border-gray-100">
        {/* View toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setView('week')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'week' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-500'
              }`}
            >
              周视图
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'day' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-500'
              }`}
            >
              日视图
            </button>
          </div>
          <button onClick={goToday} className="text-sm text-pink-400 font-medium">今天</button>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prevWeek} className="p-2 text-gray-400 text-lg">◀</button>
          <span className="text-sm font-semibold text-gray-700">{weekLabel}</span>
          <button onClick={nextWeek} className="p-2 text-gray-400 text-lg">▶</button>
        </div>

        {/* Day headers (always shown for both views) */}
        <div className="flex mt-2">
          <div className="w-12 shrink-0" /> {/* time gutter */}
          {DAY_NAMES.map((name, i) => {
            const d = addDays(weekStart, i);
            const isToday = i === todayGridIndex;
            const isSelected = view === 'day' && i === selectedDay;
            return (
              <button
                key={i}
                onClick={() => { setSelectedDay(i); if (view === 'week') setView('day'); }}
                className={`flex-1 min-w-[48px] text-center py-1 rounded-lg transition-colors ${
                  isSelected ? 'bg-pink-400 text-white' : isToday ? 'bg-pink-50 text-pink-500' : 'text-gray-500'
                }`}
              >
                <div className="text-xs">{name}</div>
                <div className={`text-sm font-bold ${isSelected ? 'text-white' : isToday ? 'text-pink-500' : 'text-gray-700'}`}>
                  {d.getDate()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time grid */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className={`flex ${view === 'week' ? 'min-w-[500px] pr-1' : ''}`}>
          {/* Time column */}
          <div className="w-12 shrink-0">
            {HOURS.map(h => (
              <div key={h} className="h-[60px] text-right pr-2 text-xs text-gray-400 pt-0 leading-none">
                {h}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {view === 'week' ? (
            // Week view: 7 columns
            <div className="flex flex-1 relative">
              {DAY_NAMES.map((_, dayIdx) => (
                <div key={dayIdx} className="flex-1 min-w-[48px] relative border-l border-gray-100 overflow-visible">
                  {/* Hour lines */}
                  {HOURS.map(h => (
                    <div key={h} className="h-[60px] border-b border-gray-50" />
                  ))}
                  {/* Course blocks */}
                  {weekBlocks
                    .filter(b => b.dayIndex === dayIdx)
                    .map((block, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDetailCourse(block.course)}
                        title={`${block.course.name} ${block.course.startTime}-${block.course.endTime}`}
                        className="absolute left-0.5 right-0.5 rounded-lg px-1 py-0.5 overflow-hidden text-left shadow-sm border border-white/50 flex items-center"
                        style={{
                          top: block.top,
                          height: Math.max(block.height, 24),
                          backgroundColor: block.course.color,
                        }}
                      >
                        <div className="text-[9px] font-bold text-gray-800 leading-tight line-clamp-2">
                          {block.course.name}
                        </div>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            // Day view: single column
            <div className="flex-1 relative border-l border-gray-100">
              {HOURS.map(h => (
                <div key={h} className="h-[60px] border-b border-gray-50" />
              ))}
              {dayBlocks.map((block, idx) => (
                <button
                  key={idx}
                  onClick={() => setDetailCourse(block.course)}
                  className="absolute left-2 right-2 rounded-xl px-3 py-2 overflow-hidden text-left shadow-sm border border-white/50"
                  style={{
                    top: block.top,
                    height: Math.max(block.height, 36),
                    backgroundColor: block.course.color,
                  }}
                >
                  <div className="text-sm font-bold text-gray-800 truncate">{block.course.name}</div>
                  <div className="text-xs text-gray-700">{block.course.startTime}-{block.course.endTime}</div>
                  {block.height >= 60 && (
                    <div className="text-xs text-gray-600 mt-0.5">
                      {block.course.institution && <span>{block.course.institution}</span>}
                      {block.course.teacher && <span> · {block.course.teacher}</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* No courses hint */}
      {courses.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-lg">暂无课程安排</p>
            <p className="text-sm mt-1">先去首页添加课程吧</p>
          </div>
        </div>
      )}

      {/* Course detail modal */}
      {detailCourse && !markingCourse && (
        <CourseDetailModal
          course={detailCourse}
          onClose={() => setDetailCourse(null)}
          onMarkClass={() => setMarkingCourse(detailCourse)}
          onViewHistory={() => {
            setDetailCourse(null);
            navigate(`/history/${detailCourse.id}`);
          }}
        />
      )}

      {/* Mark class confirmation modal */}
      {markingCourse && (
        <MarkClassModal
          course={markingCourse}
          childName={childName}
          onConfirm={handleConfirmMark}
          onCancel={() => setMarkingCourse(null)}
        />
      )}
    </div>
  );
}

// --- Course Detail Modal ---
function CourseDetailModal({
  course,
  onClose,
  onMarkClass,
  onViewHistory,
}: {
  course: Course;
  onClose: () => void;
  onMarkClass: () => void;
  onViewHistory: () => void;
}) {
  const remaining = remainingSessions(course.totalSessions, course.usedSessions);
  const percent = course.totalSessions > 0
    ? Math.round((course.usedSessions / course.totalSessions) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl p-6 w-full max-w-[480px] shadow-xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Color bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-12 rounded-full" style={{ backgroundColor: course.color }} />
          <div>
            <h3 className="text-lg font-bold text-gray-800">{course.name}</h3>
            <p className="text-sm text-gray-500">
              {course.institution && <span>{course.institution}</span>}
              {course.teacher && <span> · {course.teacher}</span>}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">课时进度</span>
            <span className="font-bold text-gray-700">{course.usedSessions}/{course.totalSessions}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all"
              style={{ width: `${percent}%`, backgroundColor: course.color }}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-2xl font-bold text-pink-500">{remaining}</span>
            <span className="text-sm text-gray-500 ml-1">课时剩余</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onMarkClass}
            className="flex-1 py-3 bg-pink-400 text-white rounded-xl font-medium text-sm hover:bg-pink-500 transition-colors"
          >
            标记上课
          </button>
          <button
            onClick={onViewHistory}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            上课记录
          </button>
        </div>
      </div>
    </div>
  );
}

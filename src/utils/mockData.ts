import { Child, Course, ClassRecord } from '../types';
import { getChildren, saveChildren, saveCourses, saveRecords, setSelectedChildId, getSelectedChildId } from './storage';

const COURSE_COLORS = [
  '#FFB5C2', '#FFCBA4', '#FFE5A0', '#B5EAD7',
  '#A0D2DB', '#C9B1FF', '#E8A0BF', '#89CFF0',
  '#FF9AA2', '#B5D99C',
];

export function getColorByIndex(index: number): string {
  return COURSE_COLORS[index % COURSE_COLORS.length];
}

export function initMockData() {
  // Ensure selectedChildId is set even if data already exists
  const existing = getChildren();
  if (existing.length > 0) {
    if (!getSelectedChildId()) {
      setSelectedChildId(existing[0].id);
    }
    return;
  }

  const childId = 'child-xiaoming';
  const child: Child = {
    id: childId,
    name: '小明',
    avatar: '👦',
    createdAt: Date.now(),
  };

  const courses: Course[] = [
    {
      id: 'course-art',
      childId,
      name: '美术课',
      institution: '彩虹美术中心',
      teacher: '李老师',
      totalSessions: 48,
      usedSessions: 12,
      sessionsPerClass: 1,
      totalFee: 4800,
      feePerSession: 100,
      weekdays: [6], // 周六
      startTime: '09:00',
      endTime: '10:30',
      color: COURSE_COLORS[0],
      createdAt: Date.now(),
    },
    {
      id: 'course-go',
      childId,
      name: '围棋课',
      institution: '黑白围棋院',
      teacher: '王老师',
      totalSessions: 60,
      usedSessions: 20,
      sessionsPerClass: 1,
      totalFee: 3600,
      feePerSession: 60,
      weekdays: [3, 6], // 周三、周六
      startTime: '15:00',
      endTime: '16:00',
      color: COURSE_COLORS[3],
      createdAt: Date.now(),
    },
    {
      id: 'course-swim',
      childId,
      name: '游泳课',
      institution: '阳光游泳馆',
      teacher: '张教练',
      totalSessions: 24,
      usedSessions: 8,
      sessionsPerClass: 1,
      totalFee: 4800,
      feePerSession: 200,
      weekdays: [0], // 周日
      startTime: '10:00',
      endTime: '11:00',
      color: COURSE_COLORS[4],
      createdAt: Date.now(),
    },
  ];

  const now = Date.now();
  const day = 86400000;
  const records: ClassRecord[] = [
    // 美术课 12 条记录（取最近几条）
    { id: 'rec-art-1', courseId: 'course-art', childId, date: '2026-03-07', sessions: 1, fee: 100, createdAt: now - 21 * day },
    { id: 'rec-art-2', courseId: 'course-art', childId, date: '2026-03-14', sessions: 1, fee: 100, createdAt: now - 14 * day },
    { id: 'rec-art-3', courseId: 'course-art', childId, date: '2026-03-21', sessions: 1, fee: 100, createdAt: now - 7 * day },
    // 围棋课
    { id: 'rec-go-1', courseId: 'course-go', childId, date: '2026-03-11', sessions: 1, fee: 60, createdAt: now - 17 * day },
    { id: 'rec-go-2', courseId: 'course-go', childId, date: '2026-03-14', sessions: 1, fee: 60, createdAt: now - 14 * day },
    { id: 'rec-go-3', courseId: 'course-go', childId, date: '2026-03-18', sessions: 1, fee: 60, createdAt: now - 10 * day },
    { id: 'rec-go-4', courseId: 'course-go', childId, date: '2026-03-21', sessions: 1, fee: 60, createdAt: now - 7 * day },
    // 游泳课
    { id: 'rec-swim-1', courseId: 'course-swim', childId, date: '2026-03-08', sessions: 1, fee: 200, createdAt: now - 20 * day },
    { id: 'rec-swim-2', courseId: 'course-swim', childId, date: '2026-03-15', sessions: 1, fee: 200, createdAt: now - 13 * day },
    { id: 'rec-swim-3', courseId: 'course-swim', childId, date: '2026-03-22', sessions: 1, fee: 200, createdAt: now - 6 * day },
  ];

  saveChildren([child]);
  saveCourses(courses);
  saveRecords(records);
  setSelectedChildId(childId);
}

import { Child, Course, ClassRecord, Family } from '../types';

const KEYS = {
  children: 'kids-tracker-children',
  courses: 'kids-tracker-courses',
  records: 'kids-tracker-records',
  family: 'kids-tracker-family',
  selectedChildId: 'kids-tracker-selected-child',
};

function get<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Children ----
export function getChildren(): Child[] {
  return get<Child[]>(KEYS.children, []);
}

export function saveChildren(children: Child[]) {
  set(KEYS.children, children);
}

export function addChild(child: Child) {
  const list = getChildren();
  list.push(child);
  saveChildren(list);
}

export function updateChild(child: Child) {
  const list = getChildren().map(c => c.id === child.id ? child : c);
  saveChildren(list);
}

export function deleteChild(id: string) {
  saveChildren(getChildren().filter(c => c.id !== id));
  // Also delete related courses and records
  saveCourses(getCourses().filter(c => c.childId !== id));
  saveRecords(getRecords().filter(r => r.childId !== id));
}

// ---- Selected Child ----
export function getSelectedChildId(): string | null {
  return localStorage.getItem(KEYS.selectedChildId);
}

export function setSelectedChildId(id: string) {
  localStorage.setItem(KEYS.selectedChildId, id);
}

// ---- Courses ----
export function getCourses(): Course[] {
  return get<Course[]>(KEYS.courses, []);
}

export function saveCourses(courses: Course[]) {
  set(KEYS.courses, courses);
}

export function getCoursesByChild(childId: string): Course[] {
  return getCourses().filter(c => c.childId === childId);
}

export function getCourseById(id: string): Course | undefined {
  return getCourses().find(c => c.id === id);
}

export function addCourse(course: Course) {
  const list = getCourses();
  list.push(course);
  saveCourses(list);
}

export function updateCourse(course: Course) {
  const list = getCourses().map(c => c.id === course.id ? course : c);
  saveCourses(list);
}

export function deleteCourse(id: string) {
  saveCourses(getCourses().filter(c => c.id !== id));
  saveRecords(getRecords().filter(r => r.courseId !== id));
}

// ---- Class Records ----
export function getRecords(): ClassRecord[] {
  return get<ClassRecord[]>(KEYS.records, []);
}

export function saveRecords(records: ClassRecord[]) {
  set(KEYS.records, records);
}

export function getRecordsByCourse(courseId: string): ClassRecord[] {
  return getRecords().filter(r => r.courseId === courseId);
}

export function getRecordsByChild(childId: string): ClassRecord[] {
  return getRecords().filter(r => r.childId === childId);
}

export function addRecord(record: ClassRecord) {
  const list = getRecords();
  list.push(record);
  saveRecords(list);
}

export function deleteRecord(id: string) {
  saveRecords(getRecords().filter(r => r.id !== id));
}

// ---- Family ----
export function getFamily(): Family {
  return get<Family>(KEYS.family, {
    name: '我的家庭',
    members: [
      { name: '爸爸', avatar: '👨', role: 'admin' },
      { name: '妈妈', avatar: '👩', role: 'admin' },
    ],
  });
}

export function saveFamily(family: Family) {
  set(KEYS.family, family);
}

// ---- Generate ID ----
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

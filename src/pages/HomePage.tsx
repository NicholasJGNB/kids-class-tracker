import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getChildren, addChild, getSelectedChildId, setSelectedChildId,
  getCoursesByChild, deleteCourse, updateCourse,
  addRecord, deleteRecord, getRecordsByCourse,
  generateId,
} from '../utils/storage';
import { Child, Course } from '../types';
import ChildSwitcher from '../components/ChildSwitcher';
import CourseCard from '../components/CourseCard';
import MarkClassModal from '../components/MarkClassModal';
import AddChildModal from '../components/AddChildModal';
import { todayString } from '../utils/helpers';

export default function HomePage() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const children = getChildren();
  const savedId = getSelectedChildId();
  const [selectedChildId, setSelectedId] = useState<string>(
    savedId && children.find(c => c.id === savedId) ? savedId : children[0]?.id || ''
  );
  const [markingCourse, setMarkingCourse] = useState<Course | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [undoRecordId, setUndoRecordId] = useState<string | null>(null);
  const [undoCourseId, setUndoCourseId] = useState<string | null>(null);

  // Force re-read from storage
  void refreshKey;

  const courses = selectedChildId ? getCoursesByChild(selectedChildId) : [];

  const handleSelectChild = (id: string) => {
    setSelectedId(id);
    setSelectedChildId(id);
    setUndoRecordId(null);
    setUndoCourseId(null);
  };

  const handleAddChild = (name: string, avatar: string) => {
    const child: Child = { id: generateId(), name, avatar, createdAt: Date.now() };
    addChild(child);
    handleSelectChild(child.id);
    setShowAddChild(false);
    refresh();
  };

  const handleMarkClass = (course: Course) => {
    setMarkingCourse(course);
  };

  const handleConfirmMark = () => {
    if (!markingCourse) return;
    const recordId = generateId();
    const fee = markingCourse.sessionsPerClass * markingCourse.feePerSession;
    addRecord({
      id: recordId,
      courseId: markingCourse.id,
      childId: markingCourse.childId,
      date: todayString(),
      sessions: markingCourse.sessionsPerClass,
      fee,
      createdAt: Date.now(),
    });
    updateCourse({
      ...markingCourse,
      usedSessions: markingCourse.usedSessions + markingCourse.sessionsPerClass,
    });
    setUndoRecordId(recordId);
    setUndoCourseId(markingCourse.id);
    setMarkingCourse(null);
    refresh();
  };

  const handleUndo = (courseId: string) => {
    if (!undoRecordId || undoCourseId !== courseId) return;
    const records = getRecordsByCourse(courseId);
    const record = records.find(r => r.id === undoRecordId);
    if (!record) return;
    deleteRecord(undoRecordId);
    const course = getCoursesByChild(selectedChildId).find(c => c.id === courseId);
    if (course) {
      updateCourse({
        ...course,
        usedSessions: Math.max(0, course.usedSessions - record.sessions),
      });
    }
    setUndoRecordId(null);
    setUndoCourseId(null);
    refresh();
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('确定要删除该课程吗？所有上课记录也会被删除。')) {
      deleteCourse(courseId);
      refresh();
    }
  };

  return (
    <div className="px-4 pt-4 pb-40">
      {/* 顶部孩子切换 */}
      <ChildSwitcher
        children={children}
        selectedId={selectedChildId}
        onSelect={handleSelectChild}
        onAdd={() => setShowAddChild(true)}
      />

      {/* 课程卡片列表 */}
      {courses.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-lg">还没有添加课程</p>
          <p className="text-sm mt-1">点击下方按钮添加第一门课程吧</p>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onMark={() => handleMarkClass(course)}
              onEdit={() => navigate(`/course/edit/${course.id}`)}
              onDelete={() => handleDeleteCourse(course.id)}
              canUndo={undoRecordId !== null && undoCourseId === course.id}
              onUndo={() => handleUndo(course.id)}
            />
          ))}
        </div>
      )}

      {/* 浮动添加课程按钮 */}
      {selectedChildId && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4">
          <button
            onClick={() => navigate('/course/add')}
            className="w-full bg-pink-400 hover:bg-pink-500 text-white text-lg font-semibold py-3 rounded-2xl shadow-lg transition-colors"
          >
            + 添加新课程
          </button>
        </div>
      )}

      {/* 标记上课弹窗 */}
      {markingCourse && (
        <MarkClassModal
          course={markingCourse}
          childName={children.find(c => c.id === selectedChildId)?.name}
          onConfirm={handleConfirmMark}
          onCancel={() => setMarkingCourse(null)}
        />
      )}

      {/* 添加孩子弹窗 */}
      {showAddChild && (
        <AddChildModal
          onConfirm={handleAddChild}
          onCancel={() => setShowAddChild(false)}
        />
      )}
    </div>
  );
}

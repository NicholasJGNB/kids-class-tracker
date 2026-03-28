import { Routes, Route, Navigate } from 'react-router-dom';
import TabBar from './components/TabBar';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import StatsPage from './pages/StatsPage';
import FamilyPage from './pages/FamilyPage';
import CourseFormPage from './pages/CourseFormPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 pb-16 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/course/add" element={<CourseFormPage />} />
          <Route path="/course/edit/:courseId" element={<CourseFormPage />} />
          <Route path="/history/:courseId" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <TabBar />
    </div>
  );
}

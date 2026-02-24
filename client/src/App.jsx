import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';

// Layouts
import AdminLayout from './components/AdminLayout';
import FacultyLayout from './components/FacultyLayout';
import StudentLayout from './components/StudentLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageFaculty from './pages/admin/ManageFaculty';
import ManageCourses from './pages/admin/ManageCourses';
import ManageClassrooms from './pages/admin/ManageClassrooms';
import GenerateTimetable from './pages/admin/GenerateTimetable';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import MakeAnnouncement from './pages/admin/MakeAnnouncement';
import LeaveManagement from './pages/admin/LeaveManagement';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyTimetable from './pages/faculty/FacultyTimetable';
import MarkAttendance from './pages/faculty/MarkAttendance';
import UploadMaterials from './pages/faculty/UploadMaterials';
import FacultyAnnouncements from './pages/faculty/FacultyAnnouncements';
import LeaveRequest from './pages/faculty/LeaveRequest';
import FacultyProfile from './pages/faculty/FacultyProfile';
import ViewAttendance from './pages/faculty/ViewAttendance';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyTimetable from './pages/student/MyTimetable';
import Attendance from './pages/student/Attendance';
import StudyMaterials from './pages/student/StudyMaterials';
import Announcements from './pages/student/Announcements';
import Profile from './pages/student/Profile';
import StudentLeave from './pages/student/StudentLeave';
import ViewStudentLeaves from './pages/faculty/ViewStudentLeaves';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="faculty" element={<ManageFaculty />} />
                <Route path="courses" element={<ManageCourses />} />
                <Route path="classrooms" element={<ManageClassrooms />} />
                <Route path="timetable" element={<GenerateTimetable />} />
                <Route path="reports" element={<Reports />} />
                <Route path="announcements" element={<MakeAnnouncement />} />
                <Route path="leaves" element={<LeaveManagement />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
              <Route path="/faculty" element={<FacultyLayout />}>
                <Route index element={<FacultyDashboard />} />
                <Route path="timetable" element={<FacultyTimetable />} />
                <Route path="attendance" element={<MarkAttendance />} />
                <Route path="attendance-history" element={<ViewAttendance />} />
                <Route path="materials" element={<UploadMaterials />} />
                <Route path="announcements" element={<FacultyAnnouncements />} />
                <Route path="leave" element={<LeaveRequest />} />
                <Route path="student-leaves" element={<ViewStudentLeaves />} />
                <Route path="profile" element={<FacultyProfile />} />
              </Route>
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentLayout />}>
                <Route index element={<StudentDashboard />} />
                <Route path="timetable" element={<MyTimetable />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="materials" element={<StudyMaterials />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="leave" element={<StudentLeave />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

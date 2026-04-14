import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import Login from "@/pages/Login";

import StudentDashboard from "@/pages/student/Dashboard";
import StudentAssignments from "@/pages/student/Assignments";
import StudentProfile from "@/pages/student/Profile";
import StudentResults from "@/pages/student/Results";
import StudentAttendance from "@/pages/student/Attendance";

import FacultyDashboard from "@/pages/faculty/Dashboard";
import FacultyAssignments from "@/pages/faculty/FacultyAssignments";
import FacultyMarks from "@/pages/faculty/Marks";
import FacultyProfile from "@/pages/faculty/FacultyProfile";
import FacultyStudents from "@/pages/faculty/FacultyStudents";
import FacultyAttendance from "@/pages/faculty/FacultyAttendance";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminStudents from "@/pages/admin/Students";
import AdminFaculty from "@/pages/admin/Faculty";
import PublishResults from "@/pages/admin/PublishResults";
import AdminProfile from "@/pages/admin/AdminProfile";

import Subjects from "@/pages/Subjects";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();
  const role = user?.role;

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Login} />
        <Route><Redirect to="/" /></Route>
      </Switch>
    );
  }

  return (
    <DashboardLayout>
      <Switch>
        {/* Redirect root to dashboard */}
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>

        {/* Dashboard */}
        <Route path="/dashboard">
          {role === "student" ? <StudentDashboard /> : role === "faculty" ? <FacultyDashboard /> : <AdminDashboard />}
        </Route>

        {/* Shared */}
        <Route path="/subjects" component={Subjects} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/settings" component={Settings} />

        {/* Assignments */}
        <Route path="/assignments">
          {role === "student" ? <StudentAssignments /> : <FacultyAssignments />}
        </Route>

        {/* Attendance — faculty gets bulk attendance management */}
        <Route path="/attendance">
          {role === "student" ? <StudentAttendance /> : role === "faculty" ? <FacultyAttendance /> : <Redirect to="/dashboard" />}
        </Route>

        {/* Marks & Results */}
        <Route path="/results">
          {role === "student" ? <StudentResults /> : <FacultyMarks />}
        </Route>

        {/* Profile — admin gets dedicated AdminProfile */}
        <Route path="/profile">
          {role === "student" ? <StudentProfile /> : role === "faculty" ? <FacultyProfile /> : <AdminProfile />}
        </Route>

        {/* Students list */}
        <Route path="/students">
          {role === "admin" ? <AdminStudents /> : <FacultyStudents />}
        </Route>

        {/* Admin-only */}
        <Route path="/faculty">
          {role === "admin" ? <AdminFaculty /> : <Redirect to="/dashboard" />}
        </Route>
        <Route path="/courses" component={Subjects} />
        <Route path="/publish-results">
          {role === "admin" ? <PublishResults /> : <Redirect to="/dashboard" />}
        </Route>

        {/* Catch-all */}
        <Route><Redirect to="/dashboard" /></Route>
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DataProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppRoutes />
            </WouterRouter>
            <Toaster />
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, GraduationCap, BarChart2, TrendingUp, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

export default function AdminDashboard() {
  const { students, faculty, courses, marks } = useData();

  const deptStudents = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"].map((d) => ({
    name: d.slice(0, 6) + ".",
    students: students.filter((s) => s.department === d).length,
    faculty: faculty.filter((f) => f.department === d).length,
  }));

  const activeStudents = students.filter((s) => s.status === "active").length;
  const activeFaculty = faculty.filter((f) => f.status === "active").length;

  const cgpaDistrib = [
    { range: "9-10", count: students.filter((s) => s.cgpa >= 9).length },
    { range: "8-9", count: students.filter((s) => s.cgpa >= 8 && s.cgpa < 9).length },
    { range: "7-8", count: students.filter((s) => s.cgpa >= 7 && s.cgpa < 8).length },
    { range: "6-7", count: students.filter((s) => s.cgpa >= 6 && s.cgpa < 7).length },
    { range: "<6", count: students.filter((s) => s.cgpa < 6).length },
  ];

  const yearWise = [1, 2, 3, 4].map((y) => ({
    name: y === 1 ? "FY" : y === 2 ? "SY" : y === 3 ? "TY" : "BE",
    students: students.filter((s) => s.year === y).length,
  }));

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  const gradeDistrib = ["O", "A+", "A", "B+", "B", "C", "D", "F"].map((g) => ({
    grade: g,
    count: marks.filter((m) => m.grade === g).length,
  })).filter((g) => g.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">University ERP System Overview</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: students.length, active: activeStudents, icon: <GraduationCap size={20} className="text-blue-600" />, bg: "bg-blue-50" },
          { label: "Total Faculty", value: faculty.length, active: activeFaculty, icon: <Users size={20} className="text-green-600" />, bg: "bg-green-50" },
          { label: "Total Courses", value: courses.length, active: courses.length, icon: <BookOpen size={20} className="text-purple-600" />, bg: "bg-purple-50" },
          { label: "Departments", value: 5, active: 5, icon: <Activity size={20} className="text-orange-600" />, bg: "bg-orange-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-xs text-green-600 mt-1">{s.active} active</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Students by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptStudents}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="students" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Students" />
                <Bar dataKey="faculty" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Faculty" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">CGPA Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={cgpaDistrib} cx="50%" cy="50%" outerRadius={80} dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {cgpaDistrib.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Year-wise Student Count</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={yearWise}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="students" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Grade Distribution (All Courses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={gradeDistrib}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Top Department</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">Computer Science</p>
            <p className="text-sm text-muted-foreground">{students.filter((s) => s.department === "Computer Science").length} students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Average CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-primary">
              {(students.reduce((a, s) => a + s.cgpa, 0) / students.length).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">across all students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Active This Semester</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-green-600">{activeStudents}</p>
            <p className="text-sm text-muted-foreground">of {students.length} total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

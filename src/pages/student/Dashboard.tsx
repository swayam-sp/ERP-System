import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ClipboardList, Calendar, BarChart2, TrendingUp, Award } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from "recharts";
import { useLocation } from "wouter";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { students, courses, assignments, attendance, marks } = useData();
  const [, navigate] = useLocation();
  const student = students.find((s) => s.id === user?.id) ?? students[0];

  const myAttendance = attendance.filter((a) => a.studentId === student.id);
  const myMarks = marks.filter((m) => m.studentId === student.id && m.semester === student.semester);
  const myAssignments = assignments.filter((a) => student.enrolledCourses.includes(a.courseId));
  const submittedAssignments = myAssignments.filter(
    (a) => a.submissions.some((s) => s.studentId === student.id)
  );
  const pendingAssignments = myAssignments.filter(
    (a) => !a.submissions.some((s) => s.studentId === student.id)
  );

  const avgAttendance = myAttendance.length
    ? myAttendance.reduce((acc, a) => acc + a.percentage, 0) / myAttendance.length
    : 0;

  const attendancePieData = [
    { name: "Present", value: myAttendance.reduce((a, r) => a + r.attended, 0) },
    { name: "Absent", value: myAttendance.reduce((a, r) => a + (r.totalClasses - r.attended), 0) },
  ];

  const attendanceBarData = myAttendance.map((a) => {
    const course = courses.find((c) => c.id === a.courseId);
    return { name: course?.code ?? a.courseId, percentage: a.percentage };
  });

  const internalMarksData = myMarks.map((m) => {
    const course = courses.find((c) => c.id === m.courseId);
    return { name: course?.code ?? m.courseId, ISA: m.isa, MSE: m.mse };
  });

  const COLORS = ["hsl(var(--chart-2))", "hsl(var(--chart-3))"];

  const statCards = [
    {
      label: "Enrolled Courses",
      value: student.enrolledCourses.length,
      icon: <BookOpen size={20} className="text-blue-600" />,
      bg: "bg-blue-50",
      change: "This semester",
      href: "/subjects",
    },
    {
      label: "Avg. Attendance",
      value: `${avgAttendance.toFixed(1)}%`,
      icon: <Calendar size={20} className="text-green-600" />,
      bg: "bg-green-50",
      change: avgAttendance >= 75 ? "✓ Good standing" : "⚠ Below 75%",
      href: "/attendance",
    },
    {
      label: "Assignments Submitted",
      value: `${submittedAssignments.length}/${myAssignments.length}`,
      icon: <ClipboardList size={20} className="text-orange-600" />,
      bg: "bg-orange-50",
      change: `${pendingAssignments.length} pending`,
      href: "/assignments",
    },
    {
      label: "Current CGPA",
      value: student.cgpa,
      icon: <BarChart2 size={20} className="text-purple-600" />,
      bg: "bg-purple-50",
      change: "Cumulative",
      href: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {student.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {student.department} • Year {student.year} • Sem {student.semester} • Div {student.division}
          </p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="text-xs">Roll No: {student.rollNo}</Badge>
          <p className="text-xs text-muted-foreground mt-1">Academic Year 2024-25</p>
        </div>
      </div>

      {/* Stat Cards — clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className={`transition-all hover:shadow-md ${card.href ? "cursor-pointer hover:border-primary/40" : ""}`}
            onClick={() => card.href && navigate(card.href)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  {card.icon}
                </div>
                <TrendingUp size={14} className="text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{card.change}</p>
              {card.href && (
                <p className="text-xs text-primary mt-1 font-medium">Click to view →</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {attendancePieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Subject-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={attendanceBarData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
                <Bar dataKey="percentage" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Internal Marks (ISA & MSE)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={internalMarksData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="ISA" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MSE" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Internal Marks Summary Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award size={16} /> Internal Marks Summary
            <Badge variant="outline" className="ml-auto text-xs">Always Visible</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            ISA and MSE are always visible. ESE results appear only after admin publishes the semester.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3 font-medium">Course</th>
                  <th className="text-center py-2 px-3 font-medium">ISA</th>
                  <th className="text-center py-2 px-3 font-medium">MSE</th>
                  <th className="text-center py-2 px-3 font-medium">Assignments Uploaded</th>
                  <th className="text-center py-2 px-3 font-medium">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {student.enrolledCourses.map((cid) => {
                  const course = courses.find((c) => c.id === cid);
                  const m = myMarks.find((mk) => mk.courseId === cid);
                  const att = myAttendance.find((a) => a.courseId === cid);
                  const courseAssignments = myAssignments.filter((a) => a.courseId === cid);
                  const uploadedCount = courseAssignments.filter((a) =>
                    a.submissions.some((s) => s.studentId === student.id)
                  ).length;
                  const maxIsa = course?.maxIsa ?? 30;
                  const maxMse = course?.maxMse;
                  return (
                    <tr key={cid} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="py-2 px-3 font-medium">
                        {course?.name ?? cid}
                        {course?.courseType === "lab" && (
                          <Badge variant="outline" className="ml-2 text-xs">Lab</Badge>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="font-semibold">{m?.isa ?? "—"}</span>
                        <span className="text-muted-foreground text-xs">/{maxIsa}</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {maxMse !== undefined ? (
                          <>
                            <span className="font-semibold">{m?.mse ?? "—"}</span>
                            <span className="text-muted-foreground text-xs">/{maxMse}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A (Lab)</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-medium">
                        {uploadedCount}/{courseAssignments.length}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={att && att.percentage < 75 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                          {att?.percentage ?? "—"}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

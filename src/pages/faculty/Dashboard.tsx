import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, ClipboardList, BarChart2, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { faculty, students, courses, assignments, marks } = useData();
  const fac = faculty.find((f) => f.id === user?.id) ?? faculty[0];

  const myCourses = courses.filter((c) => fac.assignedCourses.includes(c.id));
  const myStudents = students.filter((s) => fac.assignedCourses.some((cid) => s.enrolledCourses.includes(cid)));
  const myAssignments = assignments.filter((a) => fac.assignedCourses.includes(a.courseId));
  const pendingGrading = myAssignments.reduce(
    (acc, a) => acc + a.submissions.filter((s) => s.status === "submitted").length, 0
  );

  const myMarks = marks.filter((m) => fac.assignedCourses.includes(m.courseId));
  const avgMarks = myMarks.length ? myMarks.reduce((a, m) => a + m.total, 0) / myMarks.length : 0;

  const gradeDistribution = ["O", "A+", "A", "B+", "B", "C", "D", "F"].map((grade) => ({
    name: grade,
    count: myMarks.filter((m) => m.grade === grade).length,
  })).filter((g) => g.count > 0);

  const topPerformers = myStudents
    .map((s) => {
      const sMarks = myMarks.filter((m) => m.studentId === s.id);
      const avg = sMarks.length ? sMarks.reduce((a, m) => a + m.total, 0) / sMarks.length : 0;
      return { ...s, avg: parseFloat(avg.toFixed(1)) };
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  const courseMarksData = myCourses.map((c) => {
    const courseMarks = myMarks.filter((m) => m.courseId === c.id);
    const avg = courseMarks.length ? courseMarks.reduce((a, m) => a + m.total, 0) / courseMarks.length : 0;
    return { name: c.code, avg: parseFloat(avg.toFixed(1)) };
  });

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {fac.name} 👋</h1>
          <p className="text-muted-foreground text-sm">{fac.designation} — {fac.department}</p>
        </div>
        <Badge variant="outline" className="text-xs">{fac.employeeId}</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "My Courses", value: myCourses.length, icon: <BookOpen size={20} className="text-blue-600" />, bg: "bg-blue-50" },
          { label: "My Students", value: myStudents.length, icon: <Users size={20} className="text-green-600" />, bg: "bg-green-50" },
          { label: "Assignments", value: myAssignments.length, icon: <ClipboardList size={20} className="text-orange-600" />, bg: "bg-orange-50" },
          { label: "Pending Grading", value: pendingGrading, icon: <BarChart2 size={20} className="text-purple-600" />, bg: "bg-purple-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>{s.icon}</div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={gradeDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {gradeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Average Marks by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={courseMarksData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="avg" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers + My Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} /> Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPerformers.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-300" : i === 2 ? "bg-orange-400" : "bg-muted"} text-white`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.rollNo}</p>
                </div>
                <Badge variant="default">{s.avg}/100</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen size={16} /> My Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myCourses.map((c) => {
              const enrolled = myStudents.filter((s) => s.enrolledCourses.includes(c.id)).length;
              const cAssignments = myAssignments.filter((a) => a.courseId === c.id).length;
              return (
                <div key={c.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.code} • {c.credits} Credits</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {c.year === 1 ? "FY" : c.year === 2 ? "SY" : c.year === 3 ? "TY" : "BE"}
                    </Badge>
                  </div>
                  <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground">
                    <span>Students: {enrolled}</span>
                    <span>Assignments: {cAssignments}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

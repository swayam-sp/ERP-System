import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from "recharts";

export default function StudentAttendance() {
  const { user } = useAuth();
  const { students, courses, attendance } = useData();
  const student = students.find((s) => s.id === user?.id) ?? students[0];
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  const myAttendance = attendance.filter((a) => a.studentId === student.id);
  const avgAttendance = myAttendance.length
    ? myAttendance.reduce((acc, a) => acc + a.percentage, 0) / myAttendance.length
    : 0;

  const pieData = [
    { name: "Present", value: myAttendance.reduce((acc, a) => acc + a.attended, 0) },
    { name: "Absent", value: myAttendance.reduce((acc, a) => acc + (a.totalClasses - a.attended), 0) },
  ];
  const COLORS = ["hsl(var(--chart-2))", "hsl(var(--chart-3))"];

  const barData = myAttendance.map((a) => {
    const course = courses.find((c) => c.id === a.courseId);
    return {
      name: course?.code ?? a.courseId,
      percentage: a.percentage,
      attended: a.attended,
      total: a.totalClasses,
    };
  });

  const selectedAtt = selectedCourse === "all" ? myAttendance[0] : myAttendance.find((a) => a.courseId === selectedCourse);
  const trendData = selectedAtt?.monthly ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground text-sm">Track your class attendance across subjects</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className={`text-3xl font-bold ${avgAttendance >= 75 ? "text-green-600" : "text-red-600"}`}>
              {avgAttendance.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Overall Average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{myAttendance.reduce((a, r) => a + r.attended, 0)}</p>
            <p className="text-sm text-muted-foreground">Total Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">
              {myAttendance.reduce((a, r) => a + (r.totalClasses - r.attended), 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">
              {myAttendance.filter((a) => a.percentage >= 75).length}
            </p>
            <p className="text-sm text-muted-foreground">Subjects OK</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overall Attendance Split</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
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
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(v, n) => n === "percentage" ? [`${v}%`, "Attendance"] : [v, n]} />
                <Bar dataKey="percentage" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]}
                  label={{ position: "top", fontSize: 10, formatter: (v: number) => `${v}%` }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Monthly Attendance Trend</CardTitle>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses (First)</SelectItem>
              {student.enrolledCourses.map((id) => {
                const c = courses.find((c) => c.id === id);
                return c ? <SelectItem key={id} value={id}>{c.code}</SelectItem> : null;
              })}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" iconSize={8} />
              <Line type="monotone" dataKey="attended" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Present" />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="5 5" name="Total" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {myAttendance.map((a) => {
          const course = courses.find((c) => c.id === a.courseId);
          const isLow = a.percentage < 75;
          return (
            <Card key={a.courseId} className={isLow ? "border-red-200" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{course?.name}</p>
                    <p className="text-xs text-muted-foreground">{course?.code}</p>
                  </div>
                  <Badge variant={isLow ? "destructive" : "default"}>
                    {a.percentage}%
                  </Badge>
                </div>
                <Progress value={a.percentage} className={`h-2 ${isLow ? "[&>div]:bg-red-500" : ""}`} />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Present: {a.attended}</span>
                  <span>Absent: {a.totalClasses - a.attended}</span>
                  <span>Total: {a.totalClasses}</span>
                </div>
                {isLow && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    ⚠ Attendance below 75% — risk of de-registration
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User, Mail, Phone, MapPin, BookOpen, Calendar, Hash, Building, Lock, FlaskConical
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StudentProfile() {
  const { user } = useAuth();
  const { students, courses, marks, attendance } = useData();
  const student = students.find((s) => s.id === user?.id) ?? students[0];

  // Only use current semester marks
  const myMarks = marks.filter((m) => m.studentId === student.id && m.semester === student.semester);
  const myAttendance = attendance.filter((a) => a.studentId === student.id);
  const avgAttendance = myAttendance.length
    ? myAttendance.reduce((acc, a) => acc + a.percentage, 0) / myAttendance.length
    : 0;

  // Only show courses for current year
  const currentYearCourses = courses.filter(
    (c) => student.enrolledCourses.includes(c.id) && c.year === student.year
  );

  const infoFields = [
    { icon: <Hash size={14} />, label: "Roll Number", value: student.rollNo },
    { icon: <User size={14} />, label: "Full Name", value: student.name },
    { icon: <Mail size={14} />, label: "Email ID", value: student.email },
    { icon: <Calendar size={14} />, label: "Date of Birth", value: student.dob },
    { icon: <Phone size={14} />, label: "Phone", value: student.phone },
    { icon: <Building size={14} />, label: "Department", value: student.department },
    { icon: <BookOpen size={14} />, label: "Year / Division", value: `Year ${student.year} / Division ${student.division}` },
    { icon: <BookOpen size={14} />, label: "Semester", value: `Semester ${student.semester}` },
    { icon: <MapPin size={14} />, label: "Address", value: student.address },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm">Your academic profile information</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <Lock size={14} />
          <span>Profile is read-only. Contact admin for changes.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Avatar card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {student.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-bold">{student.name}</h2>
            <p className="text-muted-foreground text-sm">{student.email}</p>
            <Badge className="mt-2" variant={student.status === "active" ? "default" : "secondary"}>
              {student.status === "active" ? "Active Student" : "Inactive"}
            </Badge>

            <Separator className="my-4 w-full" />

            <div className="w-full space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CGPA</span>
                <span className="font-bold text-primary">{student.cgpa}</span>
              </div>
              <Progress value={(student.cgpa / 10) * 100} className="h-2" />

              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Avg Attendance</span>
                <span className={`font-bold ${avgAttendance >= 75 ? "text-green-600" : "text-red-600"}`}>
                  {avgAttendance.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={avgAttendance}
                className={`h-2 ${avgAttendance < 75 ? "[&>div]:bg-red-500" : ""}`}
              />
            </div>

            <Separator className="my-4 w-full" />

            <div className="w-full text-left space-y-1">
              <p className="text-xs text-muted-foreground font-medium mb-2">
                ENROLLED COURSES — Year {student.year}
              </p>
              {currentYearCourses.length > 0 ? currentYearCourses.map((course) => (
                <div key={course.id} className="text-sm py-1 px-2 bg-muted/50 rounded flex items-center gap-1">
                  {course.courseType === "lab"
                    ? <FlaskConical size={11} className="text-purple-500 shrink-0" />
                    : <BookOpen size={11} className="text-primary shrink-0" />}
                  <span className="font-medium">{course.code}</span>
                  <span className="text-muted-foreground truncate">— {course.name}</span>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground">No courses for current year</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right — Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal & Academic Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoFields.map((f) => (
                <div key={f.label} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {f.icon}
                    {f.label}
                  </div>
                  <p className="text-sm font-medium bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Records — Current semester, current year courses only */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Academic Records — Semester {student.semester}
            <span className="text-sm text-muted-foreground font-normal ml-2">(Current year courses only)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3 font-medium">Course</th>
                  <th className="text-left py-2 px-3 font-medium">Code</th>
                  <th className="text-center py-2 px-3 font-medium">Credits</th>
                  <th className="text-center py-2 px-3 font-medium text-blue-700">ISA</th>
                  <th className="text-center py-2 px-3 font-medium text-indigo-700">MSE</th>
                  <th className="text-center py-2 px-3 font-medium text-purple-700">ESE</th>
                  <th className="text-center py-2 px-3 font-medium">Total</th>
                  <th className="text-center py-2 px-3 font-medium">Grade</th>
                  <th className="text-center py-2 px-3 font-medium">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {currentYearCourses.map((course) => {
                  const m = myMarks.find((mk) => mk.courseId === course.id);
                  const att = myAttendance.find((a) => a.courseId === course.id);
                  const isLab = course.courseType === "lab";
                  return (
                    <tr key={course.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="py-2 px-3 font-medium flex items-center gap-1">
                        {isLab && <FlaskConical size={12} className="text-purple-500 shrink-0" />}
                        {course.name}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{course.code}</td>
                      <td className="py-2 px-3 text-center">{course.credits}</td>
                      <td className="py-2 px-3 text-center text-blue-700 font-medium">
                        {m?.isa ?? "—"}
                        <span className="text-muted-foreground text-xs">/{course.maxIsa}</span>
                      </td>
                      <td className="py-2 px-3 text-center text-indigo-700 font-medium">
                        {isLab
                          ? <span className="text-xs text-muted-foreground">N/A</span>
                          : <>{m?.mse ?? "—"}<span className="text-muted-foreground text-xs">/{course.maxMse}</span></>}
                      </td>
                      <td className="py-2 px-3 text-center text-purple-700 font-medium">
                        {m?.ese ?? "—"}
                        <span className="text-muted-foreground text-xs">/{course.maxEse}</span>
                      </td>
                      <td className="py-2 px-3 text-center font-semibold">{m?.total ?? "—"}</td>
                      <td className="py-2 px-3 text-center">
                        {m ? (
                          <Badge variant={m.grade === "F" ? "destructive" : "default"}>{m.grade}</Badge>
                        ) : "—"}
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

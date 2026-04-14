import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function FacultyStudents() {
  const { user } = useAuth();
  const { faculty, students, courses, marks, attendance } = useData();
  const fac = faculty.find((f) => f.id === user?.id) ?? faculty[0];

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [viewStudent, setViewStudent] = useState<string | null>(null);

  const myCourses = courses.filter((c) => fac.assignedCourses.includes(c.id));
  const myStudents = students.filter((s) => fac.assignedCourses.some((cid) => s.enrolledCourses.includes(cid)));

  const filtered = myStudents.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === "all" || s.enrolledCourses.includes(courseFilter);
    const matchDept = deptFilter === "all" || s.department === deptFilter;
    const matchYear = yearFilter === "all" || s.year === parseInt(yearFilter);
    return matchSearch && matchCourse && matchDept && matchYear;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const viewedStudent = viewStudent ? students.find((s) => s.id === viewStudent) : null;
  const viewedMarks = viewStudent ? marks.filter((m) => m.studentId === viewStudent && fac.assignedCourses.includes(m.courseId)) : [];
  const viewedAttendance = viewStudent ? attendance.filter((a) => a.studentId === viewStudent && fac.assignedCourses.includes(a.courseId)) : [];

  const uniqueDepts = [...new Set(myStudents.map((s) => s.department))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Students</h1>
        <p className="text-muted-foreground text-sm">{filtered.length} students in your courses</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or roll no..." className="pl-8" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={courseFilter} onValueChange={(v) => { setCourseFilter(v); setPage(1); }}>
              <SelectTrigger className="w-48"><Filter size={14} className="mr-2" /><SelectValue placeholder="Course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {myCourses.map((c) => <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depts</SelectItem>
                {uniqueDepts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setPage(1); }}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {[1,2,3,4].map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year/Div</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Avg Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((s) => {
                  const sMarks = marks.filter((m) => m.studentId === s.id && fac.assignedCourses.includes(m.courseId));
                  const avg = sMarks.length ? sMarks.reduce((a, m) => a + m.total, 0) / sMarks.length : 0;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.rollNo}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-sm">{s.department}</TableCell>
                      <TableCell className="text-sm">Y{s.year}/D{s.division}</TableCell>
                      <TableCell>
                        <span className={s.cgpa >= 8 ? "text-green-600 font-semibold" : s.cgpa < 6 ? "text-red-600 font-semibold" : "font-semibold"}>
                          {s.cgpa}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={avg >= 70 ? "text-green-600" : avg < 40 ? "text-red-600" : ""}>
                          {avg.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs">{s.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setViewStudent(s.id)}>
                          <Eye size={14} className="mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
          <span className="text-sm px-2">{page} / {Math.max(1, totalPages)}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
        </div>
      </div>

      {/* Student Detail Dialog */}
      {viewedStudent && (
        <Dialog open={true} onOpenChange={() => setViewStudent(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{viewedStudent.name} — {viewedStudent.rollNo}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "Department", value: viewedStudent.department },
                  { label: "Year/Division", value: `Year ${viewedStudent.year} / Div ${viewedStudent.division}` },
                  { label: "Email", value: viewedStudent.email },
                  { label: "CGPA", value: viewedStudent.cgpa },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="font-medium">{f.value}</p>
                  </div>
                ))}
              </div>

              {viewedMarks.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Marks (Your Courses)</p>
                  {viewedMarks.map((m) => {
                    const c = courses.find((cr) => cr.id === m.courseId);
                    return (
                      <div key={m.courseId} className="flex items-center justify-between p-2 bg-muted/50 rounded mb-1">
                        <span className="text-sm">{c?.code}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{m.total}/100</span>
                          <Badge variant={m.grade === "F" ? "destructive" : "default"} className="text-xs">{m.grade}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewedAttendance.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Attendance (Your Courses)</p>
                  {viewedAttendance.map((a) => {
                    const c = courses.find((cr) => cr.id === a.courseId);
                    return (
                      <div key={a.courseId} className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{c?.code}</span>
                          <span className={a.percentage < 75 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                            {a.percentage}%
                          </span>
                        </div>
                        <Progress value={a.percentage} className={`h-1.5 ${a.percentage < 75 ? "[&>div]:bg-red-500" : ""}`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

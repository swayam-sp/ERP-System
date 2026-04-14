import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Search, Save, CheckCircle, AlertTriangle, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AttendanceRecord } from "@/data/mockData";

export default function FacultyAttendance() {
  const { user } = useAuth();
  const { faculty, students, courses, attendance, bulkUpdateAttendance } = useData();
  const { toast } = useToast();
  const fac = faculty.find((f) => f.id === user?.id) ?? faculty[0];

  const [selectedCourse, setSelectedCourse] = useState<string>(fac.assignedCourses[0] ?? "");
  const [search, setSearch] = useState("");
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState<AttendanceRecord[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [inlineEdits, setInlineEdits] = useState<Record<string, { attended: number; total: number }>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const myCourses = courses.filter((c) => fac.assignedCourses.includes(c.id));
  const courseStudents = students.filter((s) => s.enrolledCourses.includes(selectedCourse));
  const filtered = courseStudents.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  const getAttendance = (studentId: string): AttendanceRecord => {
    const existing = attendance.find((a) => a.studentId === studentId && a.courseId === selectedCourse);
    return existing ?? {
      studentId, courseId: selectedCourse,
      totalClasses: 60, attended: 0, percentage: 0,
      monthly: [],
    };
  };

  const getEdited = (studentId: string) => {
    if (inlineEdits[studentId]) return inlineEdits[studentId];
    const att = getAttendance(studentId);
    return { attended: att.attended, total: att.totalClasses };
  };

  const updateInline = (studentId: string, field: "attended" | "total", value: number) => {
    const current = getEdited(studentId);
    const updated = { ...current, [field]: value };
    setInlineEdits((prev) => ({ ...prev, [studentId]: updated }));
  };

  const saveInlineEdits = () => {
    const records: AttendanceRecord[] = Object.entries(inlineEdits).map(([studentId, vals]) => {
      const existing = getAttendance(studentId);
      const pct = vals.total > 0 ? parseFloat(((vals.attended / vals.total) * 100).toFixed(1)) : 0;
      return {
        ...existing,
        studentId,
        courseId: selectedCourse,
        attended: vals.attended,
        totalClasses: vals.total,
        percentage: pct,
      };
    });
    bulkUpdateAttendance(records);
    setInlineEdits({});
    toast({ title: "Attendance Saved!", description: `${records.length} records updated.` });
  };

  const parseCsv = (text: string): AttendanceRecord[] => {
    const lines = text.trim().split("\n").slice(1);
    return lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const studentId = parts[0] ?? "";
      const attended = parseInt(parts[2] ?? "0") || 0;
      const total = parseInt(parts[3] ?? "60") || 60;
      const pct = total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 0;
      const existing = getAttendance(studentId);
      return {
        ...existing,
        studentId,
        courseId: selectedCourse,
        attended,
        totalClasses: total,
        percentage: pct,
      };
    }).filter((r) => r.studentId);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCsvFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvPreview(parseCsv(text));
    };
    reader.readAsText(f);
  };

  const confirmCsvImport = () => {
    bulkUpdateAttendance(csvPreview);
    setCsvOpen(false);
    setCsvPreview([]);
    setCsvFile(null);
    toast({ title: "Attendance Imported!", description: `${csvPreview.length} student records updated.` });
  };

  const downloadTemplate = () => {
    const header = "StudentID,RollNo,Attended,TotalClasses\n";
    const rows = courseStudents.map((s) => {
      const att = getAttendance(s.id);
      return `${s.id},${s.rollNo},${att.attended},${att.totalClasses}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${selectedCourse}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasEdits = Object.keys(inlineEdits).length > 0;
  const selectedCourseName = myCourses.find((c) => c.id === selectedCourse)?.name ?? "";
  const avgAttendance = courseStudents.length
    ? courseStudents.reduce((acc, s) => {
        const att = getAttendance(s.id);
        return acc + att.percentage;
      }, 0) / courseStudents.length
    : 0;

  const lowAttCount = courseStudents.filter((s) => getAttendance(s.id).percentage < 75).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground text-sm">Track and update attendance per subject</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download size={14} className="mr-2" /> Export / Template
          </Button>
          <Button variant="outline" onClick={() => setCsvOpen(true)}>
            <Upload size={14} className="mr-2" /> Bulk Upload CSV
          </Button>
          {hasEdits && (
            <Button onClick={saveInlineEdits}>
              <Save size={14} className="mr-2" /> Save ({Object.keys(inlineEdits).length})
            </Button>
          )}
        </div>
      </div>

      {/* Course Selector + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="sm:col-span-3">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setInlineEdits({}); }}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {myCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search students..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-4 ml-auto text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg">{courseStudents.length}</p>
                  <p className="text-muted-foreground text-xs">Students</p>
                </div>
                <div className="text-center">
                  <p className={`font-bold text-lg ${avgAttendance < 75 ? "text-red-600" : "text-green-600"}`}>
                    {avgAttendance.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground text-xs">Avg Attendance</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-amber-600">{lowAttCount}</p>
                  <p className="text-muted-foreground text-xs">Below 75%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">{selectedCourseName} — Attendance Register</CardTitle>
          <Badge variant="outline">{filtered.length} students</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="w-28 text-center">Classes Attended</TableHead>
                  <TableHead className="w-28 text-center">Total Classes</TableHead>
                  <TableHead className="w-32 text-center">Percentage</TableHead>
                  <TableHead className="w-40">Progress</TableHead>
                  <TableHead className="w-20 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const edit = getEdited(s.id);
                  const pct = edit.total > 0 ? parseFloat(((edit.attended / edit.total) * 100).toFixed(1)) : 0;
                  const isEdited = !!inlineEdits[s.id];
                  const isLow = pct < 75;
                  return (
                    <TableRow key={s.id} className={isEdited ? "bg-blue-50/50" : isLow ? "bg-red-50/30" : ""}>
                      <TableCell className="font-mono text-xs">{s.rollNo}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number" min={0} max={edit.total}
                          value={edit.attended}
                          onChange={(e) => updateInline(s.id, "attended", Math.min(edit.total, parseInt(e.target.value) || 0))}
                          className="w-20 mx-auto text-center h-8"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number" min={1}
                          value={edit.total}
                          onChange={(e) => updateInline(s.id, "total", parseInt(e.target.value) || 1)}
                          className="w-20 mx-auto text-center h-8"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${isLow ? "text-red-600" : "text-green-600"}`}>{pct}%</span>
                      </TableCell>
                      <TableCell>
                        <Progress value={pct} className={`h-2 ${isLow ? "[&>div]:bg-red-500" : ""}`} />
                      </TableCell>
                      <TableCell className="text-center">
                        {isEdited ? <span className="text-blue-600 text-xs font-medium">Modified</span>
                          : isLow ? <AlertTriangle size={14} className="text-red-500 mx-auto" />
                          : <CheckCircle size={14} className="text-green-500 mx-auto" />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk CSV Upload Dialog */}
      <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Bulk Attendance Upload</DialogTitle>
            <DialogDescription>
              Upload a CSV file to update attendance for all students in {selectedCourseName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <span>Format: StudentID, RollNo, Attended, TotalClasses</span>
              <Button variant="outline" size="sm" className="ml-auto shrink-0" onClick={downloadTemplate}>
                <Download size={12} className="mr-1" /> Export Current
              </Button>
            </div>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
              <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{csvFile ? csvFile.name : "Click to upload CSV file"}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Only .csv files accepted</p>
            </div>

            {csvPreview.length > 0 && (
              <div className="overflow-x-auto max-h-56 overflow-y-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead className="text-center">Attended</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">%</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvPreview.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{r.studentId}</TableCell>
                        <TableCell className="text-center">{r.attended}</TableCell>
                        <TableCell className="text-center">{r.totalClasses}</TableCell>
                        <TableCell className="text-center">
                          <span className={r.percentage < 75 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                            {r.percentage}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {r.percentage < 75
                            ? <Badge variant="destructive" className="text-xs">Low</Badge>
                            : <Badge variant="default" className="text-xs">OK</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCsvOpen(false); setCsvPreview([]); }}>Cancel</Button>
            <Button onClick={confirmCsvImport} disabled={csvPreview.length === 0}>
              Update {csvPreview.length} Records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

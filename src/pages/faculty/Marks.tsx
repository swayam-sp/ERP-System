import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Upload, Download, Search, Save, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { gradeCalcByPct } from "@/data/mockData";
import type { Marks } from "@/data/mockData";

export default function FacultyMarks() {
  const { user } = useAuth();
  const { faculty, students, courses, marks, bulkUpdateMarks } = useData();
  const { toast } = useToast();
  const fac = faculty.find((f) => f.id === user?.id) ?? faculty[0];

  const [selectedCourse, setSelectedCourse] = useState<string>(fac.assignedCourses[0] ?? "");
  const [selectedSem, setSelectedSem] = useState("5");
  const [search, setSearch] = useState("");
  const [editedMarks, setEditedMarks] = useState<Record<string, Marks>>({});
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState<Marks[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const myCourses = courses.filter((c) => fac.assignedCourses.includes(c.id));
  const course = courses.find((c) => c.id === selectedCourse);
  const isLab = course?.courseType === "lab";
  const maxIsa = course?.maxIsa ?? 30;
  const maxMse = course?.maxMse ?? 30;
  const maxEse = course?.maxEse ?? 40;
  const maxTotal = maxIsa + (isLab ? 0 : maxMse) + maxEse;

  const courseStudents = students.filter((s) => s.enrolledCourses.includes(selectedCourse));
  const filtered = courseStudents.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  const calcGrade = (isa: number, mse: number, ese: number): string => {
    const total = isa + (isLab ? 0 : mse) + ese;
    const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
    return gradeCalcByPct(pct);
  };

  const getMarkForStudent = (studentId: string): Marks => {
    const key = `${studentId}_${selectedCourse}_${selectedSem}`;
    if (editedMarks[key]) return editedMarks[key];
    const existing = marks.find(
      (m) => m.studentId === studentId && m.courseId === selectedCourse && m.semester === parseInt(selectedSem)
    );
    return existing ?? {
      studentId, courseId: selectedCourse, semester: parseInt(selectedSem),
      isa: 0, mse: 0, ese: 0, total: 0, grade: "F",
    };
  };

  const updateMark = (studentId: string, field: "isa" | "mse" | "ese", value: number) => {
    const key = `${studentId}_${selectedCourse}_${selectedSem}`;
    const current = getMarkForStudent(studentId);
    const updated = { ...current, [field]: value };
    if (isLab) updated.mse = 0;
    updated.total = updated.isa + (isLab ? 0 : updated.mse) + updated.ese;
    updated.grade = calcGrade(updated.isa, updated.mse, updated.ese);
    setEditedMarks((prev) => ({ ...prev, [key]: updated }));
  };

  const saveMarks = () => {
    const marksToSave = Object.values(editedMarks);
    bulkUpdateMarks(marksToSave);
    setEditedMarks({});
    toast({ title: "Marks Saved!", description: `${marksToSave.length} records updated successfully.` });
  };

  const parseCsv = (text: string): Marks[] => {
    const lines = text.trim().split("\n").slice(1);
    return lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const isa = Math.min(parseInt(parts[2] ?? "0") || 0, maxIsa);
      const mse = isLab ? 0 : Math.min(parseInt(parts[3] ?? "0") || 0, maxMse);
      const ese = Math.min(parseInt(parts[isLab ? 3 : 4] ?? "0") || 0, maxEse);
      const total = isa + (isLab ? 0 : mse) + ese;
      return {
        studentId: parts[0] ?? "",
        courseId: selectedCourse,
        semester: parseInt(selectedSem),
        isa, mse, ese, total,
        grade: calcGrade(isa, mse, ese),
      };
    }).filter((m) => m.studentId);
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
    bulkUpdateMarks(csvPreview);
    setCsvOpen(false);
    setCsvPreview([]);
    setCsvFile(null);
    toast({ title: "Bulk Import Successful!", description: `${csvPreview.length} students' marks imported.` });
  };

  const downloadTemplate = () => {
    const header = isLab
      ? `StudentID,RollNo,ISA(max${maxIsa}),ESE(max${maxEse})\n`
      : `StudentID,RollNo,ISA(max${maxIsa}),MSE(max${maxMse}),ESE(max${maxEse})\n`;
    const rows = courseStudents.map((s) => {
      const m = getMarkForStudent(s.id);
      return isLab ? `${s.id},${s.rollNo},${m.isa},${m.ese}` : `${s.id},${s.rollNo},${m.isa},${m.mse},${m.ese}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marks_${selectedCourse}_sem${selectedSem}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasEdits = Object.keys(editedMarks).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Marks Management</h1>
          <p className="text-muted-foreground text-sm">Enter marks — max values are set per course</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download size={14} className="mr-2" /> Template
          </Button>
          <Button variant="outline" onClick={() => setCsvOpen(true)}>
            <Upload size={14} className="mr-2" /> Bulk Import CSV
          </Button>
          {hasEdits && (
            <Button onClick={saveMarks}>
              <Save size={14} className="mr-2" /> Save ({Object.keys(editedMarks).length})
            </Button>
          )}
        </div>
      </div>

      {/* Course info bar */}
      {course && (
        <div className="flex flex-wrap gap-2 items-center text-sm p-3 bg-muted/40 rounded-lg border">
          <Badge variant={isLab ? "secondary" : "default"}>{isLab ? "Lab Course" : "Theory Course"}</Badge>
          <span className="text-muted-foreground">Max marks:</span>
          <span className="font-medium text-blue-700">ISA: {maxIsa}</span>
          {!isLab && <span className="font-medium text-indigo-700">+ MSE: {maxMse}</span>}
          <span className="font-medium text-purple-700">+ ESE: {maxEse}</span>
          <span className="text-muted-foreground">= Total: <strong>{maxTotal}</strong></span>
          <span className="text-xs text-muted-foreground ml-auto">Max values set per course in Courses page</span>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Select value={selectedCourse} onValueChange={(v) => { setSelectedCourse(v); setEditedMarks({}); }}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {myCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} — {c.name}
                    {c.courseType === "lab" && " (Lab)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSem} onValueChange={setSelectedSem}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marks Table */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {course?.name ?? "Select a course"}
          </CardTitle>
          <Badge variant="outline">{filtered.length} students</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="w-28 text-center text-blue-700">ISA /{maxIsa}</TableHead>
                  {!isLab && <TableHead className="w-28 text-center text-indigo-700">MSE /{maxMse}</TableHead>}
                  <TableHead className="w-28 text-center text-purple-700">ESE /{maxEse}</TableHead>
                  <TableHead className="w-20 text-center">Total /{maxTotal}</TableHead>
                  <TableHead className="w-20 text-center">Grade</TableHead>
                  <TableHead className="w-16 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const m = getMarkForStudent(s.id);
                  const key = `${s.id}_${selectedCourse}_${selectedSem}`;
                  const isEdited = !!editedMarks[key];
                  return (
                    <TableRow key={s.id} className={isEdited ? "bg-blue-50/50" : ""}>
                      <TableCell className="font-mono text-xs">{s.rollNo}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number" min={0} max={maxIsa}
                          value={m.isa}
                          onChange={(e) => updateMark(s.id, "isa", Math.min(maxIsa, parseInt(e.target.value) || 0))}
                          className="w-20 mx-auto text-center h-8 border-blue-200 focus:border-blue-400"
                        />
                      </TableCell>
                      {!isLab && (
                        <TableCell className="text-center">
                          <Input
                            type="number" min={0} max={maxMse}
                            value={m.mse}
                            onChange={(e) => updateMark(s.id, "mse", Math.min(maxMse, parseInt(e.target.value) || 0))}
                            className="w-20 mx-auto text-center h-8 border-indigo-200 focus:border-indigo-400"
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        <Input
                          type="number" min={0} max={maxEse}
                          value={m.ese}
                          onChange={(e) => updateMark(s.id, "ese", Math.min(maxEse, parseInt(e.target.value) || 0))}
                          className="w-20 mx-auto text-center h-8 border-purple-200 focus:border-purple-400"
                        />
                      </TableCell>
                      <TableCell className="text-center font-bold">{m.total}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={m.grade === "F" ? "destructive" : m.grade === "O" || m.grade === "A+" ? "default" : "outline"}>
                          {m.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {isEdited ? <span className="text-blue-600 text-xs font-medium">Modified</span>
                          : m.total > 0 ? <CheckCircle size={14} className="text-green-500 mx-auto" />
                          : <AlertTriangle size={14} className="text-amber-500 mx-auto" />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CSV Import Dialog */}
      <Dialog open={csvOpen} onOpenChange={setCsvOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Marks via CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <span>
                Format: StudentID, RollNo, ISA (max {maxIsa}){!isLab && `, MSE (max ${maxMse})`}, ESE (max {maxEse})
              </span>
              <Button variant="outline" size="sm" className="ml-auto shrink-0" onClick={downloadTemplate}>
                <Download size={12} className="mr-1" /> Template
              </Button>
            </div>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary"
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
              <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{csvFile ? csvFile.name : "Click to upload CSV file"}</p>
            </div>

            {csvPreview.length > 0 && (
              <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead className="text-blue-700">ISA</TableHead>
                      {!isLab && <TableHead className="text-indigo-700">MSE</TableHead>}
                      <TableHead className="text-purple-700">ESE</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvPreview.map((m, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{m.studentId}</TableCell>
                        <TableCell className="text-blue-700 font-medium">{m.isa}</TableCell>
                        {!isLab && <TableCell className="text-indigo-700 font-medium">{m.mse}</TableCell>}
                        <TableCell className="text-purple-700 font-medium">{m.ese}</TableCell>
                        <TableCell className="font-bold">{m.total}</TableCell>
                        <TableCell>
                          <Badge variant={m.grade === "F" ? "destructive" : "default"}>{m.grade}</Badge>
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
              Import {csvPreview.length} Records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

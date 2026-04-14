import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { BookOpen, Users, Search, Filter, Plus, FlaskConical, BookMarked } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/data/mockData";

const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"];

const THEORY_TEMPLATE: Partial<Course> = {
  courseType: "theory",
  maxIsa: 30,
  maxMse: 30,
  maxEse: 40,
  credits: 4,
};

const LAB_TEMPLATE: Partial<Course> = {
  courseType: "lab",
  maxIsa: 30,
  maxMse: undefined,
  maxEse: 70,
  credits: 2,
};

const EMPTY_FORM = {
  name: "", code: "", department: departments[0],
  year: "2", semester: "3", facultyId: "",
  credits: "4", description: "", courseType: "theory" as "theory" | "lab",
  maxIsa: "30", maxMse: "30", maxEse: "40",
};

export default function Courses() {
  const { user } = useAuth();
  const { students, faculty, courses, attendance, marks, addCourse } = useData();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [templateChosen, setTemplateChosen] = useState<"" | "theory" | "lab">("");
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const isAdmin = user?.role === "admin";
  const isFaculty = user?.role === "faculty";
  const isStudent = user?.role === "student";

  const fac = isFaculty ? faculty.find((f) => f.id === user?.id) ?? faculty[0] : null;
  const stu = isStudent ? students.find((s) => s.id === user?.id) ?? students[0] : null;

  const relevantCourses = isFaculty
    ? courses.filter((c) => fac?.assignedCourses.includes(c.id))
    : isStudent
    ? courses.filter((c) => stu?.enrolledCourses.includes(c.id))
    : courses;

  const filtered = relevantCourses.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || c.department === deptFilter;
    const matchYear = yearFilter === "all" || c.year === parseInt(yearFilter);
    return matchSearch && matchDept && matchYear;
  });

  const applyTemplate = (type: "theory" | "lab") => {
    const tpl = type === "theory" ? THEORY_TEMPLATE : LAB_TEMPLATE;
    setTemplateChosen(type);
    setForm((prev) => ({
      ...prev,
      courseType: type,
      maxIsa: String(tpl.maxIsa ?? 30),
      maxMse: tpl.maxMse !== undefined ? String(tpl.maxMse) : "",
      maxEse: String(tpl.maxEse ?? 40),
      credits: String(tpl.credits ?? (type === "lab" ? 2 : 4)),
    }));
  };

  const handleAddCourse = () => {
    if (!form.name || !form.code) return;
    const isLab = form.courseType === "lab";
    const newCourse: Course = {
      id: form.code,
      name: form.name,
      code: form.code,
      department: form.department,
      year: parseInt(form.year),
      semester: parseInt(form.semester),
      facultyId: form.facultyId || faculty[0]?.id,
      credits: parseInt(form.credits),
      description: form.description || `${form.name} course.`,
      courseType: form.courseType,
      maxIsa: parseInt(form.maxIsa) || 30,
      maxMse: isLab ? undefined : parseInt(form.maxMse) || 30,
      maxEse: parseInt(form.maxEse) || 40,
    };
    addCourse(newCourse);
    toast({ title: "Course Added!", description: `${form.name} (${form.code}) added successfully.` });
    setAddOpen(false);
    setForm({ ...EMPTY_FORM });
    setTemplateChosen("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} courses found</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={14} className="mr-2" /> Add Course
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search courses..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {!isStudent && (
              <>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="w-44">
                    <Filter size={14} className="mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {[1, 2, 3, 4].map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const courseFaculty = faculty.find((f) => f.id === c.facultyId);
          const enrolled = students.filter((s) => s.enrolledCourses.includes(c.id)).length;
          const avgMarks = marks.filter((m) => m.courseId === c.id && m.semester === 5);
          const avg = avgMarks.length ? avgMarks.reduce((a, m) => a + m.total, 0) / avgMarks.length : 0;
          const stuAtt = stu ? attendance.find((a) => a.studentId === stu.id && a.courseId === c.id) : null;
          const stuMark = stu ? marks.find((m) => m.studentId === stu.id && m.courseId === c.id) : null;
          const maxTotal = c.maxIsa + (c.maxMse ?? 0) + c.maxEse;
          const isLab = c.courseType === "lab";

          return (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isLab ? "bg-purple-100" : "bg-primary/10"}`}>
                    {isLab
                      ? <FlaskConical size={18} className="text-purple-600" />
                      : <BookOpen size={18} className="text-primary" />}
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {c.year === 1 ? "FY" : c.year === 2 ? "SY" : c.year === 3 ? "TY" : "BE"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">Sem {c.semester}</Badge>
                    {isLab && <Badge className="text-xs bg-purple-500 text-white">Lab</Badge>}
                  </div>
                </div>

                <h3 className="font-semibold text-sm">{c.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{c.code} • {c.credits} Credits</p>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Department</span>
                    <span className="text-foreground font-medium">{c.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Faculty</span>
                    <span className="text-foreground font-medium">{courseFaculty?.name ?? "TBD"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Users size={11} /> Students</span>
                    <span className="text-foreground font-medium">{enrolled}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Marks Structure</span>
                    <span className="text-foreground font-medium">
                      ISA:{c.maxIsa} {c.maxMse ? `+ MSE:${c.maxMse}` : ""} + ESE:{c.maxEse} = {maxTotal}
                    </span>
                  </div>
                  {!isStudent && (
                    <div className="flex items-center justify-between">
                      <span>Avg Marks</span>
                      <span className="text-foreground font-medium">{avg.toFixed(1)}/{maxTotal}</span>
                    </div>
                  )}
                  {stuAtt && (
                    <div className="flex items-center justify-between">
                      <span>Your Attendance</span>
                      <span className={`font-medium ${stuAtt.percentage < 75 ? "text-red-600" : "text-green-600"}`}>
                        {stuAtt.percentage}%
                      </span>
                    </div>
                  )}
                  {stuMark && (
                    <div className="flex items-center justify-between">
                      <span>Your Grade</span>
                      <Badge variant={stuMark.grade === "F" ? "destructive" : "default"} className="text-xs">
                        {stuMark.grade}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Course Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) { setTemplateChosen(""); setForm({ ...EMPTY_FORM }); } }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>Choose a template to prefill the marks structure</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Template Selector */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Course Template</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => applyTemplate("theory")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${templateChosen === "theory" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <BookMarked size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Theory Course</p>
                    <p className="text-xs text-muted-foreground">ISA + MSE + ESE</p>
                    <p className="text-xs text-muted-foreground">30 + 30 + 40 = 100</p>
                  </div>
                </button>
                <button
                  onClick={() => applyTemplate("lab")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${templateChosen === "lab" ? "border-purple-500 bg-purple-50" : "border-border hover:border-purple-300"}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <FlaskConical size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Lab Course</p>
                    <p className="text-xs text-muted-foreground">ISA + ESE (No MSE)</p>
                    <p className="text-xs text-muted-foreground">30 + 70 = 100</p>
                  </div>
                </button>
              </div>
            </div>

            {templateChosen && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <Label>Course Name</Label>
                  <Input
                    placeholder="e.g. Data Structures & Algorithms"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <Label>Course Code</Label>
                  <Input
                    placeholder="e.g. CRS011"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Credits</Label>
                  <Input
                    type="number" min={1} max={6}
                    value={form.credits}
                    onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Faculty</Label>
                  <Select value={form.facultyId} onValueChange={(v) => setForm((f) => ({ ...f, facultyId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Assign faculty" /></SelectTrigger>
                    <SelectContent>
                      {faculty.filter((f) => f.status === "active").map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Year</Label>
                  <Select value={form.year} onValueChange={(v) => setForm((f) => ({ ...f, year: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Semester</Label>
                  <Select value={form.semester} onValueChange={(v) => setForm((f) => ({ ...f, semester: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Marks Configuration */}
                <div className="col-span-2 border-t pt-3">
                  <Label className="text-sm font-medium mb-2 block">
                    Marks Configuration
                    <span className="text-xs text-muted-foreground font-normal ml-2">(editable per subject)</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-blue-700">ISA Max</Label>
                      <Input
                        type="number" min={0} max={100}
                        value={form.maxIsa}
                        onChange={(e) => setForm((f) => ({ ...f, maxIsa: e.target.value }))}
                        className="border-blue-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-indigo-700">MSE Max {form.courseType === "lab" && "(N/A)"}</Label>
                      <Input
                        type="number" min={0} max={100}
                        value={form.courseType === "lab" ? "—" : form.maxMse}
                        disabled={form.courseType === "lab"}
                        onChange={(e) => setForm((f) => ({ ...f, maxMse: e.target.value }))}
                        className={`border-indigo-200 ${form.courseType === "lab" ? "bg-muted text-muted-foreground" : ""}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-purple-700">ESE Max</Label>
                      <Input
                        type="number" min={0} max={100}
                        value={form.maxEse}
                        onChange={(e) => setForm((f) => ({ ...f, maxEse: e.target.value }))}
                        className="border-purple-200"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total max = {parseInt(form.maxIsa || "0") + (form.courseType === "lab" ? 0 : parseInt(form.maxMse || "0")) + parseInt(form.maxEse || "0")}
                  </p>
                </div>

                <div className="space-y-1 col-span-2">
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="Brief course description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setTemplateChosen(""); setForm({ ...EMPTY_FORM }); }}>
              Cancel
            </Button>
            <Button onClick={handleAddCourse} disabled={!templateChosen || !form.name || !form.code}>
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

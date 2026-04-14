import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/data/mockData";

const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"];
const divisions = ["A", "B", "C", "D"];

const EMPTY_FORM = {
  name: "", email: "", rollNo: "", dob: "", department: departments[0], division: divisions[0],
  year: "1", semester: "1", phone: "", address: ""
};

export default function AdminStudents() {
  const { students, courses, addStudent, updateStudent, deleteStudent, assignCourseToStudent, removeCourseFromStudent } = useData();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [divFilter, setDivFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const [addOpen, setAddOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [courseStudent, setCourseStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || s.department === deptFilter;
    const matchYear = yearFilter === "all" || s.year === parseInt(yearFilter);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchDiv = divFilter === "all" || s.division === divFilter;
    return matchSearch && matchDept && matchYear && matchStatus && matchDiv;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleAdd = () => {
    const newS: Student = {
      id: `STU${Date.now()}`,
      name: form.name,
      email: form.email,
      rollNo: form.rollNo,
      dob: form.dob,
      department: form.department,
      division: form.division,
      year: parseInt(form.year),
      semester: parseInt(form.semester),
      phone: form.phone,
      address: form.address,
      avatar: "",
      enrolledCourses: [],
      cgpa: 0,
      status: "active",
    };
    addStudent(newS);
    toast({ title: "Student Added", description: `${form.name} has been enrolled.` });
    setAddOpen(false);
    setForm({ ...EMPTY_FORM });
  };

  const handleEdit = () => {
    if (!editStudent) return;
    updateStudent(editStudent.id, {
      name: form.name, email: form.email, phone: form.phone,
      department: form.department, division: form.division,
      year: parseInt(form.year), semester: parseInt(form.semester),
    });
    toast({ title: "Student Updated" });
    setEditStudent(null);
  };

  const handleDelete = (id: string, name: string) => {
    deleteStudent(id);
    toast({ title: "Student Removed", description: `${name} has been removed.` });
  };

  const openEdit = (s: Student) => {
    setForm({
      name: s.name, email: s.email, rollNo: s.rollNo, dob: s.dob,
      department: s.department, division: s.division,
      year: String(s.year), semester: String(s.semester),
      phone: s.phone, address: s.address,
    });
    setEditStudent(s);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} students found</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={14} className="mr-2" /> Add Student
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, roll no, email..." className="pl-8" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={(v) => { setYearFilter(v); setPage(1); }}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {[1,2,3,4].map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={divFilter} onValueChange={(v) => { setDivFilter(v); setPage(1); }}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Division" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Div</SelectItem>
                {divisions.map((d) => <SelectItem key={d} value={d}>Div {d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year/Div</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.rollNo}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.email}</TableCell>
                    <TableCell className="text-sm">{s.department}</TableCell>
                    <TableCell className="text-sm">Y{s.year}/D{s.division}</TableCell>
                    <TableCell>
                      <span className={s.cgpa >= 8 ? "text-green-600 font-semibold" : s.cgpa < 6 ? "text-red-600 font-semibold" : "font-semibold"}>
                        {s.cgpa}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs">
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(s)}>
                            <Edit size={12} className="mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setCourseStudent(s)}>
                            <BookOpen size={12} className="mr-2" /> Manage Courses
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(s.id, s.name)}
                          >
                            <Trash2 size={12} className="mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm px-2">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Add/Edit Student Dialog */}
      {(addOpen || editStudent) && (
        <Dialog open={true} onOpenChange={() => { setAddOpen(false); setEditStudent(null); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2"><Label>Full Name</Label><Input placeholder="Student name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" placeholder="email@university.edu" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Roll Number</Label><Input placeholder="CS2001" value={form.rollNo} onChange={(e) => setForm((f) => ({ ...f, rollNo: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Phone</Label><Input placeholder="+91 9800000000" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Division</Label>
                <Select value={form.division} onValueChange={(v) => setForm((f) => ({ ...f, division: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{divisions.map((d) => <SelectItem key={d} value={d}>Division {d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Year</Label>
                <Select value={form.year} onValueChange={(v) => setForm((f) => ({ ...f, year: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1,2,3,4].map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Semester</Label>
                <Select value={form.semester} onValueChange={(v) => setForm((f) => ({ ...f, semester: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1 col-span-2"><Label>Address</Label><Input placeholder="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditStudent(null); }}>Cancel</Button>
              <Button onClick={editStudent ? handleEdit : handleAdd}>
                {editStudent ? "Save Changes" : "Add Student"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Courses Dialog */}
      {courseStudent && (
        <Dialog open={true} onOpenChange={() => setCourseStudent(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{courseStudent.name} — Manage Courses</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Enrolled Courses:</p>
              {courseStudent.enrolledCourses.map((cid) => {
                const course = courses.find((c) => c.id === cid);
                return course ? (
                  <div key={cid} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{course.name}</p>
                      <p className="text-xs text-muted-foreground">{course.code}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700"
                      onClick={() => { removeCourseFromStudent(courseStudent.id, cid); setCourseStudent(s => s ? { ...s, enrolledCourses: s.enrolledCourses.filter(c => c !== cid) } : null); }}>
                      Remove
                    </Button>
                  </div>
                ) : null;
              })}
              <p className="text-sm text-muted-foreground mt-2">Add Course:</p>
              {courses.filter((c) => !courseStudent.enrolledCourses.includes(c.id)).map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.code} • {c.department}</p>
                  </div>
                  <Button size="sm" variant="outline"
                    onClick={() => { assignCourseToStudent(courseStudent.id, c.id); setCourseStudent(s => s ? { ...s, enrolledCourses: [...s.enrolledCourses, c.id] } : null); }}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

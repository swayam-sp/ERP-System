import { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { Plus, Search, MoreVertical, Edit, Trash2, BookOpen, Info, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Faculty } from "@/data/mockData";

const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"];
const designations = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"];

const EMPTY_FORM = {
  name: "", email: "", employeeId: "", dob: "", department: departments[0],
  designation: designations[0], phone: "", specialization: "", joiningDate: ""
};

// FacultyFormFields is defined OUTSIDE the parent component to prevent re-mount focus loss
function FacultyFormFields({
  form,
  onChange,
}: {
  form: typeof EMPTY_FORM;
  onChange: (key: keyof typeof EMPTY_FORM, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1 col-span-2">
        <Label>Full Name</Label>
        <Input
          placeholder="Dr. John Smith"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          autoFocus
        />
      </div>
      <div className="space-y-1">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="name@university.edu"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label>Employee ID</Label>
        <Input
          placeholder="EMP1001"
          value={form.employeeId}
          onChange={(e) => onChange("employeeId", e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label>Date of Birth</Label>
        <Input
          type="date"
          value={form.dob}
          onChange={(e) => onChange("dob", e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label>Phone</Label>
        <Input
          placeholder="+91 9700000000"
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label>Department</Label>
        <Select value={form.department} onValueChange={(v) => onChange("department", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Designation</Label>
        <Select value={form.designation} onValueChange={(v) => onChange("designation", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {designations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Specialization</Label>
        <Input
          placeholder="e.g. Algorithms"
          value={form.specialization}
          onChange={(e) => onChange("specialization", e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label>Joining Date</Label>
        <Input
          type="date"
          value={form.joiningDate}
          onChange={(e) => onChange("joiningDate", e.target.value)}
        />
      </div>
    </div>
  );
}

export default function AdminFaculty() {
  const { faculty, courses, addFaculty, updateFaculty, deleteFaculty, assignCourseToFaculty } = useData();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [designFilter, setDesignFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [addOpen, setAddOpen] = useState(false);
  const [editFac, setEditFac] = useState<Faculty | null>(null);
  const [detailFac, setDetailFac] = useState<Faculty | null>(null);
  const [courseFac, setCourseFac] = useState<Faculty | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const handleFormChange = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const filtered = faculty.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || f.department === deptFilter;
    const matchDesign = designFilter === "all" || f.designation === designFilter;
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    return matchSearch && matchDept && matchDesign && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleAdd = () => {
    const newF: Faculty = {
      id: `FAC_${Date.now()}`,
      name: form.name, email: form.email, employeeId: form.employeeId,
      department: form.department, designation: form.designation,
      phone: form.phone, dob: form.dob, joiningDate: form.joiningDate,
      avatar: "", assignedCourses: [], specialization: form.specialization, status: "active",
    };
    addFaculty(newF);
    toast({ title: "Faculty Added", description: `${form.name} has been added.` });
    setAddOpen(false);
    setForm({ ...EMPTY_FORM });
  };

  const handleEdit = () => {
    if (!editFac) return;
    updateFaculty(editFac.id, {
      name: form.name, email: form.email, phone: form.phone,
      department: form.department, designation: form.designation,
      specialization: form.specialization, dob: form.dob, joiningDate: form.joiningDate,
    });
    toast({ title: "Faculty Updated" });
    setEditFac(null);
  };

  const openEdit = (f: Faculty) => {
    setForm({
      name: f.name, email: f.email, employeeId: f.employeeId, dob: f.dob,
      department: f.department, designation: f.designation, phone: f.phone,
      specialization: f.specialization, joiningDate: f.joiningDate,
    });
    setEditFac(f);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} faculty members found</p>
        </div>
        <Button onClick={() => { setForm({ ...EMPTY_FORM }); setAddOpen(true); }}>
          <Plus size={14} className="mr-2" /> Add Faculty
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, ID..."
                className="pl-8"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44">
                <Filter size={14} className="mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={designFilter} onValueChange={(v) => { setDesignFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {designations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
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
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.employeeId}</TableCell>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{f.email}</TableCell>
                    <TableCell className="text-sm">{f.department}</TableCell>
                    <TableCell className="text-sm">{f.designation}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{f.assignedCourses.length} courses</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={f.status === "active" ? "default" : "secondary"} className="text-xs">
                        {f.status}
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
                          <DropdownMenuItem onClick={() => setDetailFac(f)}>
                            <Info size={12} className="mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(f)}>
                            <Edit size={12} className="mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setCourseFac(f)}>
                            <BookOpen size={12} className="mr-2" /> Manage Courses
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => { deleteFaculty(f.id); toast({ title: "Faculty Removed" }); }}
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
          <span className="text-sm px-2">{page} / {Math.max(1, totalPages)}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Add Faculty Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Add New Faculty</DialogTitle></DialogHeader>
          <FacultyFormFields form={form} onChange={handleFormChange} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.email}>Add Faculty</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Faculty Dialog */}
      <Dialog open={!!editFac} onOpenChange={(o) => !o && setEditFac(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Faculty — {editFac?.name}</DialogTitle></DialogHeader>
          <FacultyFormFields form={form} onChange={handleFormChange} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFac(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      {detailFac && (
        <Dialog open={true} onOpenChange={() => setDetailFac(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Faculty Details — {detailFac.name}</DialogTitle></DialogHeader>
            <Tabs defaultValue="personal">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="dept">Department</TabsTrigger>
              </TabsList>
              <TabsContent value="personal" className="space-y-2 mt-3">
                {[
                  { label: "Employee ID", value: detailFac.employeeId },
                  { label: "Email", value: detailFac.email },
                  { label: "Phone", value: detailFac.phone },
                  { label: "Date of Birth", value: detailFac.dob },
                  { label: "Joining Date", value: detailFac.joiningDate },
                  { label: "Specialization", value: detailFac.specialization },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between py-2 border-b last:border-0">
                    <span className="text-muted-foreground text-sm">{f.label}</span>
                    <span className="font-medium text-sm">{f.value}</span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="courses" className="mt-3 space-y-2">
                {detailFac.assignedCourses.length === 0
                  ? <p className="text-muted-foreground text-center py-4">No courses assigned.</p>
                  : detailFac.assignedCourses.map((cid) => {
                    const course = courses.find((c) => c.id === cid);
                    return course ? (
                      <div key={cid} className="p-3 rounded-lg border">
                        <p className="font-medium text-sm">{course.name}</p>
                        <p className="text-xs text-muted-foreground">{course.code} • {course.credits} Credits • Sem {course.semester}</p>
                      </div>
                    ) : null;
                  })}
              </TabsContent>
              <TabsContent value="dept" className="mt-3 space-y-2">
                {[
                  { label: "Department", value: detailFac.department },
                  { label: "Designation", value: detailFac.designation },
                  { label: "Status", value: detailFac.status },
                  { label: "Total Courses", value: `${detailFac.assignedCourses.length} courses` },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between py-2 border-b last:border-0">
                    <span className="text-muted-foreground text-sm">{f.label}</span>
                    <span className="font-medium text-sm capitalize">{f.value}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Courses Dialog */}
      {courseFac && (
        <Dialog open={true} onOpenChange={() => setCourseFac(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{courseFac.name} — Assigned Courses</DialogTitle></DialogHeader>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              <p className="text-xs text-muted-foreground font-medium">Currently assigned:</p>
              {courseFac.assignedCourses.map((cid) => {
                const c = courses.find((cr) => cr.id === cid);
                return c ? (
                  <div key={cid} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.code}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{c.department}</Badge>
                  </div>
                ) : null;
              })}
              {courses.filter((c) => !courseFac.assignedCourses.includes(c.id)).length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground font-medium mt-3">Add course:</p>
                  {courses.filter((c) => !courseFac.assignedCourses.includes(c.id)).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.code} • {c.department}</p>
                      </div>
                      <Button size="sm" variant="outline"
                        onClick={() => {
                          assignCourseToFaculty(courseFac.id, c.id);
                          setCourseFac(f => f ? { ...f, assignedCourses: [...f.assignedCourses, c.id] } : null);
                        }}>
                        Assign
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

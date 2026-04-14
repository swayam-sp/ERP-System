import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { Plus, Search, Eye, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Assignment, Notification } from "@/data/mockData";

export default function FacultyAssignments() {
  const { user } = useAuth();
  const { faculty, students, courses, assignments, addAssignment, addNotification } = useData();
  const { toast } = useToast();
  const fac = faculty.find((f) => f.id === user?.id) ?? faculty[0];

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewSubmissions, setViewSubmissions] = useState<Assignment | null>(null);
  const [form, setForm] = useState({
    title: "", courseId: fac.assignedCourses[0] ?? "",
    description: "", dueDate: "", maxMarks: "20"
  });

  const myAssignments = assignments.filter((a) => fac.assignedCourses.includes(a.courseId));
  const myCourses = courses.filter((c) => fac.assignedCourses.includes(c.id));

  const filtered = myAssignments.filter((a) => {
    const course = courses.find((c) => c.id === a.courseId);
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      course?.name.toLowerCase().includes(search.toLowerCase()) || false;
    const matchCourse = courseFilter === "all" || a.courseId === courseFilter;
    return matchSearch && matchCourse;
  });

  const handleCreate = () => {
    if (!form.title || !form.courseId || !form.dueDate) return;
    const newA: Assignment = {
      id: `ASN_${Date.now()}`,
      title: form.title,
      courseId: form.courseId,
      description: form.description,
      dueDate: form.dueDate,
      maxMarks: parseInt(form.maxMarks),
      createdBy: fac.id,
      createdAt: new Date().toISOString().split("T")[0],
      submissions: [],
    };
    addAssignment(newA);

    // Auto-notify students about the new assignment
    const courseName = courses.find((c) => c.id === form.courseId)?.name ?? form.courseId;
    const notif: Notification = {
      id: `NOTIF_ASN_${Date.now()}`,
      title: `New Assignment: ${form.title}`,
      message: `${fac.name} has posted a new assignment "${form.title}" for ${courseName}. Due date: ${form.dueDate}. Max marks: ${form.maxMarks}.`,
      type: "info",
      date: new Date().toISOString().split("T")[0],
      read: false,
      targetRole: "student",
    };
    addNotification(notif);

    toast({ title: "Assignment Created!", description: `"${form.title}" added and students notified.` });
    setCreateOpen(false);
    setForm({ title: "", courseId: fac.assignedCourses[0] ?? "", description: "", dueDate: "", maxMarks: "20" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground text-sm">Manage and view student assignment submissions</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={14} className="mr-2" /> Create Assignment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: myAssignments.length, color: "text-blue-600" },
          { label: "Total Submissions", value: myAssignments.reduce((a, x) => a + x.submissions.length, 0), color: "text-green-600" },
          { label: "Pending Grading", value: myAssignments.reduce((a, x) => a + x.submissions.filter(s => s.status === "submitted").length, 0), color: "text-orange-600" },
          { label: "Graded", value: myAssignments.reduce((a, x) => a + x.submissions.filter(s => s.status === "graded").length, 0), color: "text-purple-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search assignments..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-52"><SelectValue placeholder="All Courses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {myCourses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a) => {
          const course = courses.find((c) => c.id === a.courseId);
          const submitted = a.submissions.length;
          const graded = a.submissions.filter(s => s.status === "graded").length;
          return (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{course?.name} • {course?.code}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{a.maxMarks} Marks</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{a.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>Due: {a.dueDate}</span>
                    </div>
                    <span>{submitted} submitted • {graded} graded</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setViewSubmissions(a)}>
                    <Eye size={12} className="mr-1" /> View
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Assignment Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                placeholder="Assignment title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label>Course</Label>
              <Select value={form.courseId} onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {myCourses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Assignment instructions..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Max Marks</Label>
                <Input
                  type="number"
                  value={form.maxMarks}
                  onChange={(e) => setForm((f) => ({ ...f, maxMarks: e.target.value }))}
                />
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              Students will be automatically notified when this assignment is created.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title || !form.courseId || !form.dueDate}>
              Create & Notify Students
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Submissions Dialog */}
      {viewSubmissions && (
        <Dialog open={true} onOpenChange={() => setViewSubmissions(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{viewSubmissions.title} — Submissions</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="submitted">
              <TabsList>
                <TabsTrigger value="submitted">Submitted ({viewSubmissions.submissions.filter(s => s.status !== "graded").length})</TabsTrigger>
                <TabsTrigger value="graded">Graded ({viewSubmissions.submissions.filter(s => s.status === "graded").length})</TabsTrigger>
              </TabsList>
              <TabsContent value="submitted" className="max-h-64 overflow-y-auto space-y-2 mt-2">
                {viewSubmissions.submissions.filter(s => s.status !== "graded").map((sub) => {
                  const stu = students.find((s) => s.id === sub.studentId);
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{stu?.name ?? sub.studentId}</p>
                        <p className="text-xs text-muted-foreground">{sub.fileName} • {sub.submittedAt}</p>
                      </div>
                      <Badge variant={sub.status === "late" ? "destructive" : "outline"} className="text-xs capitalize">{sub.status}</Badge>
                    </div>
                  );
                })}
              </TabsContent>
              <TabsContent value="graded" className="max-h-64 overflow-y-auto space-y-2 mt-2">
                {viewSubmissions.submissions.filter(s => s.status === "graded").map((sub) => {
                  const stu = students.find((s) => s.id === sub.studentId);
                  return (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{stu?.name ?? sub.studentId}</p>
                        <p className="text-xs text-muted-foreground">{sub.feedback}</p>
                      </div>
                      <Badge variant="default" className="text-xs">{sub.marks}/{viewSubmissions.maxMarks}</Badge>
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

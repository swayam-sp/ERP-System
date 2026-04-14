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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Upload, FileText, Search, Filter, CheckCircle, Clock, AlertTriangle, Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { AssignmentSubmission } from "@/data/mockData";

export default function StudentAssignments() {
  const { user } = useAuth();
  const { students, courses, assignments, submitAssignment } = useData();
  const { toast } = useToast();
  const student = students.find((s) => s.id === user?.id) ?? students[0];

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const myAssignments = assignments.filter((a) => student.enrolledCourses.includes(a.courseId));

  const filtered = myAssignments.filter((a) => {
    const course = courses.find((c) => c.id === a.courseId);
    const submitted = a.submissions.some((s) => s.studentId === student.id);
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      course?.name.toLowerCase().includes(search.toLowerCase()) || false;
    const matchCourse = courseFilter === "all" || a.courseId === courseFilter;
    const matchStatus = statusFilter === "all" ||
      (statusFilter === "submitted" && submitted) ||
      (statusFilter === "pending" && !submitted);
    return matchSearch && matchCourse && matchStatus;
  });

  const handleUpload = async () => {
    if (!selectedAssignment || !file) return;
    setUploading(true);
    await new Promise((r) => setTimeout(r, 800));
    const sub: AssignmentSubmission = {
      id: `SUB_${Date.now()}`,
      studentId: student.id,
      assignmentId: selectedAssignment,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(0)} KB`,
      submittedAt: new Date().toISOString().split("T")[0],
      status: "submitted",
    };
    submitAssignment(selectedAssignment, sub);
    toast({ title: "Assignment Submitted!", description: `${file.name} uploaded successfully.` });
    setUploadOpen(false);
    setFile(null);
    setSelectedAssignment(null);
    setUploading(false);
  };

  const openUpload = (id: string) => {
    setSelectedAssignment(id);
    setUploadOpen(true);
  };

  const getStatus = (a: typeof assignments[0]) => {
    const sub = a.submissions.find((s) => s.studentId === student.id);
    if (!sub) {
      const due = new Date(a.dueDate);
      return new Date() > due ? "overdue" : "pending";
    }
    return sub.status;
  };

  const statusConfig = {
    submitted: { label: "Submitted", color: "default", icon: <CheckCircle size={12} /> },
    graded: { label: "Graded", color: "secondary", icon: <CheckCircle size={12} /> },
    pending: { label: "Pending", color: "outline", icon: <Clock size={12} /> },
    overdue: { label: "Overdue", color: "destructive", icon: <AlertTriangle size={12} /> },
    late: { label: "Late", color: "secondary", icon: <AlertTriangle size={12} /> },
  };

  const myCourses = student.enrolledCourses.map((id) => courses.find((c) => c.id === id)).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground text-sm">View and submit your assignments</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload size={16} className="mr-2" /> Upload Assignment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: myAssignments.length, color: "text-blue-600" },
          { label: "Pending", value: myAssignments.filter((a) => getStatus(a) === "pending").length, color: "text-orange-600" },
          { label: "Submitted", value: myAssignments.filter((a) => getStatus(a) === "submitted" || getStatus(a) === "graded").length, color: "text-green-600" },
          { label: "Overdue", value: myAssignments.filter((a) => getStatus(a) === "overdue").length, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search assignments..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-48">
                <Filter size={14} className="mr-2" />
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {myCourses.map((c) => c && <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignment List */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No assignments found.</div>
        ) : (
          filtered.map((a) => {
            const course = courses.find((c) => c.id === a.courseId);
            const status = getStatus(a);
            const sub = a.submissions.find((s) => s.studentId === student.id);
            const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.pending;

            return (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{a.title}</h3>
                        <p className="text-sm text-muted-foreground">{course?.name} ({course?.code})</p>
                        <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          <span>Due: <span className="font-medium text-foreground">{a.dueDate}</span></span>
                          <span>Max Marks: <span className="font-medium text-foreground">{a.maxMarks}</span></span>
                          {sub?.marks && <span>Marks: <span className="font-semibold text-green-600">{sub.marks}/{a.maxMarks}</span></span>}
                        </div>
                        {sub && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <FileText size={12} />
                            <span>{sub.fileName}</span>
                            <span>•</span>
                            <span>{sub.submittedAt}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={cfg.color as any} className="flex items-center gap-1">
                        {cfg.icon} {cfg.label}
                      </Badge>
                      {(status === "pending" || status === "overdue") && (
                        <Button size="sm" onClick={() => openUpload(a.id)}>
                          <Upload size={14} className="mr-1" /> Submit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Select Assignment</Label>
              <Select value={selectedAssignment ?? ""} onValueChange={setSelectedAssignment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an assignment" />
                </SelectTrigger>
                <SelectContent>
                  {myAssignments
                    .filter((a) => !a.submissions.some((s) => s.studentId === student.id))
                    .map((a) => {
                      const course = courses.find((c) => c.id === a.courseId);
                      return (
                        <SelectItem key={a.id} value={a.id}>
                          {a.title} — {course?.code}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Upload File</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  file ? "border-green-400 bg-green-50" : "border-border hover:border-primary hover:bg-primary/5"
                )}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.zip,.rar"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={24} className="text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm text-green-700">{file.name}</p>
                      <p className="text-xs text-green-600">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to browse or drag and drop</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">PDF, DOC, DOCX, ZIP (max 10MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!selectedAssignment || !file || uploading}>
              {uploading ? "Uploading..." : "Submit Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

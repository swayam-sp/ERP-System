import { createContext, useContext, useState, ReactNode } from "react";
import {
  mockStudents, mockFaculty, mockCourses, mockAssignments, mockMarks, mockAttendance, mockNotifications,
  semesterResultsPublished,
  type Student, type Faculty, type Course, type Assignment, type AssignmentSubmission,
  type Marks, type AttendanceRecord, type Notification,
} from "@/data/mockData";

interface DataContextType {
  students: Student[];
  faculty: Faculty[];
  courses: Course[];
  assignments: Assignment[];
  marks: Marks[];
  attendance: AttendanceRecord[];
  notifications: Notification[];
  publishedSemesters: Record<string, boolean>;

  addStudent: (s: Student) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addFaculty: (f: Faculty) => void;
  updateFaculty: (id: string, data: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;

  addCourse: (c: Course) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;

  addAssignment: (a: Assignment) => void;
  submitAssignment: (assignmentId: string, submission: AssignmentSubmission) => void;

  updateMarks: (m: Marks) => void;
  bulkUpdateMarks: (newMarks: Marks[]) => void;

  updateAttendance: (record: AttendanceRecord) => void;
  bulkUpdateAttendance: (records: AttendanceRecord[]) => void;

  togglePublishSemester: (semKey: string) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (n: Notification) => void;

  assignCourseToFaculty: (facultyId: string, courseId: string) => void;
  assignCourseToStudent: (studentId: string, courseId: string) => void;
  removeCourseFromStudent: (studentId: string, courseId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [faculty, setFaculty] = useState<Faculty[]>(mockFaculty);
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [marks, setMarks] = useState<Marks[]>(mockMarks);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [publishedSemesters, setPublishedSemesters] = useState<Record<string, boolean>>(semesterResultsPublished);

  const addStudent = (s: Student) => setStudents((prev) => [...prev, s]);
  const updateStudent = (id: string, data: Partial<Student>) =>
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  const deleteStudent = (id: string) => setStudents((prev) => prev.filter((s) => s.id !== id));

  const addFaculty = (f: Faculty) => setFaculty((prev) => [...prev, f]);
  const updateFaculty = (id: string, data: Partial<Faculty>) =>
    setFaculty((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  const deleteFaculty = (id: string) => setFaculty((prev) => prev.filter((f) => f.id !== id));

  const addCourse = (c: Course) => setCourses((prev) => [...prev, c]);
  const updateCourse = (id: string, data: Partial<Course>) =>
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));

  const addAssignment = (a: Assignment) => setAssignments((prev) => [...prev, a]);
  const submitAssignment = (assignmentId: string, submission: AssignmentSubmission) =>
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignmentId ? { ...a, submissions: [...a.submissions, submission] } : a
      )
    );

  const updateMarks = (m: Marks) =>
    setMarks((prev) => {
      const idx = prev.findIndex((x) => x.studentId === m.studentId && x.courseId === m.courseId && x.semester === m.semester);
      if (idx >= 0) { const updated = [...prev]; updated[idx] = m; return updated; }
      return [...prev, m];
    });

  const bulkUpdateMarks = (newMarks: Marks[]) => {
    setMarks((prev) => {
      const updated = [...prev];
      newMarks.forEach((nm) => {
        const idx = updated.findIndex((x) => x.studentId === nm.studentId && x.courseId === nm.courseId && x.semester === nm.semester);
        if (idx >= 0) updated[idx] = nm;
        else updated.push(nm);
      });
      return updated;
    });
  };

  const updateAttendance = (record: AttendanceRecord) =>
    setAttendance((prev) => {
      const idx = prev.findIndex((x) => x.studentId === record.studentId && x.courseId === record.courseId);
      if (idx >= 0) { const updated = [...prev]; updated[idx] = record; return updated; }
      return [...prev, record];
    });

  const bulkUpdateAttendance = (records: AttendanceRecord[]) => {
    setAttendance((prev) => {
      const updated = [...prev];
      records.forEach((r) => {
        const idx = updated.findIndex((x) => x.studentId === r.studentId && x.courseId === r.courseId);
        if (idx >= 0) updated[idx] = r;
        else updated.push(r);
      });
      return updated;
    });
  };

  const togglePublishSemester = (semKey: string) =>
    setPublishedSemesters((prev) => ({ ...prev, [semKey]: !prev[semKey] }));

  const markNotificationRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const addNotification = (n: Notification) =>
    setNotifications((prev) => [n, ...prev]);

  const assignCourseToFaculty = (facultyId: string, courseId: string) =>
    setFaculty((prev) =>
      prev.map((f) =>
        f.id === facultyId && !f.assignedCourses.includes(courseId)
          ? { ...f, assignedCourses: [...f.assignedCourses, courseId] } : f
      )
    );

  const assignCourseToStudent = (studentId: string, courseId: string) =>
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId && !s.enrolledCourses.includes(courseId)
          ? { ...s, enrolledCourses: [...s.enrolledCourses, courseId] } : s
      )
    );

  const removeCourseFromStudent = (studentId: string, courseId: string) =>
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, enrolledCourses: s.enrolledCourses.filter((c) => c !== courseId) } : s
      )
    );

  return (
    <DataContext.Provider value={{
      students, faculty, courses, assignments, marks, attendance, notifications, publishedSemesters,
      addStudent, updateStudent, deleteStudent,
      addFaculty, updateFaculty, deleteFaculty,
      addCourse, updateCourse,
      addAssignment, submitAssignment,
      updateMarks, bulkUpdateMarks,
      updateAttendance, bulkUpdateAttendance,
      togglePublishSemester, markNotificationRead, addNotification,
      assignCourseToFaculty, assignCourseToStudent, removeCourseFromStudent,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

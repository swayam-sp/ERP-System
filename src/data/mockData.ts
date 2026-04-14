export type Role = "student" | "faculty" | "admin";

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  dob: string;
  department: string;
  division: string;
  year: number;
  semester: number;
  phone: string;
  address: string;
  avatar: string;
  enrolledCourses: string[];
  cgpa: number;
  status: "active" | "inactive";
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  dob: string;
  joiningDate: string;
  avatar: string;
  assignedCourses: string[];
  specialization: string;
  status: "active" | "inactive";
}

export interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  year: number;
  semester: number;
  facultyId: string;
  credits: number;
  description: string;
  courseType: "theory" | "lab";
  maxIsa: number;
  maxMse?: number;   // undefined = no MSE (lab courses)
  maxEse: number;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  createdBy: string;
  createdAt: string;
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  studentId: string;
  assignmentId: string;
  fileName: string;
  fileSize: string;
  submittedAt: string;
  status: "submitted" | "graded" | "late";
  marks?: number;
  feedback?: string;
}

export interface Marks {
  studentId: string;
  courseId: string;
  semester: number;
  isa: number;
  mse: number;
  ese: number;
  total: number;
  grade: string;
}

export interface AttendanceRecord {
  studentId: string;
  courseId: string;
  totalClasses: number;
  attended: number;
  percentage: number;
  monthly: { month: string; attended: number; total: number }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  date: string;
  read: boolean;
  targetRole: Role | "all";
}

const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"];
const divisions = ["A", "B", "C", "D"];

export function gradeCalc(isa: number, mse: number, ese: number, course: Course): string {
  const maxTotal = course.maxIsa + (course.maxMse ?? 0) + course.maxEse;
  if (maxTotal === 0) return "F";
  const pct = ((isa + mse + ese) / maxTotal) * 100;
  if (pct >= 90) return "O";
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B+";
  if (pct >= 50) return "B";
  if (pct >= 40) return "C";
  if (pct >= 35) return "D";
  return "F";
}

export function gradeCalcByPct(pct: number): string {
  if (pct >= 90) return "O";
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B+";
  if (pct >= 50) return "B";
  if (pct >= 40) return "C";
  if (pct >= 35) return "D";
  return "F";
}

const generateStudents = (): Student[] => {
  const firstNames = ["Arjun", "Priya", "Rahul", "Sneha", "Vikram", "Anjali", "Rohit", "Kavya", "Amit", "Pooja",
    "Nikhil", "Deepika", "Sachin", "Meera", "Rajesh", "Sita", "Aakash", "Neha", "Suresh", "Divya",
    "Karthik", "Swathi", "Naveen", "Riya", "Harish", "Lakshmi", "Ganesh", "Prathima", "Vivek", "Chandana"];
  const lastNames = ["Sharma", "Patel", "Kumar", "Singh", "Verma", "Nair", "Reddy", "Iyer", "Joshi", "Mehta",
    "Rao", "Gupta", "Malhotra", "Khanna", "Bhatia", "Shah", "Chopra", "Desai", "Pillai", "Naidu"];
  const students: Student[] = [];
  for (let i = 1; i <= 80; i++) {
    const dept = departments[i % departments.length];
    const year = (i % 4) + 1;
    const sem = year * 2 - (i % 2);
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    students.push({
      id: `STU${String(i).padStart(4, "0")}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@university.edu`,
      rollNo: `${dept.slice(0, 2).toUpperCase()}${year}${String(i).padStart(3, "0")}`,
      dob: `${1998 + (i % 5)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      department: dept,
      division: divisions[i % divisions.length],
      year,
      semester: sem,
      phone: `+91 ${9800000000 + i}`,
      address: `${i * 12} University Road, Campus Area`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}${lastName}`,
      enrolledCourses: [`CRS${String((i % 8) + 1).padStart(3, "0")}`, `CRS${String((i % 8) + 2).padStart(3, "0")}`, `CRS${String((i % 8) + 3).padStart(3, "0")}`],
      cgpa: parseFloat((6.5 + (i % 35) * 0.1).toFixed(2)),
      status: i % 15 === 0 ? "inactive" : "active",
    });
  }
  return students;
};

const generateFaculty = (): Faculty[] => {
  const names = [
    { first: "Dr. Anil", last: "Kumar" }, { first: "Prof. Sunita", last: "Sharma" },
    { first: "Dr. Ramesh", last: "Verma" }, { first: "Prof. Lakshmi", last: "Nair" },
    { first: "Dr. Suresh", last: "Patel" }, { first: "Prof. Kavitha", last: "Reddy" },
    { first: "Dr. Vijay", last: "Singh" }, { first: "Prof. Meenakshi", last: "Iyer" },
    { first: "Dr. Prakash", last: "Rao" }, { first: "Prof. Geeta", last: "Joshi" },
    { first: "Dr. Mohan", last: "Gupta" }, { first: "Prof. Rekha", last: "Shah" },
    { first: "Dr. Krishnan", last: "Pillai" }, { first: "Prof. Usha", last: "Desai" },
    { first: "Dr. Sanjay", last: "Mehta" },
  ];
  const designations = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"];
  return names.map((n, i) => ({
    id: `FAC${String(i + 1).padStart(3, "0")}`,
    name: `${n.first} ${n.last}`,
    email: `${n.first.replace("Dr. ", "").replace("Prof. ", "").toLowerCase()}.${n.last.toLowerCase()}@university.edu`,
    employeeId: `EMP${String(i + 1001).padStart(4, "0")}`,
    department: departments[i % departments.length],
    designation: designations[i % designations.length],
    phone: `+91 ${9700000000 + i}`,
    dob: `${1965 + (i % 20)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    joiningDate: `${2005 + (i % 15)}-${String((i % 12) + 1).padStart(2, "0")}-01`,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${n.first}${n.last}`,
    assignedCourses: [`CRS${String((i % 8) + 1).padStart(3, "0")}`, `CRS${String((i % 8) + 2).padStart(3, "0")}`],
    specialization: ["Algorithms", "Networks", "VLSI", "Thermodynamics", "Structures"][i % 5],
    status: i === 12 ? "inactive" : "active",
  }));
};

const generateCourses = (): Course[] => {
  const courseData: Array<{
    name: string; code: string; dept: string; year: number; sem: number;
    fac: string; credits: number; courseType: "theory" | "lab";
    maxIsa: number; maxMse?: number; maxEse: number;
  }> = [
    { name: "Data Structures & Algorithms", code: "CRS001", dept: "Computer Science", year: 2, sem: 3, fac: "FAC001", credits: 4, courseType: "theory", maxIsa: 30, maxMse: 30, maxEse: 40 },
    { name: "Database Management Systems", code: "CRS002", dept: "Computer Science", year: 2, sem: 4, fac: "FAC002", credits: 4, courseType: "theory", maxIsa: 30, maxMse: 30, maxEse: 40 },
    { name: "Computer Networks", code: "CRS003", dept: "Computer Science", year: 3, sem: 5, fac: "FAC003", credits: 3, courseType: "theory", maxIsa: 30, maxMse: 30, maxEse: 40 },
    { name: "Operating Systems", code: "CRS004", dept: "Computer Science", year: 3, sem: 6, fac: "FAC004", credits: 4, courseType: "theory", maxIsa: 30, maxMse: 30, maxEse: 40 },
    { name: "Software Engineering", code: "CRS005", dept: "Information Technology", year: 3, sem: 5, fac: "FAC005", credits: 3, courseType: "theory", maxIsa: 30, maxMse: 30, maxEse: 40 },
    { name: "Web Technologies Lab", code: "CRS006", dept: "Information Technology", year: 2, sem: 4, fac: "FAC006", credits: 3, courseType: "lab", maxIsa: 30, maxEse: 70 },
    { name: "Digital Electronics", code: "CRS007", dept: "Electronics", year: 2, sem: 3, fac: "FAC007", credits: 4, courseType: "theory", maxIsa: 30, maxMse: 30, maxEse: 40 },
    { name: "Signal Processing Lab", code: "CRS008", dept: "Electronics", year: 3, sem: 5, fac: "FAC008", credits: 3, courseType: "lab", maxIsa: 30, maxEse: 70 },
    { name: "Thermodynamics", code: "CRS009", dept: "Mechanical", year: 2, sem: 3, fac: "FAC009", credits: 4, courseType: "theory", maxIsa: 30, maxMse: 30, maxEse: 40 },
    { name: "Fluid Mechanics", code: "CRS010", dept: "Mechanical", year: 3, sem: 5, fac: "FAC010", credits: 3, courseType: "theory", maxIsa: 30, maxMse: 30, maxEse: 40 },
  ];
  return courseData.map((c) => ({
    id: c.code,
    name: c.name,
    code: c.code,
    department: c.dept,
    year: c.year,
    semester: c.sem,
    facultyId: c.fac,
    credits: c.credits,
    description: `Comprehensive study of ${c.name} concepts and applications.`,
    courseType: c.courseType,
    maxIsa: c.maxIsa,
    maxMse: c.maxMse,
    maxEse: c.maxEse,
  }));
};

const generateAssignments = (): Assignment[] => {
  const titles = ["Unit Test 1", "Project Submission", "Lab Report", "Case Study", "Mini Project", "Research Paper"];
  return Array.from({ length: 20 }, (_, i) => ({
    id: `ASN${String(i + 1).padStart(3, "0")}`,
    title: `${titles[i % titles.length]} - ${i + 1}`,
    courseId: `CRS${String((i % 10) + 1).padStart(3, "0")}`,
    description: `Complete the ${titles[i % titles.length]} as per the given guidelines and submit before due date.`,
    dueDate: `2025-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
    maxMarks: [10, 20, 25, 50][i % 4],
    createdBy: `FAC${String((i % 10) + 1).padStart(3, "0")}`,
    createdAt: `2025-0${(i % 9) + 1}-01`,
    submissions: Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, j) => ({
      id: `SUB${i}${j}`,
      studentId: `STU${String((j + 1) * (i + 1)).padStart(4, "0")}`,
      assignmentId: `ASN${String(i + 1).padStart(3, "0")}`,
      fileName: `assignment_${j + 1}.pdf`,
      fileSize: `${(j + 1) * 256} KB`,
      submittedAt: `2025-0${(i % 9) + 1}-${String((j % 20) + 1).padStart(2, "0")}`,
      status: ["submitted", "graded", "late"][j % 3] as "submitted" | "graded" | "late",
      marks: j % 3 === 1 ? Math.floor(Math.random() * 20) + 5 : undefined,
      feedback: j % 3 === 1 ? "Good work! Keep it up." : undefined,
    })),
  }));
};

const rng = (seed: number, min: number, max: number) => min + (seed * 1009 % (max - min + 1));

const generateMarks = (): Marks[] => {
  const marks: Marks[] = [];
  const courses = generateCourses();
  // Generate marks for semesters 3, 4, and 5
  for (let si = 1; si <= 80; si++) {
    for (let ci = 1; ci <= 3; ci++) {
      const course = courses.find((c) => c.id === `CRS${String(ci).padStart(3, "0")}`);
      if (!course) continue;
      for (const sem of [3, 4, 5]) {
        const seed = si * 100 + ci * 10 + sem;
        const maxIsa = course.maxIsa;
        const maxMse = course.maxMse ?? 0;
        const maxEse = course.maxEse;
        const isa = rng(seed + 1, Math.floor(maxIsa * 0.4), Math.floor(maxIsa * 0.9));
        const mse = maxMse > 0 ? rng(seed + 2, Math.floor(maxMse * 0.4), Math.floor(maxMse * 0.9)) : 0;
        const ese = rng(seed + 3, Math.floor(maxEse * 0.4), Math.floor(maxEse * 0.9));
        const total = isa + mse + ese;
        const maxTotal = maxIsa + maxMse + maxEse;
        const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
        marks.push({
          studentId: `STU${String(si).padStart(4, "0")}`,
          courseId: `CRS${String(ci).padStart(3, "0")}`,
          semester: sem,
          isa, mse, ese, total,
          grade: gradeCalcByPct(pct),
        });
      }
    }
  }
  return marks;
};

const generateAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  for (let si = 1; si <= 80; si++) {
    for (let ci = 1; ci <= 3; ci++) {
      const total = 60;
      const attended = rng(si * 7 + ci * 3, 40, 60);
      records.push({
        studentId: `STU${String(si).padStart(4, "0")}`,
        courseId: `CRS${String(ci).padStart(3, "0")}`,
        totalClasses: total,
        attended,
        percentage: parseFloat(((attended / total) * 100).toFixed(1)),
        monthly: [
          { month: "Jan", attended: rng(si + ci + 1, 8, 12), total: 12 },
          { month: "Feb", attended: rng(si + ci + 2, 7, 12), total: 12 },
          { month: "Mar", attended: rng(si + ci + 3, 8, 12), total: 12 },
          { month: "Apr", attended: rng(si + ci + 4, 6, 12), total: 12 },
          { month: "May", attended: rng(si + ci + 5, 6, 12), total: 12 },
        ],
      });
    }
  }
  return records;
};

const generateNotifications = (): Notification[] => [
  { id: "N001", title: "Semester Results Published", message: "Semester 5 results are now available. Check your exam portal.", type: "success", date: "2025-01-15", read: false, targetRole: "student" },
  { id: "N002", title: "Assignment Deadline Extended", message: "DSA Assignment 2 deadline extended to Jan 25.", type: "info", date: "2025-01-14", read: false, targetRole: "all" },
  { id: "N003", title: "Attendance Warning", message: "Your attendance in Networks is below 75%. Attend classes to avoid de-registration.", type: "warning", date: "2025-01-13", read: true, targetRole: "student" },
  { id: "N004", title: "Marks Submission Reminder", message: "Please submit internal marks for Semester 6 by Jan 20.", type: "warning", date: "2025-01-12", read: false, targetRole: "faculty" },
  { id: "N005", title: "New Student Enrollments", message: "15 new students have been added to your courses.", type: "info", date: "2025-01-11", read: true, targetRole: "faculty" },
  { id: "N006", title: "System Maintenance", message: "ERP portal will be down for maintenance on Jan 20 from 2-4 AM.", type: "info", date: "2025-01-10", read: false, targetRole: "all" },
  { id: "N007", title: "Fee Payment Reminder", message: "Last date for semester fee payment is Jan 31.", type: "warning", date: "2025-01-09", read: false, targetRole: "student" },
  { id: "N008", title: "Faculty Meeting", message: "Department faculty meeting scheduled for Jan 18 at 10 AM.", type: "info", date: "2025-01-08", read: true, targetRole: "faculty" },
];

export const mockStudents = generateStudents();
export const mockFaculty = generateFaculty();
export const mockCourses = generateCourses();
export const mockAssignments = generateAssignments();
export const mockMarks = generateMarks();
export const mockAttendance = generateAttendance();
export const mockNotifications = generateNotifications();

export const semesterResultsPublished: Record<string, boolean> = {
  "sem5": false,
  "sem4": true,
  "sem3": true,
};

export const mockUsers: { email: string; password: string; role: Role; id: string }[] = [
  { email: "student@university.edu", password: "student123", role: "student", id: "STU0001" },
  { email: "faculty@university.edu", password: "faculty123", role: "faculty", id: "FAC001" },
  { email: "admin@university.edu", password: "admin123", role: "admin", id: "ADMIN001" },
];

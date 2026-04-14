import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Calendar, Hash, Building, BookOpen, Lock, Briefcase } from "lucide-react";

export default function FacultyProfile() {
  const { user } = useAuth();
  const { faculty, courses, students } = useData();
  const fac = faculty.find((f) => f.id === user?.id) ?? faculty[0];
  const myCourses = courses.filter((c) => fac.assignedCourses.includes(c.id));
  const myStudents = students.filter((s) => fac.assignedCourses.some((cid) => s.enrolledCourses.includes(cid)));

  const fields = [
    { icon: <Hash size={14} />, label: "Employee ID", value: fac.employeeId },
    { icon: <User size={14} />, label: "Full Name", value: fac.name },
    { icon: <Mail size={14} />, label: "Email ID", value: fac.email },
    { icon: <Calendar size={14} />, label: "Date of Birth", value: fac.dob },
    { icon: <Phone size={14} />, label: "Phone", value: fac.phone },
    { icon: <Building size={14} />, label: "Department", value: fac.department },
    { icon: <Briefcase size={14} />, label: "Designation", value: fac.designation },
    { icon: <BookOpen size={14} />, label: "Specialization", value: fac.specialization },
    { icon: <Calendar size={14} />, label: "Joining Date", value: fac.joiningDate },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm">Your faculty profile information</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <Lock size={14} />
          <span>Profile is read-only. Contact admin for changes.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarFallback className="bg-green-600 text-white text-2xl">
                {fac.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-bold">{fac.name}</h2>
            <p className="text-muted-foreground text-sm">{fac.designation}</p>
            <p className="text-muted-foreground text-xs">{fac.department}</p>
            <Badge className="mt-2" variant={fac.status === "active" ? "default" : "secondary"}>
              {fac.status === "active" ? "Active Faculty" : "Inactive"}
            </Badge>

            <Separator className="my-4 w-full" />

            <div className="w-full grid grid-cols-2 gap-3 text-center">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-primary">{myCourses.length}</p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">{myStudents.length}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Professional Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.label} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {f.icon} {f.label}
                  </div>
                  <p className="text-sm font-medium bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myCourses.map((c) => {
              const enrolled = myStudents.filter((s) => s.enrolledCourses.includes(c.id)).length;
              return (
                <div key={c.id} className="p-3 rounded-lg border bg-muted/30">
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.code} • {c.credits} Credits</p>
                  <p className="text-xs text-muted-foreground mt-1">{enrolled} students enrolled</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {c.year === 1 ? "FY" : c.year === 2 ? "SY" : c.year === 3 ? "TY" : "BE"} Sem {c.semester}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

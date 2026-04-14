import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, BookOpen, Users, GraduationCap, Activity, Calendar, Hash } from "lucide-react";

export default function AdminProfile() {
  const { user } = useAuth();
  const { students, faculty, courses, assignments, publishedSemesters } = useData();

  const activeStudents = students.filter((s) => s.status === "active").length;
  const activeFaculty = faculty.filter((f) => f.status === "active").length;
  const publishedCount = Object.values(publishedSemesters).filter(Boolean).length;

  const joinDate = "2020-08-01";
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const systemStats = [
    { label: "Total Students", value: students.length, sub: `${activeStudents} active`, icon: <GraduationCap size={18} className="text-blue-600" />, bg: "bg-blue-50" },
    { label: "Total Faculty", value: faculty.length, sub: `${activeFaculty} active`, icon: <Users size={18} className="text-green-600" />, bg: "bg-green-50" },
    { label: "Courses", value: courses.length, sub: "across departments", icon: <BookOpen size={18} className="text-purple-600" />, bg: "bg-purple-50" },
    { label: "Published Results", value: publishedCount, sub: "semesters live", icon: <Activity size={18} className="text-orange-600" />, bg: "bg-orange-50" },
  ];

  const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"];
  const deptStats = departments.map((d) => ({
    name: d,
    students: students.filter((s) => s.department === d).length,
    faculty: faculty.filter((f) => f.department === d).length,
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Admin Profile</h1>
        <p className="text-muted-foreground text-sm">System administrator account overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar + Info Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-purple-600 text-white text-2xl font-bold">
                  {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                <Shield size={12} className="text-white" />
              </div>
            </div>
            <h2 className="text-lg font-bold">{user?.name ?? "Administrator"}</h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <Badge className="mt-2 bg-purple-600 text-white">System Administrator</Badge>

            <Separator className="my-4 w-full" />

            <div className="w-full space-y-2 text-sm">
              {[
                { icon: <Hash size={14} />, label: "Admin ID", value: "ADMIN001" },
                { icon: <Calendar size={14} />, label: "Since", value: joinDate },
                { icon: <Activity size={14} />, label: "Status", value: "Active" },
                { icon: <Shield size={14} />, label: "Access Level", value: "Full Access" },
              ].map((f) => (
                <div key={f.label} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {f.icon} <span>{f.label}</span>
                  </div>
                  <span className="font-medium">{f.value}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4 w-full" />

            <div className="w-full space-y-1">
              <p className="text-xs text-muted-foreground font-medium text-left mb-2">PERMISSIONS</p>
              {[
                "Manage Students",
                "Manage Faculty",
                "Publish Results",
                "Send Notifications",
                "View All Data",
                "System Configuration",
              ].map((perm) => (
                <div key={perm} className="flex items-center gap-2 text-xs py-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* System Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {systemStats.map((s) => (
                  <div key={s.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground/70">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Department Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {deptStats.map((d) => (
                  <div key={d.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full bg-primary" />
                      <span className="font-medium text-sm">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GraduationCap size={13} />
                        <span className="font-semibold text-foreground">{d.students}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users size={13} />
                        <span className="font-semibold text-foreground">{d.faculty}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Full Name", value: user?.name ?? "Administrator" },
                  { label: "Email Address", value: user?.email ?? "admin@university.edu" },
                  { label: "Role", value: "System Administrator" },
                  { label: "Account Created", value: joinDate },
                  { label: "Last Login", value: today },
                  { label: "Access Level", value: "Super Admin — Full System Access" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-muted-foreground">{f.label}</span>
                    <span className="text-sm font-medium">{f.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

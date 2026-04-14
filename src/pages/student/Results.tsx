import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart2, Lock, CheckCircle, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const gradePoints: Record<string, number> = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, D: 4, F: 0 };

export default function StudentResults() {
  const { user } = useAuth();
  const { students, courses, marks, publishedSemesters } = useData();
  const student = students.find((s) => s.id === user?.id) ?? students[0];

  const [expandedSem, setExpandedSem] = useState<number | null>(null);

  const allMyMarks = marks.filter((m) => m.studentId === student.id);
  const sem5Marks = allMyMarks.filter((m) => m.semester === 5);
  const sem4Marks = allMyMarks.filter((m) => m.semester === 4);
  const sem3Marks = allMyMarks.filter((m) => m.semester === 3);

  const isCurrentPublished = publishedSemesters["sem5"];
  const isSem4Published = publishedSemesters["sem4"];
  const isSem3Published = publishedSemesters["sem3"];

  const calculateSGPA = (semMarks: typeof allMyMarks) => {
    if (!semMarks.length) return 0;
    const totalCredits = semMarks.reduce((acc, m) => {
      const course = courses.find((c) => c.id === m.courseId);
      return acc + (course?.credits ?? 3);
    }, 0);
    const weightedPoints = semMarks.reduce((acc, m) => {
      const course = courses.find((c) => c.id === m.courseId);
      return acc + (gradePoints[m.grade] ?? 0) * (course?.credits ?? 3);
    }, 0);
    return totalCredits ? parseFloat((weightedPoints / totalCredits).toFixed(2)) : 0;
  };

  const currentSGPA = calculateSGPA(sem5Marks);
  const chartData = sem5Marks.map((m) => {
    const course = courses.find((c) => c.id === m.courseId);
    return { name: course?.code ?? m.courseId, ISA: m.isa, MSE: m.mse, ESE: m.ese };
  });

  const MarksTable = ({ semMarks, sem }: { semMarks: typeof allMyMarks; sem: number }) => {
    const sgpa = calculateSGPA(semMarks);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left py-2 px-3 font-medium">Course</th>
              <th className="text-center py-2 px-3 font-medium">Code</th>
              <th className="text-center py-2 px-3 font-medium">Credits</th>
              <th className="text-center py-2 px-3 font-medium text-blue-700">ISA</th>
              <th className="text-center py-2 px-3 font-medium text-indigo-700">MSE</th>
              <th className="text-center py-2 px-3 font-medium text-purple-700">ESE</th>
              <th className="text-center py-2 px-3 font-medium">Total</th>
              <th className="text-center py-2 px-3 font-medium">Grade</th>
              <th className="text-center py-2 px-3 font-medium">GP</th>
            </tr>
          </thead>
          <tbody>
            {semMarks.map((m) => {
              const course = courses.find((c) => c.id === m.courseId);
              const maxIsa = course?.maxIsa ?? 30;
              const maxMse = course?.maxMse;
              const maxEse = course?.maxEse ?? 40;
              const gp = gradePoints[m.grade] ?? 0;
              return (
                <tr key={m.courseId} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="py-2 px-3 font-medium">
                    {course?.name ?? m.courseId}
                    {course?.courseType === "lab" && (
                      <Badge variant="outline" className="ml-2 text-xs">Lab</Badge>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center text-muted-foreground">{course?.code}</td>
                  <td className="py-2 px-3 text-center">{course?.credits}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="font-medium text-blue-700">{m.isa}</span>
                    <span className="text-muted-foreground text-xs">/{maxIsa}</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {maxMse !== undefined ? (
                      <>
                        <span className="font-medium text-indigo-700">{m.mse}</span>
                        <span className="text-muted-foreground text-xs">/{maxMse}</span>
                      </>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="font-medium text-purple-700">{m.ese}</span>
                    <span className="text-muted-foreground text-xs">/{maxEse}</span>
                  </td>
                  <td className="py-2 px-3 text-center font-bold">{m.total}</td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant={m.grade === "F" ? "destructive" : m.grade === "O" || m.grade === "A+" ? "default" : "outline"}>
                      {m.grade}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center font-medium">{gp}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5 border-t-2 font-semibold">
              <td colSpan={7} className="py-2 px-3">SGPA (Semester {sem})</td>
              <td colSpan={2} className="py-2 px-3 text-center text-primary text-lg">{sgpa}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  const PrevSemCard = ({
    semMarks, sem, semKey, isPublished, label,
  }: {
    semMarks: typeof allMyMarks; sem: number; semKey: string; isPublished: boolean; label: string;
  }) => {
    const isOpen = expandedSem === sem;
    const sgpa = calculateSGPA(semMarks);
    return (
      <Card className={isPublished ? "border-green-200" : ""}>
        <CardContent className="p-0">
          <button
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
            onClick={() => setExpandedSem(isOpen ? null : sem)}
            disabled={!isPublished}
          >
            <div className="flex items-center gap-3">
              {isPublished ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <Lock size={16} className="text-muted-foreground" />
              )}
              <div>
                <p className="font-semibold">{label}</p>
                {isPublished ? (
                  <p className="text-sm text-muted-foreground">
                    SGPA: <span className="font-bold text-primary">{sgpa}</span>
                    {" • "}{semMarks.filter((m) => m.grade !== "F").length}/{semMarks.length} Courses Cleared
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Results not yet published</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isPublished ? "default" : "outline"} className={isPublished ? "bg-green-500 text-white" : ""}>
                {isPublished ? "Published" : "Locked"}
              </Badge>
              {isPublished && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </div>
          </button>
          {isOpen && isPublished && (
            <div className="border-t p-4">
              <MarksTable semMarks={semMarks} sem={sem} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marks & Results</h1>
        <p className="text-muted-foreground text-sm">ISA, MSE, ESE and final results for each semester</p>
      </div>

      {!isCurrentPublished ? (
        <Alert className="border-amber-300 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            Semester 5 results have not been published yet. ISA and MSE are visible on your Dashboard. Full results appear here once published.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Semester 5 results are published. All marks including ESE, Total, and Grade are shown below.
          </AlertDescription>
        </Alert>
      )}

      {/* SGPA Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{isCurrentPublished ? currentSGPA : "—"}</p>
            <p className="text-sm text-muted-foreground">Sem 5 SGPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{student.cgpa}</p>
            <p className="text-sm text-muted-foreground">Overall CGPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {isCurrentPublished ? sem5Marks.filter((m) => m.grade !== "F").length : "—"}
            </p>
            <p className="text-sm text-muted-foreground">Courses Cleared</p>
          </CardContent>
        </Card>
      </div>

      {/* Semester 5 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 size={16} /> Semester 5 — Current Semester
            {isCurrentPublished
              ? <Badge className="ml-auto bg-green-500 text-white">Published</Badge>
              : <Badge variant="outline" className="ml-auto">Not Published</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isCurrentPublished ? (
            <div className="text-center py-12">
              <Lock size={48} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">Results not published yet</p>
              <p className="text-sm text-muted-foreground mt-1">Check your ISA & MSE on the Dashboard while you wait.</p>
            </div>
          ) : (
            <>
              <MarksTable semMarks={sem5Marks} sem={5} />
              <div className="mt-6">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="ISA" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="MSE" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ESE" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Previous Semesters — clickable to expand with actual data */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <TrendingUp size={16} /> Previous Semesters
          <span className="text-xs text-muted-foreground font-normal">Click to expand and view full results</span>
        </h2>
        <PrevSemCard semMarks={sem4Marks} sem={4} semKey="sem4" isPublished={isSem4Published} label="Semester 4" />
        <PrevSemCard semMarks={sem3Marks} sem={3} semKey="sem3" isPublished={isSem3Published} label="Semester 3" />
      </div>
    </div>
  );
}

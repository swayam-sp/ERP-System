import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe, Lock, Eye, EyeOff, Users, AlertTriangle, CheckCircle, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const semesterConfig = [
  { key: "sem5", label: "Semester 5", year: "Third Year", note: "Current semester — 80 students enrolled" },
  { key: "sem4", label: "Semester 4", year: "Second Year", note: "Previous semester" },
  { key: "sem3", label: "Semester 3", year: "Second Year (First Half)", note: "Archived results" },
];

export default function PublishResults() {
  const { publishedSemesters, togglePublishSemester, students, marks } = useData();
  const { toast } = useToast();

  const handleToggle = (key: string, currentState: boolean) => {
    togglePublishSemester(key);
    toast({
      title: currentState ? "Results Hidden" : "Results Published!",
      description: currentState
        ? `${semesterConfig.find((s) => s.key === key)?.label} results are now hidden from students.`
        : `${semesterConfig.find((s) => s.key === key)?.label} results are now visible to all students.`,
    });
  };

  const totalPublished = Object.values(publishedSemesters).filter(Boolean).length;
  const sem5Marks = marks.filter((m) => m.semester === 5);
  const failCount = sem5Marks.filter((m) => m.grade === "F").length;
  const passCount = sem5Marks.filter((m) => m.grade !== "F").length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Result Publication Control</h1>
        <p className="text-muted-foreground text-sm">Control visibility of semester results for students</p>
      </div>

      {/* Warning */}
      <Alert className="border-amber-300 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-700">
          Publishing results makes them immediately visible to all students. Ensure marks have been finalized before publishing.
        </AlertDescription>
      </Alert>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalPublished}</p>
            <p className="text-sm text-muted-foreground">Semesters Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{passCount}</p>
            <p className="text-sm text-muted-foreground">Students Passed (Sem 5)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{failCount}</p>
            <p className="text-sm text-muted-foreground">Students Failed (Sem 5)</p>
          </CardContent>
        </Card>
      </div>

      {/* Semester Controls */}
      <div className="space-y-4">
        {semesterConfig.map((sem) => {
          const isPublished = publishedSemesters[sem.key] ?? false;
          return (
            <Card key={sem.key} className={isPublished ? "border-green-300" : ""}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPublished ? "bg-green-100" : "bg-muted"}`}>
                      {isPublished ? (
                        <Globe size={22} className="text-green-600" />
                      ) : (
                        <Lock size={22} className="text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{sem.label}</h3>
                        <Badge variant={isPublished ? "default" : "outline"} className={isPublished ? "bg-green-500 text-white" : ""}>
                          {isPublished ? "Published" : "Not Published"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{sem.year}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{sem.note}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                      {isPublished ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-muted-foreground" />}
                      <span className="text-sm text-muted-foreground">{isPublished ? "Visible" : "Hidden"}</span>
                    </div>
                    <Switch
                      checked={isPublished}
                      onCheckedChange={() => handleToggle(sem.key, isPublished)}
                      className={isPublished ? "data-[state=checked]:bg-green-500" : ""}
                    />
                    <Button
                      variant={isPublished ? "destructive" : "default"}
                      size="sm"
                      onClick={() => handleToggle(sem.key, isPublished)}
                    >
                      {isPublished ? (
                        <><Lock size={12} className="mr-1" /> Unpublish</>
                      ) : (
                        <><Globe size={12} className="mr-1" /> Publish</>
                      )}
                    </Button>
                  </div>
                </div>

                {isPublished && (
                  <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle size={14} />
                    <span>Results are live and visible to all students in {sem.label}.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sem 5 Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 size={16} /> Semester 5 — Result Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3 font-medium">Grade</th>
                  <th className="text-center py-2 px-3 font-medium">Count</th>
                  <th className="text-center py-2 px-3 font-medium">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {["O", "A+", "A", "B+", "B", "C", "D", "F"].map((grade) => {
                  const count = sem5Marks.filter((m) => m.grade === grade).length;
                  const pct = sem5Marks.length ? ((count / sem5Marks.length) * 100).toFixed(1) : "0";
                  if (count === 0) return null;
                  return (
                    <tr key={grade} className="border-b last:border-0">
                      <td className="py-2 px-3">
                        <Badge variant={grade === "F" ? "destructive" : grade === "O" || grade === "A+" ? "default" : "outline"}>{grade}</Badge>
                      </td>
                      <td className="py-2 px-3 text-center font-semibold">{count}</td>
                      <td className="py-2 px-3 text-center">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

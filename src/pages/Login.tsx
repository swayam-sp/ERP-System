import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { type Role } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const roleInfo = {
  student: {
    icon: <GraduationCap size={20} />,
    label: "Student",
    color: "text-blue-600",
    bg: "bg-blue-50",
    demo: { email: "student@university.edu", password: "student123" },
  },
  faculty: {
    icon: <BookOpen size={20} />,
    label: "Faculty",
    color: "text-green-600",
    bg: "bg-green-50",
    demo: { email: "faculty@university.edu", password: "faculty123" },
  },
  admin: {
    icon: <Shield size={20} />,
    label: "Admin",
    color: "text-purple-600",
    bg: "bg-purple-50",
    demo: { email: "admin@university.edu", password: "admin123" },
  },
};

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password, role);
      if (ok) {
        navigate("/dashboard");
      } else {
        setError("Invalid email or password. Please check your credentials.");
      }
      setLoading(false);
    }, 600);
  };

  const fillDemo = () => {
    setEmail(roleInfo[role].demo.email);
    setPassword(roleInfo[role].demo.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">UniERP Portal</h1>
          <p className="text-blue-200/70 mt-1 text-sm">University Enterprise Resource Planning</p>
        </div>

        <Card className="shadow-2xl border-white/10 bg-white/95 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <Tabs value={role} onValueChange={(v) => { setRole(v as Role); setError(""); }}>
              <TabsList className="grid grid-cols-3 w-full mb-6">
                {(["student", "faculty", "admin"] as Role[]).map((r) => (
                  <TabsTrigger key={r} value={r} className="flex items-center gap-1.5">
                    <span className={cn(role === r ? roleInfo[r].color : "text-muted-foreground")}>
                      {roleInfo[r].icon}
                    </span>
                    <span>{roleInfo[r].label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role info banner */}
                <div className={cn("flex items-center gap-3 p-3 rounded-lg", roleInfo[role].bg)}>
                  <span className={roleInfo[role].color}>{roleInfo[role].icon}</span>
                  <div>
                    <p className="text-sm font-medium">{roleInfo[role].label} Login</p>
                    <p className="text-xs text-muted-foreground">{roleInfo[role].demo.email}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="ml-auto text-xs h-7" onClick={fillDemo}>
                    Demo
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-blue-200/50 text-xs mt-6">
          © 2025 University ERP Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
}

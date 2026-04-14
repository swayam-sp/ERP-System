import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, Moon, Sun, Monitor, Shield, Palette } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }
  localStorage.setItem("erp-theme", theme);
}

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true, browser: true, assignments: true, results: true
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("erp-theme") as Theme) ?? "light";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleTheme = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun size={16} /> },
    { value: "dark", label: "Dark", icon: <Moon size={16} /> },
    { value: "system", label: "System", icon: <Monitor size={16} /> },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account preferences</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell size={16} /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
            { key: "browser", label: "Browser Notifications", desc: "Get alerts in your browser" },
            { key: "assignments", label: "Assignment Reminders", desc: "Reminders before assignment deadlines" },
            { key: "results", label: "Result Announcements", desc: "Alert when results are published" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <Label className="font-medium">{item.label}</Label>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(v) => setNotifications((n) => ({ ...n, [item.key]: v }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette size={16} /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="font-medium">Theme</Label>
          <p className="text-xs text-muted-foreground mb-4">Choose your preferred color scheme</p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTheme(t.value)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all",
                  theme === t.value
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <span className={theme === t.value ? "text-primary" : "text-muted-foreground"}>
                  {t.icon}
                </span>
                {t.label}
                {theme === t.value && (
                  <span className="text-xs text-primary font-semibold">Active</span>
                )}
              </button>
            ))}
          </div>

          {/* Theme Preview */}
          <div className="mt-4 p-3 rounded-lg border bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Current theme preview:</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary" />
              <div className="w-8 h-8 rounded-full bg-secondary border" />
              <div className="w-8 h-8 rounded-full bg-card border" />
              <div className="w-8 h-8 rounded-full bg-muted" />
              <span className="text-xs text-muted-foreground ml-1">
                {theme === "dark" ? "Dark mode active" : theme === "light" ? "Light mode active" : "Following system preference"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield size={16} /> Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Two-Factor Authentication", desc: "Add an extra layer of security", value: "Not Enabled" },
            { label: "Session Timeout", desc: "Auto logout after inactivity", value: "30 minutes" },
            { label: "Role", desc: "Your account type", value: user?.role ?? "", className: "capitalize" },
          ].map((item, i) => (
            <div key={i}>
              {i > 0 && <Separator className="mb-3" />}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Badge variant="outline" className={item.className}>{item.value}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

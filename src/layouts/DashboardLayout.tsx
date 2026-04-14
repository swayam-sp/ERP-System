import { useState, ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import {
  LayoutDashboard, BookOpen, ClipboardList, Calendar, BarChart2,
  Bell, User, Settings, LogOut, Menu, X, GraduationCap, Users,
  BookMarked, ChevronDown, Search, Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard",     href: "/dashboard",      icon: <LayoutDashboard size={18} />, roles: ["student", "faculty", "admin"] },
  { label: "Courses",       href: "/subjects",        icon: <BookOpen size={18} />,        roles: ["student", "faculty"] },
  { label: "Assignments",   href: "/assignments",     icon: <ClipboardList size={18} />,   roles: ["student", "faculty"] },
  { label: "Attendance",    href: "/attendance",      icon: <Calendar size={18} />,        roles: ["student", "faculty"] },
  { label: "Marks & Results", href: "/results",       icon: <BarChart2 size={18} />,       roles: ["student", "faculty"] },
  { label: "Students",      href: "/students",        icon: <GraduationCap size={18} />,   roles: ["admin", "faculty"] },
  { label: "Faculty",       href: "/faculty",         icon: <Users size={18} />,            roles: ["admin"] },
  { label: "Courses",       href: "/subjects",        icon: <BookMarked size={18} />,       roles: ["admin"] },
  { label: "Publish Results", href: "/publish-results", icon: <Globe size={18} />,         roles: ["admin"] },
  { label: "Notifications", href: "/notifications",   icon: <Bell size={18} />,            roles: ["student", "faculty", "admin"] },
  { label: "Profile",       href: "/profile",         icon: <User size={18} />,            roles: ["student", "faculty", "admin"] },
  { label: "Settings",      href: "/settings",        icon: <Settings size={18} />,        roles: ["student", "faculty", "admin"] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { notifications } = useData();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, navigate] = useLocation();

  const unreadCount = notifications.filter(
    (n) => !n.read && (n.targetRole === "all" || n.targetRole === user?.role)
  ).length;

  const filteredNav = navItems.filter((n) => n.roles.includes(user?.role ?? ""));

  const roleColors: Record<string, string> = {
    student: "bg-blue-500",
    faculty: "bg-green-500",
    admin: "bg-purple-500",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out shrink-0",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-sm leading-tight">UniERP</p>
              <p className="text-xs text-sidebar-foreground/60">Campus Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-all duration-150 group relative",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                  {!sidebarOpen && item.label === "Notifications" && unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                  {sidebarOpen && item.label === "Notifications" && unreadCount > 0 && (
                    <Badge className="ml-auto text-xs py-0 px-1.5 bg-red-500 hover:bg-red-500">{unreadCount}</Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-sidebar-border p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-sidebar-primary text-white text-xs">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate capitalize">{user?.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => { logout(); navigate("/"); }}
              >
                <LogOut size={14} />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 mx-auto"
              onClick={() => { logout(); navigate("/"); }}
            >
              <LogOut size={16} />
            </Button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-3 border-b border-border bg-card shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9 bg-muted/50"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Role badge */}
            <Badge className={cn("capitalize text-white text-xs", roleColors[user?.role ?? "admin"])}>
              {user?.role}
            </Badge>

            {/* Notifications */}
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[120px] truncate hidden sm:block">{user?.name}</span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile"><span className="flex items-center gap-2 cursor-pointer w-full"><User size={14} /> Profile</span></Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings"><span className="flex items-center gap-2 cursor-pointer w-full"><Settings size={14} /> Settings</span></Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => { logout(); navigate("/"); }}
                >
                  <LogOut size={14} className="mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

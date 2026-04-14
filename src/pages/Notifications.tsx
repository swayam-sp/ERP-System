import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Bell, CheckCheck, Search, Info, AlertTriangle, CheckCircle, AlertCircle, Plus, Send } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Notification, Role } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, markNotificationRead, addNotification } = useData();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info" as Notification["type"],
    targetRole: "all" as Notification["targetRole"],
  });

  const canCreate = user?.role === "faculty" || user?.role === "admin";

  const myNotifs = notifications.filter(
    (n) => n.targetRole === "all" || n.targetRole === user?.role
  );

  const filtered = myNotifs.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || n.type === typeFilter;
    return matchSearch && matchType;
  });

  const markAllRead = () => myNotifs.forEach((n) => markNotificationRead(n.id));

  const handleCreate = () => {
    if (!form.title || !form.message) return;
    const newN: Notification = {
      id: `N_${Date.now()}`,
      title: form.title,
      message: form.message,
      type: form.type,
      date: new Date().toISOString().split("T")[0],
      read: false,
      targetRole: form.targetRole,
    };
    addNotification(newN);
    toast({ title: "Notification Sent!", description: `"${form.title}" sent to ${form.targetRole === "all" ? "everyone" : form.targetRole + "s"}.` });
    setCreateOpen(false);
    setForm({ title: "", message: "", type: "info", targetRole: "all" });
  };

  const typeIcons = {
    info: <Info size={16} className="text-blue-600" />,
    warning: <AlertTriangle size={16} className="text-amber-600" />,
    success: <CheckCircle size={16} className="text-green-600" />,
    error: <AlertCircle size={16} className="text-red-600" />,
  };

  const typeBg = {
    info: "bg-blue-50 border-blue-200",
    warning: "bg-amber-50 border-amber-200",
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">{myNotifs.filter((n) => !n.read).length} unread notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={14} className="mr-2" /> Create Notification
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck size={14} className="mr-2" /> Mark all read
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No notifications found.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex gap-3 p-4 rounded-lg border cursor-pointer hover:opacity-90 transition-opacity",
                n.read ? "bg-card border-border" : typeBg[n.type]
              )}
              onClick={() => markNotificationRead(n.id)}
            >
              <div className="shrink-0 mt-0.5">{typeIcons[n.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("font-medium text-sm", !n.read && "font-semibold")}>{n.title}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    <span className="text-xs text-muted-foreground">{n.date}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs capitalize">{n.targetRole}</Badge>
                  <Badge variant="outline" className="text-xs">{n.type}</Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Notification Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send size={16} /> Send Notification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="Notification title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea
                placeholder="Write your notification message..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as Notification["type"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Send To</Label>
                <Select
                  value={form.targetRole}
                  onValueChange={(v) => setForm((f) => ({ ...f, targetRole: v as Notification["targetRole"] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="student">Students Only</SelectItem>
                    <SelectItem value="faculty">Faculty Only</SelectItem>
                    {user?.role === "admin" && <SelectItem value="admin">Admin Only</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.title && form.message && (
              <div className={cn("p-3 rounded-lg border text-sm", typeBg[form.type])}>
                <div className="flex items-center gap-2 mb-1">
                  {typeIcons[form.type]}
                  <span className="font-semibold">{form.title}</span>
                </div>
                <p className="text-muted-foreground">{form.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Will be sent to: <span className="font-medium capitalize">{form.targetRole === "all" ? "everyone" : form.targetRole + "s"}</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title || !form.message}>
              <Send size={14} className="mr-2" /> Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

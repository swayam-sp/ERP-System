import { createContext, useContext, useState, ReactNode } from "react";
import { mockUsers, mockStudents, mockFaculty, type Role } from "@/data/mockData";

interface AuthUser {
  id: string;
  role: Role;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: Role) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, password: string, role: Role): boolean => {
    const found = mockUsers.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (!found) return false;

    let name = "Admin User";
    if (role === "student") {
      const s = mockStudents.find((s) => s.id === found.id);
      name = s?.name ?? "Student";
    } else if (role === "faculty") {
      const f = mockFaculty.find((f) => f.id === found.id);
      name = f?.name ?? "Faculty";
    }

    setUser({ id: found.id, role, name, email });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

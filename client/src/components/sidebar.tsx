import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  FolderOpen,
  FileText,
  Key,
  Settings,
  LogOut,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  {
    icon: Home,
    label: "Project overview",
    href: "/",
  },
  {
    icon: FolderOpen,
    label: "Projects",
    href: "/projects",
  },
  {
    icon: FileText,
    label: "Form Editor",
    href: "/form-editor",
  },
  {
    icon: Key,
    label: "API Keys",
    href: "/api-keys",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div
      className={cn(
        "bg-card border-r transition-all duration-300 ease-in-out shadow-sm flex flex-col h-full",
        isHovered ? "w-64" : "w-16",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo/Brand */}
      <div className="flex items-center px-4 py-4 border-b">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Box className="h-4 w-4 text-primary-foreground" />
        </div>
        <span
          className={cn(
            "ml-3 font-semibold text-lg transition-opacity duration-300 whitespace-nowrap",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          Formfy
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start px-2 py-2 h-10",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={cn(
                    "ml-3 transition-opacity duration-300 whitespace-nowrap",
                    isHovered ? "opacity-100" : "opacity-0",
                  )}
                >
                  {item.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

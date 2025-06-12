import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronDown, Settings, LogOut, User, FolderOpen, TestTube, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import type { Project } from "@shared/schema";

interface HeaderProps {
  selectedProject?: string;
  onProjectChange?: (projectId: string) => void;
}

export function Header({ selectedProject, onProjectChange }: HeaderProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"testing" | "production">("testing");
  
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const currentProject = projects.find(p => p.id === selectedProject) || projects[0];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || "User";
  };

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Project Selector and Mode */}
        <div className="flex items-center gap-4">
          {/* Project Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 px-3 text-sm font-medium border-gray-300 hover:bg-gray-50">
                <FolderOpen className="w-4 h-4 mr-2" />
                {currentProject ? currentProject.name : "Select Project"}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => onProjectChange?.(project.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{project.name}</span>
                    {project.status === "active" && (
                      <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              {projects.length === 0 && (
                <DropdownMenuItem disabled>
                  <span className="text-gray-500">No projects available</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/projects" className="cursor-pointer">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Manage Projects
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mode Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "testing" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("testing")}
              className={`h-7 px-3 text-xs ${
                mode === "testing" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <TestTube className="w-3 h-3 mr-1" />
              Testing
            </Button>
            <Button
              variant={mode === "production" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("production")}
              className={`h-7 px-3 text-xs ${
                mode === "production" 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Globe className="w-3 h-3 mr-1" />
              Production
            </Button>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder="Search projects, forms..."
              className="pl-10 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right: User Avatar */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.profileImageUrl} 
                    alt={getUserDisplayName()}
                  />
                  <AvatarFallback className="text-xs font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/settings" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/settings" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
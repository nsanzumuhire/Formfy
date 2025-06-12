import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { 
  Search, 
  ChevronDown, 
  Settings, 
  LogOut,
  Bell,
  HelpCircle,
} from "lucide-react";
import type { Project, User } from "@shared/schema";

interface HeaderProps {
  selectedProject?: string;
  onProjectChange?: (projectId: string) => void;
}

export function Header({ selectedProject, onProjectChange }: HeaderProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const currentProject = projects?.find(p => p.id === selectedProject);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: User Avatar and Info */}
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as any)?.profileImageUrl || ""} alt={(user as any)?.firstName || ""} />
                  <AvatarFallback className="text-xs">
                    {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {(user as any)?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="hidden sm:block">
            <p className="text-sm font-medium">
              {(user as any)?.firstName} {(user as any)?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {(user as any)?.email}
            </p>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search forms, projects, settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Right: Project Selector and Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {projects && projects.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground hidden sm:block">Project:</span>
              <Select value={selectedProject} onValueChange={onProjectChange}>
                <SelectTrigger className="w-auto h-8 px-3 text-sm border-0 bg-muted/50 hover:bg-muted">
                  <SelectValue placeholder="Select project">
                    {currentProject ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{currentProject.name}</span>
                        <Badge variant="outline" className="h-4 px-1 text-xs">
                          Active
                        </Badge>
                      </div>
                    ) : (
                      "Select project"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="end">
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{project.name}</span>
                        {project.description && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {project.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
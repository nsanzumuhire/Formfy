import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ChevronDown,
  Settings,
  LogOut,
  User,
  FolderOpen,
  TestTube,
  Globe,
  Box,
  Check,
  ChevronsUpDown,
} from "lucide-react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Project } from "@shared/schema";

interface HeaderProps {
  selectedProject?: string;
  onProjectChange?: (projectId: string) => void;
}

export function Header({ selectedProject, onProjectChange }: HeaderProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"testing" | "production">("testing");
  const [projectOpen, setProjectOpen] = useState(false);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const currentProject =
    projects.find((p) => p.id === selectedProject) || projects[0];

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
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Project Selector and Mode */}
        <div className="flex items-center gap-4">
          {/* Project Selector */}
          <Popover open={projectOpen} onOpenChange={setProjectOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={projectOpen}
                className="h-8 px-3 text-sm font-medium border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 justify-between min-w-[200px]"
              >
                <div className="flex items-center">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  <span className="truncate">
                    {currentProject ? currentProject.name : "Select Project"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search projects..." />
                <CommandEmpty>No projects found.</CommandEmpty>
                <CommandGroup>
                  {projects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => {
                        onProjectChange?.(project.id);
                        setProjectOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProject === project.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{project.name}</span>
                        {project.status === "active" && (
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {projects.length > 0 && (
                  <>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          window.location.href = "/projects";
                          setProjectOpen(false);
                        }}
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Manage Projects
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </Command>
            </PopoverContent>
          </Popover>

          {/* Mode Selector */}
          <div className="flex items-center">
            <button
              onClick={() =>
                setMode(mode === "testing" ? "production" : "testing")
              }
              className="flex items-center h-7 px-3 text-xs font-medium rounded-md transition-colors bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            >
              <Box className="w-3 h-3 mr-1.5" />
              {mode === "testing" ? "Testing" : "Production"}
            </button>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              type="search"
              placeholder="Search projects, forms..."
              className="pl-10 h-9 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </div>

        {/* Right: Theme Toggle & User Avatar */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
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
                  <p className="text-sm font-medium leading-none">
                    {getUserDisplayName()}
                  </p>
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
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
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

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useGetCurrentUser,
  useLogout,
  getGetCurrentUserQueryKey,
  customFetch,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  LogOut,
  PlusSquare,
  MessageSquare,
  Users,
  Mail,
  LayoutGrid,
  Circle,
  Settings,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ONLINE COUNT (ONLY WHEN LOGGED IN)
 */
function useOnlineCount(enabled: boolean) {
  return useQuery({
    queryKey: ["online-count"],
    queryFn: () =>
      customFetch<{
        count: number;
        users: { id: number; username: string }[];
      }>("/api/online"),
    refetchInterval: 30_000,
    enabled,
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetCurrentUser();
  const logout = useLogout();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [accentColor, setAccentColor] = useState("25 100% 55%");

  const COLOR_PRESETS = [
    { name: "Crimson", value: "355 100% 55%" },
    { name: "Aqua", value: "185 100% 50%" },
    { name: "Violet", value: "292 100% 60%" },
    { name: "Lime", value: "95 85% 45%" },
    { name: "Amber", value: "35 100% 60%" },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("voyager-accent-color");
    if (stored) {
      setAccentColor(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--accent", accentColor);
    window.localStorage.setItem("voyager-accent-color", accentColor);
  }, [accentColor]);

  /**
   * 🔥 CRITICAL Fix: treat ONLY valid user as logged in
   */
  const isLoggedIn = !!user?.id;

  const { data: onlineData } = useOnlineCount(isLoggedIn);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetCurrentUserQueryKey(),
        });
        setLocation("/login");
      },
    });
  };

  /**
   * ❌ HARD GUARD: prevents "?? user" entirely
   */
  if (!isLoading && !isLoggedIn) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Link href="/login">
          <Button variant="outline">Access Portal</Button>
        </Link>
      </div>
    );
  }

  const username = user?.username ?? "";
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      <div className="scanlines" />
      <div className="noise" />

      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-primary font-serif text-2xl tracking-widest uppercase">
              VOYAGER
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : isLoggedIn ? (
              <>
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Forum
                  </Button>
                </Link>

                <Link href="/chat">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </Link>

                <Link href="/crews">
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Crews
                  </Button>
                </Link>

                <Link href="/messages">
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    DMs
                  </Button>
                </Link>

                {onlineData && (
                  <div className="hidden md:flex items-center gap-1 px-2 py-1 border">
                    <Circle className="h-2 w-2 text-green-500 fill-green-500 animate-pulse" />
                    <span className="text-xs text-green-500">
                      {onlineData.count} online
                    </span>
                  </div>
                )}

                <Link href="/new-thread">
                  <Button variant="outline" size="sm">
                    <PlusSquare className="h-4 w-4 mr-2" />
                    New Thread
                  </Button>
                </Link>

                {/* USER MENU */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.avatarUrl || ""}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user?.role}
                        </span>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Colors
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-500"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="rounded-none border-border/50 bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif tracking-widest uppercase">Profile Colors</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Pick an accent tone for your profile and map highlights.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setAccentColor(preset.value)}
                  className={`h-16 rounded-none border border-border/50 transition-all ${accentColor === preset.value ? "ring-2 ring-primary" : "hover:border-primary/70"}`}
                  style={{ backgroundColor: `hsl(${preset.value})` }}
                  aria-label={preset.name}
                />
              ))}
            </div>
            <div className="space-y-2">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Current accent</div>
              <div className="h-12 rounded-none border border-border/50 bg-background flex items-center justify-center text-sm text-foreground uppercase tracking-widest">
                {accentColor}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setProfileDialogOpen(false)} className="rounded-none font-mono">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
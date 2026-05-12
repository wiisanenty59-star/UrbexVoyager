import { Link, useLocation } from "wouter";
import { useGetCurrentUser, useLogout, getGetCurrentUserQueryKey, customFetch } from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shield, LogOut, PlusSquare, MessageSquare, Users, Mail, LayoutGrid, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function useOnlineCount() {
  const { data: authUser } = useGetCurrentUser();
  return useQuery({
    queryKey: ["online-count"],
    queryFn: () => customFetch<{ count: number; users: { id: number; username: string }[] }>("/api/online"),
    refetchInterval: 30_000,
    enabled: !!authUser,
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetCurrentUser();
  const logout = useLogout();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: onlineData } = useOnlineCount();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        setLocation("/login");
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      <div className="scanlines" />
      <div className="noise" />
      
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="text-primary font-serif text-2xl tracking-widest uppercase">HiddenFreeways</span>
          </Link>

          <nav className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-8 w-8 rounded-full bg-muted/50" />
            ) : user ? (
              <>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="hidden md:flex font-mono uppercase tracking-wider text-xs">
                    <LayoutGrid className="h-4 w-4 mr-2" /> Forum
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" size="sm" className="hidden md:flex font-mono uppercase tracking-wider text-xs">
                    <MessageSquare className="h-4 w-4 mr-2" /> Chat
                  </Button>
                </Link>
                <Link href="/crews">
                  <Button variant="ghost" size="sm" className="hidden md:flex font-mono uppercase tracking-wider text-xs">
                    <Users className="h-4 w-4 mr-2" /> Crews
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="sm" className="hidden md:flex font-mono uppercase tracking-wider text-xs">
                    <Mail className="h-4 w-4 mr-2" /> DMs
                  </Button>
                </Link>

                {/* Online indicator */}
                {onlineData && (
                  <div className="hidden md:flex items-center gap-1 px-2 py-1 border border-border/30 bg-card/30">
                    <Circle className="h-2 w-2 text-green-500 fill-green-500 animate-pulse" />
                    <span className="font-mono text-[10px] text-green-500 uppercase tracking-widest">{onlineData.count} online</span>
                  </div>
                )}

                <Link href="/new-thread">
                  <Button variant="outline" size="sm" className="hidden sm:flex border-primary/20 hover:border-primary/50 text-primary rounded-none">
                    <PlusSquare className="h-4 w-4 mr-2" />
                    New Thread
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 rounded-none border border-border">
                        <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
                        <AvatarFallback className="rounded-none bg-secondary text-secondary-foreground font-mono text-xs">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-none border-border/50 bg-card" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none font-mono">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground uppercase tracking-wider">
                          {user.role}
                          {(user as { trustLevel?: number }).trustLevel && (user as { trustLevel?: number }).trustLevel! >= 2 && (
                            <span className="ml-2 text-yellow-500">★ Honored</span>
                          )}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent/20 focus:text-accent-foreground rounded-none">
                        <Link href="/admin" className="flex w-full items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Control</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/20 focus:text-primary-foreground rounded-none sm:hidden">
                      <Link href="/new-thread" className="flex w-full items-center">
                        <PlusSquare className="mr-2 h-4 w-4" />
                        <span>New Thread</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/20 focus:text-primary-foreground rounded-none md:hidden">
                      <Link href="/" className="flex w-full items-center">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>Forum</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/20 focus:text-primary-foreground rounded-none md:hidden">
                      <Link href="/chat" className="flex w-full items-center">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Chat</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/20 focus:text-primary-foreground rounded-none md:hidden">
                      <Link href="/crews" className="flex w-full items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Crews</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/20 focus:text-primary-foreground rounded-none md:hidden">
                      <Link href="/messages" className="flex w-full items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        <span>DMs</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/20 focus:text-destructive rounded-none">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Disconnect</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="rounded-none border-primary/20 text-primary hover:bg-primary/10 hover:text-primary font-mono uppercase tracking-wider text-xs">
                  Access Portal
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-background py-6 relative z-10 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            {new Date().getFullYear()} // HiddenFreeways // The freeways stay hidden
          </p>
        </div>
      </footer>
    </div>
  );
}

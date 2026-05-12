import { useListCategories, useListStates, useGetForumStats, useGetRecentActivity, customFetch } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MapPin, Users, Activity, FileText, Circle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AnnouncementsBanner } from "@/components/announcements-banner";

type OnlineUser = { id: number; username: string; role: string; trustLevel: number };
type Crew = { id: number; name: string; memberCount: number };

function useOnlineUsers() {
  return useQuery({
    queryKey: ["online-users"],
    queryFn: () => customFetch<{ count: number; users: OnlineUser[] }>("/api/online"),
    refetchInterval: 30_000,
  });
}

function useCrewsList() {
  return useQuery({
    queryKey: ["crews-sidebar"],
    queryFn: () => customFetch<Crew[]>("/api/crews"),
    refetchInterval: 60_000,
  });
}

export default function Home() {
  const { data: categories, isLoading: loadingCategories } = useListCategories();
  const { data: states, isLoading: loadingStates } = useListStates();
  const { data: stats, isLoading: loadingStats } = useGetForumStats();
  const { data: recentActivity, isLoading: loadingActivity } = useGetRecentActivity();
  const { data: onlineData, isLoading: loadingOnline } = useOnlineUsers();
  const { data: crews, isLoading: loadingCrews } = useCrewsList();

  // Only top-level categories (no parent)
  const topCategories = categories?.filter(c => !(c as { parentId?: number }).parentId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AnnouncementsBanner />
      {/* Hero Stats Banner */}
      <section className="relative border border-primary/20 bg-card/50 p-6 md:p-8 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
        <div className="absolute -right-20 -top-20 opacity-5 blur-3xl pointer-events-none transition-transform duration-1000 group-hover:scale-110">
          <Activity className="w-96 h-96 text-primary" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-serif text-foreground uppercase tracking-widest">
              Central <span className="text-primary">Dispatch</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm max-w-xl">
              Encrypted communications for urban exploration. Coordinates, access logs, and structural reports.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full md:w-auto">
            {[
              { label: "Operatives", value: stats?.memberCount, icon: Users },
              { label: "Locations", value: stats?.locationCount, icon: MapPin },
              { label: "Threads", value: stats?.threadCount, icon: FileText },
              { label: "Transmissions", value: stats?.postCount, icon: MessageSquare },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-start md:items-center">
                <div className="flex items-center text-muted-foreground mb-1">
                  <stat.icon className="w-3 h-3 mr-1" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">{stat.label}</span>
                </div>
                {loadingStats ? (
                  <Skeleton className="h-6 w-12 bg-muted/30" />
                ) : (
                  <span className="font-serif text-2xl text-foreground">{stat.value || 0}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Categories & States */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Categories */}
          <section className="space-y-4">
            <div className="flex items-center border-b border-border/50 pb-2">
              <h2 className="font-serif text-xl text-primary tracking-widest uppercase">Comms Channels</h2>
            </div>
            
            <div className="grid gap-4">
              {loadingCategories ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full bg-muted/20" />
                ))
              ) : topCategories?.length === 0 ? (
                <div className="text-muted-foreground font-mono text-sm italic">No channels established.</div>
              ) : (
                topCategories?.map((cat) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`}>
                    <div className="group border border-border bg-card/30 p-4 hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                          <p className="text-muted-foreground text-sm max-w-xl">{cat.description}</p>
                        </div>
                        <div className="text-right font-mono text-xs text-muted-foreground flex flex-col gap-1 shrink-0 ml-4">
                          <span>{cat.threadCount} THREADS</span>
                          <span>{cat.postCount} POSTS</span>
                        </div>
                      </div>
                      {cat.latestThread && (
                        <div className="mt-4 pt-3 border-t border-border/50 text-xs font-mono text-muted-foreground flex items-center justify-between">
                          <span className="truncate max-w-[70%]">
                            LATEST: <span className="text-foreground">{cat.latestThread.title}</span>
                          </span>
                          <span className="shrink-0">{formatDistanceToNow(new Date(cat.latestThread.lastActivityAt), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* States Grid */}
          <section className="space-y-4">
            <div className="flex items-center border-b border-border/50 pb-2">
              <h2 className="font-serif text-xl text-primary tracking-widest uppercase">Geographic Sectors</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {loadingStates ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full bg-muted/20" />
                ))
              ) : states?.length === 0 ? (
                <div className="col-span-full text-muted-foreground font-mono text-sm italic">No sectors mapped.</div>
              ) : (
                states?.map((state) => (
                  <Link key={state.id} href={`/state/${state.slug}`}>
                    <div className="border border-border bg-card/30 p-3 hover:bg-card/80 hover:border-accent/50 transition-all cursor-pointer h-full flex flex-col justify-between group">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-sm text-foreground group-hover:text-accent transition-colors">{state.name}</h3>
                        <span className="font-mono text-[10px] text-muted-foreground">{state.abbreviation}</span>
                      </div>
                      <div className="mt-2 font-mono text-[10px] text-muted-foreground flex justify-between">
                        <span>{state.locationCount} LOCS</span>
                        <span>{state.threadCount} THREADS</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Online Now Widget */}
          <Card className="border-border/50 bg-card/20 rounded-none backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-3 pt-4 px-4">
              <CardTitle className="font-serif text-base text-primary tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Circle className="w-3 h-3 text-green-500 fill-green-500" />
                  Online Now
                </span>
                {loadingOnline ? (
                  <Skeleton className="h-4 w-8 bg-muted/20" />
                ) : (
                  <span className="font-mono text-sm text-green-500">{onlineData?.count ?? 0}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingOnline ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-3/4 bg-muted/20" />)}
                </div>
              ) : !onlineData?.users?.length ? (
                <div className="p-4 text-muted-foreground font-mono text-xs italic">No one online right now.</div>
              ) : (
                <div className="divide-y divide-border/30">
                  {onlineData.users.slice(0, 12).map(u => (
                    <div key={u.id} className="px-4 py-2 flex items-center gap-2 hover:bg-muted/10 transition-colors">
                      <Circle className="w-2 h-2 text-green-500 fill-green-500 shrink-0" />
                      <span className="font-mono text-xs text-foreground">{u.username}</span>
                      {u.role === "admin" && (
                        <Badge className="h-3.5 text-[9px] font-mono rounded-none bg-primary/20 text-primary border-primary/30 px-1 uppercase ml-auto">Admin</Badge>
                      )}
                      {u.role !== "admin" && u.trustLevel >= 2 && (
                        <span className="text-yellow-500 text-[10px] ml-auto">★</span>
                      )}
                    </div>
                  ))}
                  {(onlineData?.count ?? 0) > 12 && (
                    <div className="px-4 py-2 text-muted-foreground font-mono text-[10px]">
                      +{(onlineData?.count ?? 0) - 12} more...
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Crews Widget */}
          <Card className="border-border/50 bg-card/20 rounded-none backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-3 pt-4 px-4">
              <CardTitle className="font-serif text-base text-primary tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Active Crews
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingCrews ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full bg-muted/20" />)}
                </div>
              ) : !crews?.length ? (
                <div className="p-4 text-muted-foreground font-mono text-xs italic">No crews yet. Form one!</div>
              ) : (
                <div className="divide-y divide-border/30">
                  {crews.slice(0, 8).map(crew => (
                    <Link key={crew.id} href="/crews">
                      <div className="px-4 py-2.5 flex items-center justify-between hover:bg-muted/10 transition-colors cursor-pointer group">
                        <span className="font-mono text-xs text-foreground group-hover:text-primary transition-colors">{crew.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[10px] text-muted-foreground">{crew.memberCount}</span>
                          <Users className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {(crews?.length ?? 0) > 8 && (
                    <Link href="/crews">
                      <div className="px-4 py-2 text-muted-foreground font-mono text-[10px] hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
                        View all {crews?.length} crews <ChevronRight className="w-3 h-3" />
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signal Feed */}
          <Card className="border-border/50 bg-card/20 rounded-none backdrop-blur-sm">
            <CardHeader className="border-b border-border/50 pb-3 pt-4 px-4">
              <CardTitle className="font-serif text-base text-primary tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Signal Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {loadingActivity ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-muted/20" />
                      <Skeleton className="h-3 w-1/2 bg-muted/20" />
                    </div>
                  ))
                ) : recentActivity?.length === 0 ? (
                  <div className="p-4 text-muted-foreground font-mono text-xs italic">No recent signals.</div>
                ) : (
                  recentActivity?.map((item, i) => (
                    <div key={i} className="p-3 hover:bg-muted/10 transition-colors group">
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className="rounded-none border-primary/30 text-primary bg-primary/5 text-[9px] uppercase font-mono px-1 py-0 h-4">
                          {item.kind === "thread" ? "NEW" : "REPLY"}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(item.at), { addSuffix: true })}
                        </span>
                      </div>
                      <Link href={`/thread/${item.threadId}`}>
                        <h4 className="text-xs font-medium leading-tight text-foreground group-hover:text-primary transition-colors cursor-pointer mt-1.5 mb-1 line-clamp-2">
                          {item.threadTitle}
                        </h4>
                      </Link>
                      <div className="flex items-center text-[10px] text-muted-foreground font-mono">
                        <span className="text-accent">{item.actorUsername}</span>
                        <span className="mx-1 opacity-50">/</span>
                        <span className="truncate text-muted-foreground">{item.categoryName}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

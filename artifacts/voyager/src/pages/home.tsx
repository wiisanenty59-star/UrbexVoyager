import {
  useListCategories,
  useListStates,
  useGetForumStats,
  useGetRecentActivity,
  customFetch
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  MapPin,
  Users,
  Activity,
  FileText,
  Circle,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AnnouncementsBanner } from "@/components/announcements-banner";

type OnlineUser = { id: number; username: string; role: string; trustLevel: number };
type Crew = { id: number; name: string; memberCount: number };

function useOnlineUsers() {
  return useQuery({
    queryKey: ["online-users"],
    queryFn: () =>
      customFetch<{ count: number; users: OnlineUser[] }>("/api/online"),
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

  /**
   * ✅ SAFE NORMALIZATION
   * Prevents:
   * - categories.filter is not a function
   * - undefined crashes
   */
  const categoryArray = Array.isArray(categories) ? categories : [];

  const topCategories = categoryArray.filter((c: any) => !c.parentId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AnnouncementsBanner />

      {/* Hero Stats Banner */}
      <section className="relative border border-primary/20 bg-card/50 p-6 md:p-8 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-serif uppercase tracking-widest">
              Central <span className="text-primary">Dispatch</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm max-w-xl">
              Encrypted communications for urban exploration.
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
                  <span className="font-mono text-[10px] uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>

                {loadingStats ? (
                  <Skeleton className="h-6 w-12 bg-muted/30" />
                ) : (
                  <span className="font-serif text-2xl text-foreground">
                    {stat.value || 0}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-8">

          {/* Categories */}
          <section className="space-y-4">
            <div className="flex items-center border-b border-border/50 pb-2">
              <h2 className="font-serif text-xl text-primary tracking-widest uppercase">
                Comms Channels
              </h2>
            </div>

            <div className="grid gap-4">
              {loadingCategories ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full bg-muted/20" />
                ))
              ) : topCategories.length === 0 ? (
                <div className="text-muted-foreground font-mono text-sm italic">
                  No channels established.
                </div>
              ) : (
                topCategories.map((cat: any) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`}>
                    <div className="group border border-border bg-card/30 p-4 hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer">
                      <h3 className="font-serif text-lg text-foreground group-hover:text-primary">
                        {cat.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {cat.description}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* States */}
          <section className="space-y-4">
            <div className="flex items-center border-b border-border/50 pb-2">
              <h2 className="font-serif text-xl text-primary tracking-widest uppercase">
                Operational Zones
              </h2>
            </div>

            <div className="grid gap-4">
              {loadingStates ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full bg-muted/20" />
                ))
              ) : !states || states.length === 0 ? (
                <div className="text-muted-foreground font-mono text-sm italic">
                  No zones established.
                </div>
              ) : (
                states.map((state: any) => (
                  <Link key={state.id} href={`/state/${state.slug}`}>
                    <div className="group border border-border bg-card/30 p-4 hover:bg-card/80 hover:border-primary/30 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-lg text-foreground group-hover:text-primary">
                          {state.name}
                        </h3>
                        <Badge variant="outline" className="font-mono text-xs">
                          {state.locationCount || 0} locations
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">
                        {state.threadCount || 0} active threads
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { customFetch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Lock, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ChatRoom = {
  id: number;
  slug: string;
  name: string;
  description: string;
  kind: string;
  minTrustLevel: number;
  memberCount: number;
  lastMessageAt: string | null;
};

export default function ChatIndex() {
  const [rooms, setRooms] = useState<ChatRoom[] | null>(null);

  useEffect(() => {
    customFetch<ChatRoom[]>("/api/chat/rooms", { method: "GET" })
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch(() => setRooms([]));
  }, []);

  if (rooms === null) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full bg-muted/20 border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-border/50 pb-4">
        <h1 className="font-serif text-3xl text-primary tracking-widest uppercase flex items-center gap-3">
          <MessageSquare className="w-6 h-6" /> Live Chat
        </h1>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-2">
          Real-time relay rooms. Don't burn locations.
        </p>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12 font-mono text-muted-foreground">
          NO ROOMS AVAILABLE
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((r) => (
            <Link key={r.id} href={`/chat/${r.slug}`}>
              <a className="block border border-border/50 bg-card/40 hover:border-primary/50 hover:bg-card/60 backdrop-blur-sm p-4 transition-all">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {r.minTrustLevel > 0 ? (
                      <Lock className="w-4 h-4 text-accent shrink-0" />
                    ) : (
                      <Hash className="w-4 h-4 text-primary shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-serif text-lg text-foreground tracking-widest uppercase">
                        {r.name}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground truncate">
                        {r.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge
                      variant="outline"
                      className="rounded-none border-primary/30 text-primary bg-primary/5 text-[10px] font-mono uppercase"
                    >
                      {r.memberCount} active
                    </Badge>
                    {r.minTrustLevel > 0 && (
                      <Badge
                        variant="outline"
                        className="rounded-none border-accent/30 text-accent bg-accent/5 text-[10px] font-mono uppercase"
                      >
                        Trust ≥ {r.minTrustLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

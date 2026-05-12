import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, Link } from "wouter";
import { customFetch } from "@workspace/api-client-react";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, ArrowLeft, Shield, Heart, UserX, MapPin } from "lucide-react";

type LocationResult = {
  id: number;
  name: string;
  city: string | null;
  stateSlug: string | null;
  stateName: string | null;
};

type RoomMessage = {
  id: number;
  body: string;
  authorId: number;
  authorUsername: string;
  authorTrustLevel: number;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
};

function renderBody(body: string, navigate: (href: string) => void) {
  const parts = body.split(/(\[loc:\d+:[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[loc:(\d+):([^\]]+)\]$/);
        if (m) {
          const href = `/location/${m[1]}`;
          return (
            <button
              key={i}
              type="button"
              onClick={() => navigate(href)}
              className="inline-flex items-center gap-1 rounded-none border border-primary/50 bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-wider hover:bg-primary/20 cursor-pointer mx-0.5 px-1.5 py-0.5"
            >
              <MapPin className="w-2.5 h-2.5" />
              {m[2]}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function ChatRoom() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const slug = params.slug ?? "";
  const { data: user } = useGetCurrentUser();
  const [messages, setMessages] = useState<RoomMessage[] | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastIdRef = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [showLocations, setShowLocations] = useState(false);

  const isPrivileged = user?.role === "admin";

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const url =
          lastIdRef.current > 0
            ? `/api/chat/rooms/${slug}/messages?sinceId=${lastIdRef.current}`
            : `/api/chat/rooms/${slug}/messages`;
        const res = await customFetch<{ messages: RoomMessage[] }>(url, {
          method: "GET",
        });
        if (cancelled) return;
        if (res.messages.length > 0) {
          setMessages((prev) => {
            const merged =
              lastIdRef.current === 0
                ? res.messages
                : [...(prev ?? []), ...res.messages];
            lastIdRef.current = Math.max(...merged.map((m) => m.id));
            return merged;
          });
        }
      } catch {
        // ignore
      }
    }
    lastIdRef.current = 0;
    setMessages([]);
    poll();
    const t = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [slug]);

  useEffect(() => {
    if (!messages) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!locationQuery) {
      setLocationResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await customFetch<LocationResult[]>(
          `/api/chat/location-search?q=${encodeURIComponent(locationQuery)}`,
        );
        setLocationResults(Array.isArray(res) ? res : []);
      } catch {
        setLocationResults([]);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [locationQuery]);

  function handleBodyChange(val: string) {
    setBody(val);
    const match = val.match(/#(\w*)$/);
    if (match !== null) {
      setLocationQuery(match[1] ?? "");
      setShowLocations(true);
    } else {
      setShowLocations(false);
      setLocationQuery("");
    }
  }

  function pickLocation(loc: LocationResult) {
    setBody((b) => b.replace(/#\w*$/, `[loc:${loc.id}:${loc.name}]`));
    setShowLocations(false);
    setLocationQuery("");
    setLocationResults([]);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const msg = await customFetch<RoomMessage>(
        `/api/chat/rooms/${slug}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        },
      );
      setBody("");
      setError(null);
      setMessages((prev) => {
        const merged = [...(prev ?? []), msg];
        lastIdRef.current = Math.max(...merged.map((m) => m.id));
        return merged;
      });
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function toggleLike(msgId: number) {
    try {
      const res = await customFetch<{ liked: boolean; count: number }>(
        `/api/chat/rooms/${slug}/messages/${msgId}/like`,
        { method: "POST" },
      );
      setMessages((prev) =>
        (prev ?? []).map((m) =>
          m.id === msgId
            ? { ...m, likedByMe: res.liked, likeCount: res.count }
            : m,
        ),
      );
    } catch {
      // ignore
    }
  }

  async function kick(userId: number, username: string) {
    if (!confirm(`Kick ${username} from this room for 24 hours?`)) return;
    try {
      await customFetch(`/api/chat/rooms/${slug}/kick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, minutes: 1440 }),
      });
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Link href="/chat">
          <Button
            variant="ghost"
            size="sm"
            className="font-mono uppercase tracking-wider text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>
        <h1 className="font-serif text-2xl text-primary tracking-widest uppercase">
          #{slug}
        </h1>
      </div>

      <div
        ref={scrollRef}
        className="border border-border/50 bg-card/20 backdrop-blur-sm h-[60vh] overflow-y-auto p-4 space-y-3"
      >
        {messages === null ? (
          <div className="text-center text-muted-foreground font-mono text-xs uppercase tracking-wider py-12">
            Establishing link...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground font-mono text-xs uppercase tracking-wider py-12">
            No transmissions yet. Be the first to break silence.
          </div>
        ) : (
          messages.map((m) => {
            const mine = user?.id === m.authorId;
            return (
              <div
                key={m.id}
                className="border-l-2 border-border/40 pl-3 hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
                  <span className={mine ? "text-primary" : "text-foreground"}>
                    {m.authorUsername}
                  </span>
                  {m.authorTrustLevel >= 3 && (
                    <Shield className="w-3 h-3 text-accent" />
                  )}
                  <span className="text-muted-foreground text-[10px]">
                    {formatDistanceToNow(new Date(m.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => toggleLike(m.id)}
                      className={`flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 border transition-colors ${
                        m.likedByMe
                          ? "border-red-400/60 text-red-400 bg-red-400/10"
                          : "border-border/40 text-muted-foreground hover:border-red-400/40 hover:text-red-400"
                      }`}
                      title={m.likedByMe ? "Unlike" : "Like"}
                    >
                      <Heart
                        className={`w-3 h-3 ${m.likedByMe ? "fill-red-400" : ""}`}
                      />
                      {m.likeCount > 0 && <span>{m.likeCount}</span>}
                    </button>
                    {isPrivileged && !mine && (
                      <button
                        type="button"
                        onClick={() => kick(m.authorId, m.authorUsername)}
                        className="border border-border/40 text-muted-foreground hover:border-destructive/60 hover:text-destructive px-1.5 py-0.5 transition-colors"
                        title="Kick from room (24h)"
                      >
                        <UserX className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="font-mono text-sm text-foreground whitespace-pre-wrap mt-1 leading-relaxed">
                  {renderBody(m.body, setLocation)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {error ? (
        <div className="mb-4 rounded-none border border-destructive/50 bg-destructive/10 p-3 text-sm font-mono text-destructive">
          {error}
        </div>
      ) : null}

      <div className="relative">
        {showLocations && (
          <div className="absolute bottom-full left-0 right-0 mb-1 border border-border/50 bg-card shadow-lg z-10 max-h-48 overflow-y-auto">
            {locationResults.length === 0 ? (
              <div className="font-mono text-xs text-muted-foreground p-3 uppercase tracking-wider">
                {locationQuery ? "No locations found..." : "Type to search locations..."}
              </div>
            ) : (
              locationResults.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => pickLocation(loc)}
                  className="w-full text-left p-2 hover:bg-primary/10 flex items-center gap-2 border-b border-border/20 last:border-0 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <div>
                    <div className="font-mono text-xs text-foreground">
                      {loc.name}
                    </div>
                    {(loc.city || loc.stateName) && (
                      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                        {[loc.city, loc.stateName].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        <form onSubmit={send} className="flex gap-2">
          <Input
            value={body}
            onChange={(e) => handleBodyChange(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setShowLocations(false)}
            placeholder="Transmit... (type # to tag a location)"
            className="font-mono text-sm bg-background/50 border-border rounded-none focus-visible:ring-primary/50"
          />
          <Button
            type="submit"
            disabled={sending || !body.trim()}
            className="font-serif tracking-widest uppercase rounded-none"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
          Type # to tag a location — hover messages to like or kick
        </p>
      </div>
    </div>
  );
}

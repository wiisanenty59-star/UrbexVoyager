import { useEffect, useRef, useState } from "react";
import { customFetch } from "@workspace/api-client-react";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Users, Plus, Send, Shield, Edit2, Calendar, MapPin, UserPlus, Heart } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

type CrewMember = {
  userId: number;
  username: string;
  trustLevel: number;
  joinedAt: string;
};
type Crew = {
  id: number;
  name: string;
  description: string;
  creatorId: number;
  creatorUsername: string;
  roomId: number;
  memberCount: number;
  members: CrewMember[];
  meetupAt: string | null;
  meetupNote: string | null;
  createdAt: string;
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
type LocationResult = {
  id: number;
  name: string;
  city: string | null;
  stateSlug: string | null;
  stateName: string | null;
};

function renderBody(body: string) {
  const parts = body.split(/(\[loc:\d+:[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[loc:(\d+):([^\]]+)\]$/);
        if (m) {
          const href = `/location/${m[1]}`;
          return (
            <a
              key={i}
              href={href}
              onClick={(e) => { e.preventDefault(); window.location.href = href; }}
              className="inline-flex items-center gap-1 border border-primary/50 bg-primary/10 text-primary font-mono text-[10px] uppercase tracking-wider hover:bg-primary/20 cursor-pointer mx-0.5 px-1.5 py-0.5"
            >
              <MapPin className="w-2.5 h-2.5" />
              {m[2]}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function CrewsPage() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selected, setSelected] = useState<Crew | null>(null);
  const { data: user } = useGetCurrentUser();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const { toast } = useToast();

  async function reload() {
    const c = await customFetch<Crew[]>("/api/crews", { method: "GET" });
    const list = Array.isArray(c) ? c : [];
    setCrews(list);
    if (selected) {
      const updated = list.find((x) => x.id === selected.id);
      if (updated) setSelected(updated);
    } else if (list.length > 0) {
      setSelected(list[0] ?? null);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createCrew(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const usernames = memberInput.split(/[, ]+/).map(s => s.trim()).filter(Boolean);
    const created = await customFetch<Crew>("/api/crews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, memberUsernames: usernames }),
    });
    setOpen(false);
    setName("");
    setDescription("");
    setMemberInput("");
    setCrews(prev => [created, ...prev]);
    setSelected(created);
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl text-primary tracking-widest uppercase flex items-center gap-3">
            <Users className="w-6 h-6" /> Crews
          </h1>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-2">
            Private squads for planning trips off the public boards.
          </p>
        </div>
        {user && (user as { trustLevel?: number }).trustLevel !== undefined && (user as { trustLevel?: number }).trustLevel! < 2 ? (
          <div className="text-right">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest border border-border/30 px-3 py-2 bg-card/20">
              ★ Honored rank (Trust Lvl 2+) required to form crews
            </div>
          </div>
        ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="font-serif tracking-widest uppercase rounded-none">
              <Plus className="w-4 h-4 mr-2" /> New Crew
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none border-border/50 bg-card">
            <DialogHeader>
              <DialogTitle className="font-serif tracking-widest uppercase">Form a Crew</DialogTitle>
            </DialogHeader>
            <form onSubmit={createCrew} className="space-y-3">
              <Input placeholder="Crew name" value={name} onChange={e => setName(e.target.value)} className="font-mono rounded-none" required />
              <Textarea placeholder="Mission briefing" value={description} onChange={e => setDescription(e.target.value)} className="font-mono rounded-none" />
              <Input placeholder="Members (usernames, comma separated)" value={memberInput} onChange={e => setMemberInput(e.target.value)} className="font-mono rounded-none" />
              <DialogFooter>
                <Button type="submit" className="font-serif tracking-widest uppercase rounded-none">Form Crew</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        <aside className="space-y-2">
          {crews.length === 0 && (
            <div className="text-muted-foreground font-mono text-xs uppercase tracking-wider p-4 border border-border/40">
              No crews yet
            </div>
          )}
          {crews.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full text-left border p-3 rounded-none transition-all ${selected?.id === c.id ? "border-primary bg-primary/10" : "border-border/50 bg-card/30 hover:border-primary/40"}`}
            >
              <div className="font-serif text-sm uppercase tracking-widest text-foreground truncate">{c.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                {c.memberCount} members
              </div>
              {c.meetupAt && (
                <div className="font-mono text-[10px] text-primary uppercase tracking-wider mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(c.meetupAt), "MMM d")}
                </div>
              )}
            </button>
          ))}
        </aside>

        {selected ? (
          <CrewDetail crew={selected} currentUserId={user?.id} onUpdate={reload} />
        ) : (
          <div className="text-muted-foreground font-mono text-xs uppercase tracking-wider p-12 border border-border/40 text-center">
            Form or select a crew
          </div>
        )}
      </div>
    </div>
  );
}

function CrewDetail({
  crew,
  currentUserId,
  onUpdate,
}: {
  crew: Crew;
  currentUserId: number | undefined;
  onUpdate: () => void;
}) {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const lastIdRef = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isCreator = currentUserId === crew.creatorId;

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(crew.name);
  const [editDesc, setEditDesc] = useState(crew.description);
  const [editMeetupAt, setEditMeetupAt] = useState(crew.meetupAt ? crew.meetupAt.slice(0, 16) : "");
  const [editMeetupNote, setEditMeetupNote] = useState(crew.meetupNote ?? "");
  const [savingEdit, setSavingEdit] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [newMember, setNewMember] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Location autocomplete
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [showLocations, setShowLocations] = useState(false);

  const openEdit = () => {
    setEditName(crew.name);
    setEditDesc(crew.description);
    setEditMeetupAt(crew.meetupAt ? crew.meetupAt.slice(0, 16) : "");
    setEditMeetupNote(crew.meetupNote ?? "");
    setEditOpen(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await customFetch(`/api/crews/${crew.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          meetupAt: editMeetupAt ? new Date(editMeetupAt).toISOString() : null,
          meetupNote: editMeetupNote || null,
        }),
      });
      setEditOpen(false);
      onUpdate();
      toast({ title: "Crew updated" });
    } catch {
      toast({ title: "Error", description: "Could not save changes.", variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.trim()) return;
    setAddingMember(true);
    try {
      await customFetch(`/api/crews/${crew.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newMember.trim() }),
      });
      setNewMember("");
      setAddOpen(false);
      onUpdate();
      toast({ title: "Member added" });
    } catch {
      toast({ title: "Error", description: "Could not add member. Check the username.", variant: "destructive" });
    } finally {
      setAddingMember(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    lastIdRef.current = 0;
    let cancelled = false;
    async function poll() {
      try {
        const url = lastIdRef.current > 0
          ? `/api/crews/${crew.id}/messages?sinceId=${lastIdRef.current}`
          : `/api/crews/${crew.id}/messages`;
        const res = await customFetch<{ messages: RoomMessage[] }>(url, { method: "GET" });
        if (cancelled) return;
        if (res.messages.length > 0) {
          setMessages(prev => {
            const merged = lastIdRef.current === 0 ? res.messages : [...prev, ...res.messages];
            lastIdRef.current = Math.max(...merged.map(m => m.id));
            return merged;
          });
        }
      } catch {}
    }
    poll();
    const t = setInterval(poll, 3000);
    return () => { cancelled = true; clearInterval(t); };
  }, [crew.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  useEffect(() => {
    if (!locationQuery) { setLocationResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await customFetch<LocationResult[]>(
          `/api/chat/location-search?q=${encodeURIComponent(locationQuery)}`
        );
        setLocationResults(Array.isArray(res) ? res : []);
      } catch { setLocationResults([]); }
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
    setBody(b => b.replace(/#\w*$/, `[loc:${loc.id}:${loc.name}]`));
    setShowLocations(false);
    setLocationQuery("");
    setLocationResults([]);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const msg = await customFetch<RoomMessage>(`/api/crews/${crew.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      setBody("");
      setMessages(prev => {
        const merged = [...prev, msg];
        lastIdRef.current = Math.max(...merged.map(m => m.id));
        return merged;
      });
    } finally {
      setSending(false);
    }
  }

  async function toggleLike(msgId: number) {
    try {
      const res = await customFetch<{ liked: boolean; count: number }>(
        `/api/crews/${crew.id}/messages/${msgId}/like`,
        { method: "POST" }
      );
      setMessages(prev =>
        prev.map(m => m.id === msgId ? { ...m, likedByMe: res.liked, likeCount: res.count } : m)
      );
    } catch {}
  }

  return (
    <div className="border border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-serif text-xl uppercase tracking-widest text-foreground truncate">{crew.name}</div>
            {crew.description && (
              <div className="font-mono text-xs text-muted-foreground mt-1">{crew.description}</div>
            )}
          </div>
          {isCreator && (
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={openEdit} className="h-8 w-8 rounded-none hover:bg-primary/20 hover:text-primary" title="Edit crew">
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setAddOpen(true)} className="h-8 w-8 rounded-none hover:bg-primary/20 hover:text-primary" title="Add member">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Meetup banner */}
        {crew.meetupAt && (
          <div className="mt-3 border border-primary/30 bg-primary/5 p-3 flex items-start gap-2">
            <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <div className="font-mono text-xs text-primary uppercase tracking-wider font-bold">
                Next Meetup: {format(new Date(crew.meetupAt), "EEEE, MMM d yyyy 'at' h:mm a")}
              </div>
              {crew.meetupNote && (
                <div className="font-mono text-xs text-muted-foreground mt-1">{crew.meetupNote}</div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mt-3">
          {crew.members.map(m => (
            <Badge key={m.userId} variant="outline" className="rounded-none border-border/50 bg-background/50 text-[10px] font-mono uppercase">
              {m.userId === crew.creatorId && <Shield className="w-3 h-3 mr-1 text-primary" />}
              {m.username}
              {m.trustLevel >= 3 && <Shield className="w-3 h-3 ml-1 text-accent" />}
            </Badge>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="h-[45vh] overflow-y-auto p-4 space-y-3 bg-background/30">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground font-mono text-xs uppercase tracking-wider py-12">
            Crew chat is silent
          </div>
        ) : (
          messages.map(m => {
            const mine = currentUserId === m.authorId;
            return (
              <div key={m.id} className="border-l-2 border-border/40 pl-3 hover:border-primary/40 transition-colors group">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
                  <span className={mine ? "text-primary" : "text-foreground"}>{m.authorUsername}</span>
                  <span className="text-muted-foreground text-[10px]">
                    {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
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
                      <Heart className={`w-3 h-3 ${m.likedByMe ? "fill-red-400" : ""}`} />
                      {m.likeCount > 0 && <span>{m.likeCount}</span>}
                    </button>
                  </div>
                </div>
                <div className="font-mono text-sm text-foreground whitespace-pre-wrap mt-1 leading-relaxed">
                  {renderBody(m.body)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send with location autocomplete */}
      <div className="relative p-3 border-t border-border/50">
        {showLocations && (
          <div className="absolute bottom-full left-3 right-3 mb-1 border border-border/50 bg-card shadow-lg z-10 max-h-40 overflow-y-auto">
            {locationResults.length === 0 ? (
              <div className="font-mono text-xs text-muted-foreground p-2 uppercase tracking-wider">
                {locationQuery ? "No locations found..." : "Type to search..."}
              </div>
            ) : (
              locationResults.map(loc => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => pickLocation(loc)}
                  className="w-full text-left p-2 hover:bg-primary/10 flex items-center gap-2 border-b border-border/20 last:border-0 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <div>
                    <div className="font-mono text-xs text-foreground">{loc.name}</div>
                    {(loc.city || loc.stateName) && (
                      <div className="font-mono text-[10px] text-muted-foreground uppercase">
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
            onChange={e => handleBodyChange(e.target.value)}
            onKeyDown={e => e.key === "Escape" && setShowLocations(false)}
            placeholder="Transmit to crew... (# to tag location)"
            className="font-mono rounded-none"
          />
          <Button type="submit" disabled={sending || !body.trim()} className="font-serif tracking-widest uppercase rounded-none">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-none border-border/50 bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif tracking-widest uppercase">Edit Crew</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-muted-foreground">Crew Name</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="rounded-none font-mono" required />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-muted-foreground">Mission Briefing</label>
              <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="rounded-none font-mono" rows={2} />
            </div>
            <div className="border-t border-border/50 pt-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs uppercase text-muted-foreground tracking-wider">Schedule Meetup</span>
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Meetup Date & Time</label>
                <Input
                  type="datetime-local"
                  value={editMeetupAt}
                  onChange={e => setEditMeetupAt(e.target.value)}
                  className="rounded-none font-mono"
                />
                <p className="font-mono text-[10px] text-muted-foreground">Leave empty to clear the meetup</p>
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Meetup Location / Notes</label>
                <Textarea
                  value={editMeetupNote}
                  onChange={e => setEditMeetupNote(e.target.value)}
                  className="rounded-none font-mono"
                  rows={2}
                  placeholder="Where and what to bring..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} className="rounded-none font-mono">Cancel</Button>
              <Button type="submit" disabled={savingEdit} className="rounded-none font-serif tracking-widest uppercase">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add member dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-none border-border/50 bg-card max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif tracking-widest uppercase">Add Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={addMember} className="space-y-3">
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-muted-foreground">Username</label>
              <Input value={newMember} onChange={e => setNewMember(e.target.value)} className="rounded-none font-mono" placeholder="operative_id" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} className="rounded-none font-mono">Cancel</Button>
              <Button type="submit" disabled={addingMember} className="rounded-none font-serif tracking-widest uppercase">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

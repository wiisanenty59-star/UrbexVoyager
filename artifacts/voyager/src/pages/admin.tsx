import { useState } from "react";
import {
  useAdminListUsers, useAdminUpdateUser,
  useAdminListInvites, useAdminCreateInvite, useAdminRevokeInvite,
  useListCategories, useAdminCreateCategory, useAdminUpdateCategory, useAdminDeleteCategory,
  useListStates, useAdminCreateState, useAdminUpdateState, useAdminDeleteState,
  useListLocations, useAdminUpdateLocation, useAdminDeleteLocation,
  useListThreads, useAdminPinThread, useAdminDeleteThread,
  useGetForumStats,
  customFetch,
  getAdminListUsersQueryKey, getAdminListInvitesQueryKey,
  getListCategoriesQueryKey, getListStatesQueryKey,
  getListLocationsQueryKey, getListThreadsQueryKey,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield, KeyRound, Map, MapPin, MessageSquare, Trash2, Edit2, Plus,
  Copy, Ban, UserCheck, FileText, Settings, Pin, PinOff, BellRing,
  Radio, Archive, ArchiveRestore, UserX,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Admin() {
  const statsQuery = useGetForumStats();
  const stats = statsQuery.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-serif text-3xl text-foreground tracking-widest uppercase">Admin Override</h1>
            <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">System Control Interface</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-none border border-border/50 bg-background/80 p-4">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Members</div>
            <div className="text-3xl font-serif text-foreground">{stats?.memberCount ?? "--"}</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Newest: {stats?.newestMember ?? "—"}</div>
          </div>
          <div className="rounded-none border border-border/50 bg-background/80 p-4">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Threads</div>
            <div className="text-3xl font-serif text-foreground">{stats?.threadCount ?? "--"}</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Locations: {stats?.locationCount ?? "--"}</div>
          </div>
          <div className="rounded-none border border-border/50 bg-background/80 p-4">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Posts</div>
            <div className="text-3xl font-serif text-foreground">{stats?.postCount ?? "--"}</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Sectors: {stats?.stateCount ?? "--"}</div>
          </div>
          <div className="rounded-none border border-border/50 bg-background/80 p-4">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Live stats</div>
            <div className="text-sm font-mono text-foreground">{statsQuery.isLoading ? "Loading…" : "Updated"}</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Refresh every 30s</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="invites" className="w-full">
        <TabsList className="bg-card/40 border border-border/50 rounded-none h-auto flex flex-wrap p-1 gap-1">
          <TabsTrigger value="invites" className="rounded-none font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><KeyRound className="w-4 h-4 mr-2" /> Invites</TabsTrigger>
          <TabsTrigger value="users" className="rounded-none font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Shield className="w-4 h-4 mr-2" /> Users</TabsTrigger>
          <TabsTrigger value="categories" className="rounded-none font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Map className="w-4 h-4 mr-2" /> Categories</TabsTrigger>
          <TabsTrigger value="states" className="rounded-none font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><MapPin className="w-4 h-4 mr-2" /> States</TabsTrigger>
          <TabsTrigger value="locations" className="rounded-none font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><MapPin className="w-4 h-4 mr-2" /> Locations</TabsTrigger>
          <TabsTrigger value="threads" className="rounded-none font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><MessageSquare className="w-4 h-4 mr-2" /> Threads</TabsTrigger>
          <TabsTrigger value="guidelines" className="rounded-none font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="w-4 h-4 mr-2" /> Guidelines</TabsTrigger>
          <TabsTrigger value="noticeboard" className="rounded-none font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><BellRing className="w-4 h-4 mr-2" /> Noticeboard</TabsTrigger>
          <TabsTrigger value="chat" className="rounded-none font-mono text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Radio className="w-4 h-4 mr-2" /> Chat Rooms</TabsTrigger>
        </TabsList>

        <div className="mt-6 border border-border/50 bg-card/20 p-6 backdrop-blur-sm min-h-[500px]">
          <TabsContent value="invites" className="m-0"><InvitesTab /></TabsContent>
          <TabsContent value="users" className="m-0"><UsersTab /></TabsContent>
          <TabsContent value="categories" className="m-0"><CategoriesTab /></TabsContent>
          <TabsContent value="states" className="m-0"><StatesTab /></TabsContent>
          <TabsContent value="locations" className="m-0"><LocationsTab /></TabsContent>
          <TabsContent value="threads" className="m-0"><ThreadsTab /></TabsContent>
          <TabsContent value="guidelines" className="m-0"><GuidelinesTab /></TabsContent>
          <TabsContent value="noticeboard" className="m-0"><NoticeboardTab /></TabsContent>
          <TabsContent value="chat" className="m-0"><ChatRoomsTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ─── Invites ────────────────────────────────────────────────────────────────

function InvitesTab() {
  const { data, isLoading } = useAdminListInvites();
  const createInvite = useAdminCreateInvite();
  const revokeInvite = useAdminRevokeInvite();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [note, setNote] = useState("");

  const handleCreate = () => {
    createInvite.mutate({ data: { note: note || null } }, {
      onSuccess: () => {
        setNote("");
        queryClient.invalidateQueries({ queryKey: getAdminListInvitesQueryKey() });
        toast({ title: "Invite created", description: "A new access code has been generated." });
      },
    });
  };

  const handleCopy = (code: string) => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/invite/${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied to clipboard", description: "Invite link ready to share." });
  };

  const handleRevoke = (id: number) => {
    if (!confirm("Revoke this invite?")) return;
    revokeInvite.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListInvitesQueryKey() });
        toast({ title: "Invite revoked" });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="space-y-2 flex-1 max-w-sm">
          <label className="font-mono text-xs uppercase text-muted-foreground">Internal Note (Optional)</label>
          <Input value={note} onChange={e => setNote(e.target.value)} className="bg-background/50 rounded-none border-border font-mono" placeholder="Who is this for?" />
        </div>
        <Button onClick={handleCreate} disabled={createInvite.isPending} className="font-serif tracking-widest uppercase rounded-none shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Generate Key
        </Button>
      </div>
      <div className="border border-border/50 bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase">Code</TableHead>
              <TableHead className="font-mono text-xs uppercase">Note</TableHead>
              <TableHead className="font-mono text-xs uppercase">Created By</TableHead>
              <TableHead className="font-mono text-xs uppercase">Status</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Skeleton className="h-4 w-32 mx-auto" /></TableCell></TableRow>
            ) : data?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 font-mono text-xs text-muted-foreground italic">No invites generated.</TableCell></TableRow>
            ) : data?.map(invite => (
              <TableRow key={invite.id} className="border-border/50 group">
                <TableCell className="font-mono text-primary">{invite.code}</TableCell>
                <TableCell className="font-mono text-sm">{invite.note || "-"}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{invite.createdByUsername}</TableCell>
                <TableCell>
                  {invite.usedById ? (
                    <Badge variant="outline" className="rounded-none border-destructive/30 text-destructive bg-destructive/10 text-[10px] uppercase font-mono">Used by {invite.usedByUsername}</Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-none border-green-500/30 text-green-500 bg-green-500/10 text-[10px] uppercase font-mono">Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {!invite.usedById && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(invite.code)} className="h-8 w-8 rounded-none hover:bg-primary/20 hover:text-primary"><Copy className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRevoke(invite.id)} className="h-8 w-8 rounded-none hover:bg-destructive/20 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Users ───────────────────────────────────────────────────────────────────

function UsersTab() {
  const { data, isLoading } = useAdminListUsers();
  const updateUser = useAdminUpdateUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleTrustChange = (id: number, trustLevel: number) => {
    updateUser.mutate({ id, data: { trustLevel } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        toast({ title: "Trust level updated" });
      },
      onError: () => toast({ title: "Error", description: "Could not change trust level", variant: "destructive" }),
    });
  };

  const handleToggleRole = (id: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    updateUser.mutate({ id, data: { role: newRole as "admin" | "member" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        toast({ title: "Role updated" });
      },
    });
  };

  const handleToggleBan = (id: number, isBanned: boolean) => {
    if (!confirm(`Are you sure you want to ${isBanned ? "unban" : "ban"} this user?`)) return;
    updateUser.mutate({ id, data: { isBanned: !isBanned } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        toast({ title: "Ban status updated" });
      },
    });
  };

  return (
    <div className="border border-border/50 bg-background overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="font-mono text-xs uppercase">Operative</TableHead>
            <TableHead className="font-mono text-xs uppercase">Role</TableHead>
            <TableHead className="font-mono text-xs uppercase">Trust</TableHead>
            <TableHead className="font-mono text-xs uppercase">Posts</TableHead>
            <TableHead className="font-mono text-xs uppercase">Status</TableHead>
            <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={6} className="text-center py-8"><Skeleton className="h-4 w-32 mx-auto" /></TableCell></TableRow>
          ) : data?.map(user => (
            <TableRow key={user.id} className="border-border/50 group">
              <TableCell className="font-mono text-sm font-medium">{user.username}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`rounded-none text-[10px] uppercase font-mono px-2 py-0.5 ${user.role === "admin" ? "border-primary/50 text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Select value={String(user.trustLevel)} onValueChange={(value) => handleTrustChange(user.id, Number(value))}>
                  <SelectTrigger className="min-w-[4rem] rounded-none font-mono text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-none">
                    {[0,1,2,3,4,5].map(level => (
                      <SelectItem key={level} value={String(level)} className="font-mono">Level {level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">{user.postCount}</TableCell>
              <TableCell>
                {user.isBanned ? (
                  <Badge variant="outline" className="rounded-none border-destructive/50 text-destructive bg-destructive/10 text-[10px] uppercase font-mono">Banned</Badge>
                ) : (
                  <Badge variant="outline" className="rounded-none border-green-500/50 text-green-500 bg-green-500/10 text-[10px] uppercase font-mono">Active</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" onClick={() => handleToggleRole(user.id, user.role)} title="Toggle Admin" className="h-8 w-8 rounded-none hover:bg-accent/20 hover:text-accent">
                  <Shield className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleToggleBan(user.id, user.isBanned)} title={user.isBanned ? "Unban" : "Ban"} className={`h-8 w-8 rounded-none hover:bg-destructive/20 hover:text-destructive ${user.isBanned ? "text-destructive" : ""}`}>
                  {user.isBanned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Categories ──────────────────────────────────────────────────────────────

type CategoryForm = { slug: string; name: string; description: string; icon: string; sortOrder: string };
const emptyCatForm = (): CategoryForm => ({ slug: "", name: "", description: "", icon: "", sortOrder: "10" });

function CategoriesTab() {
  const { data, isLoading } = useListCategories();
  const createCat = useAdminCreateCategory();
  const updateCat = useAdminUpdateCategory();
  const deleteCat = useAdminDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyCatForm());

  const openCreate = () => { setForm(emptyCatForm()); setShowCreate(true); };
  const openEdit = (c: { id: number; slug: string; name: string; description: string; icon: string | null; sortOrder: number }) => {
    setEditId(c.id);
    setForm({ slug: c.slug, name: c.name, description: c.description, icon: c.icon ?? "", sortOrder: String(c.sortOrder) });
  };

  const handleSave = () => {
    const payload = { slug: form.slug, name: form.name, description: form.description, icon: form.icon || null, sortOrder: parseInt(form.sortOrder, 10) || 10 };
    if (editId !== null) {
      updateCat.mutate({ id: editId, data: payload }, {
        onSuccess: () => {
          setEditId(null);
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          toast({ title: "Category updated" });
        },
        onError: () => toast({ title: "Error", description: "Could not update category", variant: "destructive" }),
      });
    } else {
      createCat.mutate({ data: payload }, {
        onSuccess: () => {
          setShowCreate(false);
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          toast({ title: "Category created" });
        },
        onError: () => toast({ title: "Error", description: "Could not create category", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"? All threads will be removed too.`)) return;
    deleteCat.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        toast({ title: "Category deleted" });
      },
    });
  };

  const isOpen = showCreate || editId !== null;
  const setIsOpen = (v: boolean) => { if (!v) { setShowCreate(false); setEditId(null); } };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="font-serif tracking-widest uppercase rounded-none">
          <Plus className="w-4 h-4 mr-2" /> New Category
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-none border-border/50 bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif tracking-widest uppercase">{editId ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Name</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-none font-mono" placeholder="Trip Reports" />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Slug</label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="rounded-none font-mono" placeholder="trip-reports" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-muted-foreground">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-none font-mono" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Icon (lucide name)</label>
                <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="rounded-none font-mono" placeholder="compass" />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Sort Order</label>
                <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="rounded-none font-mono" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-none font-mono">Cancel</Button>
            <Button onClick={handleSave} disabled={createCat.isPending || updateCat.isPending} className="rounded-none font-serif tracking-widest uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border border-border/50 bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase">Name</TableHead>
              <TableHead className="font-mono text-xs uppercase">Slug</TableHead>
              <TableHead className="font-mono text-xs uppercase">Threads</TableHead>
              <TableHead className="font-mono text-xs uppercase">Order</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Skeleton className="h-4 w-32 mx-auto" /></TableCell></TableRow>
            ) : data?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 font-mono text-xs text-muted-foreground">No categories.</TableCell></TableRow>
            ) : data?.map(cat => (
              <TableRow key={cat.id} className="border-border/50 group">
                <TableCell className="font-mono text-sm font-medium">{cat.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{cat.slug}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{cat.threadCount}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{cat.sortOrder}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(cat)} className="h-8 w-8 rounded-none hover:bg-primary/20 hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id, cat.name)} className="h-8 w-8 rounded-none hover:bg-destructive/20 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── States ──────────────────────────────────────────────────────────────────

type StateForm = { slug: string; name: string; abbreviation: string; centerLat: string; centerLng: string; zoom: string };
const emptyStateForm = (): StateForm => ({ slug: "", name: "", abbreviation: "", centerLat: "40.0", centerLng: "-90.0", zoom: "7" });

function StatesTab() {
  const { data, isLoading } = useListStates();
  const createState = useAdminCreateState();
  const updateState = useAdminUpdateState();
  const deleteState = useAdminDeleteState();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<StateForm>(emptyStateForm());

  const openCreate = () => { setForm(emptyStateForm()); setShowCreate(true); };
  const openEdit = (s: { id: number; slug: string; name: string; abbreviation: string; centerLat: number; centerLng: number; zoom: number }) => {
    setEditId(s.id);
    setForm({ slug: s.slug, name: s.name, abbreviation: s.abbreviation, centerLat: String(s.centerLat), centerLng: String(s.centerLng), zoom: String(s.zoom) });
  };

  const handleSave = () => {
    const payload = { slug: form.slug, name: form.name, abbreviation: form.abbreviation, centerLat: parseFloat(form.centerLat), centerLng: parseFloat(form.centerLng), zoom: parseInt(form.zoom, 10) || 7 };
    if (editId !== null) {
      updateState.mutate({ id: editId, data: payload }, {
        onSuccess: () => {
          setEditId(null);
          queryClient.invalidateQueries({ queryKey: getListStatesQueryKey() });
          toast({ title: "State updated" });
        },
        onError: () => toast({ title: "Error", description: "Could not update state", variant: "destructive" }),
      });
    } else {
      createState.mutate({ data: payload }, {
        onSuccess: () => {
          setShowCreate(false);
          queryClient.invalidateQueries({ queryKey: getListStatesQueryKey() });
          toast({ title: "State added" });
        },
        onError: () => toast({ title: "Error", description: "Could not create state", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Remove sector "${name}"? Locations and threads in this sector will be affected.`)) return;
    deleteState.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStatesQueryKey() });
        toast({ title: "State removed" });
      },
    });
  };

  const isOpen = showCreate || editId !== null;
  const setIsOpen = (v: boolean) => { if (!v) { setShowCreate(false); setEditId(null); } };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="font-serif tracking-widest uppercase rounded-none">
          <Plus className="w-4 h-4 mr-2" /> Add Sector
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rounded-none border-border/50 bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif tracking-widest uppercase">{editId ? "Edit Sector" : "New Sector"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Name</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-none font-mono" placeholder="Illinois" />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Abbrev.</label>
                <Input value={form.abbreviation} onChange={e => setForm(f => ({ ...f, abbreviation: e.target.value.toUpperCase().slice(0, 2) }))} className="rounded-none font-mono" placeholder="IL" maxLength={2} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-muted-foreground">Slug</label>
              <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="rounded-none font-mono" placeholder="illinois" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Center Lat</label>
                <Input type="number" step="0.01" value={form.centerLat} onChange={e => setForm(f => ({ ...f, centerLat: e.target.value }))} className="rounded-none font-mono" />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Center Lng</label>
                <Input type="number" step="0.01" value={form.centerLng} onChange={e => setForm(f => ({ ...f, centerLng: e.target.value }))} className="rounded-none font-mono" />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Zoom</label>
                <Input type="number" min={4} max={14} value={form.zoom} onChange={e => setForm(f => ({ ...f, zoom: e.target.value }))} className="rounded-none font-mono" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-none font-mono">Cancel</Button>
            <Button onClick={handleSave} disabled={createState.isPending || updateState.isPending} className="rounded-none font-serif tracking-widest uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border border-border/50 bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase">Name</TableHead>
              <TableHead className="font-mono text-xs uppercase">Abbr</TableHead>
              <TableHead className="font-mono text-xs uppercase">Slug</TableHead>
              <TableHead className="font-mono text-xs uppercase">Locations</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Skeleton className="h-4 w-32 mx-auto" /></TableCell></TableRow>
            ) : data?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 font-mono text-xs text-muted-foreground">No states.</TableCell></TableRow>
            ) : data?.map(s => (
              <TableRow key={s.id} className="border-border/50 group">
                <TableCell className="font-mono text-sm font-medium">{s.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{s.abbreviation}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{s.slug}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{s.locationCount}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)} className="h-8 w-8 rounded-none hover:bg-primary/20 hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id, s.name)} className="h-8 w-8 rounded-none hover:bg-destructive/20 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Locations ───────────────────────────────────────────────────────────────

function LocationsTab() {
  const { data, isLoading } = useListLocations();
  const updateLoc = useAdminUpdateLocation();
  const deleteLoc = useAdminDeleteLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", city: "", status: "active", risk: "low" });

  const openEdit = (l: { id: number; name: string; description: string; city: string | null; status: string; risk: string }) => {
    setEditId(l.id);
    setForm({ name: l.name, description: l.description, city: l.city ?? "", status: l.status, risk: l.risk });
  };

  const handleSave = () => {
    if (editId === null) return;
    updateLoc.mutate({ id: editId, data: { name: form.name, description: form.description, city: form.city || null, status: form.status as "active" | "demolished" | "sealed" | "watched", risk: form.risk as "low" | "medium" | "high" | "extreme" } }, {
      onSuccess: () => {
        setEditId(null);
        queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() });
        toast({ title: "Location updated" });
      },
      onError: () => toast({ title: "Error", description: "Could not update location", variant: "destructive" }),
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete location "${name}"?`)) return;
    deleteLoc.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() });
        toast({ title: "Location deleted" });
      },
    });
  };

  const STATUS_COLORS: Record<string, string> = {
    active: "border-green-500/30 text-green-500 bg-green-500/10",
    demolished: "border-destructive/30 text-destructive bg-destructive/10",
    sealed: "border-yellow-500/30 text-yellow-500 bg-yellow-500/10",
    watched: "border-orange-500/30 text-orange-500 bg-orange-500/10",
  };

  return (
    <div className="space-y-4">
      <Dialog open={editId !== null} onOpenChange={v => { if (!v) setEditId(null); }}>
        <DialogContent className="rounded-none border-border/50 bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif tracking-widest uppercase">Edit Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-muted-foreground">Name</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-none font-mono" />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-muted-foreground">Description</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-none font-mono" rows={3} />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-muted-foreground">City</label>
              <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="rounded-none font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Status</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="rounded-none font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-none">
                    {["active", "demolished", "sealed", "watched"].map(s => <SelectItem key={s} value={s} className="font-mono">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Risk</label>
                <Select value={form.risk} onValueChange={v => setForm(f => ({ ...f, risk: v }))}>
                  <SelectTrigger className="rounded-none font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-none">
                    {["low", "medium", "high", "extreme"].map(r => <SelectItem key={r} value={r} className="font-mono">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditId(null)} className="rounded-none font-mono">Cancel</Button>
            <Button onClick={handleSave} disabled={updateLoc.isPending} className="rounded-none font-serif tracking-widest uppercase">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border border-border/50 bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase">Location</TableHead>
              <TableHead className="font-mono text-xs uppercase">State</TableHead>
              <TableHead className="font-mono text-xs uppercase">Status</TableHead>
              <TableHead className="font-mono text-xs uppercase">Risk</TableHead>
              <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8"><Skeleton className="h-4 w-32 mx-auto" /></TableCell></TableRow>
            ) : data?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 font-mono text-xs text-muted-foreground">No locations yet.</TableCell></TableRow>
            ) : data?.map(loc => (
              <TableRow key={loc.id} className="border-border/50 group">
                <TableCell>
                  <div className="font-mono text-sm font-medium">{loc.name}</div>
                  {loc.city && <div className="font-mono text-[10px] text-muted-foreground">{loc.city}</div>}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{loc.stateName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`rounded-none text-[10px] uppercase font-mono ${STATUS_COLORS[loc.status] ?? ""}`}>{loc.status}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground uppercase">{loc.risk}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(loc)} className="h-8 w-8 rounded-none hover:bg-primary/20 hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id, loc.name)} className="h-8 w-8 rounded-none hover:bg-destructive/20 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Threads ─────────────────────────────────────────────────────────────────

function ThreadsTab() {
  const { data, isLoading } = useListThreads();
  const pinThread = useAdminPinThread();
  const deleteThread = useAdminDeleteThread();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleTogglePin = (id: number, isPinned: boolean) => {
    pinThread.mutate({ id, data: { isPinned: !isPinned } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListThreadsQueryKey() });
        toast({ title: isPinned ? "Thread unpinned" : "Thread pinned" });
      },
    });
  };

  const handleToggleLock = (id: number, isLocked: boolean) => {
    customFetch(`/api/admin/threads/${id}/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isLocked: !isLocked }),
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: getListThreadsQueryKey() });
      toast({ title: isLocked ? "Thread unlocked" : "Thread locked" });
    }).catch(() => toast({ title: "Error", variant: "destructive" }));
  };

  const handleDelete = (id: number) => {
    if (!confirm("Permanently delete this thread and all its posts?")) return;
    deleteThread.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListThreadsQueryKey() });
        toast({ title: "Thread deleted" });
      },
    });
  };

  return (
    <div className="border border-border/50 bg-background overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="font-mono text-xs uppercase">Transmission</TableHead>
            <TableHead className="font-mono text-xs uppercase">Author</TableHead>
            <TableHead className="font-mono text-xs uppercase">Category</TableHead>
            <TableHead className="font-mono text-xs uppercase">Status</TableHead>
            <TableHead className="font-mono text-xs uppercase text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={5} className="text-center py-8"><Skeleton className="h-4 w-32 mx-auto" /></TableCell></TableRow>
          ) : data?.map(thread => (
            <TableRow key={thread.id} className="border-border/50 group">
              <TableCell className="font-mono text-sm font-medium max-w-[220px] truncate">{thread.title}</TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">{thread.authorUsername}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{thread.categoryName}</TableCell>
              <TableCell className="space-x-1">
                {thread.isPinned && <Badge variant="outline" className="rounded-none border-primary/50 text-primary bg-primary/10 text-[10px] uppercase font-mono">Pinned</Badge>}
                {thread.isLocked && <Badge variant="outline" className="rounded-none border-destructive/50 text-destructive bg-destructive/10 text-[10px] uppercase font-mono">Locked</Badge>}
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="sm" onClick={() => handleTogglePin(thread.id, thread.isPinned)} className="rounded-none font-mono text-xs uppercase hover:text-primary h-8 px-2">
                  {thread.isPinned ? "Unpin" : "Pin"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleToggleLock(thread.id, thread.isLocked)} className="rounded-none font-mono text-xs uppercase hover:text-yellow-500 h-8 px-2">
                  {thread.isLocked ? "Unlock" : "Lock"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(thread.id)} className="h-8 w-8 rounded-none hover:bg-destructive/20 hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Chat Rooms ───────────────────────────────────────────────────────────────

type AdminChatRoom = {
  id: number; slug: string; name: string; description: string;
  kind: string; minTrustLevel: number; isArchived: boolean;
  memberCount: number; messageCount: number; createdAt: string;
};

type RoomBan = {
  id: number; roomSlug: string | null; roomName: string | null;
  userId: number; username: string | null;
  bannedUntil: string | null; reason: string; createdAt: string;
};

function ChatRoomsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms, isLoading } = useQuery<AdminChatRoom[]>({
    queryKey: ["admin-chat-rooms"],
    queryFn: () => customFetch<AdminChatRoom[]>("/api/admin/chat/rooms"),
  });
  const { data: bans } = useQuery<RoomBan[]>({
    queryKey: ["admin-chat-bans"],
    queryFn: () => customFetch<RoomBan[]>("/api/admin/chat/bans"),
  });

  // Create room
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newKind, setNewKind] = useState("public");
  const [newMinTrust, setNewMinTrust] = useState("0");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await customFetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, slug: newSlug, description: newDesc, kind: newKind, minTrustLevel: parseInt(newMinTrust) }),
      });
      setCreateOpen(false); setNewName(""); setNewSlug(""); setNewDesc(""); setNewKind("public"); setNewMinTrust("0");
      queryClient.invalidateQueries({ queryKey: ["admin-chat-rooms"] });
      toast({ title: "Room created" });
    } catch { toast({ title: "Error", description: "Could not create room.", variant: "destructive" }); }
    finally { setCreating(false); }
  };

  // Edit room
  const [editRoom, setEditRoom] = useState<AdminChatRoom | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editMinTrust, setEditMinTrust] = useState("0");
  const [editKind, setEditKind] = useState("public");
  const [saving, setSaving] = useState(false);

  const openEdit = (r: AdminChatRoom) => {
    setEditRoom(r); setEditName(r.name); setEditDesc(r.description);
    setEditMinTrust(String(r.minTrustLevel)); setEditKind(r.kind);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;
    setSaving(true);
    try {
      await customFetch(`/api/chat/rooms/${editRoom.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDesc, minTrustLevel: parseInt(editMinTrust), kind: editKind }),
      });
      setEditRoom(null);
      queryClient.invalidateQueries({ queryKey: ["admin-chat-rooms"] });
      toast({ title: "Room updated" });
    } catch { toast({ title: "Error", description: "Could not update room.", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const toggleArchive = async (r: AdminChatRoom) => {
    await customFetch(`/api/chat/rooms/${r.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !r.isArchived }),
    });
    queryClient.invalidateQueries({ queryKey: ["admin-chat-rooms"] });
    toast({ title: r.isArchived ? "Room restored" : "Room archived" });
  };

  const unban = async (banId: number) => {
    await customFetch(`/api/admin/chat/bans/${banId}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["admin-chat-bans"] });
    toast({ title: "Ban lifted" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-serif text-lg text-primary tracking-widest uppercase">Chat Room Management</h3>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Create, edit, and archive public chat rooms. Crew rooms are managed separately.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="font-mono uppercase tracking-wider rounded-none shrink-0">
              <Plus className="w-4 h-4 mr-2" /> New Room
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-none border-border/50 bg-card max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif tracking-widest uppercase">Create Chat Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Room Name</label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} className="rounded-none font-mono" placeholder="General Discussion" required />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Slug (URL identifier)</label>
                <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} className="rounded-none font-mono" placeholder="general-discussion" required />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Description</label>
                <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="rounded-none font-mono" placeholder="Optional description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase text-muted-foreground">Type</label>
                  <Select value={newKind} onValueChange={setNewKind}>
                    <SelectTrigger className="rounded-none font-mono text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="trusted">Trusted Only</SelectItem>
                      <SelectItem value="location">Location Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-xs uppercase text-muted-foreground">Min Trust Level</label>
                  <Select value={newMinTrust} onValueChange={setNewMinTrust}>
                    <SelectTrigger className="rounded-none font-mono text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[0,1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>Level {n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="rounded-none font-mono">Cancel</Button>
                <Button type="submit" disabled={creating} className="rounded-none font-serif tracking-widest uppercase">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rooms table */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : (
        <div className="border border-border/50 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-card/40">
                <TableHead className="font-mono text-xs uppercase text-muted-foreground">Name / Slug</TableHead>
                <TableHead className="font-mono text-xs uppercase text-muted-foreground">Type</TableHead>
                <TableHead className="font-mono text-xs uppercase text-muted-foreground">Min Trust</TableHead>
                <TableHead className="font-mono text-xs uppercase text-muted-foreground">Messages</TableHead>
                <TableHead className="font-mono text-xs uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="font-mono text-xs uppercase text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms?.map(r => (
                <TableRow key={r.id} className={`border-border/30 ${r.isArchived ? "opacity-50" : ""}`}>
                  <TableCell>
                    <div className="font-mono text-sm text-foreground">{r.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase">#{r.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-none font-mono text-[10px] uppercase">{r.kind}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.minTrustLevel}</TableCell>
                  <TableCell className="font-mono text-xs">{r.messageCount}</TableCell>
                  <TableCell>
                    <Badge variant={r.isArchived ? "secondary" : "outline"} className="rounded-none font-mono text-[10px] uppercase">
                      {r.isArchived ? "Archived" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-primary/20" onClick={() => openEdit(r)} title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none hover:bg-muted/40" onClick={() => toggleArchive(r)} title={r.isArchived ? "Restore" : "Archive"}>
                        {r.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editRoom} onOpenChange={o => { if (!o) setEditRoom(null); }}>
        <DialogContent className="rounded-none border-border/50 bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif tracking-widest uppercase">Edit Room — #{editRoom?.slug}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-muted-foreground">Name</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="rounded-none font-mono" required />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-xs uppercase text-muted-foreground">Description</label>
              <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="rounded-none font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Type</label>
                <Select value={editKind} onValueChange={setEditKind}>
                  <SelectTrigger className="rounded-none font-mono text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="trusted">Trusted Only</SelectItem>
                    <SelectItem value="location">Location Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="font-mono text-xs uppercase text-muted-foreground">Min Trust Level</label>
                <Select value={editMinTrust} onValueChange={setEditMinTrust}>
                  <SelectTrigger className="rounded-none font-mono text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0,1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>Level {n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditRoom(null)} className="rounded-none font-mono">Cancel</Button>
              <Button type="submit" disabled={saving} className="rounded-none font-serif tracking-widest uppercase">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Active bans */}
      <div className="space-y-3">
        <h4 className="font-serif text-base text-primary tracking-widest uppercase flex items-center gap-2">
          <UserX className="w-4 h-4" /> Active Kicks / Bans
        </h4>
        {!bans?.length ? (
          <div className="font-mono text-xs text-muted-foreground italic p-3 border border-border/30">No active bans.</div>
        ) : (
          <div className="border border-border/50 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 bg-card/40">
                  <TableHead className="font-mono text-xs uppercase text-muted-foreground">User</TableHead>
                  <TableHead className="font-mono text-xs uppercase text-muted-foreground">Room</TableHead>
                  <TableHead className="font-mono text-xs uppercase text-muted-foreground">Expires</TableHead>
                  <TableHead className="font-mono text-xs uppercase text-muted-foreground text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bans.map(ban => (
                  <TableRow key={ban.id} className="border-border/30">
                    <TableCell className="font-mono text-xs">{ban.username}</TableCell>
                    <TableCell className="font-mono text-xs">#{ban.roomSlug}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {ban.bannedUntil ? new Date(ban.bannedUntil).toLocaleString() : "Permanent"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => unban(ban.id)} className="h-7 rounded-none font-mono text-[10px] uppercase hover:bg-green-500/20 hover:text-green-400">
                        Lift Ban
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Noticeboard ─────────────────────────────────────────────────────────────

type AdminNotice = {
  id: number; title: string; body: string;
  authorUsername: string | null; isPinned: boolean; createdAt: string;
};

function NoticeboardTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const { data: notices, isLoading } = useQuery<AdminNotice[]>({
    queryKey: ["admin-notices"],
    queryFn: () => customFetch<AdminNotice[]>("/api/admin/notices"),
  });

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSending(true);
    try {
      await customFetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      setTitle(""); setBody("");
      queryClient.invalidateQueries({ queryKey: ["admin-notices"] });
      toast({ title: "Notice posted" });
    } catch {
      toast({ title: "Error", description: "Could not post notice.", variant: "destructive" });
    } finally { setSending(false); }
  };

  const handlePin = async (notice: AdminNotice) => {
    await customFetch(`/api/admin/notices/${notice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !notice.isPinned }),
    });
    queryClient.invalidateQueries({ queryKey: ["admin-notices"] });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this notice?")) return;
    await customFetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["admin-notices"] });
    toast({ title: "Notice deleted" });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-serif text-lg text-primary tracking-widest uppercase">Admin Noticeboard</h3>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          Internal bulletin board — visible to admins only. Pin important notices to the top.
        </p>
      </div>

      {/* Post form */}
      <form onSubmit={handlePost} className="space-y-3 border border-border/50 bg-card/30 p-4">
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notice title" className="font-mono rounded-none bg-background/50" required />
        <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Notice body (optional)..." rows={3} className="font-mono rounded-none bg-background/50 text-sm" />
        <Button type="submit" disabled={sending} size="sm" className="font-mono uppercase tracking-wider rounded-none">
          <Plus className="w-4 h-4 mr-2" />{sending ? "Posting..." : "Post Notice"}
        </Button>
      </form>

      {/* Notices list */}
      <div className="space-y-3">
        {isLoading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)
        ) : !notices?.length ? (
          <div className="text-muted-foreground font-mono text-xs italic p-4 border border-border/30">No notices yet.</div>
        ) : (
          notices.map(notice => (
            <div key={notice.id} className={`border p-4 space-y-2 ${notice.isPinned ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/20"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {notice.isPinned && <Pin className="w-3.5 h-3.5 text-primary shrink-0" />}
                  <span className="font-serif text-base text-foreground tracking-wider">{notice.title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handlePin(notice)} className="h-7 w-7 rounded-none hover:bg-primary/20 hover:text-primary" title={notice.isPinned ? "Unpin" : "Pin"}>
                    {notice.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(notice.id)} className="h-7 w-7 rounded-none hover:bg-destructive/20 hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              {notice.body && <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">{notice.body}</p>}
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                {notice.authorUsername} // {new Date(notice.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Guidelines ──────────────────────────────────────────────────────────────

function GuidelinesTab() {
  const { toast } = useToast();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => customFetch<{ guidelines: string; rules: string; welcome_message: string }>("/api/settings"),
  });

  const [guidelines, setGuidelines] = useState("");
  const [rules, setRules] = useState("");
  const [welcome, setWelcome] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!loaded && data) {
    setGuidelines(data.guidelines || "");
    setRules(data.rules || "");
    setWelcome(data.welcome_message || "");
    setLoaded(true);
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await customFetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guidelines, rules, welcome_message: welcome }),
      });
      await refetch();
      toast({ title: "Guidelines saved", description: "Site content updated successfully." });
    } catch {
      toast({ title: "Error", description: "Could not save guidelines.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-1">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          Edit site-wide pinned content. These appear on the home page and are visible to all logged-in members.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase text-muted-foreground tracking-wider">
              Welcome Message
            </label>
            <Textarea
              value={welcome}
              onChange={e => setWelcome(e.target.value)}
              rows={3}
              className="rounded-none font-mono text-sm bg-background/50 border-border"
              placeholder="A short message shown at the top of the home page..."
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs uppercase text-muted-foreground tracking-wider">
              Site Guidelines
            </label>
            <Textarea
              value={guidelines}
              onChange={e => setGuidelines(e.target.value)}
              rows={8}
              className="rounded-none font-mono text-sm bg-background/50 border-border"
              placeholder="Community guidelines, code of conduct, rules of operation..."
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-xs uppercase text-muted-foreground tracking-wider">
              Operational Rules
            </label>
            <Textarea
              value={rules}
              onChange={e => setRules(e.target.value)}
              rows={6}
              className="rounded-none font-mono text-sm bg-background/50 border-border"
              placeholder="Field rules, location sharing protocol, security guidelines..."
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="font-serif tracking-widest uppercase rounded-none">
            <Settings className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Guidelines"}
          </Button>
        </>
      )}
    </div>
  );
}

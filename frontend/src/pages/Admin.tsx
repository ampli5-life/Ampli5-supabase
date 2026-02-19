import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Video,
  FileText,
  Users,
  Calendar,
  CalendarDays,
  Book,
  Youtube,
  Smartphone,
  BookOpen,
  HelpCircle,
  MessageCircle,
  FileEdit,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SECTIONS = [
  { id: "users", label: "Users", icon: Users },
  { id: "videos", label: "Videos", icon: Video },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "team", label: "Team", icon: Users },
  { id: "schedules", label: "Schedules", icon: Calendar },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "books", label: "Books", icon: Book },
  { id: "video-channels", label: "Video Channels", icon: Youtube },
  { id: "apps", label: "Apps", icon: Smartphone },
  { id: "readings", label: "Recommended Reading", icon: BookOpen },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "testimonials", label: "Testimonials", icon: MessageCircle },
  { id: "page-content", label: "Page Content", icon: FileEdit },
];

const PAGE_CONTENT_PRESETS = [
  { key: "home_hero", hint: "{ title, subtitle }" },
  { key: "home_intro", hint: "{ heading, paragraph }" },
  { key: "home_benefits", hint: "[{ title, desc }]" },
  { key: "home_cta", hint: "{ heading, paragraph, buttonText, buttonLink }" },
  { key: "about_story", hint: "plain text" },
  { key: "about_mission", hint: "plain text" },
  { key: "meditation_needs", hint: "[{ need, desc }]" },
  { key: "contact_info", hint: "{ email, phone, address }" },
  { key: "donate_text", hint: "{ heading, paragraph, comingSoonText }" },
];

function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete?</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to delete? This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CrudList({
  items,
  onEdit,
  onDelete,
  onAdd,
  renderItem,
  emptyLabel,
}: {
  items: unknown[];
  onEdit: (item: unknown) => void;
  onDelete: (item: unknown) => void | Promise<void>;
  onAdd: () => void;
  renderItem: (item: unknown) => React.ReactNode;
  emptyLabel?: string;
}) {
  const [pendingDelete, setPendingDelete] = useState<unknown | null>(null);

  const handleConfirmDelete = async () => {
    if (pendingDelete) {
      await onDelete(pendingDelete);
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <Button onClick={onAdd} className="mb-4 gap-2">
        <Plus size={18} />
        Add
      </Button>
      <div className="space-y-2">
        {items.map((item: unknown, i: number) => (
          <Card key={(item as { id?: string }).id ?? i} className="flex items-center justify-between p-4">
            <div className="min-w-0 flex-1">{renderItem(item)}</div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                <Pencil size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setPendingDelete(item)}>
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {items.length === 0 && emptyLabel && (
        <p className="py-8 text-center text-muted-foreground">No {emptyLabel} yet. Click Add to create your first one.</p>
      )}
      <ConfirmDeleteModal open={pendingDelete !== null} onClose={() => setPendingDelete(null)} onConfirm={handleConfirmDelete} />
    </div>
  );
}

function extractYoutubeVideoId(url: string): string | null {
  const trimmed = (url || "").trim();
  const match = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

const emptyFreeVideoForm = {
  title: "",
  description: "",
  youtube_url: "",
  thumbnail_url: "",
  category: "",
  duration: 0,
  instructor: "",
};

const emptyPaidVideoForm = {
  title: "",
  description: "",
  thumbnail_url: "",
  category: "",
  duration: 0,
  instructor: "",
};

function UsersSection() {
  const { profile } = useAuth();
  const [items, setItems] = useState<{ id: string; email: string; fullName?: string; full_name?: string; admin?: boolean; isAdmin?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", fullName: "", admin: false });
  const [searchQuery, setSearchQuery] = useState("");

  const isUserAdmin = (u: { admin?: boolean; isAdmin?: boolean }) => u.admin === true || u.isAdmin === true;

  const load = async () => {
    try {
      const data = await api.get<typeof items>("/users");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (item: { id: string; admin?: boolean; isAdmin?: boolean }) => {
    if (item.id === profile?.id) return;
    const currentlyAdmin = isUserAdmin(item);
    if (currentlyAdmin) {
      const adminCount = items.filter((u) => isUserAdmin(u)).length;
      if (adminCount <= 1) {
        toast.error("At least one admin must remain.");
        return;
      }
    }
    try {
      await api.patch(`/users/${item.id}`, { admin: !currentlyAdmin });
      load();
      toast.success(currentlyAdmin ? "Admin removed" : "User set as admin");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleCreate = async () => {
    if (!createForm.email.trim() || !createForm.password || !createForm.fullName.trim()) {
      toast.error("Email, password, and full name are required.");
      return;
    }
    if (createForm.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      await api.post("/users", {
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        fullName: createForm.fullName.trim(),
        admin: createForm.admin,
      });
      setCreateForm({ email: "", password: "", fullName: "", admin: false });
      setShowCreateForm(false);
      load();
      toast.success("User created");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Manage users. Toggle admin role (at least one admin must remain).</p>
      {!showCreateForm ? (
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus size={18} />
          Create user
        </Button>
      ) : (
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Create user</h3>
          <div className="space-y-4">
            <Input placeholder="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
            <Input placeholder="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
            <Input placeholder="Full name" value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={createForm.admin} onChange={(e) => setCreateForm({ ...createForm, admin: e.target.checked })} />
              <span className="text-sm">Admin</span>
            </label>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Save</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}
      <Input
        placeholder="Search by name or email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />
      <div className="space-y-2">
        {items
          .filter((u) => {
            const q = searchQuery.trim().toLowerCase();
            if (!q) return true;
            const name = (u.fullName ?? u.full_name ?? "").toLowerCase();
            const email = (u.email ?? "").toLowerCase();
            return name.includes(q) || email.includes(q);
          })
          .map((u) => (
            <Card key={u.id} className="flex items-center justify-between p-4">
              <div>
                <span className="font-medium">{u.fullName ?? u.full_name ?? "—"}</span>
                <span className="text-muted-foreground ml-2">({u.email})</span>
                {(u.admin || u.isAdmin) && <span className="ml-2 rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">Admin</span>}
              </div>
              {u.id !== profile?.id && (
                <Button variant="outline" size="sm" onClick={() => toggleAdmin(u)}>
                  {isUserAdmin(u) ? "Remove admin" : "Make admin"}
                </Button>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
}

function VideosSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoSubTab, setVideoSubTab] = useState<"free" | "paid">("free");
  const [form, setForm] = useState<Record<string, unknown> | null>(null);
  const [formMode, setFormMode] = useState<"free" | "paid">("free");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/videos");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (form != null) setVideoFile(null);
  }, [form?.id]);

  const freeItems = items.filter((v) => !v.is_paid);
  const paidItems = items.filter((v) => v.is_paid);

  const saveFree = async () => {
    const payload = { ...form } as Record<string, unknown>;
    if (!String(payload.youtube_url || "").trim()) {
      toast.error("YouTube URL is required for free videos.");
      return;
    }
    if (!payload.thumbnail_url && payload.youtube_url) {
      const vid = extractYoutubeVideoId(String(payload.youtube_url));
      if (vid) payload.thumbnail_url = `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;
    }
    payload.is_paid = false;
    payload.storage_path = null;
    if (form?.id) {
      await api.put(`/videos/${form.id}`, payload);
    } else {
      await api.post("/videos", payload);
    }
    setForm(null);
    load();
    toast.success("Saved");
  };

  const savePaid = async () => {
    const payload = { ...form } as Record<string, unknown>;
    payload.is_paid = true;
    payload.youtube_url = payload.youtube_url ?? "";
    payload.thumbnail_url = payload.thumbnail_url ?? "";
    if (videoFile) {
      setUploading(true);
      const pathPrefix = form?.id ?? crypto.randomUUID();
      const path = `${pathPrefix}/${videoFile.name}`;
      const { error: uploadError } = await supabase.storage.from("videos").upload(path, videoFile, { upsert: true });
      if (uploadError) {
        setUploading(false);
        toast.error(uploadError.message);
        return;
      }
      payload.storage_path = path;
      setUploading(false);
    } else if (!form?.id && !payload.storage_path) {
      toast.error("Upload a video file for new paid videos.");
      return;
    }
    if (form?.id) {
      await api.put(`/videos/${form.id}`, payload);
    } else {
      await api.post("/videos", payload);
    }
    setForm(null);
    setVideoFile(null);
    load();
    toast.success("Saved");
  };

  const save = () => {
    if (formMode === "free") void saveFree();
    else void savePaid();
  };

  const del = async (item: unknown) => {
    const id = (item as { id: string }).id;
    await api.delete(`/videos/${id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  if (form) {
    const isFree = formMode === "free";
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? (isFree ? "Edit Free Video" : "Edit Paid Video") : isFree ? "Add Free Video" : "Add Paid Video"}</h3>
        <div className="space-y-4">
          <Input placeholder="Title" value={String(form.title || "")} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Description" value={String(form.description || "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          {isFree ? (
            <>
              <Input placeholder="YouTube URL (required)" value={String(form.youtube_url || "")} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} />
              <Input placeholder="Thumbnail URL (optional, or leave blank to use YouTube thumbnail)" value={String(form.thumbnail_url || "")} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
            </>
          ) : (
            <>
              <Input placeholder="Thumbnail URL (optional)" value={String(form.thumbnail_url || "")} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} />
              <p className="text-xs text-muted-foreground">Upload video file. Required for new paid videos.</p>
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
              {form.storage_path && !videoFile && (
                <span className="text-xs text-muted-foreground">Current file: {String(form.storage_path)}</span>
              )}
            </>
          )}
          <div className="flex gap-4">
            <Input placeholder="Category" value={String(form.category || "")} onChange={(e) => setForm({ ...form, category: e.target.value })} className="flex-1" />
            <Input type="number" placeholder="Duration (min)" value={form.duration ?? ""} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value, 10) || 0 })} className="w-28" />
          </div>
          <Input placeholder="Instructor" value={String(form.instructor || "")} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save} disabled={uploading}>{uploading ? "Uploading..." : "Save"}</Button>
            <Button variant="outline" onClick={() => { setForm(null); setVideoFile(null); }}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Button variant={videoSubTab === "free" ? "default" : "outline"} size="sm" onClick={() => setVideoSubTab("free")}>Free Videos</Button>
        <Button variant={videoSubTab === "paid" ? "default" : "outline"} size="sm" onClick={() => setVideoSubTab("paid")}>Paid Videos</Button>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        {videoSubTab === "free" ? "Free videos use a YouTube URL and play without login. Paid videos are uploaded to storage and require a subscription." : "Paid videos require a subscription. Upload the video file below."}
      </p>
      {videoSubTab === "free" && (
        <CrudList
          items={freeItems}
          emptyLabel="free videos"
          onAdd={() => { setFormMode("free"); setForm({ ...emptyFreeVideoForm }); }}
          onEdit={(item) => { setFormMode("free"); setForm(item as Record<string, unknown>); }}
          onDelete={del}
          renderItem={(item: unknown) => {
            const v = item as { title?: string };
            return <span className="font-medium">{v.title}</span>;
          }}
        />
      )}
      {videoSubTab === "paid" && (
        <CrudList
          items={paidItems}
          emptyLabel="paid videos"
          onAdd={() => { setFormMode("paid"); setForm({ ...emptyPaidVideoForm }); }}
          onEdit={(item) => { setFormMode("paid"); setForm(item as Record<string, unknown>); }}
          onDelete={del}
          renderItem={(item: unknown) => {
            const v = item as { title?: string };
            return (
              <div className="flex items-center gap-3">
                <span className="font-medium">{v.title}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  <Lock size={12} /> Premium
                </span>
              </div>
            );
          }}
        />
      )}
    </>
  );
}

function BlogSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/blog");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      if (form?.id) await api.put(`/blog/${form.id}`, form);
      else await api.post("/blog", form);
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (item: unknown) => {
    await api.delete(`/blog/${(item as { id: string }).id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? "Edit Post" : "Add Post"}</h3>
        <div className="space-y-4">
          <Input placeholder="Title" value={String(form.title || "")} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Excerpt" value={String(form.excerpt || "")} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} />
          <Input placeholder="Tag" value={String(form.tag || "")} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">Posts shown on the Blog page.</p>
      <CrudList items={items} emptyLabel="posts" onAdd={() => setForm({ title: "", excerpt: "", tag: "Tips" })} onEdit={(i) => setForm(i as Record<string, unknown>)} onDelete={del} renderItem={(i: unknown) => <span className="font-medium">{(i as { title?: string }).title}</span>} />
    </>
  );
}

function TeamSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/team");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      if (form?.id) await api.put(`/team/${form.id}`, form);
      else await api.post("/team", form);
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (item: unknown) => {
    await api.delete(`/team/${(item as { id: string }).id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? "Edit Member" : "Add Member"}</h3>
        <div className="space-y-4">
          <Input placeholder="Name" value={String(form.name || "")} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Role" value={String(form.role || "")} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Textarea placeholder="Bio" value={String(form.bio || "")} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} />
          <Input placeholder="Avatar URL (optional)" value={String(form.avatar_url || "")} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <CrudList
      items={items}
      emptyLabel="team members"
      onAdd={() => setForm({ name: "", role: "", bio: "" })}
      onEdit={(i) => setForm(i as Record<string, unknown>)}
      onDelete={del}
      renderItem={(i: unknown) => {
        const x = i as { name?: string; role?: string };
        return <span className="font-medium">{x.name} — {x.role}</span>;
      }}
    />
  );
}

function SchedulesSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/schedules");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      const body = {
        dayOfWeek: form?.dayOfWeek ?? form?.day_of_week,
        time: form?.time,
        className: form?.className ?? form?.class_name,
        instructor: form?.instructor,
        level: form?.level,
      };
      if (form?.id) await api.put(`/schedules/${form.id}`, body);
      else await api.post("/schedules", body);
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (item: unknown) => {
    await api.delete(`/schedules/${(item as { id: string }).id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? "Edit Schedule" : "Add Schedule"}</h3>
        <div className="space-y-4">
          <Input placeholder="Day of week" value={String(form.dayOfWeek ?? form.day_of_week ?? "")} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })} />
          <Input placeholder="Time" value={String(form.time || "")} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <Input placeholder="Class name" value={String(form.className ?? form.class_name ?? "")} onChange={(e) => setForm({ ...form, className: e.target.value })} />
          <Input placeholder="Instructor" value={String(form.instructor || "")} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
          <Input placeholder="Level" value={String(form.level || "")} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">Weekly class schedule.</p>
      <CrudList
        items={items}
        emptyLabel="schedules"
        onAdd={() => setForm({ dayOfWeek: "", time: "", className: "", instructor: "", level: "" })}
        onEdit={(i) => setForm(i as Record<string, unknown>)}
        onDelete={del}
        renderItem={(i: unknown) => {
          const x = i as { dayOfWeek?: string; day_of_week?: string; time?: string; className?: string; class_name?: string };
          return <span>{x.dayOfWeek ?? x.day_of_week} {x.time} — {x.className ?? x.class_name}</span>;
        }}
      />
    </>
  );
}

function EventsSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/events");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      if (form?.id) await api.put(`/events/${form.id}`, form);
      else await api.post("/events", form);
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (item: unknown) => {
    await api.delete(`/events/${(item as { id: string }).id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? "Edit Event" : "Add Event"}</h3>
        <div className="space-y-4">
          <Input placeholder="Title" value={String(form.title || "")} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input type="date" value={String(form.date || "").slice(0, 10)} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Textarea placeholder="Description" value={String(form.description || "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <Input placeholder="Instructor" value={String(form.instructor || "")} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">Upcoming workshops and events.</p>
      <CrudList
        items={items}
        emptyLabel="events"
        onAdd={() => setForm({ title: "", date: "", description: "", instructor: "" })}
        onEdit={(i) => setForm(i as Record<string, unknown>)}
        onDelete={del}
        renderItem={(i: unknown) => {
          const x = i as { title?: string; date?: string };
          return <span>{x.title} — {String(x.date || "").slice(0, 10)}</span>;
        }}
      />
    </>
  );
}

function BooksSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/books");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      if (form?.id) await api.put(`/books/${form.id}`, form);
      else await api.post("/books", form);
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (item: unknown) => {
    await api.delete(`/books/${(item as { id: string }).id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? "Edit Book" : "Add Book"}</h3>
        <div className="space-y-4">
          <Input placeholder="Title" value={String(form.title || "")} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Author" value={String(form.author || "")} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <Textarea placeholder="Description" value={String(form.description || "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <CrudList
      items={items}
      emptyLabel="books"
      onAdd={() => setForm({ title: "", author: "", description: "" })}
      onEdit={(i) => setForm(i as Record<string, unknown>)}
      onDelete={del}
      renderItem={(i: unknown) => {
        const x = i as { title?: string; author?: string };
        return <span>{x.title} — {x.author}</span>;
      }}
    />
  );
}

function VideoChannelsSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/video-channels");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      if (form?.id) await api.put(`/video-channels/${form.id}`, form);
      else await api.post("/video-channels", form);
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (item: unknown) => {
    await api.delete(`/video-channels/${(item as { id: string }).id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? "Edit Channel" : "Add Channel"}</h3>
        <div className="space-y-4">
          <Input placeholder="Title" value={String(form.title || "")} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="URL" value={String(form.url || "")} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <Textarea placeholder="Description" value={String(form.description || "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <CrudList items={items} emptyLabel="channels" onAdd={() => setForm({ title: "", url: "", description: "" })} onEdit={(i) => setForm(i as Record<string, unknown>)} onDelete={del} renderItem={(i: unknown) => <span>{(i as { title?: string }).title}</span>} />
  );
}

function AppsSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/apps");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      if (form?.id) await api.put(`/apps/${form.id}`, form);
      else await api.post("/apps", form);
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (item: unknown) => {
    await api.delete(`/apps/${(item as { id: string }).id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? "Edit App" : "Add App"}</h3>
        <div className="space-y-4">
          <Input placeholder="Name" value={String(form.name || "")} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea placeholder="Description" value={String(form.description || "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <CrudList items={items} emptyLabel="apps" onAdd={() => setForm({ name: "", description: "" })} onEdit={(i) => setForm(i as Record<string, unknown>)} onDelete={del} renderItem={(i: unknown) => <span>{(i as { name?: string }).name}</span>} />
  );
}

function ReadingsSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/recommended-readings");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      if (form?.id) await api.put(`/recommended-readings/${form.id}`, form);
      else await api.post("/recommended-readings", form);
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (item: unknown) => {
    await api.delete(`/recommended-readings/${(item as { id: string }).id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? "Edit" : "Add"}</h3>
        <div className="space-y-4">
          <Input placeholder="Title" value={String(form.title || "")} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <CrudList items={items} emptyLabel="readings" onAdd={() => setForm({ title: "" })} onEdit={(i) => setForm(i as Record<string, unknown>)} onDelete={del} renderItem={(i: unknown) => <span>{(i as { title?: string }).title}</span>} />
  );
}

function FaqsSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/faqs");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      if (form?.id) await api.put(`/faqs/${form.id}`, form);
      else await api.post("/faqs", form);
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (item: unknown) => {
    await api.delete(`/faqs/${(item as { id: string }).id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? "Edit FAQ" : "Add FAQ"}</h3>
        <div className="space-y-4">
          <Input placeholder="Question" value={String(form.question || "")} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          <Textarea placeholder="Answer" value={String(form.answer || "")} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={3} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <CrudList items={items} emptyLabel="FAQs" onAdd={() => setForm({ question: "", answer: "" })} onEdit={(i) => setForm(i as Record<string, unknown>)} onDelete={del} renderItem={(i: unknown) => <span>{(i as { question?: string }).question}</span>} />
  );
}

function TestimonialsSection() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/testimonials");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      if (form?.id) await api.put(`/testimonials/${form.id}`, form);
      else await api.post("/testimonials", form);
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (item: unknown) => {
    await api.delete(`/testimonials/${(item as { id: string }).id}`);
    load();
    toast.success("Deleted");
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? "Edit" : "Add"}</h3>
        <div className="space-y-4">
          <Textarea placeholder="Text" value={String(form.text || "")} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} />
          <Input placeholder="Author" value={String(form.author || "")} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <CrudList
      items={items}
      emptyLabel="testimonials"
      onAdd={() => setForm({ text: "", author: "" })}
      onEdit={(i) => setForm(i as Record<string, unknown>)}
      onDelete={del}
      renderItem={(i: unknown) => {
        const x = i as { text?: string; author?: string };
        return <span>{String(x.text || "").slice(0, 50)}... — {x.author}</span>;
      }}
    />
  );
}

function PageContentSection() {
  const [items, setItems] = useState<{ id?: string; pageKey?: string; contentJson?: string }[]>([]);
  const [form, setForm] = useState<{ id?: string; pageKey?: string; contentJson?: string; customKey?: boolean } | null>(null);

  const load = async () => {
    try {
      const data = await api.get<typeof items>("/page-content");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form?.pageKey?.trim()) {
      toast.error("Page key is required.");
      return;
    }
    try {
      if (form.id) {
        await api.put(`/page-content/${form.id}`, { pageKey: form.pageKey, contentJson: form.contentJson || "" });
      } else {
        await api.put(`/page-content/key/${form.pageKey.trim()}`, { contentJson: form.contentJson || "" });
      }
      setForm(null);
      load();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (form) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 font-semibold">{form.id ? `Edit: ${form.pageKey}` : "Add / Edit Page Content"}</h3>
        <div className="space-y-4">
          {form.id ? (
            <p className="text-sm text-muted-foreground">Key: {form.pageKey}</p>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium">Page key</label>
              <select
                value={form.customKey ? "_custom" : (form.pageKey || "")}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "_custom") setForm({ ...form, pageKey: "", customKey: true });
                  else setForm({ ...form, pageKey: v, customKey: false });
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Select a preset</option>
                {PAGE_CONTENT_PRESETS.map((p) => (
                  <option key={p.key} value={p.key}>{p.key} ({p.hint})</option>
                ))}
                <option value="_custom">Custom key</option>
              </select>
              {form.customKey && (
                <Input
                  placeholder="Custom key (e.g. home_hero)"
                  value={form.pageKey || ""}
                  onChange={(e) => setForm({ ...form, pageKey: e.target.value })}
                  className="mt-2"
                />
              )}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Content (JSON or plain text)</label>
            <Textarea placeholder="Content (JSON or text)" value={form.contentJson || ""} onChange={(e) => setForm({ ...form, contentJson: e.target.value })} className="min-h-[200px] font-mono text-sm" />
          </div>
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer">JSON examples</summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`home_hero: {"title":"Welcome","subtitle":"Your path to mindful living."}
home_benefits: [{"title":"Physical wellness","desc":"Improve flexibility."}]`}
            </pre>
          </details>
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Button onClick={() => setForm({ pageKey: "", contentJson: "", customKey: false })} className="mb-4 gap-2">
        <Plus size={18} />
        Add new page content
      </Button>
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id!} className="flex items-center justify-between p-4">
            <span className="font-medium">{item.pageKey}</span>
            <Button variant="ghost" size="icon" onClick={() => setForm({ ...item })}>
              <Pencil size={16} />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState("videos");

  useEffect(() => {
    if (!loading && !profile?.is_admin) {
      navigate("/", { replace: true });
    }
  }, [loading, profile, navigate]);

  if (loading || !profile?.is_admin) {
    return (
      <div className="container flex min-h-[40vh] items-center justify-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <section className="bg-primary py-8 text-primary-foreground">
        <div className="container">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20" asChild>
              <a href="/">
                <ArrowLeft size={18} className="mr-1" />
                Back
              </a>
            </Button>
            <h1 className="font-serif text-2xl font-bold">Admin Panel</h1>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container flex gap-8">
          <aside className="w-56 shrink-0 space-y-1">
            {SECTIONS.map((s) => (
              <Button
                key={s.id}
                variant={section === s.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => setSection(s.id)}
              >
                <s.icon size={18} />
                {s.label}
              </Button>
            ))}
          </aside>

          <main className="min-w-0 flex-1">
            {section === "users" && <UsersSection />}
            {section === "videos" && <VideosSection />}
            {section === "blog" && <BlogSection />}
            {section === "team" && <TeamSection />}
            {section === "schedules" && <SchedulesSection />}
            {section === "events" && <EventsSection />}
            {section === "books" && <BooksSection />}
            {section === "video-channels" && <VideoChannelsSection />}
            {section === "apps" && <AppsSection />}
            {section === "readings" && <ReadingsSection />}
            {section === "faqs" && <FaqsSection />}
            {section === "testimonials" && <TestimonialsSection />}
            {section === "page-content" && <PageContentSection />}
          </main>
        </div>
      </section>
    </>
  );
}

// client/src/components/AdminMentorship.tsx
import { useEffect, useState } from "react";
import { adminFetch } from "../utils/adminFetch";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Pencil, Trash2, Plus, X, ExternalLink } from "lucide-react";

interface EventItem {
  id: number; title: string; date: string; time: string;
  venue: string; link?: string | null; description?: string | null;
  price: string; is_active: boolean; created_at?: string;
}

type FormData = Omit<EventItem, "id" | "is_active" | "created_at">;

const emptyForm: FormData = { title:"", date:"", time:"", venue:"", link:"", description:"", price:"0" };

const inp = { width:"100%", background:"var(--bg)", border:"1px solid rgba(10,239,255,0.12)", padding:"10px 14px", color:"var(--text)", fontFamily:"var(--font-sans)", fontSize:13, fontWeight:300, outline:"none", borderRadius:0, boxSizing:"border-box" as const };
const lbl = { fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase" as const, color:"var(--muted-2)", display:"block", marginBottom:6 };

function DateBadge({ dateStr }: { dateStr: string }) {
  try {
    const d = new Date(dateStr);
    return (
      <div style={{ width:48, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", background:"rgba(10,239,255,0.06)", border:"1px solid rgba(10,239,255,0.15)", padding:"6px 4px" }}>
        <span style={{ fontFamily:"var(--font-mono)", fontSize:7, letterSpacing:"0.1em", color:"var(--cyan)", textTransform:"uppercase" }}>{d.toLocaleDateString("en-GB",{month:"short"}).toUpperCase()}</span>
        <span style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:300, color:"var(--text)", lineHeight:1 }}>{d.toLocaleDateString("en-GB",{day:"2-digit"})}</span>
        <span style={{ fontFamily:"var(--font-mono)", fontSize:7, color:"var(--muted-2)" }}>{d.getFullYear()}</span>
      </div>
    );
  } catch { return null; }
}

export default function AdminMentorship() {
  const [events,   setEvents]   = useState<EventItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState<number | null>(null);
  const [form,     setForm]     = useState<FormData>(emptyForm);
  const [err,      setErr]      = useState("");

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true); setErr("");
    try {
      const res  = await adminFetch("/api/admin/mentorship/events");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load events");
      setEvents(data.events.map((ev: any) => ({
        ...ev,
        date: new Date(ev.date).toISOString().split("T")[0],
        time: ev.time || new Date(ev.date).toTimeString().slice(0,5),
      })));
    } catch (e: any) { setErr(e.message || "Could not load events"); }
    finally { setLoading(false); }
  }

  function openCreate() { setForm(emptyForm); setEditId(null); setShowForm(true); }
  function openEdit(ev: EventItem) {
    setForm({ title:ev.title, date:ev.date, time:ev.time, venue:ev.venue, link:ev.link||"", description:ev.description||"", price:ev.price });
    setEditId(ev.id); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditId(null); setForm(emptyForm); setErr(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!form.title.trim() || !form.date || !form.time || !form.venue.trim()) { setErr("Title, date, time and venue are required"); return; }
    setSaving(true);
    try {
      const url    = editId ? `/api/admin/mentorship/events/${editId}` : "/api/admin/mentorship/events";
      const method = editId ? "PUT" : "POST";
      const res    = await adminFetch(url, { method, body: JSON.stringify({ ...form, price: form.price || "0" }) });
      const data   = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save event");
      toast.success(editId ? "Event updated" : "Event created");
      closeForm(); fetchEvents();
    } catch (e: any) { setErr(e.message || "Failed to save event"); }
    finally { setSaving(false); }
  }

  async function deleteEvent(id: number) {
    if (!confirm("Delete this event?")) return;
    try {
      const res  = await adminFetch(`/api/admin/mentorship/events/${id}`, { method:"DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete");
      toast.success("Event deleted"); fetchEvents();
    } catch (e: any) { toast.error(e instanceof Error ? e.message : "Failed to delete"); }
  }

  const upcoming = events.filter(e => new Date(e.date) >= new Date(new Date().toDateString()));
  const past     = events.filter(e => new Date(e.date) <  new Date(new Date().toDateString()));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:1 }}>

      {/* Header */}
      <div style={{ background:"var(--surface)", border:"1px solid rgba(10,239,255,0.08)", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:300, color:"var(--text)" }}>Mentorship Events</div>
        <button onClick={openCreate} className="btn-primary" style={{ cursor:"pointer" }}>
          <Plus size={14} /> Add Event
        </button>
      </div>

      {/* Stats strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:"rgba(10,239,255,0.06)" }}>
        {[
          { label:"Total Events", value: String(events.length)   },
          { label:"Upcoming",     value: String(upcoming.length) },
          { label:"Past",         value: String(past.length)     },
        ].map((item,i) => (
          <div key={i} style={{ background:"var(--surface)", padding:"16px 20px" }}>
            <div style={lbl}>{item.label}</div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:300, color:"var(--text)" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Error */}
      {err && (
        <div style={{ background:"rgba(246,70,93,0.08)", border:"1px solid rgba(246,70,93,0.25)", padding:"12px 20px", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.08em", color:"var(--red)" }}>{err}</div>
      )}

      {/* Form modal overlay */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }}
            onClick={e => { if (e.target === e.currentTarget) closeForm(); }}>
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
              style={{ background:"var(--bg)", border:"1px solid rgba(10,239,255,0.15)", width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto" }}>

              <div style={{ padding:"18px 24px", borderBottom:"1px solid rgba(10,239,255,0.08)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:300, color:"var(--text)" }}>
                  {editId ? "Edit Event" : "New Event"}
                </div>
                <button onClick={closeForm} style={{ background:"none", border:"1px solid rgba(240,237,230,0.12)", color:"var(--muted)", width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding:"24px", display:"flex", flexDirection:"column", gap:16 }}>
                {err && <div style={{ padding:"10px 14px", background:"rgba(246,70,93,0.08)", border:"1px solid rgba(246,70,93,0.2)", fontFamily:"var(--font-mono)", fontSize:9, color:"var(--red)" }}>{err}</div>}

                <div>
                  <label style={lbl}>Event Title *</label>
                  <input style={inp} value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="e.g. Live Trading Masterclass" required />
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={lbl}>Date *</label>
                    <input type="date" style={inp} value={form.date} onChange={e => setForm({...form, date:e.target.value})} required />
                  </div>
                  <div>
                    <label style={lbl}>Time *</label>
                    <input type="time" style={inp} value={form.time} onChange={e => setForm({...form, time:e.target.value})} required />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Venue / Platform *</label>
                  <input style={inp} value={form.venue} onChange={e => setForm({...form, venue:e.target.value})} placeholder="Zoom, Discord, physical address..." required />
                </div>

                <div>
                  <label style={lbl}>Meeting Link (optional)</label>
                  <input type="url" style={inp} value={form.link ?? ""} onChange={e => setForm({...form, link:e.target.value})} placeholder="https://zoom.us/j/..." />
                </div>

                <div>
                  <label style={lbl}>Price (USD) — 0 for free</label>
                  <input type="number" min="0" step="0.01" style={{ ...inp, maxWidth:160 }} value={form.price} onChange={e => setForm({...form, price:e.target.value})} placeholder="0" />
                </div>

                <div>
                  <label style={lbl}>Description (optional)</label>
                  <textarea rows={4} style={{ ...inp, resize:"vertical", minHeight:80, lineHeight:1.7 }}
                    value={form.description ?? ""} onChange={e => setForm({...form, description:e.target.value})}
                    placeholder="Brief description of the session..." />
                </div>

                <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:8, borderTop:"1px solid rgba(10,239,255,0.07)" }}>
                  <button type="button" onClick={closeForm}
                    style={{ padding:"10px 24px", background:"transparent", border:"1px solid rgba(10,239,255,0.15)", color:"var(--muted)", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary"
                    style={{ cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                    {saving ? "Saving..." : editId ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div style={{ background:"var(--surface)", padding:"48px 24px", textAlign:"center", fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted-2)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
          Loading events...
        </div>
      )}

      {/* Upcoming */}
      {!loading && upcoming.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          <div style={{ background:"var(--surface)", padding:"12px 24px", borderBottom:"1px solid rgba(10,239,255,0.07)" }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--cyan)" }}>Upcoming Sessions</div>
          </div>
          {upcoming.map(ev => {
            const isFree = Number(ev.price) === 0;
            return (
              <div key={ev.id} style={{ background:"var(--surface)", border:"1px solid rgba(10,239,255,0.06)", padding:"20px 24px", display:"flex", gap:16, alignItems:"flex-start" }}>
                <DateBadge dateStr={ev.date} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:14, fontWeight:500, color:"var(--text)", marginBottom:8 }}>{ev.title}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"5px 18px", marginBottom: ev.description ? 8 : 0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted-2)" }}>
                      <Clock size={10} style={{ color:"var(--cyan)" }} /> {ev.time}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted-2)" }}>
                      <MapPin size={10} style={{ color:"var(--cyan)" }} /> {ev.venue}
                    </div>
                    {ev.link && (
                      <a href={ev.link} target="_blank" rel="noopener noreferrer"
                        style={{ display:"flex", alignItems:"center", gap:4, fontFamily:"var(--font-mono)", fontSize:9, color:"var(--cyan)", textDecoration:"none" }}>
                        <ExternalLink size={9} /> Link
                      </a>
                    )}
                  </div>
                  {ev.description && <p style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--muted)", lineHeight:1.65, margin:0 }}>{ev.description}</p>}
                </div>
                <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 }}>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:300, color: isFree ? "var(--green)" : "var(--cyan)" }}>
                    {isFree ? "FREE" : `$${ev.price}`}
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => openEdit(ev)}
                      style={{ padding:"6px 12px", background:"rgba(242,178,58,0.06)", border:"1px solid rgba(242,178,58,0.2)", color:"#F2B23A", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => deleteEvent(ev.id)}
                      style={{ padding:"6px 12px", background:"rgba(246,70,93,0.06)", border:"1px solid rgba(246,70,93,0.2)", color:"var(--red)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                      <Trash2 size={11} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past */}
      {!loading && past.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          <div style={{ background:"var(--surface)", padding:"12px 24px", borderBottom:"1px solid rgba(10,239,255,0.05)" }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--muted-2)" }}>Past Sessions</div>
          </div>
          {past.map(ev => (
            <div key={ev.id} style={{ background:"var(--surface)", border:"1px solid rgba(10,239,255,0.04)", padding:"16px 24px", display:"flex", gap:14, alignItems:"center", opacity:0.55 }}>
              <DateBadge dateStr={ev.date} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--font-sans)", fontSize:13, color:"var(--muted)" }}>{ev.title}</div>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted-2)", marginTop:3 }}>{ev.venue}</div>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button onClick={() => openEdit(ev)}
                  style={{ padding:"5px 10px", background:"transparent", border:"1px solid rgba(242,178,58,0.15)", color:"rgba(242,178,58,0.5)", fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  <Pencil size={10} /> Edit
                </button>
                <button onClick={() => deleteEvent(ev.id)}
                  style={{ padding:"5px 10px", background:"transparent", border:"1px solid rgba(246,70,93,0.15)", color:"rgba(246,70,93,0.5)", fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  <Trash2 size={10} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && events.length === 0 && !err && (
        <div style={{ background:"var(--surface)", padding:"64px 24px", textAlign:"center" }}>
          <Calendar size={36} style={{ color:"var(--muted-2)", display:"block", margin:"0 auto 16px", opacity:0.3 }} />
          <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-2)" }}>No events yet — click Add Event to create one</div>
        </div>
      )}

    </div>
  );
}

// client/src/admin/learning/AdminProgramsList.tsx
import { useState, useRef } from "react";
import { Edit2, Trash2, BookOpen, Clock, Upload, X, ImageIcon } from "lucide-react";

interface Program {
  id: number; title: string; description: string | null;
  price: string; duration_days: number; thumbnail_url?: string | null;
}
interface Props {
  programs: Program[];
  selectedProgram: Program | null;
  programForm: { title: string; description: string; price: string; duration_days: string; thumbnail_url: string };
  editingProgramId: number | null;
  setProgramForm: React.Dispatch<React.SetStateAction<{ title: string; description: string; price: string; duration_days: string; thumbnail_url: string }>>;
  setEditingProgramId: React.Dispatch<React.SetStateAction<number | null>>;
  handleProgramSubmit: (e: React.FormEvent) => Promise<void>;
  startProgramEdit: (p: Program) => void;
  handleDeleteProgram: (id: number) => Promise<void>;
  viewProgram: (p: Program) => void;
}

const inp = { width:"100%", background:"var(--bg)", border:"1px solid rgba(10,239,255,0.12)", padding:"10px 14px", color:"var(--text)", fontFamily:"var(--font-sans)", fontSize:13, fontWeight:300, outline:"none", borderRadius:0, boxSizing:"border-box" as const };
const lbl = { fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase" as const, color:"var(--muted-2)", display:"block", marginBottom:6 };
const FALLBACK = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80";

export default function AdminProgramsList({ programs, selectedProgram, programForm, editingProgramId, setProgramForm, setEditingProgramId, handleProgramSubmit, startProgramEdit, handleDeleteProgram, viewProgram }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token");

  const cancelEdit = () => {
    setEditingProgramId(null);
    setProgramForm({ title:"", description:"", price:"0", duration_days:"30", thumbnail_url:"" });
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadErr("Please select an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadErr("Image must be under 10MB"); return; }
    setUploadErr("");
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: base64 }),
      });
      const d = await res.json();
      if (d.success && d.url) {
        setProgramForm(f => ({ ...f, thumbnail_url: d.url }));
      } else {
        setUploadErr(d.error || "Upload failed");
      }
    } catch {
      setUploadErr("Upload failed — please try again");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:1 }}>

      <div style={{ background:"var(--surface)", border:"1px solid rgba(10,239,255,0.08)", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:300, color:"var(--text)" }}>Learning Programmes</div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-2)" }}>
          {programs.length} programme{programs.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div style={{ background:"var(--surface)", border:"1px solid rgba(10,239,255,0.08)", padding:"28px 24px" }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:300, color:"var(--text)", marginBottom:24 }}>
          {editingProgramId ? "Edit Programme" : "Create New Programme"}
        </div>
        <form onSubmit={handleProgramSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={lbl}>Programme Title *</label>
              <input style={inp} value={programForm.title} onChange={e => setProgramForm({...programForm, title:e.target.value})} placeholder="e.g. Advanced Crypto Trading Mastery" required />
            </div>
            <div>
              <label style={lbl}>Duration (days)</label>
              <input style={inp} type="number" min="1" value={programForm.duration_days} onChange={e => setProgramForm({...programForm, duration_days:e.target.value})} placeholder="30" />
            </div>
          </div>

          <div>
            <label style={lbl}>Price (USD) — set 0 for free</label>
            <input style={{ ...inp, maxWidth:240 }} type="number" step="0.01" min="0" value={programForm.price} onChange={e => setProgramForm({...programForm, price:e.target.value})} placeholder="99.99" />
          </div>

          <div>
            <label style={lbl}>Thumbnail Image</label>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap" }}>

              {/* Preview or placeholder */}
              <div style={{ width:160, height:100, background:"var(--bg)", border:"1px solid rgba(10,239,255,0.12)", flexShrink:0, overflow:"hidden", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {programForm.thumbnail_url ? (
                  <>
                    <img src={programForm.thumbnail_url} alt="Thumbnail" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    <button type="button"
                      onClick={() => setProgramForm(f => ({ ...f, thumbnail_url:"" }))}
                      style={{ position:"absolute", top:4, right:4, background:"rgba(11,17,32,0.85)", border:"1px solid rgba(246,70,93,0.3)", color:"var(--red)", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", padding:0 }}>
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <ImageIcon size={28} style={{ color:"var(--muted-2)", opacity:0.4 }} />
                )}
              </div>

              {/* Upload controls */}
              <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1, minWidth:200 }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload}
                  style={{ display:"none" }} id="thumb-upload" />
                <label htmlFor="thumb-upload"
                  style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 18px", background: uploading ? "rgba(10,239,255,0.03)" : "rgba(10,239,255,0.06)", border:"1px solid rgba(10,239,255,0.2)", color: uploading ? "var(--muted-2)" : "var(--cyan)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor: uploading ? "not-allowed" : "pointer", transition:"all 0.2s", width:"fit-content" }}>
                  <Upload size={12} />
                  {uploading ? "Uploading..." : "Upload Image"}
                </label>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.08em", color:"var(--muted-2)", lineHeight:1.6 }}>
                  JPG, PNG, WebP — max 10MB. Uploaded to Cloudinary.
                </div>
                {uploadErr && (
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.08em", color:"var(--red)" }}>{uploadErr}</div>
                )}
                {/* Fallback manual URL */}
                <div style={{ marginTop:4 }}>
                  <div style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.08em", color:"var(--muted-2)", marginBottom:4 }}>Or paste URL directly:</div>
                  <input style={{ ...inp, fontSize:11, padding:"7px 10px" }} value={programForm.thumbnail_url} onChange={e => setProgramForm({...programForm, thumbnail_url:e.target.value})} placeholder="https://..." />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label style={lbl}>Description</label>
            <textarea value={programForm.description} onChange={e => setProgramForm({...programForm, description:e.target.value})}
              placeholder="What will students learn? Who is this for? Key benefits and outcomes..."
              rows={5}
              style={{ ...inp, resize:"vertical", minHeight:100, lineHeight:1.7 }} />
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            {editingProgramId && (
              <button type="button" onClick={cancelEdit}
                style={{ padding:"10px 24px", background:"transparent", border:"1px solid rgba(10,239,255,0.15)", color:"var(--s7-muted)", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
                Cancel
              </button>
            )}
            <button type="submit" disabled={uploading} className="btn-primary"
              style={{ cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
              {editingProgramId ? "Update Programme" : "Create Programme"}
            </button>
          </div>
        </form>
      </div>

      {programs.length === 0 ? (
        <div style={{ background:"var(--surface)", padding:"64px 24px", textAlign:"center" }}>
          <BookOpen size={36} style={{ color:"var(--muted-2)", display:"block", margin:"0 auto 16px", opacity:0.3 }} />
          <div style={{ fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-2)" }}>No programmes yet — create one above</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:1, background:"rgba(10,239,255,0.06)" }}>
          {programs.map(p => {
            const isFree = Number(p.price) === 0;
            const img    = p.thumbnail_url || FALLBACK;
            return (
              <div key={p.id} style={{ background:"var(--surface)", display:"flex", flexDirection:"column", overflow:"hidden", cursor:"pointer" }} onClick={() => viewProgram(p)}>
                <div style={{ width:"100%", height:160, overflow:"hidden", flexShrink:0, position:"relative" }}>
                  <img src={img} alt={p.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"transform 0.4s ease" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform="scale(1.04)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform="scale(1)")} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(11,17,32,0.65) 0%, transparent 55%)" }} />
                  <div style={{ position:"absolute", top:10, right:10, fontFamily:"var(--font-display)", fontSize:16, fontWeight:300, color: isFree ? "var(--green)" : "var(--cyan)", background:"rgba(11,17,32,0.88)", border:`1px solid ${isFree ? "rgba(14,203,129,0.3)" : "rgba(10,239,255,0.25)"}`, padding:"3px 8px", lineHeight:1 }}>
                    {isFree ? "FREE" : `$${p.price}`}
                  </div>
                </div>

                <div style={{ padding:"18px 20px", flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontFamily:"var(--font-mono)", fontSize:9, color:"var(--muted-2)", letterSpacing:"0.08em" }}>
                    <Clock size={10} />
                    {`${p.duration_days} days`}
                  </div>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:14, fontWeight:500, color:"var(--text)", lineHeight:1.3 }}>{p.title}</div>
                  {p.description && (
                    <p style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--s7-muted)", lineHeight:1.65, margin:0, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                      {p.description}
                    </p>
                  )}
                </div>

                <div style={{ padding:"14px 20px", borderTop:"1px solid rgba(10,239,255,0.07)", display:"flex", gap:8 }}>
                  <button onClick={e => { e.stopPropagation(); startProgramEdit(p); }}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px", background:"rgba(242,178,58,0.06)", border:"1px solid rgba(242,178,58,0.2)", color:"#F2B23A", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
                    <Edit2 size={12} />
                    {"Edit"}
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDeleteProgram(p.id); }}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"8px", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", color:"#ef4444", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
                    <Trash2 size={12} />
                    {"Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

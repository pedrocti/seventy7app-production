// client/src/pages/Learning/ProgramView.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { LearningAPI } from '@/api/learning';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Lock, PlayCircle, Clock, BookOpen } from 'lucide-react';

interface Program { id: number; title: string; description: string; image_url?: string; thumbnail_url?: string; price: string; }
interface Course  { id: number; title: string; description: string; is_active: boolean; price: string; enrolled?: boolean; }
interface Props    { id: number; onBack: () => void; onViewCourse: (courseId: number) => void; }

const FALLBACK = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';

export default function ProgramView({ id, onBack, onViewCourse }: Props) {
  const { token } = useAuth();
  const isMobile  = useMobile();
  const [program,   setProgram]   = useState<Program | null>(null);
  const [courses,   setCourses]   = useState<Course[]>([]);
  const [enrolled,  setEnrolled]  = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { if (token) load(); }, [id, token]);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const d = await LearningAPI.getProgram(id, token);
      if (d.success) { setProgram(d.program || null); setCourses(d.courses || []); setEnrolled(!!d.enrolled); }
      else toast.error(d.error || 'Failed to load programme');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  }

  async function handleEnroll() {
    if (!token) return;
    if (Number(program?.price ?? 0) > 0) { toast.error('Paid programme — purchase from the programmes list.'); return; }
    setEnrolling(true);
    try {
      const d = await LearningAPI.enrollProgram(id, token);
      if (d.success) { setEnrolled(true); await load(); toast.success('Enrolled successfully!'); }
      else toast.error(d.error || 'Enrolment failed');
    } catch { toast.error('Network error'); }
    finally { setEnrolling(false); }
  }

  async function handleCourseEnroll(courseId: number) {
    if (!token) return;
    if (!enrolled) { toast.error('Enrol in the programme first.'); return; }
    setEnrollingCourseId(courseId);
    try {
      const d = await LearningAPI.enrollCourse(courseId, token);
      if (d.success) { setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolled: true } : c)); toast.success('Course enrolment successful!'); }
      else toast.error(d.error || 'Enrolment failed');
    } catch { toast.error('Network error'); }
    finally { setEnrollingCourseId(null); }
  }

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:300, fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted-2)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
      Loading programme...
    </div>
  );

  if (!program) return (
    <div style={{ padding:40, textAlign:"center", fontFamily:"var(--font-mono)", fontSize:11, color:"var(--red)" }}>Programme not found</div>
  );

  const isFree = Number(program.price) === 0;
  const cover  = program.thumbnail_url || program.image_url || FALLBACK;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:1 }}>

      <div style={{ background:"var(--surface)", borderBottom:"1px solid rgba(10,239,255,0.08)", padding: isMobile ? "12px 16px" : "14px 28px" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", color:"var(--cyan)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", padding:0 }}>
          <ArrowLeft size={13} />
          {"Back to Programmes"}
        </button>
      </div>

      <div style={{ position:"relative", width:"100%", height: isMobile ? 200 : 300, overflow:"hidden", flexShrink:0 }}>
        <img src={cover} alt={program.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(11,17,32,0.92) 0%, rgba(11,17,32,0.3) 60%, transparent 100%)" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding: isMobile ? "20px 20px" : "32px 40px" }}>
          <span style={{ fontFamily:"var(--font-display)", fontSize:"clamp(22px,3.5vw,40px)", fontWeight:300, color:"var(--text)", lineHeight:1.15, display:"block" }}>{program.title}</span>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 280px", gap:1, background:"rgba(10,239,255,0.06)" }}>
        <div style={{ background:"var(--surface)", padding: isMobile ? "24px 20px" : "36px 40px" }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--muted-2)", marginBottom:12 }}>About this Programme</div>
          <p style={{ fontFamily:"var(--font-sans)", fontSize:14, fontWeight:300, color:"var(--s7-muted)", lineHeight:1.8, margin:0 }}>{program.description}</p>
          <div style={{ display:"flex", gap:24, marginTop:24, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted-2)", marginBottom:4 }}>Courses</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:300, color:"var(--text)" }}>{courses.length}</div>
            </div>
            <div>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--muted-2)", marginBottom:4 }}>Price</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:300, color: isFree ? "var(--green)" : "var(--cyan)" }}>{isFree ? "FREE" : `$${program.price}`}</div>
            </div>
          </div>
        </div>

        <div style={{ background:"var(--surface)", padding:"28px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--muted-2)" }}>Enrolment</div>
          {enrolled ? (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px", background:"rgba(14,203,129,0.06)", border:"1px solid rgba(14,203,129,0.2)" }}>
              <CheckCircle2 size={16} style={{ color:"var(--green)", flexShrink:0 }} />
              <span style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--green)" }}>Enrolled</span>
            </div>
          ) : (
            <button onClick={handleEnroll} disabled={enrolling || !isFree} className="btn-primary"
              style={{ justifyContent:"center", cursor: enrolling || !isFree ? "not-allowed" : "pointer", opacity: enrolling ? 0.6 : 1 }}>
              {enrolling ? "Enrolling..." : isFree ? "Enrol Now" : "Purchase Required"}
            </button>
          )}
          {!isFree && !enrolled && (
            <p style={{ fontFamily:"var(--font-mono)", fontSize:8, letterSpacing:"0.08em", color:"var(--muted-2)", lineHeight:1.7, margin:0 }}>
              Go back and click "Buy and Access" to purchase this programme.
            </p>
          )}
        </div>
      </div>

      <div style={{ background:"var(--surface)", borderTop:"1px solid rgba(10,239,255,0.08)", padding: isMobile ? "20px" : "32px 40px" }}>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--muted-2)", marginBottom:6 }}>Included Courses</div>
        <div style={{ fontFamily:"var(--font-display)", fontSize: isMobile ? 20 : 26, fontWeight:300, color:"var(--text)", marginBottom:24 }}>
          {`${courses.length} Course${courses.length !== 1 ? "s" : ""} in this Programme`}
        </div>

        {courses.length === 0 ? (
          <div style={{ padding:"40px 0", textAlign:"center", fontFamily:"var(--font-mono)", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted-2)" }}>
            No courses yet
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:1, background:"rgba(10,239,255,0.06)" }}>
            {courses.map((c, idx) => (
              <motion.div key={c.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx * 0.05 }}
                style={{ background:"var(--surface)", padding: isMobile ? "18px 16px" : "20px 24px", display:"flex", alignItems:"center", gap:16, position:"relative" }}>
                {c.enrolled && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:2, background:"var(--green)" }} />}

                <div style={{ width:40, height:40, background: c.enrolled ? "rgba(14,203,129,0.08)" : "rgba(10,239,255,0.06)", border:`1px solid ${c.enrolled ? "rgba(14,203,129,0.2)" : "rgba(10,239,255,0.12)"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {c.enrolled ? <PlayCircle size={16} style={{ color:"var(--green)" }} /> : enrolled ? <BookOpen size={16} style={{ color:"var(--cyan)" }} /> : <Lock size={14} style={{ color:"var(--muted-2)" }} />}
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"var(--font-sans)", fontSize:14, color:"var(--text)", fontWeight:400, marginBottom: c.description ? 4 : 0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.title}</div>
                  {c.description && (
                    <p style={{ fontFamily:"var(--font-sans)", fontSize:12, color:"var(--s7-muted)", lineHeight:1.6, margin:0, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{c.description}</p>
                  )}
                </div>

                <div style={{ flexShrink:0 }}>
                  {c.enrolled ? (
                    <button onClick={() => onViewCourse(c.id)} className="btn-primary" style={{ padding:"9px 18px", whiteSpace:"nowrap" }}>
                      <PlayCircle size={12} />
                      {"Enter"}
                    </button>
                  ) : (
                    <button onClick={() => handleCourseEnroll(c.id)}
                      disabled={!enrolled || enrollingCourseId === c.id}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", background: enrolled ? "rgba(10,239,255,0.06)" : "transparent", border:`1px solid ${enrolled ? "rgba(10,239,255,0.2)" : "rgba(10,239,255,0.06)"}`, color: enrolled ? "var(--cyan)" : "var(--muted-2)", fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", cursor: enrolled ? "pointer" : "not-allowed", whiteSpace:"nowrap" }}>
                      {enrollingCourseId === c.id ? "Enrolling..." : enrolled ? "Enrol" : <><Lock size={10} /> {"Locked"}</>}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// client/src/pages/Learning/CourseView.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useMobile } from '@/hooks/useMobile';
import { LearningAPI } from '@/api/learning';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Video, FileText, Link2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface Lesson {
  id: number; title: string; content?: string;
  video_url?: string | null; pdf_url?: string | null;
  external_link?: string | null; completed?: boolean;
}
interface Assignment {
  id: number; title: string; description?: string; due_date?: string;
  my_submission?: {
    submitted_at: string; content?: string;
    status?: 'pending' | 'graded' | 'rejected';
    grade?: number | null; feedback?: string; graded_at?: string;
  };
}
interface Course { id: number; title: string; description?: string; }

interface Props {
  courseId: number;
  onBack:   () => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted-2)', display: 'block', marginBottom: 6 }}>
      {children}
    </span>
  );
}

/* ── Submit modal ─────────────────────────────────────────────────────────── */
function SubmitModal({ assignment, token, onClose, onDone }: { assignment: Assignment; token: string; onClose: () => void; onDone: () => void }) {
  const [text, setText]         = useState('');
  const [submitting, setSubmit] = useState(false);
  const sub      = assignment.my_submission;
  const isReject = sub?.status === 'rejected';
  const canEdit  = !sub || isReject;

  async function submit() {
    if (!text.trim()) { toast.error('Write something before submitting'); return; }
    setSubmit(true);
    try {
      const d = await LearningAPI.submitAssignment(assignment.id, text, token);
      if (d.success) { toast.success(isReject ? 'Resubmitted!' : 'Submitted!'); onDone(); onClose(); }
      else { toast.error(d.error || 'Submission failed'); }
    } catch { toast.error('Network error'); }
    finally { setSubmit(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,17,32,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.15)', width: '100%', maxWidth: 520 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(10,239,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--text)' }}>{assignment.title}</div>
            {assignment.description && (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--s7-muted)', marginTop: 4 }}>{assignment.description}</div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(240,237,230,0.12)', color: 'var(--s7-muted)', width: 30, height: 30, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 16 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {canEdit ? (
            <>
              {isReject && (
                <div style={{ padding: '12px 14px', background: 'rgba(246,70,93,0.06)', border: '1px solid rgba(246,70,93,0.2)', marginBottom: 14 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 4 }}>Needs revision</div>
                  {sub?.feedback && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--s7-muted)' }}>{sub.feedback}</div>}
                </div>
              )}
              <textarea value={text} onChange={e => setText(e.target.value)} maxLength={5000}
                placeholder="Write your assignment here…"
                style={{ width: '100%', height: 180, padding: '12px 14px', background: 'var(--surface-2)', border: '1px solid rgba(10,239,255,0.12)', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, outline: 'none', resize: 'vertical', boxSizing: 'border-box', borderRadius: 0 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted-2)', textAlign: 'right', marginTop: 4 }}>{text.length}/5000</div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <CheckCircle size={32} style={{ color: 'var(--green)', display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--text)', marginBottom: 8 }}>Already submitted</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)' }}>
                {new Date(sub!.submitted_at).toLocaleString()}
              </div>
              {sub?.status === 'graded' && sub.grade != null && (
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--cyan)', marginTop: 12 }}>{sub.grade}%</div>
              )}
            </div>
          )}
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(10,239,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--s7-muted)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {canEdit ? 'Cancel' : 'Close'}
          </button>
          {canEdit && (
            <button onClick={submit} disabled={submitting || !text.trim()}
              className="btn-primary"
              style={{ cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer', opacity: submitting || !text.trim() ? 0.5 : 1 }}>
              {submitting ? 'Submitting…' : isReject ? 'Resubmit' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function CourseView({ courseId, onBack }: Props) {
  const { token } = useAuth();   // ← AuthContext only, no localStorage
  const isMobile  = useMobile();
  const [course,      setCourse]      = useState<Course | null>(null);
  const [lessons,     setLessons]     = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress,    setProgress]    = useState(0);
  const [marking,     setMarking]     = useState<number[]>([]);
  const [expanded,    setExpanded]    = useState<number | null>(null);
  const [submitFor,   setSubmitFor]   = useState<Assignment | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  // Store last visit per course to detect new grades
  const VISIT_KEY = `course_visit_${courseId}`;

  useEffect(() => {
    if (token) load();
    else { setError('Please log in to access this course.'); setLoading(false); }
  }, [courseId, token]);

  async function load() {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      // Fetch course + lessons in parallel with progress + assignments
      const [courseData, progressData, assignmentData] = await Promise.all([
        LearningAPI.getCourse(courseId, token),
        LearningAPI.getCourseProgress(courseId, token),
        LearningAPI.getAssignmentsWithSubmission(courseId, token),
      ]);

      if (!courseData.success) throw new Error(courseData.error || 'Course not found');

      setCourse(courseData.course);

      // Merge lesson completion status from progress response
      const completedIds = new Set(
        (progressData.lessons_completed || []).map((l: any) => l.lesson_id)
      );
      setLessons((courseData.lessons || []).map((l: Lesson) => ({
        ...l,
        completed: completedIds.has(l.id),
      })));

      setProgress(progressData.progress_percent ?? 0);
      setAssignments(assignmentData.assignments || []);

      // Detect newly graded assignments
      const lastVisit = localStorage.getItem(VISIT_KEY);
      localStorage.setItem(VISIT_KEY, Date.now().toString());
      if (lastVisit) {
        (assignmentData.assignments || []).forEach((a: Assignment) => {
          const sub = a.my_submission;
          if (sub?.status === 'graded' && sub.graded_at) {
            if (new Date(sub.graded_at).getTime() > parseInt(lastVisit)) {
              toast.success(`"${a.title}" graded — ${sub.grade}%`, { duration: 8000 });
            }
          }
        });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load course');
    } finally { setLoading(false); }
  }

  async function markComplete(lessonId: number) {
    if (!token || marking.includes(lessonId)) return;
    setMarking(prev => [...prev, lessonId]);
    // Optimistic update
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, completed: true } : l));
    try {
      await LearningAPI.markLessonComplete(lessonId, token);
      // Refresh progress
      const pd = await LearningAPI.getCourseProgress(courseId, token);
      setProgress(pd.progress_percent ?? 0);
    } catch {
      // Rollback on failure
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, completed: false } : l));
      toast.error('Failed to mark lesson complete');
    } finally { setMarking(prev => prev.filter(id => id !== lessonId)); }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Loading course…
    </div>
  );

  if (error) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>{error}</div>
      <button onClick={onBack} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
    </div>
  );

  const completedCount = lessons.filter(l => l.completed).length;
  const hasPending = assignments.some(a => !a.my_submission);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

      {/* Back */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: isMobile ? '12px 16px' : '14px 24px' }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={13} /> Back
        </button>
      </div>

      {/* Header + progress */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: isMobile ? '16px' : '24px 32px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 20 : 26, fontWeight: 300, color: 'var(--text)', marginBottom: 6 }}>{course?.title}</div>
        {course?.description && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--s7-muted)', lineHeight: 1.65, marginBottom: 16 }}>{course.description}</div>
        )}
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            Progress — {completedCount}/{lessons.length} lessons
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--cyan)' }}>{progress}%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(10,239,255,0.08)' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--cyan), var(--purple))' }} />
        </div>
      </div>

      {/* Lessons */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: isMobile ? '16px' : '24px 32px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 6 }}>Lessons</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 18 : 22, fontWeight: 300, color: 'var(--text)', marginBottom: 16 }}>
          Course Content
        </div>

        {lessons.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            No lessons yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(10,239,255,0.06)' }}>
            {lessons.map(lesson => {
              const isOpen    = expanded === lesson.id;
              const isMarking = marking.includes(lesson.id);
              return (
                <div key={lesson.id} style={{ background: 'var(--surface)' }}>
                  {/* Lesson header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '14px 14px' : '16px 20px', cursor: 'pointer' }}
                    onClick={() => setExpanded(isOpen ? null : lesson.id)}>
                    {/* Complete toggle */}
                    <button onClick={e => { e.stopPropagation(); if (!lesson.completed) markComplete(lesson.id); }}
                      disabled={isMarking || lesson.completed}
                      style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${lesson.completed ? 'var(--green)' : 'rgba(10,239,255,0.2)'}`, background: lesson.completed ? 'rgba(14,203,129,0.1)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: lesson.completed ? 'default' : 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
                      {lesson.completed && <CheckCircle size={14} style={{ color: 'var(--green)' }} />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: lesson.completed ? 'var(--s7-muted)' : 'var(--text)', fontWeight: 400, textDecoration: lesson.completed ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lesson.title}
                      </div>
                      {isMarking && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--muted-2)', marginTop: 2 }}>Saving…</div>}
                    </div>
                    {isOpen ? <ChevronUp size={14} style={{ color: 'var(--muted-2)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--muted-2)', flexShrink: 0 }} />}
                  </div>

                  {/* Lesson content */}
                  {isOpen && (
                    <div style={{ padding: isMobile ? '0 14px 16px' : '0 20px 20px', borderTop: '1px solid rgba(10,239,255,0.05)' }}>
                      {lesson.content && (
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--s7-muted)', lineHeight: 1.7, whiteSpace: 'pre-line', padding: '16px 0' }}>
                          {lesson.content}
                        </div>
                      )}
                      {/* Resources */}
                      {(lesson.video_url || lesson.pdf_url || lesson.external_link) && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: lesson.content ? 0 : 16 }}>
                          {lesson.video_url && (
                            <a href={lesson.video_url} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(10,239,255,0.06)', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                              <Video size={12} /> Watch Video
                            </a>
                          )}
                          {lesson.pdf_url && (
                            <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(10,239,255,0.06)', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                              <FileText size={12} /> PDF Materials
                            </a>
                          )}
                          {lesson.external_link && (
                            <a href={lesson.external_link} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(10,239,255,0.06)', border: '1px solid rgba(10,239,255,0.15)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                              <Link2 size={12} /> External Resource
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assignments */}
      <div style={{ background: 'var(--surface)', border: '1px solid rgba(10,239,255,0.08)', padding: isMobile ? '16px' : '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>Assignments</div>
          {hasPending && <AlertCircle size={12} style={{ color: 'var(--gold)' }} />}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 18 : 22, fontWeight: 300, color: 'var(--text)', marginBottom: 4 }}>
          {assignments.filter(a => a.my_submission).length}/{assignments.length} Submitted
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', marginBottom: 16 }}>
          {assignments.filter(a => !a.my_submission).length} pending
        </div>

        {assignments.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
            No assignments in this course
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'rgba(10,239,255,0.06)' }}>
            {assignments.map(a => {
              const sub    = a.my_submission;
              const status = sub?.status || 'pending';
              const statusColor = status === 'graded' ? 'var(--green)' : status === 'rejected' ? 'var(--red)' : 'var(--cyan)';
              return (
                <div key={a.id} style={{ background: 'var(--surface)', padding: isMobile ? '14px' : '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text)', fontWeight: 400, marginBottom: 4 }}>{a.title}</div>
                    {a.description && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--s7-muted)', lineHeight: 1.6 }}>{a.description}</div>}
                    {a.due_date && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted-2)', marginTop: 4 }}>Due: {new Date(a.due_date).toLocaleDateString()}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    {sub ? (
                      <>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 8px', border: `1px solid ${statusColor}`, color: statusColor }}>
                          {status === 'graded' ? 'Graded' : status === 'rejected' ? 'Needs Revision' : 'Submitted'}
                        </span>
                        {sub.grade != null && (
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cyan)' }}>{sub.grade}%</span>
                        )}
                        {status === 'rejected' && (
                          <button onClick={() => setSubmitFor(a)}
                            style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 12px', background: 'rgba(246,70,93,0.06)', border: '1px solid rgba(246,70,93,0.2)', color: 'var(--red)', cursor: 'pointer' }}>
                            Resubmit
                          </button>
                        )}
                      </>
                    ) : (
                      <button onClick={() => setSubmitFor(a)}
                        className="btn-primary"
                        style={{ padding: '8px 16px' }}>
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit modal */}
      {submitFor && token && (
        <SubmitModal
          assignment={submitFor}
          token={token}
          onClose={() => setSubmitFor(null)}
          onDone={() => { load(); setSubmitFor(null); }}
        />
      )}
    </div>
  );
}
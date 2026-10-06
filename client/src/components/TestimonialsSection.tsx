import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   BLOG / INSIGHTS SECTION
   Uses exclusively our CSS design system.
   No Tailwind utilities, no inline font-family,
   no rounded corners, no blur blobs.
═══════════════════════════════════════════════════════════ */

interface Post {
  num:     string;
  title:   string;
  date:    string;
  tag:     string;
  excerpt: string;
  content: string[];
}

const posts: Post[] = [
  {
    num:     "01",
    title:   "From 9-to-5 to Passive Income",
    date:    "15 May 2025",
    tag:     "Wealth",
    excerpt: "How Seventy7 Kapital's structured programmes have helped professionals build sustainable passive income through disciplined, strategic investing.",
    content: [
      "Breaking free from the constraints of a traditional 9-to-5 job is a goal many hold, yet few achieve. At Seventy7 Kapital, we have developed a structured system that transforms ambitious individuals into disciplined investors with consistent, long-term income streams.",
      "Our education programmes begin by building a solid foundation of financial knowledge, tailored to your current level. Whether you are a complete beginner or have some market experience, our approach accelerates your development and helps you avoid the common mistakes that cause most retail participants to fail.",
      "The results speak for themselves — our community members report measurable progress within months of consistent application, with many reaching meaningful financial milestones through the application of structured risk management and disciplined capital deployment.",
    ],
  },
  {
    num:     "02",
    title:   "Mastering Trading Psychology",
    date:    "08 May 2025",
    tag:     "Mindset",
    excerpt: "The psychological training and emotional discipline that separates consistent performers from the rest of the market — and how to develop it.",
    content: [
      "The difference between profitable investors and those who struggle often has little to do with strategy and everything to do with psychology. At Seventy7 Kapital, we consider psychological training to be the cornerstone of financial success.",
      "Our approach addresses the core emotional challenges every market participant faces: fear of missing out, reactive decision-making, inability to accept losses, and the anxiety of uncertainty. Through structured education and accountability, we help you develop the emotional discipline required to execute your strategy without interference from these destructive patterns.",
      "As one member put it: 'I finally understand that financial success is 80% psychology, 15% risk management, and only 5% strategy selection.' This insight fundamentally changes how you approach capital deployment.",
    ],
  },
  {
    num:     "03",
    title:   "How Beginners Can Start Investing",
    date:    "10 Mar 2026",
    tag:     "Education",
    excerpt: "A practical guide to entering financial markets as a beginner — the principles, the process, and the mindset required to build long-term wealth.",
    content: [
      "Entering the world of financial markets can feel overwhelming for beginners, but investing does not have to be complicated. The first step is understanding how markets work and learning the principles that guide consistent, long-term investors.",
      "Financial markets include assets such as equities, currencies, commodities, and digital assets. Each asset class offers different opportunities and risks, and understanding these differences is essential for building a balanced, resilient investment approach.",
      "Beginners should focus on three key principles: education, risk management, and long-term thinking. Rather than chasing quick returns, successful investors take time to study market behaviour and develop disciplined decision-making processes. With the right guidance, anyone can begin their journey and gradually build the knowledge needed for long-term wealth creation.",
    ],
  },
  {
    num:     "04",
    title:   "5 Financial Skills to Learn Before 30",
    date:    "10 Mar 2026",
    tag:     "Literacy",
    excerpt: "The five foundational financial literacy skills that every individual should develop early — and why they compound in value over time.",
    content: [
      "Financial literacy is one of the most important life skills, yet many people enter adulthood without understanding how money truly works. Learning key financial skills early can significantly improve long-term stability and wealth creation.",
      "The five essential skills are: budgeting and money management, saving and emergency planning, understanding investing and compound growth, responsible debt management, and developing long-term financial discipline.",
      "Building these skills early creates a strong foundation for financial independence. Each one compounds on the others — a disciplined saver becomes a confident investor, and a confident investor becomes a long-term wealth builder. The earlier you start, the greater the advantage.",
    ],
  },
];

/* ── Modal ── */
function PostModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(11, 17, 32, 0.92)',
        backdropFilter: 'blur(12px)',
        padding: '24px 16px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        style={{
          background: 'var(--surface)',
          border: '1px solid rgba(10,239,255,0.14)',
          width: '100%',
          maxWidth: 680,
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Modal header */}
        <div style={{
          padding: '28px 36px 24px',
          borderBottom: '1px solid rgba(10,239,255,0.08)',
          position: 'sticky',
          top: 0,
          background: 'var(--surface)',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
        }}>
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 10 }}>
              {post.tag}
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px, 2.5vw, 26px)',
              fontWeight: 300,
              color: 'var(--text)',
              lineHeight: 1.2,
              margin: 0,
            }}>
              {post.title}
            </h2>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: '1px solid rgba(240,237,230,0.12)',
              color: 'var(--s7-muted)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              fontFamily: 'var(--font-mono)',
              fontSize: 16,
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(10,239,255,0.4)';
              (e.currentTarget as HTMLElement).style.color = 'var(--cyan)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(240,237,230,0.12)';
              (e.currentTarget as HTMLElement).style.color = 'var(--s7-muted)';
            }}
          >
            ×
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '28px 36px 36px' }}>
          <span className="data-label" style={{ display: 'block', marginBottom: 24 }}>
            {post.date}
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {post.content.map((para, i) => (
              <p key={i} className="body-text" style={{ margin: 0 }}>
                {para}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            marginTop: 40,
            paddingTop: 28,
            borderTop: '1px solid rgba(10,239,255,0.08)',
          }}>
            <a href="/register" className="btn-primary">
              Start Your Journey
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Post card — uses flush-cell + card-pad ── */
function PostCard({ post, i, onOpen }: { post: Post; i: number; onOpen: () => void }) {
  return (
    <motion.div
      className="flush-cell"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: 0.08 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Number */}
        <span className="card-num">{post.num}</span>

        {/* Tag + date row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span className="eyebrow">{post.tag}</span>
          <span className="data-label">{post.date}</span>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(17px, 1.5vw, 21px)',
          fontWeight: 300,
          color: 'var(--text)',
          lineHeight: 1.25,
          marginBottom: 16,
          letterSpacing: '-0.01em',
          flexShrink: 0,
        }}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="body-text-sm" style={{ flex: 1, marginBottom: 28 }}>
          {post.excerpt}
        </p>

        {/* Read more link */}
        <button
          className="card-link"
          onClick={onOpen}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Read Article
        </button>

      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION
═══════════════════════════════════════════════════════════ */
export default function BlogSection() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <section id="blog" className="section-base section-py">
      <div className="container-s7">

        {/* ── Section header ── */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>
              Insights
            </span>
            <h2 className="section-heading">
              Latest <em>Articles</em>
            </h2>
          </div>

          <p className="body-text" style={{ maxWidth: 340 }}>
            Explore our latest articles to elevate your financial knowledge
            and build the discipline required for long-term wealth.
          </p>
        </motion.div>

        {/* ── 4-column flush grid ── */}
        <div className="flush-grid-4">
          {posts.map((post, i) => (
            <PostCard
              key={post.num}
              post={post}
              i={i}
              onOpen={() => setActiveIdx(i)}
            />
          ))}
        </div>

      </div>

      {/* ── Article modal ── */}
      <AnimatePresence>
        {activeIdx !== null && (
          <PostModal
            post={posts[activeIdx]}
            onClose={() => setActiveIdx(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
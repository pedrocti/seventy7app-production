// client/src/components/BlogSection.tsx
// Homepage preview — fetches latest 4 published posts from API
// Shows image, tag, date, excerpt — links to /blog/:slug and /blog

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

interface Post {
  id:           number;
  title:        string;
  slug:         string;
  tag:          string;
  excerpt:      string;
  image_url:    string | null;
  author:       string;
  published_at: string;
}

const FALLBACK = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function SkeletonCard() {
  return (
    <div className="flush-cell">
      <div style={{ width:'100%', height:180, background:'var(--surface-2)' }} />
      <div className="card-pad-sm">
        <div style={{ height:9, width:'35%', background:'var(--surface-2)', marginBottom:12 }} />
        <div style={{ height:17, width:'90%', background:'var(--surface-2)', marginBottom:8 }} />
        <div style={{ height:17, width:'70%', background:'var(--surface-2)', marginBottom:16 }} />
        <div style={{ height:11, width:'55%', background:'var(--surface-2)', marginBottom:6 }} />
        <div style={{ height:11, width:'45%', background:'var(--surface-2)' }} />
      </div>
    </div>
  );
}

function PostCard({ post, i }: { post: Post; i: number }) {
  const [imgErr, setImgErr] = useState(false);
  const img = (!imgErr && post.image_url) ? post.image_url : FALLBACK;

  return (
    <motion.div
      className="flush-cell"
      initial={{ opacity:0, y:24 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:0.1 }}
      transition={{ delay:0.07*i, duration:0.6, ease:[0.22,1,0.36,1] }}
      style={{ display:'flex', flexDirection:'column' }}
    >
      {/* Image */}
      <Link href={`/blog/${post.slug}`} style={{ display:'block', textDecoration:'none' }}>
        <div style={{ width:'100%', height:180, overflow:'hidden', position:'relative', flexShrink:0 }}>
          <img
            src={img}
            alt={post.title}
            onError={() => setImgErr(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.5s ease' }}
            className="blog-card-img"
          />
          {/* Tag pill over image */}
          <span style={{
            position:'absolute', top:12, left:12,
            fontFamily:'var(--font-mono)', fontSize:9,
            letterSpacing:'0.14em', textTransform:'uppercase',
            color:'var(--bg)', background:'var(--cyan)',
            padding:'3px 8px',
          }}>
            {post.tag}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="card-pad-sm" style={{ display:'flex', flexDirection:'column', flex:1 }}>

        <span className="data-label" style={{ display:'block', marginBottom:10 }}>
          {formatDate(post.published_at)}
        </span>

        <Link href={`/blog/${post.slug}`} style={{ textDecoration:'none' }}>
          <h3
            style={{ fontFamily:'var(--font-display)', fontSize:'clamp(16px,1.4vw,20px)', fontWeight:300, color:'var(--text)', lineHeight:1.25, marginBottom:12, letterSpacing:'-0.01em', cursor:'pointer', transition:'color 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--cyan)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
          >
            {post.title}
          </h3>
        </Link>

        <p className="body-text-sm" style={{ flex:1, marginBottom:20 }}>
          {post.excerpt}
        </p>

        <Link href={`/blog/${post.slug}`} className="card-link">
          Read Article
        </Link>

      </div>
    </motion.div>
  );
}

export default function BlogSection() {
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    fetch('/api/blog')
      .then(r => r.json())
      .then(d => {
        if (d.success) setPosts(d.posts.slice(0, 4));
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="blog" className="section-base section-py">
      <div className="container-s7">

        {/* Section header */}
        <motion.div
          className="section-header"
          initial={{ opacity:0, y:16 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.6 }}
        >
          <div>
            <span className="eyebrow" style={{ display:'block', marginBottom:16 }}>
              Insights
            </span>
            <h2 className="section-heading">
              Latest <em>Articles</em>
            </h2>
          </div>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:12 }}>
            <p className="body-text" style={{ maxWidth:300, textAlign:'right' }}>
              Financial education and wealth-building strategies — written for serious long-term investors.
            </p>
            <Link href="/blog" className="card-link">
              View All Articles
            </Link>
          </div>
        </motion.div>

        {/* Grid */}
        {error ? (
          <div style={{ padding:'48px 0', textAlign:'center', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Unable to load articles — please try again later
          </div>
        ) : (
          <div className="flush-grid-4">
            {loading
              ? [0,1,2,3].map(i => <SkeletonCard key={i} />)
              : posts.map((post, i) => <PostCard key={post.id} post={post} i={i} />)
            }
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && !error && posts.length > 0 && (
          <motion.div
            initial={{ opacity:0, y:12 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }}
            transition={{ delay:0.35, duration:0.5 }}
            style={{ paddingTop:48, borderTop:'1px solid rgba(10,239,255,0.10)', marginTop:1, display:'flex', alignItems:'center', gap:32 }}
          >
            <Link href="/blog" className="btn-primary" style={{ textDecoration:'none', display:'inline-flex' }}>
              View All Articles
            </Link>
            <Link href="/register" className="btn-ghost" style={{ textDecoration:'none' }}>
              Join the Community
            </Link>
          </motion.div>
        )}

      </div>
    </section>
  );
}

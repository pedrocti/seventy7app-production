import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'wouter';
import Navbar from '@/components/InnerNavbar';

interface Post {
  id: number; title: string; slug: string; tag: string; excerpt: string;
  content: string; image_url: string | null; author: string; published_at: string;
}

const FALLBACK = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog/${slug}`).then(r => r.json()).then(d => {
      if (d.success) setPost(d.post); else setNotFound(true);
    }).catch(() => setNotFound(true)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Loading…</div>
    </div>
  );

  if (notFound || !post) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <Navbar />
      <div className="container-s7" style={{ paddingTop:'calc(var(--nav-h) + 80px)', textAlign:'center' }}>
        <span className="eyebrow" style={{ display:'block', marginBottom:16 }}>404</span>
        <h1 className="section-heading" style={{ marginBottom:20 }}>Article not found</h1>
        <Link href="/blog" className="btn-primary" style={{ textDecoration:'none', display:'inline-flex' }}>Back to Articles</Link>
      </div>
    </div>
  );

  const paragraphs = post.content.split('\n\n').filter(Boolean);
  const img = (!imgErr && post.image_url) ? post.image_url : FALLBACK;

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ paddingTop:'var(--nav-h)' }}>
        <motion.div style={{ width:'100%', height:'clamp(240px,40vh,480px)', overflow:'hidden', position:'relative' }} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6 }}>
          <img src={img} alt={post.title} onError={() => setImgErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(11,17,32,0.85) 0%, rgba(11,17,32,0.3) 60%, transparent 100%)' }} />
          <div style={{ position:'absolute', bottom:28, left:0, right:0 }}>
            <div className="container-s7">
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--bg)', background:'var(--cyan)', padding:'3px 8px' }}>{post.tag}</span>
            </div>
          </div>
        </motion.div>
        <div className="container-s7" style={{ paddingTop:56, paddingBottom:96 }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            <Link href="/blog" style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted-2)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, marginBottom:32, transition:'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color='var(--cyan)')} onMouseLeave={e => (e.currentTarget.style.color='var(--muted-2)')}>
              ← All Articles
            </Link>
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}>
              <span className="data-label" style={{ display:'block', marginBottom:16 }}>{formatDate(post.published_at)} · {post.author}</span>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,4vw,48px)', fontWeight:300, color:'var(--text)', lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:24 }}>{post.title}</h1>
              <p style={{ fontFamily:'var(--font-display)', fontSize:'clamp(16px,1.5vw,20px)', fontWeight:300, fontStyle:'italic', color:'var(--s7-muted)', lineHeight:1.7, marginBottom:40, paddingLeft:20, borderLeft:'2px solid var(--cyan)' }}>{post.excerpt}</p>
              <div style={{ height:1, background:'rgba(10,239,255,0.12)', marginBottom:40 }} />
            </motion.div>
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }} style={{ display:'flex', flexDirection:'column', gap:24 }}>
              {paragraphs.map((para, i) => <p key={i} className="body-text" style={{ margin:0, fontSize:15, lineHeight:1.9 }}>{para}</p>)}
            </motion.div>
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.3 }} style={{ marginTop:64, paddingTop:40, borderTop:'1px solid rgba(10,239,255,0.12)', display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
              <Link href="/register" className="btn-primary" style={{ textDecoration:'none', display:'inline-flex' }}>Open Your Account</Link>
              <Link href="/blog" className="btn-ghost" style={{ textDecoration:'none' }}>More Articles</Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

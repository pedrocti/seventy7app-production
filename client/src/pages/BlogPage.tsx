import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import Navbar from '@/components/InnerNavbar';

interface Post {
  id: number; title: string; slug: string; tag: string;
  excerpt: string; image_url: string | null; author: string; published_at: string;
}

const FALLBACK = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';
const TAGS = ['All', 'Wealth', 'Mindset', 'Education', 'Literacy', 'Insights', 'Markets', 'News'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function PostCard({ post, i }: { post: Post; i: number }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <motion.div className="flush-cell" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05*i, duration:0.5, ease:[0.22,1,0.36,1] }}>
      <Link href={`/blog/${post.slug}`} style={{ textDecoration:'none', display:'block' }}>
        <div style={{ width:'100%', height:200, overflow:'hidden', position:'relative' }}>
          <img src={(!imgErr && post.image_url) ? post.image_url : FALLBACK} alt={post.title} onError={() => setImgErr(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.5s ease' }} className="blog-card-img" />
          <span style={{ position:'absolute', top:12, left:12, fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--bg)', background:'var(--cyan)', padding:'3px 8px' }}>{post.tag}</span>
        </div>
      </Link>
      <div className="card-pad-sm" style={{ display:'flex', flexDirection:'column' }}>
        <span className="data-label" style={{ display:'block', marginBottom:10 }}>{formatDate(post.published_at)} · {post.author}</span>
        <Link href={`/blog/${post.slug}`} style={{ textDecoration:'none' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(17px,1.5vw,22px)', fontWeight:300, color:'var(--text)', lineHeight:1.2, marginBottom:12, letterSpacing:'-0.01em', cursor:'pointer', transition:'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color='var(--cyan)')} onMouseLeave={e => (e.currentTarget.style.color='var(--text)')}>
            {post.title}
          </h3>
        </Link>
        <p className="body-text-sm" style={{ marginBottom:20 }}>{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="card-link">Read Article</Link>
      </div>
    </motion.div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/blog').then(r => r.json()).then(d => { if (d.success) setPosts(d.posts); }).finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    const matchTag = tag === 'All' || p.tag === tag;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <Navbar />
      <div style={{ paddingTop:'var(--nav-h)' }}>
        <div style={{ borderBottom:'1px solid rgba(10,239,255,0.12)', background:'var(--surface)' }}>
          <div className="container-s7" style={{ paddingTop:64, paddingBottom:64 }}>
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
              <span className="eyebrow" style={{ display:'block', marginBottom:16 }}>Insights &amp; Education</span>
              <h1 className="section-heading" style={{ marginBottom:20 }}>The <em>77 Brief</em></h1>
              <p className="body-text" style={{ maxWidth:480 }}>Financial education, market insights, and wealth-building strategies — written for serious, long-term investors.</p>
            </motion.div>
          </div>
        </div>
        <div className="container-s7" style={{ paddingTop:48, paddingBottom:96 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:40, flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {TAGS.map(t => (
                <button key={t} onClick={() => setTag(t)} style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 12px', border:'1px solid', borderColor:tag===t?'var(--cyan)':'rgba(240,237,230,0.1)', color:tag===t?'var(--cyan)':'var(--muted-2)', background:tag===t?'rgba(10,239,255,0.06)':'transparent', cursor:'pointer', transition:'all 0.2s' }}>{t}</button>
              ))}
            </div>
            <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ maxWidth:240, padding:'7px 12px', marginLeft:'auto' }} />
          </div>
          {loading ? (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Loading articles…</div>
          ) : filtered.length === 0 ? (
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--muted-2)', letterSpacing:'0.1em', textTransform:'uppercase', padding:'48px 0' }}>No articles found</div>
          ) : (
            <div className="flush-grid-3">{filtered.map((post, i) => <PostCard key={post.id} post={post} i={i} />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
  id: number; title: string; slug: string; tag: string; excerpt: string;
  content: string; image_url: string | null; author: string;
  published: boolean; published_at: string | null; created_at: string;
}

const TAGS = ['Insights','Wealth','Mindset','Education','Literacy','Markets','News'];
const EMPTY = { title:'', tag:'Insights', excerpt:'', content:'', image_url:'', author:'Seventy7 Kapital', published:false };

function authHeader() {
  const token = localStorage.getItem('token');
  return { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) };
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

export default function BlogManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState<number|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{type:'ok'|'err';text:string}|null>(null);
  const [deleting, setDeleting] = useState<number|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showMsg = (type:'ok'|'err', text:string) => { setMsg({type,text}); setTimeout(()=>setMsg(null),3500); };

  async function loadPosts() {
    setLoading(true);
    try { const r=await fetch('/api/admin/blog',{headers:authHeader()}); const d=await r.json(); if(d.success) setPosts(d.posts); } finally { setLoading(false); }
  }
  useEffect(()=>{ loadPosts(); },[]);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showMsg('err','Please select an image file'); return; }
    if (file.size > 8*1024*1024) { showMsg('err','Image must be under 8MB'); return; }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve,reject) => { const r=new FileReader(); r.onload=()=>resolve(r.result as string); r.onerror=reject; r.readAsDataURL(file); });
      const r = await fetch('/api/admin/upload/image',{method:'POST',headers:authHeader(),body:JSON.stringify({data:base64})});
      const d = await r.json();
      if (d.success) { setForm(f=>({...f,image_url:d.url})); showMsg('ok','Image uploaded'); }
      else showMsg('err', d.error||'Upload failed');
    } catch { showMsg('err','Upload failed'); }
    finally { setUploading(false); if(fileRef.current) fileRef.current.value=''; }
  }

  function startNew() { setEditing(null); setForm({...EMPTY}); setShowForm(true); }
  function startEdit(p:Post) { setEditing(p.id); setForm({title:p.title,tag:p.tag,excerpt:p.excerpt,content:p.content,image_url:p.image_url||'',author:p.author,published:p.published}); setShowForm(true); }

  async function handleSave() {
    if (!form.title.trim()||!form.excerpt.trim()||!form.content.trim()) { showMsg('err','Title, excerpt and content are required'); return; }
    setSaving(true);
    try {
      const url=editing?`/api/admin/blog/${editing}`:'/api/admin/blog';
      const r=await fetch(url,{method:editing?'PUT':'POST',headers:authHeader(),body:JSON.stringify(form)});
      const d=await r.json();
      if(d.success){ showMsg('ok',editing?'Post updated':'Post created'); setShowForm(false); setEditing(null); loadPosts(); }
      else showMsg('err',d.error||'Failed to save');
    } catch { showMsg('err','Network error'); } finally { setSaving(false); }
  }

  async function handleDelete(id:number) {
    if(!window.confirm('Delete this post?')) return;
    setDeleting(id);
    try {
      const r=await fetch(`/api/admin/blog/${id}`,{method:'DELETE',headers:authHeader()});
      const d=await r.json();
      if(d.success){ showMsg('ok','Post deleted'); loadPosts(); } else showMsg('err',d.error||'Failed');
    } catch { showMsg('err','Network error'); } finally { setDeleting(null); }
  }

  async function togglePublish(post:Post) {
    try {
      const r=await fetch(`/api/admin/blog/${post.id}`,{method:'PUT',headers:authHeader(),body:JSON.stringify({published:!post.published})});
      const d=await r.json();
      if(d.success){ loadPosts(); showMsg('ok',post.published?'Unpublished':'Published'); }
    } catch { showMsg('err','Failed'); }
  }

  const inp:React.CSSProperties={width:'100%',background:'var(--surface-2)',border:'1px solid rgba(10,239,255,0.15)',padding:'10px 14px',color:'var(--text)',fontFamily:'var(--font-sans)',fontSize:13,fontWeight:300,outline:'none',borderRadius:0,boxSizing:'border-box'};
  const lbl:React.CSSProperties={fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.14em',textTransform:'uppercase' as const,color:'var(--muted-2)',display:'block',marginBottom:6};
  const act:React.CSSProperties={fontFamily:'var(--font-mono)',fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase' as const,padding:'5px 10px',background:'transparent',cursor:'pointer',transition:'all 0.2s'};

  return (
    <div style={{padding:'32px 0'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:32,paddingBottom:20,borderBottom:'1px solid rgba(10,239,255,0.10)'}}>
        <div>
          <span style={{...lbl,marginBottom:4}}>Content Management</span>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:24,fontWeight:300,color:'var(--text)',margin:0}}>Blog Posts</h2>
        </div>
        <button className="btn-primary" onClick={startNew} style={{cursor:'pointer'}}>+ New Post</button>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            style={{marginBottom:20,padding:'12px 16px',background:msg.type==='ok'?'rgba(14,203,129,0.08)':'rgba(246,70,93,0.08)',border:`1px solid ${msg.type==='ok'?'rgba(14,203,129,0.25)':'rgba(246,70,93,0.25)'}`,fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'0.1em',color:msg.type==='ok'?'var(--green)':'var(--red)'}}>
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} style={{overflow:'hidden',marginBottom:32}}>
            <div style={{background:'var(--surface)',border:'1px solid rgba(10,239,255,0.14)',padding:28}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--cyan)'}}>{editing?'Edit Post':'New Post'}</span>
                <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'var(--muted-2)',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:13}}>✕ Cancel</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                <div><label style={lbl}>Title *</label><input style={inp} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Post title"/></div>
                <div><label style={lbl}>Tag</label><select style={{...inp,cursor:'pointer'}} value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))}>{TAGS.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div style={{marginBottom:16}}>
                <label style={lbl}>Cover Image</label>
                <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageSelect}/>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10,flexWrap:'wrap'}}>
                  <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{...act,border:'1px solid rgba(10,239,255,0.25)',color:uploading?'var(--muted-2)':'var(--cyan)',padding:'8px 16px',opacity:uploading?0.6:1}}>{uploading?'Uploading…':'↑ Upload Image'}</button>
                  {form.image_url && <button onClick={()=>setForm(f=>({...f,image_url:''}))} style={{...act,border:'1px solid rgba(246,70,93,0.2)',color:'var(--red)',padding:'8px 12px'}}>Remove</button>}
                  <span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--muted-2)',letterSpacing:'0.08em'}}>JPG · PNG · WebP · Max 8MB</span>
                </div>
                {uploading && <div style={{height:2,background:'rgba(10,239,255,0.1)',marginBottom:10,overflow:'hidden'}}><motion.div style={{height:'100%',background:'var(--cyan)',width:'40%'}} animate={{x:['0%','250%']}} transition={{duration:1.2,repeat:Infinity,ease:'easeInOut'}}/></div>}
                {form.image_url && <div style={{width:'100%',height:160,overflow:'hidden',border:'1px solid rgba(10,239,255,0.10)'}}><img src={form.image_url} alt="Preview" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>}
              </div>
              <div style={{marginBottom:16}}><label style={lbl}>Excerpt *</label><textarea style={{...inp,resize:'vertical',minHeight:70}} value={form.excerpt} onChange={e=>setForm(f=>({...f,excerpt:e.target.value}))} placeholder="Short summary..."/></div>
              <div style={{marginBottom:16}}><label style={lbl}>Content * — separate paragraphs with a blank line</label><textarea style={{...inp,resize:'vertical',minHeight:280,lineHeight:1.7}} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} placeholder={'First paragraph...\n\nSecond paragraph...'}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:16,alignItems:'flex-end'}}>
                <div><label style={lbl}>Author</label><input style={inp} value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))}/></div>
                <div style={{display:'flex',alignItems:'center',gap:10,paddingBottom:2}}>
                  <span style={lbl}>Publish</span>
                  <button onClick={()=>setForm(f=>({...f,published:!f.published}))} style={{width:44,height:24,border:'none',cursor:'pointer',background:form.published?'var(--green)':'rgba(240,237,230,0.1)',position:'relative',transition:'background 0.2s',borderRadius:12}}>
                    <span style={{position:'absolute',top:3,left:form.published?22:3,width:18,height:18,borderRadius:'50%',background:'white',transition:'left 0.2s'}}/>
                  </button>
                </div>
              </div>
              <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid rgba(10,239,255,0.08)',display:'flex',gap:12}}>
                <button className="btn-primary" onClick={handleSave} disabled={saving||uploading} style={{cursor:'pointer',opacity:(saving||uploading)?0.6:1}}>{saving?'Saving…':editing?'Update Post':'Create Post'}</button>
                <button className="btn-ghost" onClick={()=>setShowForm(false)} style={{cursor:'pointer'}}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--muted-2)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Loading posts…</div>
      ) : posts.length===0 ? (
        <div style={{padding:'48px 0',textAlign:'center',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--muted-2)',letterSpacing:'0.1em',textTransform:'uppercase'}}>No posts yet — create your first one above</div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:1,background:'rgba(10,239,255,0.08)'}}>
          {posts.map(post=>(
            <div key={post.id} style={{background:'var(--bg)',padding:'16px 20px',display:'grid',gridTemplateColumns:'64px 1fr auto',gap:'0 16px',alignItems:'center'}}>
              <div style={{width:64,height:48,overflow:'hidden'}}>
                {post.image_url ? <img src={post.image_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div style={{width:'100%',height:'100%',background:'var(--surface-2)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontFamily:'var(--font-mono)',fontSize:7,color:'var(--muted-2)'}}>NO IMG</span></div>}
              </div>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                  <span style={{fontFamily:'var(--font-sans)',fontSize:13,color:'var(--text)'}}>{post.title}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:8,letterSpacing:'0.12em',textTransform:'uppercase',padding:'2px 6px',background:post.published?'rgba(14,203,129,0.10)':'rgba(240,237,230,0.05)',color:post.published?'var(--green)':'var(--muted-2)',border:`1px solid ${post.published?'rgba(14,203,129,0.2)':'rgba(240,237,230,0.08)'}`}}>{post.published?'Live':'Draft'}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:8,letterSpacing:'0.1em',textTransform:'uppercase',color:'rgba(10,239,255,0.5)',padding:'2px 6px',background:'rgba(10,239,255,0.05)'}}>{post.tag}</span>
                </div>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--muted-2)',letterSpacing:'0.08em'}}>{formatDate(post.created_at)} · {post.author}</span>
              </div>
              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <button onClick={()=>togglePublish(post)} style={{...act,border:'1px solid rgba(10,239,255,0.2)',color:'var(--cyan)'}}>{post.published?'Unpublish':'Publish'}</button>
                <button onClick={()=>startEdit(post)} style={{...act,border:'1px solid rgba(240,237,230,0.1)',color:'var(--s7-muted)'}}>Edit</button>
                <button onClick={()=>handleDelete(post.id)} disabled={deleting===post.id} style={{...act,border:'1px solid rgba(246,70,93,0.2)',color:'var(--red)',opacity:deleting===post.id?0.5:1}}>{deleting===post.id?'…':'Delete'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

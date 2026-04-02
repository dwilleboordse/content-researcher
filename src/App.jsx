import { useState, useEffect, useCallback } from "react";

const C={bg:"#000",surface:"#0d0d0d",surface2:"#161616",surface3:"#1c1c1e",card:"#1c1c1e",border:"rgba(255,255,255,0.08)",borderLight:"rgba(255,255,255,0.12)",text:"#f5f5f7",textSec:"#86868b",textDim:"#48484a",accent:"#0a84ff",green:"#30d158",red:"#ff453a",orange:"#ff9f0a",purple:"#bf5af2",teal:"#64d2ff",yellow:"#ffd60a",pink:"#ff375f"};
const css=`*{margin:0;padding:0;box-sizing:border-box}body{background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}::selection{background:${C.accent}40}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.textDim};border-radius:3px}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes spin{to{transform:rotate(360deg)}}.fi{animation:fadeIn .3s ease-out forwards}`;
const genId=()=>Math.random().toString(36).substring(2,10);
const PLATFORMS=[{key:"twitter",label:"Twitter / X",emoji:"𝕏",color:C.text,idHint:"Handle without @ (e.g. jason_yimco)"},{key:"youtube",label:"YouTube",emoji:"▶",color:C.red,idHint:"Channel ID (starts with UC...)"},{key:"instagram",label:"Instagram",emoji:"📸",color:C.pink,idHint:"Handle without @ (e.g. denniswtf)"}];

async function apiGet(p){return(await fetch(p)).json();}
async function apiPost(p,b){return(await fetch(p,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)})).json();}

function Btn({children,onClick,v="sec",s="md",disabled,full}){const vs={pri:{bg:C.accent,c:"#fff",b:"none"},sec:{bg:C.surface3,c:C.text,b:`1px solid ${C.border}`},ghost:{bg:"transparent",c:C.textSec,b:"none"},danger:{bg:C.red+"18",c:C.red,b:`1px solid ${C.red}30`}};const ss={sm:{p:"5px 12px",f:11},md:{p:"9px 18px",f:13},lg:{p:"13px 26px",f:14}};const vv=vs[v]||vs.sec,sz=ss[s]||ss.md;return <button onClick={onClick} disabled={disabled} style={{padding:sz.p,fontSize:sz.f,fontFamily:"inherit",fontWeight:500,borderRadius:10,cursor:disabled?"default":"pointer",opacity:disabled?.35:1,width:full?"100%":"auto",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,background:vv.bg,color:vv.c,border:vv.b}}>{children}</button>;}
function Inp({label,value,onChange,placeholder,compact,hint}){return <div style={{marginBottom:compact?6:10}}>{label&&<label style={{display:"block",fontSize:11,fontWeight:500,color:C.textSec,marginBottom:hint?2:4}}>{label}</label>}{hint&&<div style={{fontSize:10,color:C.textDim,marginBottom:4}}>{hint}</div>}<input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",fontFamily:"inherit",fontSize:13,color:C.text,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 10px",outline:"none"}}/></div>;}
function Pill({children,color}){return <span style={{fontSize:10,fontWeight:600,padding:"3px 10px",borderRadius:14,background:(color||C.accent)+"15",color:color||C.accent,border:`1px solid ${(color||C.accent)}40`,whiteSpace:"nowrap"}}>{children}</span>;}
function Card({children,style}){return <div style={{background:C.card,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginBottom:8,...style}}>{children}</div>;}
function Section({title,icon,children,color}){return <Card><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>{icon&&<span style={{fontSize:14}}>{icon}</span>}<div style={{fontSize:13,fontWeight:700,color:color||C.text}}>{title}</div></div>{children}</Card>;}
function LI({children,color,bullet}){return <div style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:5}}><span style={{color:color||C.accent,fontSize:11,fontWeight:700,marginTop:1,flexShrink:0}}>{bullet||"→"}</span><span style={{fontSize:12,color:C.textSec,lineHeight:1.5}}>{children}</span></div>;}
function Modal({children,onClose,title}){return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}><div onClick={e=>e.stopPropagation()} className="fi" style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto"}}><div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:15,fontWeight:600}}>{title}</span><button onClick={onClose} style={{width:24,height:24,borderRadius:12,background:C.surface3,border:"none",color:C.textSec,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div><div style={{padding:18}}>{children}</div></div></div>;}

// ═══ REPORT VIEW ═══
function ReportView({r}){
  if(!r)return null;
  return <div className="fi">
    <Card style={{background:C.accent+"08",border:`1px solid ${C.accent}20`}}><div style={{fontSize:14,fontWeight:600,color:C.accent,marginBottom:6}}>Daily Brief</div><div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{r.executive_summary}</div></Card>

    {/* Content Ideas */}
    {r.content_ideas?.length>0&&<Section title={`Content Ideas (${r.content_ideas.length})`} icon="🎯" color={C.accent}>
      {r.content_ideas.map((idea,i)=><div key={i} style={{background:C.surface2,borderRadius:10,padding:12,marginBottom:6,borderLeft:`3px solid ${idea.priority<=3?C.accent:idea.priority<=6?C.teal:C.textDim}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:11,fontWeight:700,color:"#fff",background:C.accent,width:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>#{idea.priority}</span><span style={{fontSize:13,fontWeight:600}}>{idea.idea}</span></div>
          <div style={{display:"flex",gap:3}}><Pill color={C.teal}>{idea.platform}</Pill><Pill color={C.purple}>{idea.format}</Pill>{idea.estimated_effort&&<Pill color={C.textDim}>{idea.estimated_effort}</Pill>}</div>
        </div>
        {idea.hook&&<div style={{fontSize:12,color:C.text,marginBottom:3,fontStyle:"italic"}}>"{idea.hook}"</div>}
        {idea.angle&&<div style={{fontSize:11,color:C.textSec,marginBottom:2}}>Angle: {idea.angle}</div>}
        {idea.why_now&&<div style={{fontSize:11,color:C.green}}>Why now: {idea.why_now}</div>}
        {idea.reference&&<div style={{fontSize:10,color:C.textDim,marginTop:3}}>Ref: {idea.reference}</div>}
      </div>)}
    </Section>}

    {/* Viral Signals */}
    {r.viral_signals?.length>0&&<Section title="Viral Signals" icon="🔥" color={C.orange}>
      {r.viral_signals.map((v,i)=>{const vc=v.velocity==="fast"?C.red:v.velocity==="building"?C.orange:C.teal;
        return <div key={i} style={{background:C.surface2,borderRadius:8,padding:"8px 12px",marginBottom:4}}>
          <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:3}}><Pill color={vc}>{v.velocity}</Pill><Pill color={C.teal}>{v.platform}</Pill></div>
          <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{v.signal}</div>
          {v.relevance&&<div style={{fontSize:11,color:C.textSec}}>Relevance: {v.relevance}</div>}
          {v.action&&<div style={{fontSize:11,color:C.accent,marginTop:2}}>Action: {v.action}</div>}
        </div>;})}
    </Section>}

    {/* Platform Breakdown */}
    {r.platform_breakdown&&<>
      {r.platform_breakdown.youtube?.top_performing?.length>0&&<Section title="YouTube" icon="▶" color={C.red}>
        {r.platform_breakdown.youtube.top_performing.map((v,i)=><div key={i} style={{background:C.surface2,borderRadius:8,padding:"8px 12px",marginBottom:4}}>
          <div style={{fontSize:13,fontWeight:600}}>{v.video_title}</div>
          <div style={{display:"flex",gap:6,fontSize:11,color:C.textDim,marginTop:3}}><span>{v.channel}</span><span>{typeof v.views==="number"?v.views.toLocaleString():v.views} views</span><span>{v.age}</span></div>
          {v.why_its_working&&<div style={{fontSize:11,color:C.green,marginTop:3}}>{v.why_its_working}</div>}
        </div>)}
        {r.platform_breakdown.youtube.patterns?.length>0&&<div style={{marginTop:8}}><div style={{fontSize:10,fontWeight:600,color:C.teal,marginBottom:4}}>PATTERNS</div>{r.platform_breakdown.youtube.patterns.map((p,i)=><LI key={i} color={C.teal}>{p}</LI>)}</div>}
        {r.platform_breakdown.youtube.content_gaps?.length>0&&<div style={{marginTop:8}}><div style={{fontSize:10,fontWeight:600,color:C.green,marginBottom:4}}>GAPS (opportunities)</div>{r.platform_breakdown.youtube.content_gaps.map((g,i)=><LI key={i} color={C.green} bullet="✦">{g}</LI>)}</div>}
      </Section>}

      {r.platform_breakdown.twitter?.viral_posts?.length>0&&<Section title="Twitter / X" icon="𝕏">
        {r.platform_breakdown.twitter.viral_posts.map((p,i)=><div key={i} style={{background:C.surface2,borderRadius:8,padding:"8px 12px",marginBottom:4}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:2}}>@{p.account}</div>
          <div style={{fontSize:12,color:C.textSec}}>{p.post_summary}</div>
          {p.engagement_signal&&<div style={{fontSize:10,color:C.orange,marginTop:2}}>{p.engagement_signal}</div>}
        </div>)}
        {r.platform_breakdown.twitter.hot_topics?.length>0&&<div style={{marginTop:8}}><div style={{fontSize:10,fontWeight:600,color:C.accent,marginBottom:4}}>HOT TOPICS</div>{r.platform_breakdown.twitter.hot_topics.map((t,i)=><LI key={i}>{t}</LI>)}</div>}
      </Section>}

      {r.platform_breakdown.instagram?.top_posts?.length>0&&<Section title="Instagram" icon="📸" color={C.pink}>
        {r.platform_breakdown.instagram.top_posts.map((p,i)=><div key={i} style={{background:C.surface2,borderRadius:8,padding:"8px 12px",marginBottom:4}}>
          <div style={{display:"flex",gap:4,marginBottom:2}}><Pill color={C.pink}>{p.post_type}</Pill><span style={{fontSize:12,fontWeight:600}}>@{p.account}</span></div>
          <div style={{fontSize:12,color:C.textSec}}>{p.topic}</div>
          {p.engagement_signal&&<div style={{fontSize:10,color:C.pink,marginTop:2}}>{p.engagement_signal}</div>}
        </div>)}
        {r.platform_breakdown.instagram.format_trends?.length>0&&<div style={{marginTop:8}}><div style={{fontSize:10,fontWeight:600,color:C.pink,marginBottom:4}}>FORMAT TRENDS</div>{r.platform_breakdown.instagram.format_trends.map((f,i)=><LI key={i} color={C.pink}>{f}</LI>)}</div>}
      </Section>}
    </>}

    {/* Competitor Moves */}
    {r.competitor_moves?.length>0&&<Section title="Competitor Moves" icon="🔍">
      {r.competitor_moves.map((m,i)=><div key={i} style={{background:C.surface2,borderRadius:8,padding:"8px 12px",marginBottom:4}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:2}}>{m.who}</div>
        <div style={{fontSize:12,color:C.textSec}}>{m.what}</div>
        {m.take&&<div style={{fontSize:11,color:C.accent,marginTop:3}}>Your move: {m.take}</div>}
      </div>)}
    </Section>}

    {/* Weekly Trends */}
    {r.weekly_trends&&<Section title="Trend Direction" icon="📈" color={C.teal}>
      {r.weekly_trends.rising_topics?.length>0&&<div style={{marginBottom:8}}><div style={{fontSize:10,fontWeight:600,color:C.green,marginBottom:4}}>RISING</div>{r.weekly_trends.rising_topics.map((t,i)=><LI key={i} color={C.green} bullet="↑">{t}</LI>)}</div>}
      {r.weekly_trends.declining_topics?.length>0&&<div style={{marginBottom:8}}><div style={{fontSize:10,fontWeight:600,color:C.red,marginBottom:4}}>DECLINING</div>{r.weekly_trends.declining_topics.map((t,i)=><LI key={i} color={C.red} bullet="↓">{t}</LI>)}</div>}
      {r.weekly_trends.format_shifts?.length>0&&<div><div style={{fontSize:10,fontWeight:600,color:C.teal,marginBottom:4}}>FORMAT SHIFTS</div>{r.weekly_trends.format_shifts.map((f,i)=><LI key={i} color={C.teal}>{f}</LI>)}</div>}
    </Section>}
  </div>;
}

// ═══ MAIN ═══
export default function App(){
  const [data,setData]=useState({profiles:[],config:{}});const [loaded,setLoaded]=useState(false);const [saving,setSaving]=useState(false);
  const [reports,setReports]=useState([]);const [activeReport,setActiveReport]=useState(null);
  const [showAdd,setShowAdd]=useState(false);const [showConfig,setShowConfig]=useState(false);
  const [form,setForm]=useState({platform:"twitter",name:"",profileId:""});
  const [config,setConfig]=useState({niche:"",notes:""});
  const [step,setStep]=useState("idle");const [error,setError]=useState(null);

  useEffect(()=>{
    apiGet("/api/data").then(d=>{setData(d);setConfig(d.config||{});setLoaded(true);});
    apiGet("/api/reports").then(d=>{setReports(d.reports||[]);if(d.reports?.length>0)setActiveReport(d.reports[d.reports.length-1].report);});
  },[]);

  const save=useCallback(async(nd)=>{setData(nd);setSaving(true);await apiPost("/api/data",nd);setSaving(false);},[]);

  const addProfile=()=>{if(!form.name.trim()||!form.profileId.trim())return;const np={id:genId(),platform:form.platform,name:form.name.trim(),profileId:form.profileId.trim()};save({...data,profiles:[...data.profiles,np]});setForm({platform:"twitter",name:"",profileId:""});setShowAdd(false);};
  const removeProfile=(id)=>{save({...data,profiles:data.profiles.filter(p=>p.id!==id)});};
  const saveConfig=()=>{save({...data,config});setShowConfig(false);};

  const runNow=async()=>{
    setStep("running");setError(null);
    try{
      const res=await fetch("/api/cron?manual=true");const d=await res.json();
      if(d.error)throw new Error(d.error);
      const rRes=await apiGet("/api/reports");setReports(rRes.reports||[]);
      if(rRes.reports?.length>0)setActiveReport(rRes.reports[rRes.reports.length-1].report);
      setStep("done");
    }catch(e){setError(e.message);setStep("idle");}
  };

  const platInfo=(key)=>PLATFORMS.find(p=>p.key===key)||PLATFORMS[0];

  if(!loaded)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{css}</style><div style={{color:C.textDim}}>Loading...</div></div>;

  return <div style={{background:C.bg,minHeight:"100vh",color:C.text}}>
    <style>{css}</style>

    <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,.72)",backdropFilter:"blur(20px) saturate(180%)",borderBottom:`1px solid ${C.border}`,padding:"0 24px"}}>
      <div style={{maxWidth:960,margin:"0 auto",height:48,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:14,fontWeight:600}}>Content Researcher</span>{saving&&<span style={{fontSize:10,color:C.accent,animation:"pulse 1s infinite"}}>Saving</span>}{step==="running"&&<span style={{fontSize:10,color:C.accent,animation:"pulse 1s infinite"}}>Researching...</span>}</div>
        <div style={{display:"flex",gap:6}}>
          {step!=="running"&&data.profiles.length>0&&<Btn v="pri" s="sm" onClick={runNow}>Run Now</Btn>}
          <Btn v="sec" s="sm" onClick={()=>setShowAdd(true)}>Add Profile</Btn>
          <Btn v="ghost" s="sm" onClick={()=>setShowConfig(true)}>Config</Btn>
        </div>
      </div>
    </nav>

    {error&&<div style={{background:C.red+"10",borderBottom:`1px solid ${C.red}25`,padding:"8px 24px"}}><div style={{maxWidth:960,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:C.red}}>{error}</span><Btn v="ghost" s="sm" onClick={()=>setError(null)}>×</Btn></div></div>}

    <div style={{maxWidth:960,margin:"0 auto",padding:"28px 24px"}}>

      {step==="running"?<div className="fi" style={{textAlign:"center",padding:"60px 20px"}}>
        <div style={{width:48,height:48,border:`3px solid ${C.accent}`,borderTopColor:"transparent",borderRadius:24,animation:"spin .8s linear infinite",margin:"0 auto 16px"}}/>
        <h2 style={{fontSize:20,fontWeight:600}}>Researching content</h2>
        <p style={{fontSize:13,color:C.textSec,animation:"pulse 2s infinite",marginTop:6}}>Fetching YouTube stats, searching Twitter + Instagram, analyzing trends...</p>
        <p style={{fontSize:12,color:C.textDim,marginTop:4}}>30-90 seconds</p>
      </div>

      :<div className="fi">
        <h1 style={{fontSize:28,fontWeight:700,letterSpacing:"-.03em",marginBottom:4}}>Content Researcher</h1>
        <p style={{fontSize:13,color:C.textSec,marginBottom:16}}>Monitors your content sources daily. Finds viral signals. Tells you what to create. Auto-runs 7am UTC.</p>

        {/* Profiles */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Monitoring {data.profiles.length} profiles</div>
          {data.profiles.length===0?<Card style={{textAlign:"center",padding:30}}><div style={{fontSize:13,color:C.textDim,marginBottom:8}}>No profiles yet. Add Twitter, YouTube, or Instagram accounts to monitor.</div><Btn v="pri" onClick={()=>setShowAdd(true)}>Add Profile</Btn></Card>
          :<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {data.profiles.map(p=>{const pl=platInfo(p.platform);return <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,background:C.card,borderRadius:10,padding:"6px 12px",border:`1px solid ${C.border}`}}>
              <span style={{fontSize:12}}>{pl.emoji}</span>
              <span style={{fontSize:12,fontWeight:600}}>{p.name}</span>
              <span style={{fontSize:10,color:C.textDim}}>@{p.profileId}</span>
              <button onClick={()=>removeProfile(p.id)} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:11,marginLeft:4}}>×</button>
            </div>;})}
          </div>}
        </div>

        {/* Report history */}
        {reports.length>1&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>
          {reports.slice().reverse().map((h,i)=>{const d=new Date(h.date);const label=d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});const isActive=activeReport===h.report;
            return <button key={i} onClick={()=>setActiveReport(h.report)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${isActive?C.accent:C.border}`,background:isActive?C.accent+"12":C.surface2,cursor:"pointer",fontFamily:"inherit"}}><span style={{fontSize:10,fontWeight:isActive?600:400,color:isActive?C.text:C.textSec}}>{label}</span></button>;
          })}
        </div>}

        {activeReport&&<ReportView r={activeReport}/>}
        {!activeReport&&reports.length===0&&data.profiles.length>0&&<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:13,color:C.textDim}}>No reports yet. Click "Run Now" to generate your first daily brief.</div></Card>}
      </div>}
    </div>

    {/* Add Profile Modal */}
    {showAdd&&<Modal title="Add Profile" onClose={()=>setShowAdd(false)}>
      <div style={{fontSize:12,fontWeight:600,color:C.textSec,marginBottom:8}}>Platform</div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {PLATFORMS.map(p=><button key={p.key} onClick={()=>setForm(f=>({...f,platform:p.key}))} style={{flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",background:form.platform===p.key?p.color+"15":C.surface2,border:`2px solid ${form.platform===p.key?p.color:C.border}`,textAlign:"center"}}><div style={{fontSize:16,marginBottom:2}}>{p.emoji}</div><div style={{fontSize:11,fontWeight:600,color:form.platform===p.key?C.text:C.textSec}}>{p.label}</div></button>)}
      </div>
      <Inp label="Display Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. Dara Denney"/>
      <Inp label="Profile ID" value={form.profileId} onChange={v=>setForm(f=>({...f,profileId:v}))} placeholder={platInfo(form.platform).idHint} hint={platInfo(form.platform).idHint}/>
      <Btn v="pri" full onClick={addProfile} disabled={!form.name.trim()||!form.profileId.trim()}>Add</Btn>
    </Modal>}

    {/* Config Modal */}
    {showConfig&&<Modal title="Configuration" onClose={()=>setShowConfig(false)}>
      <Inp label="Your Niche" value={config.niche} onChange={v=>setConfig(c=>({...c,niche:v}))} placeholder="eCommerce, DTC, performance creative"/>
      <Inp label="Focus Notes" value={config.notes} onChange={v=>setConfig(c=>({...c,notes:v}))} placeholder="Focus on creative strategy, ad hooks, UGC trends..."/>
      <Btn v="pri" full onClick={saveConfig}>Save</Btn>
    </Modal>}

    <footer style={{padding:"20px 24px",textAlign:"center",marginTop:32}}><p style={{fontSize:11,color:C.textDim}}>Content Researcher · Daily 7am UTC · D-DOUBLEU MEDIA</p></footer>
  </div>;
}

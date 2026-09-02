function CaregiverNav({ active, goTo, t }) {
 const tr=useTr();
 const inactiveColor=t.isDark?"#D8B995":t.text3;
 const items=[
  {id:"dash",s:CR.DASH,label:tr("navDash"),icon:"dashboard"},
  {id:"med_mon",s:CR.MED_MON,label:tr("navMed"),icon:"pill"},
  {id:"contacts",s:CR.CONTACTS,label:tr("navContacts"),icon:"phone"},
  {id:"settings",s:CR.SETTINGS,label:tr("navSettings"),icon:"settings"},
 ];
 return (
  <nav className="nak-care-nav" aria-label="Caregiver navigation" style={{background:t.bg}}>
   <div className="nak-care-nav-inner" style={{background:t.isDark?"#211208":t.nav,border:`1px solid ${t.isDark?"#5A341D":t.navBorder}`,boxShadow:`0 5px 16px ${t.shadow}`}}>
    {items.map(item=>{
     const selected=active===item.id;
     return <button key={item.id} aria-current={selected?"page":undefined} onClick={()=>goTo(item.s)} style={{background:selected?(t.isDark?t.red:t.redBg):"transparent",boxShadow:selected&&t.isDark?`0 3px 10px ${t.redGlow}`:"none"}}>
      <Icon name={item.icon} size={19} color={selected?(t.isDark?"#fff":t.red):inactiveColor}/>
      <span style={{color:selected?(t.isDark?"#fff":t.red):inactiveColor,fontWeight:selected?900:800}}>{item.label}</span>
     </button>;
    })}
   </div>
  </nav>
 );
}

function CaregiverDash({ goTo, t, plan, caregiverName }) {
 const tr=useTr();
 const store=useStore();
 const [showBeta,setShowBeta]=useState(false);
 const [adding,setAdding]=useState(false);
 const [newName,setNewName]=useState("");
 if(!store)return null;
 const {seniors,alerts}=store;
 const activeSenior=seniors.find(x=>x.id===(store.activeSeniorId||"s1"))||seniors[0];
 const activeAlerts=alerts.filter(a=>a.status==="active");
 const responded=alerts.filter(a=>a.status==="responded");
 const noCheckin=seniors.filter(s=>!s.lastCheckin).length;
 const meds=activeSenior?.medications||[];
 const medsDone=meds.filter(m=>m.status==="done").length;
 const displayName=(caregiverName||"Caregiver").trim();
 const titleName=displayName?displayName.charAt(0).toUpperCase()+displayName.slice(1):"Caregiver";
 const canAddMember=canUse(plan,"multiMember")&&seniors.length<4;
 const addMember=()=>{
  if(!newName.trim())return;
  STORE.addSeniorProfile({name:newName.trim()});
  setNewName("");
  setAdding(false);
 };
 const quickActions=[
  {label:"Medical profile",icon:"file_text",s:CR.MEDICAL_ID},
  {label:"QR code",icon:"qr",s:CR.QR},
  {label:"Kalendaryo",icon:"clock",s:CR.CALENDAR},
  {label:"Mga tala",icon:"notes",s:CR.NOTES},
 ];
 return (
  <div className="nak-care-shell" style={{background:t.bg}}>
   <Hdr t={t} title={`${tr("dashTitlePrefix")} ${titleName}`} sub={tr("dashSub")} right={
    <button aria-label="Tingnan ang kasalukuyang plan" onClick={()=>goTo(CR.PRICING)} style={{minHeight:44,padding:"0 11px",borderRadius:12,background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.28)",color:"#fff",fontSize:10.5,fontWeight:900,cursor:"pointer"}}>Plan: {PLANS[plan]?.name}</button>
   }/>
   <main className="nak-care-scroll">
    <div className="nak-care-stack">
     <NotifBanner t={t}/>
     <div style={{padding:"9px 10px",borderRadius:15,background:t.warnBg,border:`1px solid ${t.warnBorder}`}}>
      <button className="nak-beta-summary" aria-expanded={showBeta} onClick={()=>setShowBeta(v=>!v)} style={{background:"transparent",border:"none",color:t.warn,padding:0}}>
       <Icon name="info" size={17} color={t.warn}/>
       <span className="nak-beta-summary-copy">Beta: Hindi pa konektado ang remote alerts at fall detection.</span>
       <span aria-hidden="true" style={{fontSize:15,transform:showBeta?"rotate(180deg)":"none",transition:"transform .2s"}}>⌄</span>
      </button>
      {showBeta&&<div className="nak-beta-detail" style={{borderColor:t.warnBorder,color:t.text2}}>Hindi pa aktibo ang remote SMS, automatic calling, guaranteed push, at fall detection. Ang Tawag at Mensahe buttons ay direktang nagbubukas ng phone.</div>}
     </div>

     {activeAlerts.length>0&&<button onClick={()=>goTo(CR.ALERT)} style={{minHeight:62,borderRadius:17,padding:"12px 14px",background:t.redBg,border:`1.5px solid ${t.redBorder}`,display:"flex",alignItems:"center",gap:11,textAlign:"left",cursor:"pointer"}}>
      <span style={{width:11,height:11,borderRadius:"50%",background:t.red,boxShadow:`0 0 10px ${t.red}`,animation:"pDot 1s infinite",flexShrink:0}}/>
      <span style={{flex:1}}><strong style={{display:"block",fontSize:14,color:t.red}}>{activeAlerts.length} local beta SOS record</strong><small style={{display:"block",fontSize:10.5,color:t.text2,marginTop:2}}>{activeAlerts.map(a=>a.seniorName).join(", ")}</small></span>
      <span style={{fontSize:11,fontWeight:900,color:t.red}}>Tingnan →</span>
     </button>}

     <div className="nak-care-summary" style={{background:t.card,border:`1px solid ${t.cardBorder}`,boxShadow:`0 2px 10px ${t.shadow}`}}>
      <div style={{borderRight:`1px solid ${t.cardBorder}`}}><strong style={{color:activeAlerts.length?t.red:t.text3}}>{activeAlerts.length}</strong><span style={{color:t.text3}}>Aktibong SOS</span></div>
      <div style={{borderRight:`1px solid ${t.cardBorder}`}}><strong style={{color:noCheckin?t.warn:t.green}}>{noCheckin}</strong><span style={{color:t.text3}}>Walang check-in</span></div>
      <div><strong style={{color:meds.length&&medsDone===meds.length?t.green:t.warn}}>{medsDone}/{meds.length}</strong><span style={{color:t.text3}}>Dose nainom</span></div>
     </div>

     <div className="nak-section-head">
      <div className="nak-section-title" style={{color:t.text3}}>{tr("allSeniorLabel")}</div>
      <button onClick={()=>canAddMember?setAdding(v=>!v):goTo(CR.PRICING)} style={{minHeight:36,padding:"0 9px",borderRadius:10,background:"transparent",border:`1px solid ${t.cardBorder}`,color:t.text2,fontSize:10.5,fontWeight:850,cursor:"pointer"}}>+ Family member</button>
     </div>
     {adding&&<div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:7,padding:10,borderRadius:15,background:t.card,border:`1px solid ${t.cardBorder}`}}>
      <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addMember();}} placeholder="Pangalan ng family member" style={{minWidth:0,height:44,borderRadius:11,border:`1px solid ${t.cardBorder}`,background:t.bg2,color:t.text,padding:"0 11px",fontSize:12,fontWeight:700,outline:"none"}}/>
      <button onClick={addMember} disabled={!newName.trim()} style={{height:44,padding:"0 13px",borderRadius:11,border:0,background:newName.trim()?t.green:t.bg2,color:newName.trim()?"#fff":t.text3,fontSize:11,fontWeight:900,cursor:newName.trim()?"pointer":"default"}}>Idagdag</button>
     </div>}
     {seniors.map(s=>{
      const isSos=s.status==="sos";
      const hasCheckin=!!s.lastCheckin;
      const lowBattery=Number(s.battery)<20;
      return <button key={s.id} className="nak-care-member" onClick={()=>{STORE.setActiveSenior(s.id);goTo(CR.SENIOR_VIEW);}} style={{background:t.card,border:`1px solid ${isSos?t.redBorder:t.cardBorder}`,boxShadow:`0 2px 10px ${t.shadow}`}}>
       <span style={{width:44,height:44,borderRadius:14,background:t.redBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="senior_person" size={23} color={t.red}/></span>
       <span style={{flex:1,minWidth:0}}>
        <strong style={{display:"block",fontSize:16,color:t.text,lineHeight:1.15}}>{s.name}</strong>
        <span style={{display:"block",marginTop:3,fontSize:10.5,color:hasCheckin?t.text3:t.warn,fontWeight:700}}>{hasCheckin?`Huling check-in: ${s.lastCheckin}`:"Hindi pa nag-check-in ngayon"}</span>
        <span className="nak-care-member-status">
         <span className="nak-care-chip" style={{background:isSos?t.redBg:t.bg2,borderColor:isSos?t.redBorder:t.cardBorder,color:isSos?t.red:t.text3}}>{isSos?"SOS active":"Local profile"}</span>
         <span className="nak-care-chip" style={{background:hasCheckin?t.greenBg:t.warnBg,borderColor:hasCheckin?t.greenBorder:t.warnBorder,color:hasCheckin?t.green:t.warn}}>{hasCheckin?"May check-in":"Check-in pending"}</span>
         <span className="nak-care-chip" style={{background:lowBattery?t.redBg:t.bg2,borderColor:lowBattery?t.redBorder:t.cardBorder,color:lowBattery?t.red:t.text3}}>Battery {s.battery}%{lowBattery?" · Mababa":""}</span>
        </span>
       </span>
       <Icon name="arrow_right" size={17} color={t.text3}/>
      </button>;
     })}

     {!canUse(plan,"multiMember")&&<button onClick={()=>goTo(CR.PRICING)} style={{minHeight:44,borderRadius:13,background:t.warnBg,border:`1px solid ${t.warnBorder}`,color:t.warn,fontSize:11,fontWeight:850,cursor:"pointer"}}>Pamilya Plan ang kailangan para sa dagdag na miyembro →</button>}

     <div className="nak-section-head"><div className="nak-section-title" style={{color:t.text3}}>{tr("quickActionsLabel")}</div></div>
     <div className="nak-care-actions">
      {quickActions.map(a=><button key={a.s} className="nak-care-action" onClick={()=>goTo(a.s)} style={{background:t.card,border:`1px solid ${t.cardBorder}`,boxShadow:`0 2px 8px ${t.shadow}`}}><Icon name={a.icon} size={20} color={t.red}/><span style={{color:t.text}}>{a.label}</span></button>)}
     </div>

     {responded.length>0&&<>
      <div className="nak-section-head"><div className="nak-section-title" style={{color:t.text3}}>Nakaraang alerts</div></div>
      {responded.slice(0,2).map(a=><div key={a.id} className="nak-care-card" style={{background:t.card,border:`1px solid ${t.cardBorder}`,display:"flex",alignItems:"center",gap:10}}><Icon name={a.type==="fall"?"walk":"sos"} size={19} color={a.type==="fall"?t.warn:t.red}/><span style={{flex:1}}><strong style={{display:"block",fontSize:12.5,color:t.text}}>{a.seniorName}</strong><small style={{fontSize:10,color:t.text3}}>{a.timestamp}</small></span><span style={{fontSize:10.5,fontWeight:850,color:t.green}}>Nasagot</span></div>)}
     </>}
    </div>
   </main>
   <CaregiverNav active="dash" goTo={goTo} t={t}/>
   <style>{`@keyframes pDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}`}</style>
  </div>
 );
}

function MedMonitorCare({ goTo, t, plan }) {
 const tr=useTr();
 const lang=React.useContext(LangContext);
 const store=useStore();
 const [prescUploaded,setPrescUploaded]=useState(false);
 const [removing,setRemoving]=useState(null);
 if(!store)return null;
 const senior=store.seniors.find(x=>x.id===(store.activeSeniorId||"s1"))||store.seniors[0];
 const meds=senior?.medications||[];
 const name=senior?.nickname||senior?.name||"Nanay";
 const countDone=meds.filter(m=>m.status==="done").length;
 const countMissed=meds.filter(m=>m.status==="missed").length;
 const countPending=meds.filter(m=>m.status==="pending"||m.status==="snoozed").length;
 const groups=groupMedsByTime(meds,lang);
 const summary=lang==="en"?`${countDone} of ${meds.length} doses taken today`:`${countDone} sa ${meds.length} dose ang nainom ngayon`;
 const formatDose=dose=>String(dose||"").replace(/(\d)(mg|mcg|g|ml)\b/ig,"$1 $2");
 const freqLabel=f=>f==="1x"?"Isang dose bawat araw":f==="custom"?"Flexible na oras":`${f.replace("x","")} dose bawat araw`;
 if(!canUse(plan,"medications"))return (
  <div className="nak-care-shell" style={{background:t.bg}}>
   <Hdr t={t} title="Gamot" sub="Medication monitoring"/>
   <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:16,textAlign:"center"}}><Icon name="lock" size={44} color={t.text3}/><strong style={{fontSize:20,color:t.text}}>I-unlock ang Gamot</strong><span style={{fontSize:13,color:t.text3}}>Kailangan Plan ang kailangan para sa medication monitoring.</span><button onClick={()=>goTo(CR.PRICING)} style={{height:48,borderRadius:14,background:t.red,border:0,color:"#fff",padding:"0 20px",fontSize:13,fontWeight:900,cursor:"pointer"}}>Tingnan ang mga plan</button></div>
   <CaregiverNav active="med_mon" goTo={goTo} t={t}/>
  </div>
 );
 return (
  <div className="nak-care-shell" style={{background:t.bg}}>
   <Hdr t={t} title={tr("medsTitle")} sub={`${tr("medsSubPrefix")} ${name}`} right={<button onClick={()=>goTo(CR.ADD_MED)} style={{minHeight:44,padding:"0 11px",borderRadius:12,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.28)",color:"#fff",fontSize:10.5,fontWeight:900,cursor:"pointer"}}>+ Magdagdag</button>}/>
   <main className="nak-care-scroll">
    <div className="nak-care-stack">
     <section className="nak-med-summary" style={{background:t.card,border:`1px solid ${t.cardBorder}`,boxShadow:`0 2px 10px ${t.shadow}`}}>
      <div className="nak-med-summary-top"><div><div className="nak-med-summary-title" style={{color:t.text}}>Gamot ngayong araw</div><div className="nak-med-summary-copy" style={{color:t.text3,marginTop:2}}>{summary}</div></div><strong style={{fontSize:20,color:countMissed?t.red:t.green,fontVariantNumeric:"tabular-nums"}}>{countDone}/{meds.length}</strong></div>
      <div className="nak-care-summary" style={{background:t.bg2,border:`1px solid ${t.cardBorder}`}}>
       <div style={{borderRight:`1px solid ${t.cardBorder}`}}><strong style={{color:t.green}}>{countDone}</strong><span style={{color:t.text3}}>Nainom</span></div>
       <div style={{borderRight:`1px solid ${t.cardBorder}`}}><strong style={{color:t.red}}>{countMissed}</strong><span style={{color:t.text3}}>Hindi nainom</span></div>
       <div><strong style={{color:t.warn}}>{countPending}</strong><span style={{color:t.text3}}>Naghihintay</span></div>
      </div>
      {meds.length>0&&<div style={{height:6,background:t.bg2,borderRadius:99,overflow:"hidden",marginTop:10}}><div style={{height:"100%",width:`${(countDone/meds.length)*100}%`,background:t.green,borderRadius:99,transition:"width .35s ease"}}/></div>}
     </section>

     {Object.entries(groups).map(([key,group])=>{
      if(!group.items.length)return null;
      return <section key={key}>
       <div className="nak-section-head" style={{marginBottom:8}}><div className="nak-section-title" style={{color:t.text3}}>{group.label}</div></div>
       <div className="nak-care-stack" style={{gap:8}}>
        {group.items.map(m=>{
         const cfg=medStatusCfg(m.status,t,tr);
         const times=m.schedule||[m.time||"08:00"];
         const pending=m.status==="pending";
         return <article key={m.id} className="nak-med-card" style={{background:t.card,border:`1px solid ${m.status==="missed"?t.redBorder:t.cardBorder}`,borderLeft:`4px solid ${cfg.color}`,boxShadow:`0 2px 9px ${t.shadow}`}}>
          <div className="nak-med-card-main">
           <div style={{minWidth:0}}><div className="nak-med-name" style={{color:t.text}}>{m.name} <span className="nak-med-dose" style={{color:t.text3}}>{formatDose(m.dose)}</span></div><div className="nak-med-times">{times.map((tm,i)=><span key={i} className="nak-med-time" style={{background:t.bg2,borderColor:t.cardBorder,color:t.text2}}>{fmt24to12(tm)}</span>)}</div><div className="nak-med-meta" style={{color:t.text3}}>{freqLabel(m.freq)}{m.takenAt&&<span style={{color:t.green}}> · Nainom ng {m.takenAt}</span>}</div></div>
           <span className="nak-med-status" style={{background:cfg.bg,borderColor:cfg.border,color:cfg.color}}>{m.status==="missed"?"Hindi nainom":cfg.label}</span>
          </div>
          {pending&&<div className="nak-med-actions">
           <button onClick={()=>STORE.takeMed(senior?.id||"s1",m.id)} style={{gridColumn:"1 / -1",background:t.green,border:0,color:"#fff"}}>Nainom na</button>
           <button onClick={()=>STORE.snoozeMed(senior?.id||"s1",m.id)} style={{background:t.warnBg,border:`1px solid ${t.warnBorder}`,color:t.warn}}>Ipaalala mamaya</button>
           <button className="nak-med-missed" onClick={()=>STORE.missedMed(senior?.id||"s1",m.id)} style={{background:t.redBg,border:`1px solid ${t.redBorder}`,color:t.red}}>Hindi nainom</button>
          </div>}
          <div className="nak-med-tertiary"><button onClick={()=>setRemoving(removing===m.id?null:m.id)} style={{color:t.text3}}>{removing===m.id?"Isara":"Mga opsyon"}</button></div>
          {removing===m.id&&<div className="nak-med-remove-confirm" style={{background:t.redBg,border:`1px solid ${t.redBorder}`}}><span style={{color:t.text2}}>Tanggalin ang {m.name}?</span><button onClick={()=>setRemoving(null)} style={{background:t.card,border:`1px solid ${t.cardBorder}`,color:t.text2}}>Kanselahin</button><button onClick={()=>{STORE.deleteMed(senior?.id||"s1",m.id);setRemoving(null);}} style={{background:t.red,border:0,color:"#fff"}}>Tanggalin</button></div>}
         </article>;
        })}
       </div>
      </section>;
     })}
     {meds.length===0&&<div style={{padding:"36px 18px",textAlign:"center",borderRadius:18,background:t.card,border:`1px solid ${t.cardBorder}`}}><Icon name="pill" size={34} color={t.text3}/><div style={{fontSize:14,fontWeight:850,color:t.text,marginTop:8}}>Wala pang gamot</div><div style={{fontSize:11,color:t.text3,marginTop:3}}>Magdagdag ng gamot para masubaybayan ang schedule.</div></div>}
     <div className="nak-care-actions">
      <button className="nak-care-action" onClick={()=>goTo(CR.ADD_MED)} style={{background:t.card,border:`1px solid ${t.cardBorder}`}}><Icon name="pill" size={20} color={t.red}/><span style={{color:t.text}}>Magdagdag ng gamot</span></button>
      <button className="nak-care-action" onClick={()=>setPrescUploaded(v=>!v)} style={{background:prescUploaded?t.greenBg:t.card,border:`1px solid ${prescUploaded?t.greenBorder:t.cardBorder}`}}><Icon name="upload" size={20} color={prescUploaded?t.green:t.text3}/><span style={{color:prescUploaded?t.green:t.text}}>{prescUploaded?"Na-upload ang reseta":"I-upload ang reseta"}</span></button>
     </div>
    </div>
   </main>
   <CaregiverNav active="med_mon" goTo={goTo} t={t}/>
  </div>
 );
}

function PricingCare({ goTo, t, plan, onUpgrade }) {
 const tr=useTr();
 const plans=[
  {id:"free",name:tr("planFree"),price:"₱0",period:"Libre",color:t.text2,feats:["SOS button","Daily check-in","3 emergency contacts","Offline access"]},
  {id:"essential",name:tr("planEssential"),price:"₱100",period:"Isang bayad",color:t.red,feats:["Lahat ng nasa Libre","Medication monitoring","Flexible na medication schedule","Local missed-dose status"],planned:"Remote caregiver escalation ay beta pa."},
  {id:"family",name:tr("planFamily"),price:"₱199",period:"Bawat buwan",color:t.warn,best:true,feats:["Lahat ng nasa Kailangan","Hanggang 4 family members","Health reports","Priority support"],planned:"Fall detection, guaranteed push, remote SMS, at automatic calling ay hindi pa aktibo."},
 ];
 return (
  <div className="nak-care-shell" style={{background:t.bg}}>
   <Hdr t={t} title={tr("pricingTitle")} sub={tr("pricingSub")} back={()=>goTo(CR.SETTINGS)}/>
   <main className="nak-care-scroll">
    <div className="nak-price-list">
     {plans.map(p=>{
      const isActive=plan===p.id;
      return <section key={p.id} className="nak-price-card" style={{background:t.card,border:`${isActive?2:1}px solid ${isActive?t.green:p.best?t.warnBorder:t.cardBorder}`,boxShadow:`0 2px 10px ${t.shadow}`}}>
       <div className="nak-price-head"><div><div className="nak-price-name" style={{color:t.text}}>{p.name}</div><div className="nak-price-amount"><strong style={{color:p.color}}>{p.price}</strong><span style={{color:t.text3}}>{p.period}</span></div></div>{(isActive||p.best)&&<span className="nak-price-badge" style={{background:isActive?t.greenBg:t.warnBg,color:isActive?t.green:t.warn,border:`1px solid ${isActive?t.greenBorder:t.warnBorder}`}}>{isActive?"Kasalukuyang plan":"Pinakasulit"}</span>}</div>
       <div className="nak-price-features">{p.feats.map((f,i)=><div key={i} className="nak-price-feature" style={{color:t.text}}><span className="nak-price-feature-icon" style={{background:isActive?t.greenBg:`${p.color}18`}}><Icon name="checkmark" size={11} color={isActive?t.green:p.color}/></span><span>{f}</span></div>)}</div>
       {p.planned&&<div className="nak-price-planned" style={{borderColor:t.cardBorder,color:t.text3}}><strong style={{color:t.warn}}>Beta / paparating:</strong> {p.planned}</div>}
       <button onClick={()=>!isActive&&onUpgrade(p.id)} disabled={isActive} style={{marginTop:12,background:isActive?t.greenBg:p.id==="family"?t.warn:p.id==="essential"?t.red:t.bg2,border:isActive?`1px solid ${t.greenBorder}`:`1px solid ${p.id==="free"?t.cardBorder:"transparent"}`,color:isActive?t.green:p.id==="free"?t.text2:"#fff",cursor:isActive?"default":"pointer"}}>{isActive?"Kasalukuyang plan":`Piliin ang ${p.name}`}</button>
      </section>;
     })}
     <div style={{padding:"3px 10px 8px",textAlign:"center",fontSize:10.5,color:t.text3,fontWeight:650,lineHeight:1.45}}>{tr("allPaymentNote")} Hindi sinisingil bilang aktibo ang mga feature na nasa beta o paparating pa.</div>
    </div>
   </main>
   <CaregiverNav active="settings" goTo={goTo} t={t}/>
  </div>
 );
}

function MedicalIDEditCare({ goTo, t }) {
 const store=useStore();
 const s=store?.seniors?.find(x=>x.id===(store?.activeSeniorId||"s1"))||store?.seniors?.[0];
 const [p,setP]=useState(s?.medicalProfile||{bloodType:"",allergies:[],conditions:[],doctorName:"",doctorNum:"",philhealth:"",notes:""});
 const [newAllergy,setNewAllergy]=useState("");
 const [newCondition,setNewCondition]=useState("");
 const [saved,setSaved]=useState(false);
 const BLOOD_TYPES=["A+","A-","B+","B-","AB+","AB-","O+","O-"];
 const save=()=>{STORE.updateMedicalProfile(s?.id||"s1",p);setSaved(true);setTimeout(()=>{setSaved(false);goTo("dash");},1200);};
 const addAllergy=()=>{if(!newAllergy.trim())return;setP(x=>({...x,allergies:[...x.allergies,newAllergy.trim()]}));setNewAllergy("");};
 const addCondition=()=>{if(!newCondition.trim())return;setP(x=>({...x,conditions:[...x.conditions,newCondition.trim()]}));setNewCondition("");};
 const inp={width:"100%",height:48,borderRadius:13,border:`1.5px solid ${t.isDark?"#5A3820":t.cardBorder}`,padding:"0 14px",fontSize:14,fontWeight:650,background:t.bg2,color:t.text,outline:"none",boxSizing:"border-box"};
 return (
  <div className="nak-care-shell" style={{background:t.bg}}>
   <Hdr t={t} title="Medical Profile" sub={`Para kay ${s?.name}`} back={()=>goTo("dash")} right={<button onClick={save} style={{minHeight:44,padding:"0 14px",background:saved?t.green:t.red,border:0,borderRadius:12,cursor:"pointer",fontSize:12,fontWeight:900,color:"#fff"}}>{saved?"Na-save":"I-save"}</button>}/>
   <main className="nak-care-scroll">
    <div className="nak-care-stack">
     <section className="nak-care-card" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
      <div style={{fontSize:13,fontWeight:900,color:t.text,marginBottom:2}}>Blood type</div>
      <div style={{fontSize:10.5,fontWeight:650,color:t.text3,marginBottom:11}}>Piliin ang blood type ni {s?.nickname||s?.name||"family member"}.</div>
      <div className="nak-blood-grid">
       {BLOOD_TYPES.map(bt=>{
        const selected=p.bloodType===bt;
        return <button key={bt} aria-pressed={selected} onClick={()=>setP(x=>({...x,bloodType:bt}))} style={{background:selected?t.red:t.bg2,border:`1.5px solid ${selected?t.red:t.isDark?"#68401F":t.cardBorder}`,color:selected?"#fff":t.isDark?"#F8EEE2":t.text,boxShadow:selected?`0 3px 10px ${t.redGlow}`:"none"}}>{selected?"✓ ":""}{bt}</button>;
       })}
      </div>
     </section>

     <section className="nak-care-card" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
      <div style={{fontSize:12,fontWeight:900,color:t.text3,letterSpacing:1,marginBottom:10}}>MGA KONDISYON / SAKIT</div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}>{p.conditions.map((c,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,background:t.redBg,border:`1px solid ${t.redBorder}`,borderRadius:9,padding:"5px 9px"}}><span style={{fontSize:11.5,fontWeight:750,color:t.red}}>{c}</span><button aria-label={`Tanggalin ang ${c}`} onClick={()=>setP(x=>({...x,conditions:x.conditions.filter((_,j)=>j!==i)}))} style={{minHeight:28,width:28,background:"none",border:0,cursor:"pointer",color:t.red,fontSize:16}}>×</button></div>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:7}}><input value={newCondition} onChange={e=>setNewCondition(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCondition()} placeholder="hal. Hypertension" style={{...inp,height:44}}/><button onClick={addCondition} style={{height:44,padding:"0 13px",borderRadius:12,background:t.red,border:0,cursor:"pointer",color:"#fff",fontSize:11.5,fontWeight:900}}>+ Dagdag</button></div>
     </section>

     <section className="nak-care-card" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
      <div style={{fontSize:12,fontWeight:900,color:t.text3,letterSpacing:1,marginBottom:10}}>ALLERGIES</div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}>{p.allergies.map((a,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5,background:t.warnBg,border:`1px solid ${t.warnBorder}`,borderRadius:9,padding:"5px 9px"}}><span style={{fontSize:11.5,fontWeight:750,color:t.warn}}>{a}</span><button aria-label={`Tanggalin ang ${a}`} onClick={()=>setP(x=>({...x,allergies:x.allergies.filter((_,j)=>j!==i)}))} style={{minHeight:28,width:28,background:"none",border:0,cursor:"pointer",color:t.warn,fontSize:16}}>×</button></div>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:7}}><input value={newAllergy} onChange={e=>setNewAllergy(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAllergy()} placeholder="hal. Penicillin" style={{...inp,height:44}}/><button onClick={addAllergy} style={{height:44,padding:"0 13px",borderRadius:12,background:t.warn,border:0,cursor:"pointer",color:"#fff",fontSize:11.5,fontWeight:900}}>+ Dagdag</button></div>
     </section>

     <section className="nak-care-card" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
      <div style={{fontSize:12,fontWeight:900,color:t.text3,letterSpacing:1,marginBottom:10}}>DOKTOR AT PHILHEALTH</div>
      <div style={{display:"flex",flexDirection:"column",gap:9}}><input value={p.doctorName} onChange={e=>setP(x=>({...x,doctorName:e.target.value}))} placeholder="Pangalan ng doktor" style={inp}/><input value={p.doctorNum} onChange={e=>setP(x=>({...x,doctorNum:e.target.value}))} placeholder="+63917-800-1234" style={inp} type="tel"/><input value={p.philhealth} onChange={e=>setP(x=>({...x,philhealth:e.target.value}))} placeholder="PhilHealth number" style={inp}/></div>
     </section>

     <section className="nak-care-card" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
      <div style={{fontSize:12,fontWeight:900,color:t.text3,letterSpacing:1,marginBottom:10}}>ESPESYAL NA TALA</div>
      <textarea value={p.notes} onChange={e=>setP(x=>({...x,notes:e.target.value}))} placeholder="hal. Dialysis tuwing Lunes at Huwebes." rows={3} style={{width:"100%",boxSizing:"border-box",borderRadius:13,border:`1.5px solid ${t.isDark?"#5A3820":t.cardBorder}`,padding:"12px 14px",fontSize:13,fontWeight:650,background:t.bg2,color:t.text,resize:"none",outline:"none",fontFamily:"'Nunito',sans-serif"}}/>
     </section>
     <button onClick={save} style={{width:"100%",height:52,borderRadius:14,background:saved?t.green:t.red,border:0,cursor:"pointer",fontSize:15,fontWeight:900,color:"#fff"}}>{saved?"Na-save na":"I-save ang Medical Profile"}</button>
    </div>
   </main>
  </div>
 );
}

function CloudSyncCard({ t }) {
 const [st,setSt]=useState(NAKSYNC.status());
 const [code,setCode]=useState("");
 const [busy,setBusy]=useState(false);
 const [err,setErr]=useState("");
 useEffect(()=>NAKSYNC.onChange(setSt),[]);
 const cleanCode=value=>value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6);
 const doPair=async()=>{setBusy(true);setErr("");const r=await NAKSYNC.pair(code);setBusy(false);if(!r.ok)setErr(r.err||"Hindi nakakonekta");};
 const ready=code.length===6&&!busy;
 return (
  <Card t={t} style={{padding:"15px"}}>
   <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><Icon name="refresh" size={16} color={t.text3}/><div style={{fontSize:13,fontWeight:900,color:t.text2,flex:1}}>Ikonekta ang pamilya</div><div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 7px",borderRadius:8,background:st.paired?t.greenBg:st.configured?t.warnBg:t.bg2,border:`1px solid ${st.paired?t.greenBorder:st.configured?t.warnBorder:t.cardBorder}`}}><span style={{width:6,height:6,borderRadius:"50%",background:st.paired?t.green:st.configured?t.warn:t.text3}}/><span style={{fontSize:9.5,fontWeight:900,color:st.paired?t.green:st.configured?t.warn:t.text3}}>{st.paired?"KONEKTADO":st.configured?"HANDA":"OFF"}</span></div></div>
   {!st.configured&&<div style={{fontSize:11.5,color:t.text3,fontWeight:650,lineHeight:1.5}}>Hindi pa naka-set ang secure sync connection. Tingnan ang deployment guide bago gumamit ng Family Code.</div>}
   {st.configured&&!st.paired&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div style={{fontSize:11.5,color:t.text3,fontWeight:650,lineHeight:1.5}}>Ilagay ang 6-character Family Code para ikonekta ang device na ito sa kapamilya mo.</div>
    <div className="nak-sync-form"><div className="nak-sync-field"><label htmlFor="nak-family-code" style={{color:t.text3}}>Family Code</label><input id="nak-family-code" value={code} onChange={e=>setCode(cleanCode(e.target.value))} maxLength={6} autoCapitalize="characters" autoCorrect="off" spellCheck={false} inputMode="text" placeholder="XXXXXX" aria-describedby={err?"nak-family-code-error":undefined} style={{background:t.bg2,border:`1.5px solid ${err?t.redBorder:t.isDark?"#68401F":t.cardBorder}`,color:t.text,caretColor:t.red,fontFamily:"'Nunito',sans-serif"}}/></div><button onClick={doPair} disabled={!ready} style={{background:ready?t.red:t.bg2,border:`1px solid ${ready?t.red:t.cardBorder}`,color:ready?"#fff":t.text3,cursor:ready?"pointer":"default",opacity:ready?1:.72}}>{busy?"Kumokonekta…":"Ikonekta"}</button></div>
    {err&&<div id="nak-family-code-error" role="alert" style={{fontSize:10.5,color:t.red,fontWeight:750}}>{err}</div>}
   </div>}
   {st.paired&&<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:850,color:t.green}}>Naka-sync sa Family Space</div><div style={{fontSize:10.5,color:t.text3,fontWeight:650,marginTop:2}}>Awtomatikong nag-a-update ang device na ito.</div></div><button onClick={()=>NAKSYNC.unpair()} style={{height:40,padding:"0 11px",borderRadius:11,background:"transparent",border:`1px solid ${t.redBorder}`,cursor:"pointer",fontSize:10.5,fontWeight:850,color:t.red}}>I-disconnect</button></div>}
  </Card>
 );
}

/* naknak-caregiver-ui-end */

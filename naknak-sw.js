/* NakNak offline shell v6 — never cache Supabase API or household data. */
const STATIC_CACHE='naknak-static-v6';
const SHELL=[
  './','./index.html','./app.html','./naknak-app.html','./offline.html',
  './manifest.webmanifest','./Assets/icon-192.png',
  './Assets/icon-512.png','./Assets/apple-touch-icon.png',
];
const AUTH_ROUTES=new Set(['dashboard.html','family-dashboard.html']);
const isPublicAsset=(path)=>{
  const name=path.split('/').pop()||'';
  return path.includes('/Assets/')||
    ['index.html','app.html','naknak-app.html','manifest.webmanifest','naknak-sw.js','offline.html'].includes(name);
};
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(
      keys.filter(key=>key.startsWith('naknak-')&&key!==STATIC_CACHE).map(key=>caches.delete(key))
    )),
  ]));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  // A cross-origin GET may be an authenticated Supabase request.
  // Never intercept, cache, or replay any connected household API result.
  if(url.origin!==self.location.origin)return;
  if(!url.pathname.startsWith(new URL('./',self.registration.scope).pathname))return;
  const page=url.pathname.split('/').pop()||'index.html';
  if(req.mode==='navigate'){
    if(AUTH_ROUTES.has(page)){
      e.respondWith(fetch(req).catch(()=>caches.match('./offline.html')));
      return;
    }
    e.respondWith(fetch(req).then(response=>{
      if(response.ok&&!url.search)caches.open(STATIC_CACHE).then(cache=>cache.put(req,response.clone()));
      return response;
    }).catch(async()=>(
      await caches.match(req,{ignoreSearch:true})||await caches.match('./offline.html')
    )));
    return;
  }
  // Cache only known public shell assets, never state JSON or fetch endpoints.
  if(!isPublicAsset(url.pathname)||url.search)return;
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(response=>{
    if(response.ok)caches.open(STATIC_CACHE).then(cache=>cache.put(req,response.clone()));
    return response;
  })));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    const page=list.find(client=>client.url.includes('/Naknak/'));
    if(page)return page.focus();
    return self.clients.openWindow('./app.html');
  }));
});

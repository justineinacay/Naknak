const CACHE='naknak-v12-shell';
const SHELL=['./','./app.html','./app-v12.html'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));});
self.addEventListener('message',event=>{
 const d=event.data||{};
 if(d.type!=='NAKNAK_NOTIFY')return;
 event.waitUntil(self.registration.showNotification(d.title||'NakNak',{body:d.body||'',tag:d.tag||'naknak',requireInteraction:!!d.requireInteraction,data:d.data||{}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
   const existing=list.find(c=>c.url.includes('/Naknak/'));
   return existing?existing.focus():clients.openWindow('./app.html');
 }));
});
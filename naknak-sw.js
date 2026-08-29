const CACHE='naknak-v14-shell';
const SHELL=['./','./app.html','./app-v14.html','./app-v13.html'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('naknak-')&&k!==CACHE).map(k=>caches.delete(k))))
  ]));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});

self.addEventListener('message',event=>{
  const d=event.data||{};
  if(d.type!=='NAKNAK_NOTIFY')return;
  event.waitUntil(self.registration.showNotification(d.title||'NakNak',{
    body:d.body||'',tag:d.tag||'naknak',requireInteraction:!!d.requireInteraction,data:d.data||{},vibrate:[250,100,250,100,450]
  }));
});

self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{};}catch(e){data={body:event.data?event.data.text():''};}
  event.waitUntil(self.registration.showNotification(data.title||'NakNak Alert',{
    body:data.body||'May bagong alert mula sa iyong kapamilya.',tag:data.tag||'naknak-remote-alert',requireInteraction:data.requireInteraction!==false,data:data.data||{},vibrate:[300,100,300,100,500]
  }));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    const existing=list.find(c=>c.url.includes('/Naknak/'));
    if(existing){existing.postMessage({type:'NAKNAK_NOTIFICATION_OPENED',data:event.notification.data||{}});return existing.focus();}
    return clients.openWindow('./app.html');
  }));
});
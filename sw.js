const CACHE='sudoku-private-v5';
const STATIC=['/manifest.webmanifest','/icon.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r})));
});
/* Web Push: no se muestran remitentes ni contenido de los chats. */
self.addEventListener('push',event=>{
 let data={};
 try{data=event.data?.json()||{}}catch(_){}
 event.waitUntil(self.registration.showNotification('Sudoku',{
  body:'Tienes una actualización',
  icon:'/icon.svg',
  badge:'/icon.svg',
  tag:'privado-notificacion',
  renotify:false,
  data:{url:'/'}
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const existing=windows.find(c=>new URL(c.url).origin===self.location.origin);
  if(existing){await existing.focus();return}
  await self.clients.openWindow('/');
 })());
});

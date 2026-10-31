const CACHE_NAME='transport-messages-v14-silver-icon';
const APP_FILES=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/avatar.svg','./assets/icon-180.png','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-round-192.png','./assets/icon-maskable-512-v2.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('transport-messages-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  const url=new URL(event.request.url);const known=APP_FILES.some(path=>new URL(path,self.registration.scope).pathname===url.pathname);
  if(!known&&event.request.mode!=='navigate')return;
  event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}return response;}).catch(async()=>{const cached=await caches.match(event.request);if(cached)return cached;if(event.request.mode==='navigate')return caches.match('./index.html');return Response.error();}));
});

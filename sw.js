const CACHE='taglio-mho-comic-v4';
const ASSETS=['./','./index.html','./comic.css','./icon.svg','./manifest.webmanifest','./icons/tile-180.png','./icons/tile-192.png','./icons/tile-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&(key.startsWith('taglio')||key.startsWith('Taglio'))).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 const scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 const navigation=event.request.mode==='navigate';
 const known=ASSETS.some(path=>new URL(path,self.registration.scope).href===url.href);
 if(!navigation&&!known)return;
 const key=navigation?new URL('./index.html',self.registration.scope).href:event.request;
 event.respondWith((async()=>{
  try{
   const response=await fetch(event.request);
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(key,copy)));}
   return response;
  }catch(error){
   const cached=await caches.match(key,{cacheName:CACHE});
   return cached||Response.error();
  }
 })());
});
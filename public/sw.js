if(!self.define){let e,i={};const r=(r,s)=>(r=new URL(r+".js",s).href,i[r]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=r,e.onload=i,document.head.appendChild(e)}else e=r,importScripts(r),i()})).then((()=>{let e=i[r];if(!e)throw new Error(`Module ${r} didn’t register its module`);return e})));self.define=(s,n)=>{const d=e||("document"in self?document.currentScript.src:"")||location.href;if(i[d])return;let o={};const c=e=>r(e,d),t={module:{uri:d},exports:o,require:c};i[d]=Promise.all(s.map((e=>t[e]||c(e)))).then((e=>(n(...e),o)))}}define(["./workbox-3625d7b0"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index.00525ca4.css",revision:null},{url:"assets/index.fecca1f4.js",revision:null},{url:"index.html",revision:"3617a78c634ea55f7dc5e0b96e524002"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"script.js",revision:"009b427d90b40f075935b15c09fc3e91"},{url:"favicon.svg",revision:"df5389ab958836dc48a3b5c972987abd"},{url:"android-chrome-192x192.png",revision:"66884b380c93a1e32546df161dab3b55"},{url:"android-chrome-512x512.png",revision:"cc4d266d21afc88d965810ab03050df8"},{url:"manifest.webmanifest",revision:"86fe4e1db30788da04fc1ac7d550984b"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,89973,e=>{"use strict";var t=e.i(43476),r=e.i(71645),n=e.i(32706);e.s(["default",0,function({events:o,userLocation:a,onSelectEvent:i}){let s=(0,r.useRef)(null),l=(0,r.useRef)(null),c=(0,r.useRef)([]),d=(0,r.useRef)(null),[u,p]=(0,r.useState)(!1);return(0,r.useEffect)(()=>{if(s.current&&!l.current)return e.A(71400).then(e=>{let t;delete e.Icon.Default.prototype._getIconUrl,e.Icon.Default.mergeOptions({iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"});let r=e.map(s.current,{center:[48,15],zoom:4,minZoom:2,maxZoom:19});if(e.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors",maxZoom:19}).addTo(r),l.current=r,p(!0),!document.getElementById("heartbeat-style")){let e=document.createElement("style");e.id="heartbeat-style",e.textContent="@keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.3)}28%{transform:scale(1)}42%{transform:scale(1.2)}70%{transform:scale(1)}}",document.head.appendChild(e)}let n=e.divIcon({html:'<div style="font-size:96px;line-height:1;animation:heartbeat 1s ease-in-out infinite;transform-origin:center;filter:drop-shadow(0 0 8px rgba(180,0,0,0.4));">❤️</div>',className:"",iconSize:[120,120],iconAnchor:[60,60]});e.marker([32.4279,53.688],{icon:n,interactive:!1,zIndexOffset:-1e3}).addTo(r),fetch("https://ipapi.co/json/").then(e=>e.json()).then(e=>{e.latitude&&e.longitude&&r.flyTo([e.latitude,e.longitude],10,{duration:1.5})}).catch(()=>{});let o=()=>{clearTimeout(t),t=setTimeout(()=>r.invalidateSize(),150)};window.addEventListener("resize",o),r._onResize=o}),()=>{l.current&&(window.removeEventListener("resize",l.current._onResize),l.current.remove(),l.current=null)}},[]),(0,r.useEffect)(()=>{u&&l.current&&e.A(71400).then(e=>{c.current.forEach(e=>e.remove()),c.current=[];let t=new Map;o.forEach(e=>{if(null==e.lat||null==e.lng)return;let r=`${e.lat.toFixed(4)},${e.lng.toFixed(4)}`;t.has(r)||t.set(r,[]),t.get(r).push(e)}),t.forEach(t=>{t.forEach((r,o)=>{let a=r.lat,i=r.lng;if(t.length>1){let e=2*Math.PI*o/t.length;a+=6e-4*Math.sin(e),i+=6e-4*Math.cos(e)}let s=n.EVENT_TYPE_META[r.event_type]??n.EVENT_TYPE_META.other,d=e.divIcon({html:`<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${s.icon}</div>`,className:"",iconSize:[36,36],iconAnchor:[18,18]}),u=new Date(r.next_occurrence??r.start_date).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}),p=e.marker([a,i],{icon:d}).addTo(l.current).bindTooltip(`<strong>${r.title}</strong><br/><span style="color:#6b7280;font-size:12px;">📅 ${u}</span>`,{className:"persian-hub-tooltip",direction:"top"}).on("click",()=>{window.location.href=`/events/detail?id=${r.id}`});c.current.push(p)})})})},[o,i,u]),(0,r.useEffect)(()=>{a&&l.current&&e.A(71400).then(e=>{if(d.current&&d.current.remove(),!document.getElementById("user-location-style")){let e=document.createElement("style");e.id="user-location-style",e.textContent=`
          @keyframes user-pulse {
            0%   { transform: scale(1);   opacity: 1; }
            70%  { transform: scale(2.8); opacity: 0; }
            100% { transform: scale(1);   opacity: 0; }
          }
          @keyframes user-glow {
            0%, 100% { box-shadow: 0 0 6px 2px rgba(74,144,217,0.8); }
            50%       { box-shadow: 0 0 18px 6px rgba(74,144,217,1); }
          }
          .user-location-dot {
            width:16px;height:16px;border-radius:50%;background:#4A90D9;
            border:3px solid #1B3A6B;box-shadow:0 0 6px 2px rgba(74,144,217,0.8);
            animation:user-glow 1.8s ease-in-out infinite;position:relative;
          }
          .user-location-dot::after {
            content:'';position:absolute;top:0;left:0;width:100%;height:100%;
            border-radius:50%;background:rgba(74,144,217,0.5);
            animation:user-pulse 1.8s ease-out infinite;
          }
        `,document.head.appendChild(e)}let t=e.divIcon({html:'<div class="user-location-dot"></div>',className:"",iconSize:[16,16],iconAnchor:[8,8]});d.current=e.marker(a,{icon:t,zIndexOffset:9999,interactive:!1}).addTo(l.current),l.current.flyTo(a,13,{duration:1.2})})},[a]),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("link",{rel:"stylesheet",href:"https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"}),(0,t.jsx)("style",{children:`
        .persian-hub-tooltip {
          background: white !important;
          border: 1.5px solid #e8d5b0 !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
          font-size: 13px;
        }
        .persian-hub-tooltip::before { border-top-color: #e8d5b0 !important; }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.3); }
          28% { transform: scale(1); }
          42% { transform: scale(1.2); }
          70% { transform: scale(1); }
        }
      `}),(0,t.jsx)("div",{ref:s,className:"w-full h-full rounded-xl"})]})}])},25320,e=>{e.n(e.i(89973))},71400,e=>{e.v(t=>Promise.all(["static/chunks/06r9_3ub2r-4z.js"].map(t=>e.l(t))).then(()=>t(32322)))}]);
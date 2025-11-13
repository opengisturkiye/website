(function(){
  // Tema 
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  try{
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('crs-v4-theme', 'dark');
  }catch(e){ /* ignore storage errors */ }
  if(themeToggle){
    themeToggle.textContent = '🌙';
    themeToggle.disabled = true;
    themeToggle.style.opacity = '0.75';
    themeToggle.style.cursor = 'default';
    themeToggle.setAttribute('aria-pressed', 'true');
  }

  // TOC active
  const toc = document.getElementById('toc');
  const links = toc.querySelectorAll('a');
  const targets = Array.from(links).map(a=> document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=> l.classList.remove('active'));
        const id = '#' + e.target.id;
        const link = toc.querySelector(`a[href="${id}"]`);
        if(link) link.classList.add('active');
      }
    });
  }, {rootMargin: '-40% 0px -55% 0px', threshold: 0.0});
  targets.forEach(t=> obs.observe(t));

  // === Başlık alti animasyonlar (D3) ===
  const P = d3;
  function setupCanvas(canvas){
    const rect = canvas.getBoundingClientRect();
    const dpi = Math.min(window.devicePixelRatio||1, 2);
    const w = Math.max(640, rect.width);
    const h = Math.max(320, rect.height);
    canvas.width = Math.floor(w * dpi);
    canvas.height = Math.floor(h * dpi);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpi,0,0,dpi,0,0);
    return {ctx, w, h, dpi};
  }
  function fillBG(ctx, w, h){
    ctx.fillStyle = root.getAttribute('data-theme')==='dark' ? '#0b1625' : '#eef6ff';
    ctx.fillRect(0,0,w,h);
  }
  function drawSphere(ctx, path){
    ctx.save();
    ctx.fillStyle = root.getAttribute('data-theme')==='dark' ? '#0b1625' : '#eef6ff';
    ctx.strokeStyle = 'rgba(255,255,255,.15)';
    ctx.lineWidth = 1.1;
    ctx.beginPath(); path({type:'Sphere'}); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function drawGraticule(ctx, path, stepLon=30, stepLat=20){
    const gr = P.geoGraticule().step([stepLon, stepLat]);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); path(gr()); ctx.stroke();
    ctx.restore();
  }

  function anim_projectionMorph(canvas){
    let t=0;
    return {
      name:'projectionMorph', canvas, needsRedraw:true,
      draw(dt){
        const {ctx,w,h} = setupCanvas(canvas);
        const margin=16;
        const ortho = P.geoOrthographic().clipAngle(90);
        const equirect = P.geoEquirectangular();
        ortho.fitExtent([[margin,margin],[w/2-margin,h-margin]], {type:'Sphere'}).rotate([-20,-10,0]);
        equirect.fitExtent([[w/2+margin,margin],[w-margin,h-margin]], {type:'Sphere'});
        t = (t + 0.4*dt) % 1;
        ctx.clearRect(0,0,w,h); fillBG(ctx,w,h);
        const pathL = P.geoPath(ortho, ctx);
        const pathR = P.geoPath(equirect, ctx);
        const isDark = root.getAttribute('data-theme')==='dark';
        ctx.save();
        ctx.beginPath();
        pathL({type:'Sphere'});
        ctx.clip();
        const sphereBounds = pathL.bounds({type:'Sphere'});
        const cx = (sphereBounds[0][0] + sphereBounds[1][0]) / 2;
        const cy = (sphereBounds[0][1] + sphereBounds[1][1]) / 2;
        const r = (sphereBounds[1][0] - sphereBounds[0][0]) / 2;
        const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
        if(isDark){
          grad.addColorStop(0, '#1f3a5f');
          grad.addColorStop(1, '#071223');
        }else{
          grad.addColorStop(0, '#a5c8ff');
          grad.addColorStop(1, '#3f6fb3');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(sphereBounds[0][0]-2, sphereBounds[0][1]-2, sphereBounds[1][0]-sphereBounds[0][0]+4, sphereBounds[1][1]-sphereBounds[0][1]+4);
        ctx.restore();
        ctx.save();
        ctx.beginPath(); pathL({type:'Sphere'}); ctx.strokeStyle = isDark ? 'rgba(173,216,255,.8)' : 'rgba(15,48,92,.9)'; ctx.lineWidth = 1.4; ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        pathL({type:'Sphere'});
        ctx.clip();
        const gratStroke = isDark ? 'rgba(199,227,255,.7)' : 'rgba(234,248,255,.85)';
        const graticule = P.geoGraticule().step([30,20]);
        ctx.strokeStyle = gratStroke;
        ctx.lineWidth = 1.1;
        ctx.beginPath(); pathL(graticule()); ctx.stroke();
        ctx.strokeStyle = isDark ? '#ffffff' : '#fdfdfd';
        ctx.lineWidth = 1.4;
        ctx.beginPath(); pathL({type:'LineString', coordinates:[[0,-90],[0,90]]}); ctx.stroke();
        ctx.beginPath(); pathL({type:'LineString', coordinates:[[-180,0],[180,0]]}); ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.beginPath(); pathR({type:'Sphere'}); ctx.fillStyle = isDark ? '#0b1625' : '#eef6ff'; ctx.fill();
        ctx.restore();
        ctx.save(); ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=1;
        ctx.beginPath(); pathR(P.geoGraticule().step([30,20])()); ctx.stroke(); ctx.restore();
        const lines=[];
        for(let lon=-180; lon<=180; lon+=30){ const L=[]; for(let lat=-80; lat<=80; lat+=5){ L.push([lon,lat]); } lines.push(L); }
        for(let lat=-80; lat<=80; lat+=20){ const L=[]; for(let lon=-180; lon<=180; lon+=5){ L.push([lon,lat]); } lines.push(L); }
        ctx.save(); ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.lineWidth=1;
        lines.forEach(L=>{
          ctx.beginPath(); let pen=false;
          L.forEach(ll=>{
            const a = ortho(ll); const b = equirect(ll);
            if(!a||!b){ pen=false; return; }
            const x = a[0]*(1-t) + b[0]*t;
            const y = a[1]*(1-t) + b[1]*t;
            if(!pen){ ctx.moveTo(x,y); pen=true; } else { ctx.lineTo(x,y); }
          });
          ctx.stroke();
        });
        ctx.restore();
      }
    }
  }
  function anim_tissot(canvas){
    let tt=0;
    return {
      name:'tissot', canvas, needsRedraw:true,
      draw(dt){
        const {ctx,w,h} = setupCanvas(canvas);
        tt=(tt+0.5*dt)%1;
        const proj=P.geoConicConformal().parallels([33,45]).rotate([-20,0]);
        proj.fitExtent([[16,16],[w-16,h-16]], {type:'Sphere'});
        const path=P.geoPath(proj, ctx);
        ctx.clearRect(0,0,w,h); fillBG(ctx,w,h);
        drawSphere(ctx,path); drawGraticule(ctx,path,30,15);
        const longitudes = P.range(-150, 181, 30);
        const latitudes = P.range(-60, 61, 15);
        const r = 6;
        ctx.save(); ctx.globalAlpha=.95;
        longitudes.forEach(lon=> latitudes.forEach(lat=>{
          const rr = r*(.6 + .4*Math.sin(tt*Math.PI*2));
          const circle = P.geoCircle().center([lon,lat]).radius(rr)();
          ctx.beginPath(); path(circle);
          ctx.fillStyle='rgba(34,211,238,.12)'; ctx.fill();
          ctx.strokeStyle='rgba(34,211,238,.9)'; ctx.lineWidth=.9; ctx.stroke();
        }));
        ctx.restore();
      }
    }
  }
  function anim_utm(canvas){
    let lon=26, dir=1;
    return {
      name:'utm', canvas, needsRedraw:true,
      draw(dt){
        const {ctx,w,h} = setupCanvas(canvas);
        lon += dt*15*dir; if(lon>42){dir=-1;} if(lon<24){dir=1;}
        ctx.clearRect(0,0,w,h); fillBG(ctx,w,h);
        const x0=20,y0=20; const ww=w-40, hh=h-40;
        for(let z=1; z<=60; z++){
          const lonL=-180 + (z-1)*6, lonR=-180 + z*6;
          const xL = x0 + (lonL+180)/360*ww, xR = x0 + (lonR+180)/360*ww;
          ctx.fillStyle = z%2===0 ? 'rgba(34,211,238,.10)' : 'rgba(255,255,255,.03)';
          ctx.fillRect(xL,y0, xR-xL, hh);
        }
        ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1;
        for(let z=1; z<=60; z++){
          const x = x0 + ((-180 + (z-1)*6)+180)/360 * ww;
          ctx.beginPath(); ctx.moveTo(x,y0); ctx.lineTo(x,y0+hh); ctx.stroke();
        }
        const xSel = x0 + (lon+180)/360*ww;
        ctx.strokeStyle='rgba(250,204,21,.95)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(xSel,y0); ctx.lineTo(xSel,y0+hh); ctx.stroke();
        const zone = Math.floor((lon+180)/6)+1;
        ctx.fillStyle='rgba(255,255,255,.85)'; ctx.font='14px Inter, system-ui, sans-serif';
        ctx.fillText(`Lon ${lon.toFixed(0)}°, Zone ${zone}`, xSel+8, y0+16);
      }
    }
  }
  function anim_axisOrder(canvas){
    let t=0;
    return {
      name:'axisOrder', canvas, needsRedraw:true,
      draw(dt){
        const {ctx,w,h} = setupCanvas(canvas);
        t=(t+0.7*dt)%1;
        const proj = P.geoEquirectangular().fitExtent([[16,16],[w-16,h-16]], {type:'Sphere'});
        const path = P.geoPath(proj, ctx);
        ctx.clearRect(0,0,w,h); fillBG(ctx,w,h);
        drawSphere(ctx,path); drawGraticule(ctx,path,30,20);
        const from=[28.9795, 41.0151]; // lon,lat
        const bad=[41.0151, 28.9795];
        const p1=proj(from), p2=proj(bad);
        ctx.fillStyle='rgba(34,197,94,.95)';
        ctx.beginPath(); ctx.arc(p1[0],p1[1],4+Math.sin(t*2*Math.PI)*1.2,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(239,68,68,.9)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]); ctx.stroke();
        ctx.fillStyle='rgba(239,68,68,.95)'; ctx.beginPath(); ctx.arc(p2[0],p2[1],4,0,Math.PI*2); ctx.fill();
      }
    }
  }
  function anim_webMercator(canvas){
    let t=0;
    return {
      name:'webMercator', canvas, needsRedraw:true,
      draw(dt){
        const {ctx,w,h} = setupCanvas(canvas);
        t=(t+0.6*dt)%1;
        const proj=P.geoMercator().fitExtent([[16,16],[w-16,h-16]], {type:'Sphere'});
        const path=P.geoPath(proj, ctx);
        ctx.clearRect(0,0,w,h); fillBG(ctx,w,h);
        drawSphere(ctx,path); drawGraticule(ctx,path,30,20);
        const lats=[0, 45, 60], lon=20, r=10;
        ctx.save();
        lats.forEach(lat=>{
          const rr = r*(.8 + .2*Math.sin(t*Math.PI*2));
          const circle = P.geoCircle().center([lon,lat]).radius(rr)();
          ctx.beginPath(); path(circle);
          ctx.fillStyle='rgba(2,132,199,.16)'; ctx.fill();
          ctx.strokeStyle='rgba(2,132,199,.9)'; ctx.lineWidth=1.1; ctx.stroke();
        });
        ctx.restore();
      }
    }
  }
  function anim_datumShift(canvas){
    let t=0; const from=[32.85,39.93]; const vec=[250,-120];
    return {
      name:'datumShift', canvas, needsRedraw:true,
      draw(dt){
        const {ctx,w,h} = setupCanvas(canvas);
        t=(t+0.7*dt)%1;
        const proj=P.geoTransverseMercator().fitExtent([[16,16],[w-16,h-16]], {type:'Sphere'}).rotate([-33,0]);
        const path=P.geoPath(proj, ctx);
        ctx.clearRect(0,0,w,h); fillBG(ctx,w,h);
        drawSphere(ctx,path); drawGraticule(ctx,path,20,15);
        const p1=proj(from);
        const k=.5+.5*Math.sin(t*Math.PI*2);
        const p2=[p1[0]+vec[0]*k/3, p1[1]+vec[1]*k/3];
        ctx.fillStyle='rgba(34,197,94,.95)'; ctx.beginPath(); ctx.arc(p1[0],p1[1],4,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(234,179,8,.95)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]); ctx.stroke();
        ctx.fillStyle='rgba(234,179,8,.95)'; ctx.beginPath(); ctx.arc(p2[0],p2[1],4,0,Math.PI*2); ctx.fill();
      }
    }
  }

  // 
  const animFactories = {projectionMorph:anim_projectionMorph, tissot:anim_tissot, utm:anim_utm, axisOrder:anim_axisOrder, webMercator:anim_webMercator, datumShift:anim_datumShift};
  const anims = [];
  document.querySelectorAll('.anim-wrap[data-anim]').forEach(wrap=>{
    const key = wrap.getAttribute('data-anim');
    const canvas = wrap.querySelector('canvas.anim');
    const fn = animFactories[key];
    if(fn && canvas){ anims.push(fn(canvas)); }
  });

  // Görünürlük tabanlı oynatma
  const vis = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      const a = anims.find(x=>x.canvas===e.target);
      if(a){ a.visible = e.isIntersecting; if(a.visible) a.needsRedraw=true; }
    });
  }, {rootMargin:'-10% 0px -10% 0px', threshold: 0.0});
  anims.forEach(a=> vis.observe(a.canvas));

  let last = performance.now();
  function loop(ts){
    const dt = (ts - last)/1000; last = ts;
    anims.forEach(a=>{
      if(a.visible){ a.draw(dt); }
      else if(a.needsRedraw){ a.draw(0); a.needsRedraw=false; }
    });
    if(sandboxNeedsRedraw){ renderSandbox(); sandboxNeedsRedraw=false; }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.addEventListener('resize', ()=>{
    anims.forEach(a=> a.needsRedraw = true);
    sandboxNeedsRedraw = true;
  });

  // === SANDBOX ===
  let sandboxNeedsRedraw = false;
  const stage = document.getElementById('stage');
  const ctx = stage.getContext('2d');
  let width, height, dpi;
  function resizeCanvas(){
    const rect = stage.getBoundingClientRect();
    dpi = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(600, rect.width);
    height = Math.max(360, rect.height);
    stage.width = Math.floor(width * dpi);
    stage.height = Math.floor(height * dpi);
    stage.style.width = width + 'px';
    stage.style.height = height + 'px';
    ctx.setTransform(dpi,0,0,dpi,0,0);
  }

  const projSelect = document.getElementById('projSelect');
  const scaleRange = document.getElementById('scaleRange');
  const gratStep = document.getElementById('gratStep');
  const showGraticule = document.getElementById('showGraticule');
  const showTissot = document.getElementById('showTissot');
  const tissotRadius = document.getElementById('tissotRadius');
  const showTurkeyLines = document.getElementById('showTurkeyLines');
  const recenter = document.getElementById('recenter');
  const resetBtn = document.getElementById('reset');
  const cursorLabel = document.getElementById('cursorLabel');
  const utmLabel = document.getElementById('utmLabel');

  const P2 = d3;
  let projection = P2.geoMercator();
  let path = P2.geoPath(projection).context(ctx);
  let rotate = [0,0,0];
  let lastClickLL = null;

  function buildProjection(name){
    switch(name){
      case 'Transverse Mercator': return P2.geoTransverseMercator();
      case 'Conic Conformal': return P2.geoConicConformal().parallels([33,45]).rotate([-27,0]);
      case 'Conic Equal Area': return P2.geoConicEqualArea().parallels([30,40]).rotate([-20,0]);
      case 'Azimuthal Equal Area': return P2.geoAzimuthalEqualArea();
      case 'Orthographic': return P2.geoOrthographic();
      case 'Equirectangular': return P2.geoEquirectangular();
      default: return P2.geoMercator();
    }
  }
  function fit(){
    projection.fitExtent([[16,16],[width-16,height-16]], {type:'Sphere'});
    const s = +scaleRange.value; projection.scale(projection.scale()*s);
    projection.rotate(rotate);
    path = P2.geoPath(projection).context(ctx);
  }
  function clearSB(){ ctx.clearRect(0,0,width,height); }
  function fillBGSB(){
    ctx.fillStyle = root.getAttribute('data-theme')==='dark' ? '#0b1625' : '#eef6ff'; ctx.fillRect(0,0,width,height);
  }
  function drawSphereSB(){
    ctx.save();
    ctx.fillStyle = root.getAttribute('data-theme')==='dark' ? '#0b1625' : '#eef6ff';
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); path({type:'Sphere'}); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function drawGraticuleSB(){
    const step = +gratStep.value;
    const gr = P2.geoGraticule().step([step, step]);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); path(gr()); ctx.stroke();
    ctx.restore();
  }
  function drawTissotSB(){
    const r = +tissotRadius.value;
    const longitudes = P2.range(-150, 181, 30);
    const latitudes = P2.range(-60, 61, 15);
    ctx.save(); ctx.strokeStyle = 'rgba(110,231,255,.9)'; ctx.lineWidth = 0.8; ctx.fillStyle = 'rgba(62,199,232,.12)';
    longitudes.forEach(lon=> latitudes.forEach(lat=>{
      const circle = P2.geoCircle().center([lon,lat]).radius(r)();
      ctx.beginPath(); path(circle); ctx.fill(); ctx.stroke();
    }));
    ctx.restore();
  }
  function drawTurkeyGuides(){
    const meridiansTM6 = [27, 33, 39];
    const meridiansTM3 = [27, 30, 33, 36, 39, 42];
    ctx.save();
    ctx.strokeStyle = 'rgba(58,210,159,.95)'; ctx.lineWidth = 2;
    meridiansTM6.forEach(lon=>{
      const line = {type:'LineString', coordinates: [[lon,-90],[lon,90]]};
      ctx.beginPath(); path(line); ctx.stroke();
    });
    ctx.setLineDash([6,6]); ctx.strokeStyle = 'rgba(250,204,21,.95)'; ctx.lineWidth = 1.2;
    meridiansTM3.forEach(lon=>{ const line = {type:'LineString', coordinates: [[lon,-90],[lon,90]]}; ctx.beginPath(); path(line); ctx.stroke(); });
    ctx.restore();
  }
  function drawClickPoint(){
    if(!lastClickLL) return;
    const p = projection(lastClickLL);
    if(!p) return;
    ctx.save();
    ctx.fillStyle = 'rgba(255,123,123,.95)';
    ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
  function renderSandbox(){
    resizeCanvas();
    clearSB(); fillBGSB(); fit();
    drawSphereSB();
    if(showGraticule.checked) drawGraticuleSB();
    if(showTissot.checked) drawTissotSB();
    if(showTurkeyLines.checked) drawTurkeyGuides();
    drawClickPoint();
  }

  // init
  if(stage){
    renderSandbox();
    projSelect.addEventListener('change', ()=>{ projection = buildProjection(projSelect.value); sandboxNeedsRedraw = true; });
    scaleRange.addEventListener('input', ()=> sandboxNeedsRedraw = true);
    gratStep.addEventListener('input', ()=> sandboxNeedsRedraw = true);
    showGraticule.addEventListener('change', ()=> sandboxNeedsRedraw = true);
    showTissot.addEventListener('change', ()=> sandboxNeedsRedraw = true);
    tissotRadius.addEventListener('input', ()=> sandboxNeedsRedraw = true);
    showTurkeyLines.addEventListener('change', ()=> sandboxNeedsRedraw = true);
    recenter.addEventListener('click', ()=>{ rotate = [0,0,0]; sandboxNeedsRedraw = true; });
    resetBtn.addEventListener('click', ()=>{
      projSelect.value = 'Mercator'; projection = buildProjection('Mercator');
      scaleRange.value = 1.2; gratStep.value = 15; tissotRadius.value = 3;
      showGraticule.checked = true; showTissot.checked = true; showTurkeyLines.checked = false;
      rotate = [0,0,0]; lastClickLL = null; cursorLabel.textContent = 'Lat, Lon: –'; utmLabel.textContent = 'UTM: –';
      sandboxNeedsRedraw = true;
    });
    // Drag rotate
    let isDragging=false, lastX=0, lastY=0;
    stage.addEventListener('pointerdown', e=>{ isDragging=true; lastX=e.clientX; lastY=e.clientY; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointerup', e=>{ isDragging=false; stage.releasePointerCapture(e.pointerId); });
    stage.addEventListener('pointerleave', ()=>{ isDragging=false; });
    stage.addEventListener('pointermove', e=>{
      if(isDragging){
        const dx = e.clientX - lastX; const dy = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        rotate[0] += dx * -0.1; // lon
        rotate[1] += dy * 0.1;  // lat
        sandboxNeedsRedraw = true;
      }
    });
    // Click → lat/lon + UTM
    function lonLatToUTMZone(lon){ return Math.floor((lon + 180) / 6) + 1; }
    function latToUTMBand(lat){
      const bands = "CDEFGHJKLMNPQRSTUVWX";
      const idx = Math.floor((lat + 80) / 8);
      return (idx>=0 && idx<bands.length) ? bands[idx] : null;
    }
    stage.addEventListener('click', e=>{
      const rect = stage.getBoundingClientRect();
      const xy = [ (e.clientX - rect.left) * (stage.width / rect.width) / dpi,
                   (e.clientY - rect.top) * (stage.height / rect.height) / dpi ];
      if(!projection.invert) return;
      const ll = projection.invert(xy);
      if(!ll) return;
      lastClickLL = ll;
      const [lon,lat] = ll;
      cursorLabel.textContent = `Lat, Lon: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      const zone = lonLatToUTMZone(lon);
      const band = latToUTMBand(lat);
      utmLabel.textContent = band ? `UTM: ${zone}${band}` : `UTM: ${zone}`;
      sandboxNeedsRedraw = true;
    });
  }
})();

// Koordinat animasyonu (φ, λ → X, Y)
  (function () {
    const button = document.getElementById("coord-toggle");
    const point = document.getElementById("coord-point");

    if (!button || !point) return;

    let isProjected = false;
    const start = { x: 100, y: 80 }; // Küre üzerindeki konum
    const end = { x: 300, y: 90 };   // Harita üzerindeki konum

    button.addEventListener("click", () => {
      const duration = 700;
      const from = isProjected ? end : start;
      const to = isProjected ? start : end;
      const startTime = performance.now();

      function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const ease = t * (2 - t); // basit ease-out
        const x = from.x + (to.x - from.x) * ease;
        const y = from.y + (to.y - from.y) * ease;
        point.setAttribute("cx", x);
        point.setAttribute("cy", y);

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          isProjected = !isProjected;
        }
      }

      requestAnimationFrame(step);
    });
  })();

  // Koordinat görselindeki küre üzerine enlem-boylam çizgileri ekle
  (function () {
    const svg = document.getElementById("coord-svg");
    if (!svg) return;

    const backGroup = svg.querySelector(".earth-grid-back");
    const frontGroup = svg.querySelector(".earth-grid-front");
    if (!backGroup || !frontGroup) return;

    const NS = "http://www.w3.org/2000/svg";
    const radius = 60;
    const cx = 100;
    const cy = 100;
    const centerLat = 12; // küreye hafif yukarıdan bakış
    const centerLon = -30; // haritayı hafif batıdan çevir
    const degToRad = Math.PI / 180;
    const phi0 = centerLat * degToRad;
    const lambda0 = centerLon * degToRad;

    function project(lat, lon) {
      const phi = lat * degToRad;
      const lambda = lon * degToRad;

      const cosc =
        Math.sin(phi0) * Math.sin(phi) +
        Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0);

      const x = radius * Math.cos(phi) * Math.sin(lambda - lambda0);
      const y =
        radius *
        (Math.cos(phi0) * Math.sin(phi) -
          Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0));

      return {
        x: cx + x,
        y: cy - y,
        visible: cosc >= 0,
      };
    }

    function segmentize(values, fixed, type) {
      const segments = [];
      let current = null;

      values.forEach((value) => {
        const sample =
          type === "parallel" ? project(fixed, value) : project(value, fixed);
        if (!sample) return;

        if (!current || current.visible !== sample.visible) {
          if (current && current.points.length) segments.push(current);
          current = { visible: sample.visible, points: [] };
        }

        current.points.push(sample);
      });

      if (current && current.points.length) segments.push(current);
      return segments;
    }

    function pathFromPoints(points) {
      if (!points.length) return "";

      let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
      for (let i = 1; i < points.length; i++) {
        const p = points[i];
        d += ` L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
      }
      return d;
    }

    function createPath(d, className, target) {
      if (!d) return;
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", d);
      path.setAttribute("class", className);
      target.appendChild(path);
    }

    function drawGraticule() {
      backGroup.innerHTML = "";
      frontGroup.innerHTML = "";

      const parallels = [-60, -30, 0, 30, 60];
      const meridians = [-120, -90, -60, -30, 0, 30, 60, 90, 120];

      const lonSamples = [];
      for (let lon = -180; lon <= 180; lon += 3) lonSamples.push(lon);
      const latSamples = [];
      for (let lat = -90; lat <= 90; lat += 3) latSamples.push(lat);

      parallels.forEach((lat) => {
        const segments = segmentize(lonSamples, lat, "parallel");
        segments.forEach((segment) => {
          const d = pathFromPoints(segment.points);
          const cls = `earth-line earth-parallel-line ${
            segment.visible ? "front" : "back"
          }`;
          createPath(d, cls, segment.visible ? frontGroup : backGroup);
        });
      });

      meridians.forEach((lon) => {
        const segments = segmentize(latSamples, lon, "meridian");
        segments.forEach((segment) => {
          const d = pathFromPoints(segment.points);
          const cls = `earth-line earth-meridian-line ${
            segment.visible ? "front" : "back"
          }`;
          createPath(d, cls, segment.visible ? frontGroup : backGroup);
        });
      });
    }

    drawGraticule();
  })();

// Elipsoid • Jeoit • Yükseklik animasyon iskeleti
  (function () {
    const controls = document.getElementById("height-controls");
    const caption = document.getElementById("height-caption");
    const heightGroup = document.getElementById("height-group");

    const topo = document.querySelector(".topography-line");
    const geoid = document.querySelector(".geoid-line");
    const ellipsoid = document.querySelector(".ellipsoid-line");

    if (!controls || !caption || !heightGroup) return;

    function resetDim() {
      [topo, geoid, ellipsoid].forEach((el) => {
        if (!el) return;
        el.classList.remove("dimmed");
      });
    }

    controls.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-focus]");
      if (!btn) return;

      const focus = btn.getAttribute("data-focus");
      resetDim();

      if (focus === "topo") {
        geoid && geoid.classList.add("dimmed");
        ellipsoid && ellipsoid.classList.add("dimmed");
        caption.textContent =
          "Topoğrafya: Gerçek yeryüzü (dağlar, vadiler). Üzerinde ölçtüğümüz nokta buradadır.";
        heightGroup.classList.remove("visible");
      } else if (focus === "geoid") {
        topo && topo.classList.add("dimmed");
        ellipsoid && ellipsoid.classList.add("dimmed");
        caption.textContent =
          "Jeoit: Ortalama deniz seviyesine benzer, yerçekimine bağlı eşpotansiyel yüzey.";
        heightGroup.classList.remove("visible");
      } else if (focus === "ellipsoid") {
        topo && topo.classList.add("dimmed");
        geoid && geoid.classList.add("dimmed");
        caption.textContent =
          "Elipsoid: Dünya’nın pürüzsüz, matematiksel modeli (örneğin WGS84, GRS80).";
        heightGroup.classList.remove("visible");
      } else if (focus === "hhn") {
        heightGroup.classList.toggle("visible");
        caption.textContent =
          "h: elipsoidal yükseklik, H: ortometrik yükseklik, N: jeoit ondülasyonu. h = H + N ilişkisi geçerlidir.";
      }
    });
  })();

// Datum farkı animasyon iskeleti
  (function () {
    const btn = document.getElementById("datum-toggle");
    const caption = document.getElementById("datum-caption");

    const ed50 = document.getElementById("pt-ed50");
    const wgs84 = document.getElementById("pt-wgs84");
    const turef = document.getElementById("pt-turef");

    if (!btn || !caption || !ed50 || !wgs84 || !turef) return;

    // Orijinal konumlar
    const original = {
      ed50: { x: 190, y: 95 },
      wgs84: { x: 205, y: 100 },
      turef: { x: 195, y: 110 }
    };

    // Abartılmış kaydırma (örnek)
    const exaggerated = {
      ed50: { x: 160, y: 95 },
      wgs84: { x: 225, y: 105 },
      turef: { x: 200, y: 130 }
    };

    let exaggeratedMode = false;

    btn.addEventListener("click", () => {
      const from = exaggeratedMode ? exaggerated : original;
      const to = exaggeratedMode ? original : exaggerated;
      const duration = 600;
      const startTime = performance.now();

      function lerp(a, b, t) {
        return a + (b - a) * t;
      }

      function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const ease = t * (2 - t);

        ["ed50", "wgs84", "turef"].forEach((key) => {
          const el =
            key === "ed50" ? ed50 : key === "wgs84" ? wgs84 : turef;
          const x = lerp(from[key].x, to[key].x, ease);
          const y = lerp(from[key].y, to[key].y, ease);
          el.setAttribute("cx", x);
          el.setAttribute("cy", y);
        });

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          exaggeratedMode = !exaggeratedMode;
          caption.textContent = exaggeratedMode
            ? "Abartılmış mod: Datum farkı gerçekte birkaç–onlarca metre olsa da, kavramı göstermek için görselde fazlaca büyütüldü."
            : "Başlangıç modu: Noktalar birbirine daha yakın, gerçek hayattaki metre seviyesindeki farkı temsil eder.";
        }
      }

      requestAnimationFrame(step);
    });
  })();

// UTM zon hesaplama ve zon şeritleri
  (function () {
    const canvas = document.getElementById("utmCanvas");
    const zoneLabel = document.getElementById("utmSelectedZone");
    const lonLabel = document.getElementById("utmSelectedLon");
    const latLabel = document.getElementById("utmSelectedLat");
    const hoverLabel = document.getElementById("utmHoverZone");
    if (!canvas || !canvas.getContext) return;

    const rootEl = document.documentElement;
    const ctx = canvas.getContext("2d");
    const P3 = d3;

    let widthCSS = 0;
    let heightCSS = 0;
    let dpi = 1;

    const projection = P3.geoNaturalEarth1();
    const graticule = P3.geoGraticule().step([30, 20]);
    const zoneDefs = P3.range(1, 61).map((zone) => {
      const west = -180 + (zone - 1) * 6;
      const east = west + 6;
      return {
        zone,
        west,
        east,
        center: west + 3,
        polygon: [
          [west, -80],
          [west, 84],
          [east, 84],
          [east, -80],
          [west, -80],
        ],
      };
    });

    const turkeyBand = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [26, 42.5],
            [45, 42.5],
            [45, 35.5],
            [26, 35.5],
            [26, 42.5],
          ],
        ],
      },
    };

    const turkeyOutline = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [26.0, 39.0],
            [27.2, 40.5],
            [28.7, 41.0],
            [29.8, 41.4],
            [31.0, 41.9],
            [32.7, 41.3],
            [34.8, 41.8],
            [36.5, 41.5],
            [38.8, 41.6],
            [40.5, 41.0],
            [42.3, 40.7],
            [44.1, 40.3],
            [45.5, 39.6],
            [44.0, 38.2],
            [42.1, 37.2],
            [39.5, 36.2],
            [36.9, 35.8],
            [34.0, 36.1],
            [31.2, 36.6],
            [28.5, 36.5],
            [26.6, 37.2],
            [26.0, 38.4],
            [26.0, 39.0],
          ],
        ],
      },
    };

    const landBlobs = [
      { center: [-100, 47], radius: 32 },
      { center: [-80, 20], radius: 26 },
      { center: [-62, -25], radius: 23 },
      { center: [10, 50], radius: 28 },
      { center: [30, 18], radius: 28 },
      { center: [90, 55], radius: 34 },
      { center: [110, 10], radius: 26 },
      { center: [135, -20], radius: 20 },
      { center: [40, -32], radius: 22 },
    ].map((def) => ({
      type: "Feature",
      geometry: P3.geoCircle().center(def.center).radius(def.radius).precision(3)(),
    }));

    let path = P3.geoPath(projection, ctx);

    const hoverState = { zone: null, centerLon: null, lat: null };
    const selectedState = {
      zone: 36,
      centerLon: zoneDefs[35].center,
      lat: 39,
    };
    let locked = true;

    function clampLat(lat) {
      return Math.max(-80, Math.min(84, lat));
    }

    function latToBand(lat) {
      const letters = "CDEFGHJKLMNPQRSTUVWX";
      const start = -80;
      if (lat < start || lat > 84) return "";
      const index = Math.floor((lat - start) / 8);
      return letters[index] || "";
    }

    function formatLon(lon) {
      const dir = lon >= 0 ? "E" : "W";
      return `${Math.abs(lon).toFixed(1)}°${dir}`;
    }

    function formatLat(lat) {
      const dir = lat >= 0 ? "N" : "S";
      return `${Math.abs(lat).toFixed(1)}°${dir}`;
    }

    function updateOverlay() {
      if (zoneLabel) {
        const band = latToBand(selectedState.lat);
        zoneLabel.textContent = band ? `${selectedState.zone}${band}` : `${selectedState.zone}`;
        const pill = zoneLabel.closest(".utm-pill");
        if (pill) {
          pill.classList.toggle("utm-pill--unlocked", !locked);
        }
      }
      if (lonLabel) {
        lonLabel.textContent = formatLon(selectedState.centerLon);
      }
      if (latLabel) {
        latLabel.textContent = formatLat(selectedState.lat);
      }
      if (hoverLabel) {
        if (hoverState.zone) {
          const band = latToBand(hoverState.lat);
          hoverLabel.textContent = band ? `${hoverState.zone}${band}` : `${hoverState.zone}`;
        } else {
          hoverLabel.textContent = "–";
        }
      }
    }

    function draw() {
      const isDark = rootEl.getAttribute("data-theme") !== "light";
      ctx.save();
      ctx.clearRect(0, 0, widthCSS, heightCSS);

      const bg = ctx.createLinearGradient(0, 0, 0, heightCSS);
      if (isDark) {
        bg.addColorStop(0, "#031020");
        bg.addColorStop(1, "#06172b");
      } else {
        bg.addColorStop(0, "#e5f4ff");
        bg.addColorStop(1, "#cde4ff");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, widthCSS, heightCSS);

      ctx.save();
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = isDark ? "#071a2d" : "#d7ecff";
      ctx.fill();
      ctx.clip();

      zoneDefs.forEach((def) => {
        ctx.beginPath();
        path({ type: "Polygon", coordinates: [def.polygon] });
        const isSelected = def.zone === selectedState.zone;
        const isHover = def.zone === hoverState.zone;
        const isTurkeyZone = def.zone >= 35 && def.zone <= 37;
        let fillStyle;
        if (isSelected && locked) {
          fillStyle = isDark ? "rgba(250,204,21,0.28)" : "rgba(250,204,21,0.32)";
        } else if (isHover) {
          fillStyle = isDark ? "rgba(34,211,238,0.2)" : "rgba(14,165,233,0.26)";
        } else if (isTurkeyZone) {
          fillStyle = isDark ? "rgba(59,130,246,0.18)" : "rgba(37,99,235,0.22)";
        } else {
          fillStyle = def.zone % 2 === 0 ? "rgba(12,32,56,0.32)" : "rgba(8,23,42,0.26)";
          if (!isDark) {
            fillStyle = def.zone % 2 === 0 ? "rgba(148,181,216,0.28)" : "rgba(186,214,246,0.26)";
          }
        }
        ctx.fillStyle = fillStyle;
        ctx.fill();
      });

      ctx.beginPath();
      path(turkeyBand);
      ctx.fillStyle = isDark ? "rgba(59,130,246,0.16)" : "rgba(59,130,246,0.2)";
      ctx.fill();

      landBlobs.forEach((feature) => {
        ctx.beginPath();
        path(feature);
        ctx.fillStyle = isDark ? "rgba(125,190,255,0.22)" : "rgba(59,130,246,0.18)";
        ctx.strokeStyle = isDark ? "rgba(148,197,255,0.38)" : "rgba(37,99,235,0.32)";
        ctx.lineWidth = 1.1;
        ctx.lineJoin = "round";
        ctx.fill();
        ctx.stroke();
      });

      ctx.beginPath();
      path(turkeyOutline);
      ctx.fillStyle = isDark ? "rgba(56,189,248,0.32)" : "rgba(37,99,235,0.32)";
      ctx.strokeStyle = isDark ? "rgba(56,189,248,0.85)" : "rgba(37,99,235,0.78)";
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      path(graticule());
      ctx.strokeStyle = isDark ? "rgba(148,163,184,0.24)" : "rgba(96,118,148,0.26)";
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();

      ctx.save();
      ctx.strokeStyle = isDark ? "rgba(226,232,240,0.18)" : "rgba(71,85,105,0.25)";
      ctx.lineWidth = 1;
      zoneDefs.forEach((def) => {
        ctx.beginPath();
        path({ type: "LineString", coordinates: [
          [def.west, -80],
          [def.west, 84],
        ] });
        ctx.stroke();
      });
      ctx.restore();

      if (hoverState.zone) {
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "rgba(34,211,238,0.75)";
        ctx.lineWidth = 1.4;
        const hoverCenter = zoneDefs[hoverState.zone - 1]?.center ?? hoverState.centerLon;
        ctx.beginPath();
        path({ type: "LineString", coordinates: [
          [hoverCenter, -80],
          [hoverCenter, 84],
        ] });
        ctx.stroke();
        ctx.restore();
      }

      if (locked && selectedState.zone) {
        ctx.save();
        ctx.strokeStyle = "rgba(250,204,21,0.88)";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        path({ type: "LineString", coordinates: [
          [selectedState.centerLon, -80],
          [selectedState.centerLon, 84],
        ] });
        ctx.stroke();
        ctx.restore();
      }

      const hoverPoint = hoverState.zone
        ? projection([
            hoverState.centerLon ?? 0,
            clampLat(hoverState.lat ?? 0),
          ])
        : null;
      if (hoverPoint) {
        ctx.save();
        ctx.fillStyle = "rgba(34,211,238,0.9)";
        ctx.beginPath();
        ctx.arc(hoverPoint[0], hoverPoint[1], 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (locked) {
        const selectedPoint = projection([
          selectedState.centerLon,
          clampLat(selectedState.lat),
        ]);
        if (selectedPoint) {
          ctx.save();
          ctx.fillStyle = "rgba(250,204,21,0.92)";
          ctx.beginPath();
          ctx.arc(selectedPoint[0], selectedPoint[1], 4.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = "rgba(30,64,175,0.45)";
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.restore();
    }

    function pointerToLonLat(evt) {
      const rect = canvas.getBoundingClientRect();
      const x = evt.clientX - rect.left;
      const y = evt.clientY - rect.top;
      return projection.invert([x, y]);
    }

    function updateHoverFromPointer(lon, lat) {
      const zone = Math.max(1, Math.min(60, Math.floor((lon + 180) / 6) + 1));
      const def = zoneDefs[zone - 1];
      hoverState.zone = zone;
      hoverState.centerLon = def.center;
      hoverState.lat = clampLat(lat);
    }

    canvas.addEventListener("mousemove", (evt) => {
      const coords = pointerToLonLat(evt);
      if (!coords) {
        hoverState.zone = null;
        hoverState.centerLon = null;
        hoverState.lat = null;
      } else {
        updateHoverFromPointer(coords[0], coords[1]);
        if (!locked) {
          selectedState.zone = hoverState.zone;
          selectedState.centerLon = hoverState.centerLon;
          selectedState.lat = hoverState.lat;
        }
      }
      updateOverlay();
      draw();
    });

    canvas.addEventListener("mouseleave", () => {
      hoverState.zone = null;
      hoverState.centerLon = null;
      hoverState.lat = null;
      updateOverlay();
      draw();
    });

    canvas.addEventListener("click", () => {
      if (!hoverState.zone) return;
      if (locked && hoverState.zone === selectedState.zone) {
        locked = false;
      } else {
        locked = true;
        selectedState.zone = hoverState.zone;
        selectedState.centerLon = hoverState.centerLon;
        selectedState.lat = hoverState.lat;
      }
      updateOverlay();
      draw();
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      widthCSS = rect.width || 640;
      heightCSS = Math.max(280, Math.min(380, widthCSS * 0.55));
      dpi = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(widthCSS * dpi);
      canvas.height = Math.floor(heightCSS * dpi);
      canvas.style.width = `${widthCSS}px`;
      canvas.style.height = `${heightCSS}px`;
      ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
      projection.fitExtent(
        [
          [36, 28],
          [widthCSS - 36, heightCSS - 32],
        ],
        { type: "Sphere" }
      );
      path = P3.geoPath(projection, ctx);
      draw();
    }

    const observer = new MutationObserver(draw);
    observer.observe(rootEl, { attributes: true, attributeFilter: ["data-theme"] });

    window.addEventListener("resize", () => {
      resize();
    });

    resize();
    updateOverlay();
  })();

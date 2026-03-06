function clickPlot(index) {
    if(typeof gardenPlots === 'undefined') return;
    let p = gardenPlots[index];
    let safeRes = isNaN(currentResources) ? 0 : currentResources;
    if (p.state === 0 && safeRes >= 5000) {
        currentResources = safeRes - 5000; p.state = 1; p.readyTime = Date.now() + 60000; 
        playSound('buy'); updateGardenUI();
    } else if (p.state === 2) {
        p.state = 0; gardenBuffTimer += 120; 
        playSound('achieve'); createExplosion(window.innerWidth/2, window.innerHeight/2, "JARDIN +100% PROD");
        recalculateProduction(); updateGardenUI();
    } else if (p.state === 0) { alert("Pas assez de ressources (Coût: 5000)"); }
}
function generateGarden() {
    const container = document.getElementById('garden-container');
    if(!container || typeof gardenPlots === 'undefined') return;
    let html = "";
    gardenPlots.forEach((p, i) => { html += `<div class="garden-plot" id="plot-${i}" onclick="clickPlot(${i})"></div>`; });
    container.innerHTML = html; updateGardenUI();
}
function updateGardenUI() {
    if(typeof gardenPlots === 'undefined') return;
    let hasReadyGarden = false;
    gardenPlots.forEach((p, i) => {
        let plot = document.getElementById(`plot-${i}`); if(!plot) return;
        if(p.state === 0) { plot.innerHTML = `<span style="color:var(--text-muted); font-size:1rem; font-family:'Luckiest Guy', cursive;">Planter<br>(5000 res)</span>`; } 
        else if (p.state === 1) { let rem = (p.readyTime - Date.now()) / 1000; if(rem <= 0) { p.state = 2; hasReadyGarden = true; updateGardenUI(); return; } plot.innerHTML = `<div class="garden-icon">🌱</div><div class="garden-timer">${Math.ceil(rem)}s</div>`; } 
        else if (p.state === 2) { hasReadyGarden = true; plot.innerHTML = `<div class="garden-icon">🌻</div><div class="garden-timer" style="background:var(--accent-green); color:var(--bg-dark);">Récolter !</div>`; }
    });
    let badge = document.getElementById('badge-garden'); if (badge) badge.style.display = hasReadyGarden ? "flex" : "none";
    let buffUI = document.getElementById('garden-buff-ui');
    if(buffUI) { if(typeof gardenBuffTimer !== 'undefined' && gardenBuffTimer > 0) { buffUI.style.display = "block"; document.getElementById('garden-buff-time').innerText = Math.ceil(gardenBuffTimer); } else { buffUI.style.display = "none"; } }
}
function processGardenTick(deltaTime) {
    if (typeof gardenBuffTimer !== 'undefined' && gardenBuffTimer > 0) { 
        gardenBuffTimer -= deltaTime; 
        if (gardenBuffTimer <= 0) { gardenBuffTimer = 0; recalculateProduction(); updateGardenUI(); } 
    }
}
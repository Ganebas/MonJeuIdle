function buyStock(index) { if(typeof stocks === 'undefined') return; let s = stocks[index]; let safeRes = isNaN(currentResources) ? 0 : currentResources; if(safeRes >= s.price) { playSound('click'); let safeCost = isNaN(s.avgCost) ? 0 : s.avgCost; let safeShares = isNaN(s.shares) ? 0 : s.shares; let totalC = (safeShares * safeCost) + s.price; s.shares = safeShares + 1; s.avgCost = totalC / s.shares; currentResources -= s.price; generateMarket(); } }
function sellStock(index) { if(typeof stocks === 'undefined') return; let s = stocks[index]; let safeShares = isNaN(s.shares) ? 0 : s.shares; if(safeShares > 0) { playSound('buy'); currentResources += s.price; s.shares = safeShares - 1; if(s.shares <= 0) s.avgCost = 0; generateMarket(); checkAchievements(); } }
function updateMarketLoop() {
    if(typeof stocks === 'undefined') return;
    stocks.forEach(s => { 
        if (s.price > s.basePrice * 3) s.trend -= 0.05; if (s.price < s.basePrice / 3) s.trend += 0.05;
        let finalVol = s.vol;
        if(typeof currentFaction !== 'undefined' && currentFaction === 1) finalVol *= 2; 
        s.trend += (Math.random() - 0.5) * finalVol; s.trend = Math.max(-0.2, Math.min(0.2, s.trend)); s.price = Math.max(s.basePrice * 0.1, s.price * (1 + s.trend + (Math.random()-0.5)*0.05)); 
        if(!Array.isArray(s.history)) s.history = Array(20).fill(s.basePrice);
        s.history.shift(); s.history.push(s.price);
    });
    let tm = document.getElementById('tab-market'); if(tm && tm.classList.contains('active')) generateMarket();
}
function generateMarket() {
    const container = document.getElementById('market-container'); 
    if(!container || typeof stocks === 'undefined') return;
    let html = "";
    stocks.forEach((s, i) => {
        let colorClass = s.trend >= 0 ? 'up' : 'down'; let arrow = s.trend >= 0 ? '▲' : '▼';
        let safeHistory = Array.isArray(s.history) && s.history.length > 0 ? s.history : [50];
        let maxH = Math.max(...safeHistory); let minH = Math.min(...safeHistory);
        let range = maxH - minH || 1;
        let graphHtml = safeHistory.map(val => { let pct = ((val - minH) / range) * 100; return `<div class="graph-bar" style="height: ${Math.max(5, isNaN(pct) ? 5 : pct)}%; background: ${s.trend >= 0 ? '#37eb27' : '#f34b22'};"></div>`; }).join('');
        let profitHtml = ""; let safeShares = isNaN(s.shares) ? 0 : s.shares;
        if(safeShares > 0) { let safeCost = isNaN(s.avgCost) || s.avgCost === 0 ? 1 : s.avgCost; let profitPct = ((s.price - safeCost) / safeCost) * 100; let pColor = profitPct >= 0 ? '#37eb27' : '#f34b22'; profitHtml = `<div style="color:${pColor}; font-size:0.9rem; font-weight:bold; margin-top:5px;">Moyenne: ${formatNumber(safeCost)} (${profitPct > 0 ? '+':''}${isNaN(profitPct) ? 0 : profitPct.toFixed(1)}%)</div>`; }
        html += `<div class="metamorphose-card"><div style="flex:1;"><div class="card-title">${s.name}</div><div style="font-size:1.5rem; font-weight:bold; color:${s.trend >= 0 ? '#37eb27' : '#f34b22'}">${formatNumber(s.price)} ${arrow}</div><div style="color:var(--text-muted); font-size:1rem;">Possédées: ${safeShares}</div>${profitHtml}</div><div class="stock-graph" style="flex:1; height:60px; display:flex; align-items:flex-end; gap:2px; border-bottom:1px solid var(--border-main);">${graphHtml}</div><div style="flex:0; display:flex; flex-direction:column; gap:5px; margin-left:15px;"><button class="metamorphose-buy-btn" style="background:var(--accent-green); color:var(--bg-dark); font-size:1rem; padding:10px;" onclick="buyStock(${i})">Acheter</button> <button class="metamorphose-buy-btn" style="background:var(--accent-red); color:white; font-size:1rem; padding:10px; border-color:#c23616; box-shadow:0 6px 0 #8c2610;" onclick="sellStock(${i})">Vendre</button></div></div>`;
    });
    container.innerHTML = html;
}
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function toggleMute() { 
    isMuted = !isMuted; let btn = document.getElementById('btn-mute'); 
    if (isMuted) { btn.innerText = "🔇 Son: OFF"; btn.style.background = "#c0392b"; btn.style.borderColor = "#e74c3c"; } 
    else { btn.innerText = "🔊 Son: ON"; btn.style.background = "#8e44ad"; btn.style.borderColor = "#9b59b6"; } 
    if(typeof saveGame === 'function') saveGame(); 
}

function playSound(type) {
    if (isMuted) return; if (audioCtx.state === 'suspended') audioCtx.resume();
    try {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination);
        if (type === 'click') { osc.type = 'sine'; osc.frequency.setValueAtTime(600, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05); gain.gain.setValueAtTime(0.05, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05); osc.start(); osc.stop(audioCtx.currentTime + 0.05); } 
        else if (type === 'buy') { osc.type = 'square'; osc.frequency.setValueAtTime(400, audioCtx.currentTime); osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1); gain.gain.setValueAtTime(0.02, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2); osc.start(); osc.stop(audioCtx.currentTime + 0.2); } 
        else if (type === 'achieve' || type === 'golden') { osc.type = 'triangle'; osc.frequency.setValueAtTime(400, audioCtx.currentTime); osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1); osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.2); gain.gain.setValueAtTime(0.05, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5); osc.start(); osc.stop(audioCtx.currentTime + 0.5); }
        else if (type === 'bad') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.5); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5); osc.start(); osc.stop(audioCtx.currentTime + 0.5); }
    } catch(e) {} 
}

/* === MÉCANIQUES DE BASE === */
function doManualClick(e) {
    playSound('click'); currentResources += dynamicClickValue; lifetimeResources += dynamicClickValue; totalClicks++; 
    if(typeof missions !== 'undefined' && missions[0]) missions[0].progress++; 
    let x = e ? e.clientX : window.innerWidth * 0.25; let y = e ? e.clientY : window.innerHeight * 0.5;
    if(typeof createExplosion === 'function') createExplosion(x, y, "+" + formatNumber(dynamicClickValue)); 
    if(typeof checkAchievements === 'function') checkAchievements();
}

function setBuyMultiplier(val) { buyMultiplier = val; document.querySelectorAll('.multi-btn').forEach(btn => btn.classList.remove('active')); let id = val === "MAX" ? "max" : val; let domBtn = document.getElementById(`btn-buy-${id}`); if(domBtn) domBtn.classList.add('active'); if(typeof updateUI === 'function') updateUI(); }

function buyBuilding(i) {
    if(typeof buildings === 'undefined') return;
    let b = buildings[i]; let details = getPurchaseDetails(b); let safeRes = isNaN(currentResources) ? 0 : currentResources;
    if (safeRes >= details.cost && details.amount > 0) { 
        playSound('buy'); currentResources -= details.cost; b.owned += details.amount; 
        if (b.id === "galaxy" && !hasWon) { if(typeof triggerVictory === 'function') triggerVictory(); return; }
        if(typeof missions !== 'undefined' && missions[1]) missions[1].progress += details.amount; 
        if(typeof recalculateProduction === 'function') recalculateProduction(); 
        if(typeof drawVisualEmpire === 'function') drawVisualEmpire(); 
        if(typeof checkAchievements === 'function') checkAchievements(); 
        if(typeof generateUpgrades === 'function') generateUpgrades(); 
    }
}
function upgradeMastery(i) { if(typeof buildings === 'undefined') return; let b = buildings[i]; let safeLevel = isNaN(b.level) ? 1 : b.level; let cost = safeLevel * 2; if(gems >= cost) { playSound('achieve'); gems -= cost; b.level = safeLevel + 1; if(typeof createExplosion === 'function') createExplosion(window.innerWidth * 0.75, window.innerHeight * 0.5, "⭐ MAÎTRISE Lvl " + b.level); if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof updateUI === 'function') updateUI(); if(typeof generateStore === 'function') generateStore(); } else { playSound('bad'); if(typeof showNotification === 'function') showNotification("Erreur", "Pas assez de gemmes !"); } }
function buyUpgrade(i) { if(typeof upgrades === 'undefined') return; let u = upgrades[i]; let safeRes = isNaN(currentResources) ? 0 : currentResources; if (!u.isPurchased && safeRes >= u.cost) { playSound('buy'); currentResources -= u.cost; u.isPurchased = true; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof generateUpgrades === 'function') generateUpgrades(); } }

function buyAllUpgrades() {
    if(typeof upgrades === 'undefined') return;
    let boughtAny = false;
    upgrades.forEach(u => {
        if(!u.isPurchased && currentResources >= u.cost) {
            let reqB = buildings.find(b => b.id === u.reqBuilding); 
            if (reqB && (reqB.owned || 0) >= u.reqCount) { currentResources -= u.cost; u.isPurchased = true; boughtAny = true; }
        }
    });
    if(boughtAny) { playSound('buy'); if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof generateUpgrades === 'function') generateUpgrades(); if(typeof updateUI === 'function') updateUI(); }
}

function buySkill(i) { if(typeof prestigeSkills === 'undefined') return; let skill = prestigeSkills[i]; if (skill.purchased) return; let unspentPoints = prestigePoints - prestigeSkills.reduce((sum, s) => s.purchased ? sum + s.cost : sum, 0); if (unspentPoints >= skill.cost) { playSound('achieve'); skill.purchased = true; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof generateSkills === 'function') generateSkills(); if(typeof generateStore === 'function') generateStore(); } }
function respecSkills() { if(confirm("Voulez-vous réinitialiser votre Arbre de Compétences ?")) { prestigeSkills.forEach(s => s.purchased = false); playSound('achieve'); if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof generateSkills === 'function') generateSkills(); if(typeof generateStore === 'function') generateStore(); if(typeof updateUI === 'function') updateUI(); } }
function joinFaction(fid) { currentFaction = fid; playSound('golden'); if(typeof showNotification === 'function') showNotification("Faction Rejointe", "Vos bonus sont appliqués !"); if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof updateUI === 'function') updateUI(); if(typeof generateStore === 'function') generateStore(); if(typeof generateManagers === 'function') generateManagers(); }

function doPrestige() { let p = getPendingPrestigePoints(); if (p <= 0) return; if(confirm(`Ascension ? Vous gagnez ${p} points de prestige !`)) { prestigePoints += p; currentResources = 0; ascensionCount++; currentFaction = 0; if(typeof buildings !== 'undefined') buildings.forEach(b => { b.owned = 0; b.level = 1; }); if(typeof upgrades !== 'undefined') upgrades.forEach(u => u.isPurchased = false); if(typeof prestigeSkills !== 'undefined') { let startSkill = prestigeSkills.find(s => s.id === "skill_start"); if (startSkill && startSkill.purchased) currentResources = 1000; } gardenBuffTimer = 0; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof generateStore === 'function') generateStore(); if(typeof generateUpgrades === 'function') generateUpgrades(); if(typeof generateSkills === 'function') generateSkills(); if(typeof drawVisualEmpire === 'function') drawVisualEmpire(); if(typeof saveGame === 'function') saveGame(); alert("Ascension réussie !"); } }
function doTranscend() {
    if(lifetimeResources < 1e15) { alert("Vous avez besoin d'au moins 1 Qa (1 Quintillion) de ressources à vie pour transcender !"); return; }
    if(confirm("ATTENTION ! LE TROU NOIR VA TOUT ABSORBER. Êtes-vous prêt pour le voyage cosmique ?")) {
        let dmGain = Math.floor(Math.pow(lifetimeResources / 1e15, 0.5)); if(dmGain < 1) dmGain = 1;
        document.getElementById('dm-gained').innerText = formatNumber(dmGain); document.getElementById('blackhole-modal').classList.remove('hidden'); playSound('golden');
        darkMatter += dmGain; transcendCount++; currentResources = 0; lifetimeResources = 0; prestigePoints = 0; totalClicks = 0; goldenClicks = 0; gems = 0; currentFaction = 0; towerFloor = 1; bossMaxHP = 1000; bossHP = 1000; bossTimer = typeof bossTimerMax !== 'undefined' ? bossTimerMax : 30;
        if(typeof buildings !== 'undefined') buildings.forEach(b => { b.owned = 0; b.level = 1; }); if(typeof upgrades !== 'undefined') upgrades.forEach(u => u.isPurchased = false); if(typeof prestigeSkills !== 'undefined') prestigeSkills.forEach(s => s.purchased = false); if(typeof managers !== 'undefined') managers.forEach(m => m.purchased = false); if(typeof stocks !== 'undefined') stocks.forEach(s => { s.shares = 0; s.avgCost = 0; s.price = s.basePrice; });
        if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof generateStore === 'function') generateStore(); if(typeof generateUpgrades === 'function') generateUpgrades(); if(typeof generateSkills === 'function') generateSkills(); if(typeof generateManagers === 'function') generateManagers(); if(typeof generateDarkMatter === 'function') generateDarkMatter(); if(typeof drawVisualEmpire === 'function') drawVisualEmpire(); if(typeof saveGame === 'function') saveGame();
    }
}
function buyDarkUpgrade(i) { if(typeof darkUpgrades === 'undefined') return; let u = darkUpgrades[i]; if(darkMatter >= u.cost && !u.purchased) { playSound('achieve'); darkMatter -= u.cost; u.purchased = true; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof generateDarkMatter === 'function') generateDarkMatter(); if(typeof updateUI === 'function') updateUI(); } else { playSound('bad'); } }

/* === ARTEFACTS === */
function tryDropArtefact(force = false) { if(typeof artefacts === 'undefined') return; if(force || Math.random() < 0.25) { let unowned = artefacts.filter(a => !a.owned); if(unowned.length > 0) { let drop = unowned[Math.floor(Math.random() * unowned.length)]; drop.owned = true; playSound('golden'); if(typeof showNotification === 'function') showNotification("NOUVEL ARTEFACT !", drop.name); let ti = document.getElementById('tab-inventory'); if(ti && ti.classList.contains('active') && typeof generateInventory === 'function') generateInventory(); if(typeof checkAchievements === 'function') checkAchievements(); } else if (force) { if(typeof showNotification === 'function') showNotification("INVENTAIRE", "Tous les artefacts obtenus !"); } } }
function equipArtefact(id) { if(typeof equippedSlots === 'undefined' || typeof artefacts === 'undefined') return; let emptyIndex = equippedSlots.indexOf(null); if(emptyIndex !== -1) { equippedSlots[emptyIndex] = id; artefacts.find(a => a.id === id).equipped = true; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof generateInventory === 'function') generateInventory(); if(typeof generateStore === 'function') generateStore(); } else { alert("Déséquipez un artefact d'abord."); } }
function unequipArtefact(index) { if(typeof equippedSlots === 'undefined' || typeof artefacts === 'undefined') return; if(equippedSlots[index] !== null) { artefacts.find(a => a.id === equippedSlots[index]).equipped = false; equippedSlots[index] = null; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof generateInventory === 'function') generateInventory(); if(typeof generateStore === 'function') generateStore(); } }

/* === EVENEMENTS ALEATOIRES === */
function changeWeather() { if(hasWon || typeof weathers === 'undefined') return; currentWeatherIndex = Math.floor(Math.random() * weathers.length); let w = weathers[currentWeatherIndex]; playSound('achieve'); if(typeof showNotification === 'function') showNotification("MÉTÉO", "Le temps change : " + w.name); let wi = document.getElementById('weather-icon'); if(wi) wi.innerText = w.icon; let wn = document.getElementById('weather-name'); if(wn) { wn.innerText = w.name; wn.style.color = w.color; } let wd = document.getElementById('weather-desc'); if(wd) wd.innerText = w.desc; if(typeof recalculateProduction === 'function') recalculateProduction(); }
const redEventElement = document.getElementById('red-event'); let redEventActive = false;
function spawnRedEvent() { if (redEventActive || hasWon) return; redEventActive = true; let zc = document.getElementById('zone-centre'); if(!zc) return; redEventElement.style.left = Math.max(20, Math.random() * (zc.clientWidth - 80)) + 'px'; redEventElement.style.top = Math.max(20, Math.random() * (zc.clientHeight - 80)) + 'px'; redEventElement.style.display = 'block'; playSound('bad'); setTimeout(() => { if (redEventActive) { redEventElement.style.display = 'none'; redEventActive = false; let safeRes = isNaN(currentResources) ? 0 : currentResources; let loss = safeRes * 0.05; currentResources = safeRes - loss; playSound('bad'); if(typeof createExplosion === 'function') createExplosion(window.innerWidth/2, window.innerHeight/2, "- " + formatNumber(loss) + " (Volé!)"); let nt = document.getElementById('news-text'); if(nt) nt.innerText = "Flash Info : Un voleur a frappé !"; scheduleEvents(); } }, 4000); }
function clickRedEvent(e) { redEventElement.style.display = 'none'; redEventActive = false; playSound('achieve'); if(typeof createExplosion === 'function') createExplosion(e.clientX, e.clientY, "Défense Réussie !"); if(typeof achievements !== 'undefined') { let defAch = achievements.find(a => a.id === "ach4"); if(defAch && !defAch.unlocked) { defAch.unlocked = true; if(typeof showNotification === 'function') showNotification(defAch.name, "+1% Prod"); if(typeof renderAchievements === 'function') renderAchievements(); if(typeof recalculateProduction === 'function') recalculateProduction(); } } if(typeof tryDropArtefact === 'function') tryDropArtefact(); scheduleEvents(); }
const goldenBonusElement = document.getElementById('golden-bonus'); let goldenBonusActive = false;
function spawnGoldenBonus() { if (goldenBonusActive || hasWon) return; goldenBonusActive = true; let zc = document.getElementById('zone-centre'); if(!zc) return; goldenBonusElement.style.left = Math.max(20, Math.random() * (zc.clientWidth - 80)) + 'px'; goldenBonusElement.style.top = Math.max(20, Math.random() * (zc.clientHeight - 80)) + 'px'; goldenBonusElement.style.display = 'block'; playSound('achieve'); setTimeout(() => { if (goldenBonusActive) { goldenBonusElement.style.display = 'none'; goldenBonusActive = false; scheduleEvents(); } }, 5000); }
function collectGoldenBonus(e) { goldenBonusElement.style.display = 'none'; goldenBonusActive = false; goldenClicks++; playSound('golden'); if(typeof missions !== 'undefined' && missions[2]) missions[2].progress++; let durationMultiplier = 5; if(typeof prestigeSkills !== 'undefined') { let goldenSkill = prestigeSkills.find(s => s.id === "skill_golden"); if(goldenSkill && goldenSkill.purchased) durationMultiplier = 10; } if(typeof artefacts !== 'undefined') { let luckArt = artefacts.find(a => a.id === "art_luck"); if (luckArt && luckArt.equipped) durationMultiplier *= luckArt.val; } let bonusGains = Math.max(500, totalProductionPerSecond * 60 * durationMultiplier); currentResources += bonusGains; lifetimeResources += bonusGains; if(typeof createExplosion === 'function') createExplosion(e.clientX, e.clientY, "+" + formatNumber(bonusGains) + " !!!"); if(typeof checkAchievements === 'function') checkAchievements(); scheduleEvents(); }
function scheduleEvents() { setTimeout(() => { if(Math.random() > 0.7) spawnRedEvent(); else spawnGoldenBonus(); }, 20000 + Math.random() * 20000); }
function updateNewsTicker() { const newsEl = document.getElementById('news-text'); if(!newsEl) return; newsEl.style.opacity = 0; setTimeout(() => { if(typeof newsMessages !== 'undefined') { let randomNews = newsMessages[Math.floor(Math.random() * newsMessages.length)]; newsEl.innerText = "Flash Info : " + randomNews; } newsEl.style.opacity = 1; }, 500); }

/* === AUTRES FONCTIONS VITALES === */
function claimMission(index) { 
    try {
        if(typeof missions === 'undefined') return; 
        let m = missions[index]; 
        if (m.progress >= m.target) { 
            playSound('achieve'); 
            
            let safeGems = isNaN(gems) ? 0 : Number(gems); 
            let gemGain = isNaN(m.reward) ? 1 : Number(m.reward); 
            if(typeof darkUpgrades !== 'undefined' && darkUpgrades[2] && darkUpgrades[2].purchased) gemGain *= 2; 
            
            gems = safeGems + gemGain; 
            m.progress = 0; 
            m.level = (isNaN(m.level) ? 1 : Number(m.level)) + 1; 
            m.target = Math.floor((isNaN(m.target) ? 100 : Number(m.target)) * 1.5); 
            m.reward = Math.floor((isNaN(m.reward) ? 1 : Number(m.reward)) + 1); 
            
            // Animation sur le bouton pour confirmer que l'action a eu lieu
            let btn = document.getElementById(`mission-btn-${index}`);
            if (btn && typeof createExplosion === 'function') {
                let rect = btn.getBoundingClientRect();
                createExplosion(rect.left + rect.width/2, rect.top, "+" + gemGain + " 💎");
            }
            
            if(typeof updateUI === 'function') updateUI(); 
            if(typeof checkAchievements === 'function') checkAchievements(); 
        } 
    } catch(e) { console.error("Erreur claimMission:", e); }
}

function buyTimeWarp() { let safeGems = isNaN(gems) ? 0 : gems; if (safeGems >= 5) { playSound('golden'); gems = safeGems - 5; let warpGains = totalProductionPerSecond * 3600; currentResources += warpGains; lifetimeResources += warpGains; if(typeof createExplosion === 'function') createExplosion(window.innerWidth/2, window.innerHeight/2, "SAUT TEMPOREL !"); if(typeof updateUI === 'function') updateUI(); } else { alert("Pas assez de Gemmes !"); } }
function triggerVictory() { hasWon = true; playSound('golden'); let vs = document.getElementById('victory-stats'); if(vs) vs.innerHTML = `Temps de jeu : ${formatTimeLabel(timePlayedSeconds)}<br>Clics Totaux : ${formatNumber(totalClicks)}<br>Ascensions : ${ascensionCount}`; let vm = document.getElementById('victory-modal'); if(vm) vm.classList.remove('hidden'); }
function checkAchievements() { if(typeof achievements === 'undefined') return; let newlyUnlocked = false; achievements.forEach(ach => { if (!ach.unlocked && ach.condition()) { ach.unlocked = true; newlyUnlocked = true; playSound('achieve'); if(typeof showNotification === 'function') showNotification(ach.name, "+1% Prod Globale"); } }); if (newlyUnlocked) { if(typeof renderAchievements === 'function') renderAchievements(); if(typeof recalculateProduction === 'function') recalculateProduction(); } }

function hireManager(index) { if(typeof managers === 'undefined') return; let m = managers[index]; let canAfford = false; let safeRes = isNaN(currentResources) ? 0 : currentResources; let safeGems = isNaN(gems) ? 0 : gems; let mCost = m.cost; if(typeof currentFaction !== 'undefined' && currentFaction === 3 && m.currency === "res") mCost /= 2; if(m.currency === "res" && safeRes >= mCost) { currentResources = safeRes - mCost; canAfford = true; } if(m.currency === "gem" && safeGems >= mCost) { gems = safeGems - mCost; canAfford = true; } if(canAfford) { playSound('achieve'); m.purchased = true; if(typeof updateUI === 'function') updateUI(); if(typeof generateManagers === 'function') generateManagers(); } }

function managerAutoBuy() {
    if(typeof managers === 'undefined' || typeof buildings === 'undefined') return;
    let mCursor = managers.find(m => m.id === "mgr_cursor"); if (mCursor && mCursor.purchased) { let b = buildings.find(x => x.id === "cursor"); if(b) { let d = getPurchaseDetails(b); let safeRes = isNaN(currentResources) ? 0 : currentResources; if(safeRes >= d.cost && d.amount > 0) { currentResources=safeRes-d.cost; b.owned+=d.amount; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof drawVisualEmpire === 'function') drawVisualEmpire(); } } }
    let mFarm = managers.find(m => m.id === "mgr_farm"); if (mFarm && mFarm.purchased) { let b = buildings.find(x => x.id === "farm"); if(b) { let d = getPurchaseDetails(b); let safeRes = isNaN(currentResources) ? 0 : currentResources; if(safeRes >= d.cost && d.amount > 0) { currentResources=safeRes-d.cost; b.owned+=d.amount; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof drawVisualEmpire === 'function') drawVisualEmpire(); } } }
    let mMine = managers.find(m => m.id === "mgr_mine"); if (mMine && mMine.purchased) { let b = buildings.find(x => x.id === "mine"); if(b) { let d = getPurchaseDetails(b); let safeRes = isNaN(currentResources) ? 0 : currentResources; if(safeRes >= d.cost && d.amount > 0) { currentResources=safeRes-d.cost; b.owned+=d.amount; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof drawVisualEmpire === 'function') drawVisualEmpire(); } } }
    let mBank = managers.find(m => m.id === "mgr_bank"); if (mBank && mBank.purchased) { let b = buildings.find(x => x.id === "bank"); if(b) { let d = getPurchaseDetails(b); let safeRes = isNaN(currentResources) ? 0 : currentResources; if(safeRes >= d.cost && d.amount > 0) { currentResources=safeRes-d.cost; b.owned+=d.amount; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof drawVisualEmpire === 'function') drawVisualEmpire(); } } }
    let mGold = managers.find(m => m.id === "mgr_gold"); if (mGold && mGold.purchased && typeof goldenBonusActive !== 'undefined' && goldenBonusActive) { collectGoldenBonus({clientX: window.innerWidth/2, clientY: window.innerHeight/2}); }
}
setInterval(managerAutoBuy, 1000); 

/* === MODULE BOURSE === */
function buyStock(index) { if(typeof stocks === 'undefined') return; let s = stocks[index]; let safeRes = isNaN(currentResources) ? 0 : currentResources; if(safeRes >= s.price) { playSound('click'); let safeCost = isNaN(s.avgCost) ? 0 : s.avgCost; let safeShares = isNaN(s.shares) ? 0 : s.shares; let totalC = (safeShares * safeCost) + s.price; s.shares = safeShares + 1; s.avgCost = totalC / s.shares; currentResources -= s.price; if(typeof generateMarket === 'function') generateMarket(); } }
function sellStock(index) { if(typeof stocks === 'undefined') return; let s = stocks[index]; let safeShares = isNaN(s.shares) ? 0 : s.shares; if(safeShares > 0) { playSound('buy'); currentResources += s.price; s.shares = safeShares - 1; if(s.shares <= 0) s.avgCost = 0; if(typeof generateMarket === 'function') generateMarket(); if(typeof checkAchievements === 'function') checkAchievements(); } }
function updateMarketLoop() { if(typeof stocks === 'undefined') return; stocks.forEach(s => { if (s.price > s.basePrice * 3) s.trend -= 0.05; if (s.price < s.basePrice / 3) s.trend += 0.05; let finalVol = s.vol; if(typeof currentFaction !== 'undefined' && currentFaction === 1) finalVol *= 2; s.trend += (Math.random() - 0.5) * finalVol; s.trend = Math.max(-0.2, Math.min(0.2, s.trend)); s.price = Math.max(s.basePrice * 0.1, s.price * (1 + s.trend + (Math.random()-0.5)*0.05)); if(!Array.isArray(s.history)) s.history = Array(20).fill(s.basePrice); s.history.shift(); s.history.push(s.price); }); let tm = document.getElementById('tab-market'); if(tm && tm.classList.contains('active') && typeof generateMarket === 'function') generateMarket(); }

/* === MODULE CASINO === */
let isSpinning = false;
function playSlots() { let safeGems = isNaN(gems) ? 0 : gems; if(safeGems < 1 || isSpinning) { if(safeGems < 1) alert("Pas assez de gemmes !"); return; } gems = safeGems - 1; if(typeof updateUI === 'function') updateUI(); isSpinning = true; playSound('buy'); let resDiv = document.getElementById('slot-result'); if(resDiv) { resDiv.innerText = "Ça tourne..."; resDiv.style.color = "var(--text-muted)"; } const symbols = ["🍒", "💎", "💰", "🍀", "☠️"]; let r1 = document.getElementById('reel-1'); let r2 = document.getElementById('reel-2'); let r3 = document.getElementById('reel-3'); if(!r1 || !r2 || !r3) { isSpinning = false; return; } let spins = 0; let spinInterval = setInterval(() => { r1.innerText = symbols[Math.floor(Math.random() * symbols.length)]; r2.innerText = symbols[Math.floor(Math.random() * symbols.length)]; r3.innerText = symbols[Math.floor(Math.random() * symbols.length)]; spins++; if(spins > 20) { clearInterval(spinInterval); evaluateSlots(r1.innerText, r2.innerText, r3.innerText); } }, 50); }
function evaluateSlots(s1, s2, s3) { isSpinning = false; let resText = "Perdu..."; let resColor = "var(--accent-red)"; let safeGems = isNaN(gems) ? 0 : gems; if (s1 === s2 && s2 === s3) { playSound('golden'); resColor = "var(--accent-green)"; if(s1 === "💎") { gems = safeGems + 50; resText = "JACKPOT ! +50 Gemmes"; if(typeof createExplosion === 'function') createExplosion(window.innerWidth/2, window.innerHeight/2, "JACKPOT !"); } else if(s1 === "💰") { let warp = totalProductionPerSecond * 3600; currentResources += warp; lifetimeResources += warp; resText = "L'HEURE D'OR ! +1h Prod"; if(typeof createExplosion === 'function') createExplosion(window.innerWidth/2, window.innerHeight/2, "MEGA PROFIT !"); } else if(s1 === "🍒") { gems = safeGems + 5; if(typeof mysteryEggs !== 'undefined') mysteryEggs++; resText = "Bien joué ! +5 💎 et 1 Œuf 🥚 !"; } else if(s1 === "🍀") { if(typeof tryDropArtefact === 'function') tryDropArtefact(true); resText = "NOUVEL ARTEFACT !"; } else if(s1 === "☠️") { resText = "La Faucheuse... Rien."; resColor = "var(--accent-red)"; playSound('bad'); } } else if (s1 === s2 || s2 === s3 || s1 === s3) { gems = safeGems + 1; resText = "Remboursé (1 Gemme)"; resColor = "var(--highlight-yellow)"; } else { playSound('bad'); } let resDiv = document.getElementById('slot-result'); if(resDiv) { resDiv.innerText = resText; resDiv.style.color = resColor; } if(typeof updateUI === 'function') updateUI(); }

/* === MODULE JARDIN === */
function clickPlot(index) { if(typeof gardenPlots === 'undefined') return; let p = gardenPlots[index]; let safeRes = isNaN(currentResources) ? 0 : currentResources; if (p.state === 0 && safeRes >= 5000) { currentResources = safeRes - 5000; p.state = 1; p.readyTime = Date.now() + 60000; playSound('buy'); if(typeof updateGardenUI === 'function') updateGardenUI(); } else if (p.state === 2) { p.state = 0; gardenBuffTimer += 120; playSound('achieve'); if(typeof createExplosion === 'function') createExplosion(window.innerWidth/2, window.innerHeight/2, "JARDIN +100% PROD"); if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof updateGardenUI === 'function') updateGardenUI(); } else if (p.state === 0) { alert("Pas assez de ressources (Coût: 5000)"); } }
function processGardenTick(deltaTime) { if (typeof gardenBuffTimer !== 'undefined' && gardenBuffTimer > 0) { gardenBuffTimer -= deltaTime; if (gardenBuffTimer <= 0) { gardenBuffTimer = 0; if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof updateGardenUI === 'function') updateGardenUI(); } } }

/* === MODULE ECLOSERIE === */
function startIncubation() { if(typeof mysteryEggs !== 'undefined' && typeof incubator !== 'undefined' && mysteryEggs > 0 && !incubator.active) { mysteryEggs--; incubator.active = true; incubator.readyTime = Date.now() + 300000; playSound('buy'); if(typeof updateUI === 'function') updateUI(); } }
function hatchEgg() { if(typeof incubator !== 'undefined' && typeof pets !== 'undefined' && incubator.active && Date.now() >= incubator.readyTime) { incubator.active = false; let rand = Math.random(); let r = rand < 0.1 ? "Légendaire" : (rand < 0.4 ? "Rare" : "Commun"); let possible = pets.filter(p => p.rarity === r); let unlocked = possible[Math.floor(Math.random() * possible.length)]; playSound('golden'); if(unlocked.owned) { unlocked.level++; unlocked.val = unlocked.baseVal + (unlocked.level - 1) * unlocked.growth; if(typeof showNotification === 'function') showNotification("Évolution !", `Votre ${unlocked.name} est passé Niveau ${unlocked.level} !`); if(typeof createExplosion === 'function') createExplosion(window.innerWidth/2, window.innerHeight/2, "Niveau UP !"); } else { unlocked.owned = true; if(typeof showNotification === 'function') showNotification("Éclosion Gacha !", `Vous avez obtenu : ${unlocked.name} (${unlocked.rarity})`); if(typeof createExplosion === 'function') createExplosion(window.innerWidth/2, window.innerHeight/2, unlocked.icon); } if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof updateUI === 'function') updateUI(); } }
function equipPet(id) { if(typeof equippedPet !== 'undefined') { equippedPet = equippedPet === id ? null : id; playSound('click'); if(typeof recalculateProduction === 'function') recalculateProduction(); if(typeof updateUI === 'function') updateUI(); } }

/* === MODULE EXPEDITIONS === */
function actionExpedition(index) { if(typeof expeditions === 'undefined') return; let exp = expeditions[index]; if(exp.active) { if(Date.now() >= exp.endTime) { exp.active = false; playSound('golden'); let safeGems = isNaN(gems) ? 0 : gems; let gemMult = (typeof darkUpgrades !== 'undefined' && darkUpgrades[2] && darkUpgrades[2].purchased) ? 2 : 1; if(index === 0) { gems = safeGems + (5 * gemMult); if(Math.random()<0.2 && typeof mysteryEggs !== 'undefined') mysteryEggs++; } if(index === 1) { gems = safeGems + (25 * gemMult); if(Math.random()<0.5 && typeof mysteryEggs !== 'undefined') mysteryEggs++; } if(index === 2) { gems = safeGems + (50 * gemMult); if(typeof tryDropArtefact === 'function') tryDropArtefact(true); if(typeof mysteryEggs !== 'undefined') mysteryEggs++; } if(typeof showNotification === 'function') showNotification("Expédition Terminée", "Trésor récupéré !"); if(typeof updateUI === 'function') updateUI(); if(typeof generateExpeditions === 'function') generateExpeditions(); } } else { exp.active = true; exp.startTime = Date.now(); exp.endTime = Date.now() + (exp.durationSec * 1000); playSound('buy'); if(typeof updateUI === 'function') updateUI(); if(typeof generateExpeditions === 'function') generateExpeditions(); } }

/* === MODULE TOUR DE COMBAT === */
function processTowerCombat(deltaTime, gen) { if (typeof bossHP === 'undefined' || typeof bossTimer === 'undefined') return; let dmgMult = 1; if(typeof equippedPet !== 'undefined' && equippedPet !== null && typeof pets !== 'undefined') { let actPet = pets.find(p => p.id === equippedPet); if(actPet && actPet.type === "tower") dmgMult = actPet.val; } if (typeof mgLevel !== 'undefined' && mgLevel >= 20) dmgMult *= 2; bossHP -= (gen * dmgMult); bossTimer -= deltaTime; if(bossHP <= 0) { towerFloor++; let isEpic = (towerFloor % 10 === 0); bossMaxHP = 10000 * Math.pow(1.5, towerFloor - 1); if(isEpic) bossMaxHP *= 5; bossHP = bossMaxHP; bossTimerMax = isEpic ? 60 : 30; bossTimer = bossTimerMax; playSound('achieve'); if((towerFloor - 1) % 10 === 0 && (towerFloor - 1) !== 0) { gems += 50; if(typeof mysteryEggs !== 'undefined') mysteryEggs += 2; if(typeof createExplosion === 'function') createExplosion(window.innerWidth/2, window.innerHeight/2, "COFFRE ÉPIQUE ! +50💎 +2🥚"); } else { if(typeof createExplosion === 'function') createExplosion(window.innerWidth/2, window.innerHeight/2, "BOSS VAINCU ! +1%"); } if(typeof recalculateProduction === 'function') recalculateProduction(); } else if (bossTimer <= 0) { bossHP = bossMaxHP; bossTimer = typeof bossTimerMax !== 'undefined' ? bossTimerMax : 30; playSound('bad'); } }

/* === MODULE MINI JEU === */
function startMiniGame() { if (typeof mgCooldown === 'undefined' || mgCooldown > 0 || mgActive) return; mgActive = true; mgHits = 0; let maxTime = 10; if(typeof mgLevel !== 'undefined' && mgLevel >= 10) maxTime = 15; mgTime = maxTime; mgCooldown = 60; let bStart = document.getElementById('btn-start-minigame'); if(bStart) bStart.style.display = 'none'; let mb = document.getElementById('minigame-board'); if(mb) mb.style.display = 'block'; let mh = document.getElementById('minigame-hits'); if(mh) mh.innerText = "Cibles: 0"; let mt = document.getElementById('minigame-timer'); if(mt) mt.innerText = "Temps: " + maxTime + "s"; moveMinigameTarget(); playSound('achieve'); mgTimerInterval = setInterval(() => { mgTime--; let mt2 = document.getElementById('minigame-timer'); if(mt2) mt2.innerText = `Temps: ${mgTime}s`; if (mgTime <= 0) endMiniGame(); else moveMinigameTarget(); }, 1000); }
function hitMinigameTarget(e) { if (!mgActive) return; mgHits++; let mh = document.getElementById('minigame-hits'); if(mh) mh.innerText = `Cibles: ${mgHits}`; playSound('click'); let mult = (typeof currentFaction !== 'undefined' && currentFaction===2) ? 5 : 1; let reward = Math.max(50, totalProductionPerSecond * 2) * mult; if (typeof mgLevel !== 'undefined' && mgLevel >= 2) reward *= 1.5; currentResources += reward; lifetimeResources += reward; if(typeof createExplosion === 'function') createExplosion(e.clientX, e.clientY, "+" + formatNumber(reward)); moveMinigameTarget(); if(typeof updateUI === 'function') updateUI(); }
function moveMinigameTarget() { const board = document.getElementById('minigame-board'); const target = document.getElementById('minigame-target'); if(!board || !target) return; let maxX = board.clientWidth - 50; let maxY = board.clientHeight - 50; target.style.left = Math.max(10, Math.random() * maxX) + 'px'; target.style.top = Math.max(40, Math.random() * maxY) + 'px'; }
function endMiniGame() { mgActive = false; clearInterval(mgTimerInterval); let mb = document.getElementById('minigame-board'); if(mb) mb.style.display = 'none'; let bs = document.getElementById('btn-start-minigame'); if(bs) bs.style.display = 'inline-block'; playSound('buy'); if(typeof showNotification === 'function') showNotification("Entraînement Terminé", `Cibles touchées : ${mgHits} fois !`); if(typeof tryDropArtefact === 'function') tryDropArtefact(); let xpGained = mgHits * 10; if(typeof mgXP !== 'undefined') { mgXP += xpGained; if(typeof createExplosion === 'function') createExplosion(window.innerWidth/2, window.innerHeight/2, "+" + xpGained + " XP"); checkMgLevelUp(); } }
function checkMgLevelUp() { if(typeof getMgXPNeeded !== 'function') return; let xpNeeded = getMgXPNeeded(); while (mgXP >= xpNeeded) { mgXP -= xpNeeded; mgLevel++; playSound('golden'); if(typeof showNotification === 'function') showNotification("Niveau UP !", `Camp d'entraînement Niv. ${mgLevel} !`); if(typeof recalculateProduction === 'function') recalculateProduction(); xpNeeded = getMgXPNeeded(); } }


/* === INITIALISATION & BOUCLE PRINCIPALE (AVEC GESTION DES ERREURS !) === */
window.addEventListener('DOMContentLoaded', () => {
    try {
        let mainBtn = document.getElementById('main-click-btn');
        if(mainBtn) mainBtn.addEventListener('click', doManualClick);

        if(typeof loadGame === 'function') loadGame(); 
        if(typeof recalculateProduction === 'function') recalculateProduction();
        
        if (window.pendingOfflineSeconds && window.pendingOfflineSeconds > 60 && totalProductionPerSecond > 0 && !hasWon) { 
            let offlineGains = window.pendingOfflineSeconds * totalProductionPerSecond; 
            currentResources += offlineGains; lifetimeResources += offlineGains; timePlayedSeconds += window.pendingOfflineSeconds; 
            let ot = document.getElementById('offline-time'); if(ot) ot.innerText = formatTimeLabel(window.pendingOfflineSeconds); 
            let og = document.getElementById('offline-gains'); if(og) og.innerText = "+" + formatNumber(offlineGains);
            if(window.pendingOfflineCapped) { let om = document.getElementById('offline-cap-msg'); if(om) om.style.display = 'block'; }
            let omd = document.getElementById('offline-modal'); if(omd) omd.classList.remove('hidden');
        }
        
        if(typeof generateStore === 'function') generateStore();
        if(typeof generateUpgrades === 'function') generateUpgrades();
        if(typeof generateSkills === 'function') generateSkills();
        if(typeof initMissions === 'function') initMissions();
        if(typeof renderAchievements === 'function') renderAchievements();
        if(typeof generateMarket === 'function') generateMarket();
        if(typeof generateInventory === 'function') generateInventory();
        if(typeof generateManagers === 'function') generateManagers();
        if(typeof generateExpeditions === 'function') generateExpeditions();
        if(typeof generateGarden === 'function') generateGarden();
        if(typeof generateDarkMatter === 'function') generateDarkMatter();
        if(typeof generateHatchery === 'function') generateHatchery();
        
        if(typeof drawVisualEmpire === 'function') drawVisualEmpire();
        setBuyMultiplier(buyMultiplier);
        scheduleEvents(); 
        
        setInterval(updateMarketLoop, 3000);
        setInterval(changeWeather, 180000);
        setInterval(() => { if(typeof prestigeSkills !== 'undefined') { let autoSkill = prestigeSkills.find(s => s.id === "skill_auto"); if (autoSkill && autoSkill.purchased) doManualClick(null); } }, 500); 
        setInterval(() => { let ts = document.getElementById('tab-stats'); if(ts && ts.classList.contains('active') && typeof updateStatsTab === 'function') updateStatsTab(); }, 1000);
        setInterval(updateNewsTicker, 12000);
        if(typeof saveGame === 'function') setInterval(saveGame, 10000); 
        
        let lastTime = performance.now();
        function gameLoop(currentTime) {
            if (hasWon) return; 
            let deltaTime = (currentTime - lastTime) / 1000; 
            lastTime = currentTime; 
            
            if(typeof darkUpgrades !== 'undefined' && darkUpgrades[1] && darkUpgrades[1].purchased) deltaTime *= 1.2;
            timePlayedSeconds += deltaTime;
            
            if (typeof processGardenTick === 'function') processGardenTick(deltaTime);

            if (totalProductionPerSecond > 0) { 
                let gen = totalProductionPerSecond * deltaTime; 
                currentResources += gen; 
                lifetimeResources += gen; 
                if (typeof processTowerCombat === 'function') processTowerCombat(deltaTime, gen);
            }

            if (typeof mgCooldown !== 'undefined' && mgCooldown > 0) { 
                mgCooldown -= deltaTime; 
                let btn = document.getElementById('btn-start-minigame'); 
                if (btn) { 
                    if (mgCooldown <= 0) { 
                        btn.innerText = "🎮 Lancer l'Entraînement"; 
                        btn.classList.remove('disabled'); 
                    } else { 
                        btn.innerText = `⏳ Attendre (${Math.ceil(mgCooldown)}s)`; 
                        btn.classList.add('disabled'); 
                    } 
                } 
            }
            
            if(typeof updateUI === 'function') updateUI(); 
            requestAnimationFrame(gameLoop); 
        }
        requestAnimationFrame(gameLoop); 
        
    } catch (erreurFatale) {
        console.error(erreurFatale);
        let crashScreen = document.getElementById('crash-screen');
        if (crashScreen) { 
            crashScreen.style.display = 'block'; 
            document.getElementById('crash-message').innerText = erreurFatale.stack || erreurFatale.message; 
        }
    }
});
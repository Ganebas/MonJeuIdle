function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    let tBtn = document.getElementById(`tab-btn-${tabName}`); if(tBtn) tBtn.classList.add('active');
    let tContent = document.getElementById(`tab-${tabName}`); if(tContent) tContent.classList.add('active');
    
    if(tabName === 'market' && typeof generateMarket === 'function') generateMarket();
    if(tabName === 'inventory' && typeof generateInventory === 'function') generateInventory();
    if(tabName === 'managers' && typeof generateManagers === 'function') generateManagers();
    if(tabName === 'expeditions' && typeof generateExpeditions === 'function') generateExpeditions();
    if(tabName === 'garden' && typeof generateGarden === 'function') generateGarden();
    if(tabName === 'skills' && typeof generateSkills === 'function') generateSkills(); 
    if(tabName === 'dm' && typeof generateDarkMatter === 'function') generateDarkMatter();
    if(tabName === 'hatchery' && typeof generateHatchery === 'function') generateHatchery();
    if(tabName === 'stats' && typeof updateStatsTab === 'function') updateStatsTab();
}

function showNotification(title, msg) {
    const notif = document.createElement('div'); notif.classList.add('notification');
    notif.innerHTML = `🏆 <b>Succès : ${title}</b><br><small>${msg}</small>`;
    let nArea = document.getElementById('notification-area');
    if(nArea) nArea.appendChild(notif); setTimeout(() => { notif.remove(); }, 3500);
}

function drawVisualEmpire() {
    let html = "";
    if (typeof buildings !== 'undefined') {
        buildings.forEach(b => {
            let safeOwned = isNaN(b.owned) ? 0 : b.owned;
            if (b.id !== "galaxy" && safeOwned > 0) {
                let count = Math.min(safeOwned, 50); 
                for(let i=0; i<count; i++) html += `<span style="font-size:1.8rem; margin:-5px;">${b.icon}</span>`;
            }
        });
    }
    let empire = document.getElementById('visual-empire');
    if(empire) empire.innerHTML = html;
}

function generateStore() {
    const container = document.getElementById('buildings-container'); 
    if(!container || typeof buildings === 'undefined') return;
    let html = "";
    buildings.forEach((b, i) => {
        let synergyText = b.synergy ? `<br><span style="color:var(--accent-purple);">Synergie: ${b.synergy.description}</span>` : "";
        let details = getPurchaseDetails(b); let safeLevel = b.level || 1; let gemCost = safeLevel * 2;
        let masteryBtnHtml = b.id !== "galaxy" ? `<button id="mastery-btn-${b.id}" class="mastery-btn prestige" onclick="event.stopPropagation(); upgradeMastery(${i})">⭐ Maîtrise (Lvl ${safeLevel}) | 💎 ${gemCost}</button>` : "";
        html += `<div id="btn-${b.id}" class="metamorphose-card disabled buildings" onclick="buyBuilding(${i})"><div class="card-left"><div class="card-icon">${b.icon}</div><div class="card-info"><div class="card-title">${b.name} <span id="amount-label-${b.id}" style="font-size:1rem; color:var(--accent-blue-light);">(+${details.amount})</span></div><div class="card-desc">Prod : +${formatNumber(b.baseProduction)} /s ${synergyText}</div><div class="card-cost" id="cost-${b.id}">Coût : ${formatNumber(details.cost)} 💰</div></div></div><div class="card-right"><div class="card-owned" id="owned-${b.id}">${b.owned || 0}</div>${masteryBtnHtml}</div></div>`;
    });
    container.innerHTML = html;
}

function generateUpgrades() {
    const container = document.getElementById('upgrades-container'); 
    if(!container || typeof upgrades === 'undefined' || typeof buildings === 'undefined') return;
    let html = "";
    upgrades.forEach((u, i) => {
        if (u.isPurchased) return; 
        let reqB = buildings.find(b => b.id === u.reqBuilding); if (reqB && (reqB.owned || 0) < u.reqCount) return; 
        html += `<div id="btn-upg-${u.id}" class="metamorphose-card disabled upgrades" onclick="buyUpgrade(${i})"><div class="card-left"><div class="card-icon">${u.icon}</div><div class="card-info"><div class="card-title">${u.name}</div><div class="card-desc">${u.desc}</div><div class="card-cost" id="cost-upg-${u.id}">Coût : ${formatNumber(u.cost)} 💰</div></div></div><div class="card-right"><button class="metamorphose-buy-btn" style="width: 120px;">Acheter</button></div></div>`;
    });
    container.innerHTML = html;
}

function generateSkills() {
    const container = document.getElementById('skills-container'); 
    if(!container || typeof prestigeSkills === 'undefined') return;
    container.innerHTML = "";
    let safePrestige = typeof prestigePoints !== 'undefined' && !isNaN(prestigePoints) ? prestigePoints : 0;
    const unspentPoints = safePrestige - prestigeSkills.reduce((sum, s) => s.purchased ? sum + s.cost : sum, 0);

    prestigeSkills.forEach((skill, i) => {
        const areReqsPurchased = skill.reqs.every(reqId => prestigeSkills.find(s => s.id === reqId).purchased);
        if (!areReqsPurchased && skill.reqs.length > 0) return; // CACHE LES NOEUDS INACCESSIBLES
        let statusClass = "locked"; 
        if (skill.purchased) statusClass = "purchased"; else if (areReqsPurchased && unspentPoints >= skill.cost) statusClass = "affordable"; else if (areReqsPurchased) statusClass = ""; 
        let node = document.createElement('div'); node.className = `skill-node ${statusClass} pop-in-anim`; node.id = `skill-node-${skill.id}`; node.setAttribute('onclick', `buySkill(${i})`);
        node.style.left = (skill.x || 50) + '%'; node.style.top = (skill.y || 50) + '%'; node.style.transform = 'translate(-50%, -50%)';
        node.innerHTML = `<div class="skill-icon">${skill.icon}</div><h4>${skill.name}</h4><div class="skill-desc">${skill.desc}</div><div class="skill-cost">${skill.purchased ? "Acquis" : `Coût: ${skill.cost} pts`}</div>`;
        container.appendChild(node);
    });

    setTimeout(() => {
        prestigeSkills.forEach(skill => {
            skill.reqs.forEach(reqId => {
                let parent = document.getElementById(`skill-node-${reqId}`); let child = document.getElementById(`skill-node-${skill.id}`);
                if (parent && child) {
                    let line = document.createElement('div'); line.className = 'skill-connection pop-in-anim'; line.id = `skill-conn-${reqId}-to-${skill.id}`; container.appendChild(line);
                    let pRect = parent.getBoundingClientRect(); let cRect = child.getBoundingClientRect(); let contRect = container.getBoundingClientRect();
                    let startX = (pRect.left - contRect.left) + pRect.width / 2; let startY = (pRect.top - contRect.top) + pRect.height / 2;
                    let endX = (cRect.left - contRect.left) + cRect.width / 2; let endY = (cRect.top - contRect.top) + cRect.height / 2;
                    let distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)); let angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
                    line.style.width = distance + 'px'; line.style.left = startX + 'px'; line.style.top = startY + 'px'; line.style.transform = `rotate(${angle}deg)`;
                }
            });
        });
    }, 50); 
}

function generateMarket() {
    const container = document.getElementById('market-container'); 
    if(!container || typeof stocks === 'undefined') return;
    let html = "";
    stocks.forEach((s, i) => {
        let colorClass = s.trend >= 0 ? 'up' : 'down'; let arrow = s.trend >= 0 ? '▲' : '▼';
        let safeHistory = Array.isArray(s.history) && s.history.length > 0 ? s.history : [50];
        let maxH = Math.max(...safeHistory); let minH = Math.min(...safeHistory); let range = maxH - minH || 1;
        let graphHtml = safeHistory.map(val => { let pct = ((val - minH) / range) * 100; return `<div class="graph-bar" style="height: ${Math.max(5, isNaN(pct) ? 5 : pct)}%; background: ${s.trend >= 0 ? '#37eb27' : '#f34b22'};"></div>`; }).join('');
        let profitHtml = ""; let safeShares = isNaN(s.shares) ? 0 : s.shares;
        if(safeShares > 0) { let safeCost = isNaN(s.avgCost) || s.avgCost === 0 ? 1 : s.avgCost; let profitPct = ((s.price - safeCost) / safeCost) * 100; let pColor = profitPct >= 0 ? '#37eb27' : '#f34b22'; profitHtml = `<div style="color:${pColor}; font-size:0.9rem; font-weight:bold; margin-top:5px;">Moyenne: ${formatNumber(safeCost)} (${profitPct > 0 ? '+':''}${isNaN(profitPct) ? 0 : profitPct.toFixed(1)}%)</div>`; }
        html += `<div class="metamorphose-card"><div style="flex:1;"><div class="card-title">${s.name}</div><div style="font-size:1.5rem; font-weight:bold; color:${s.trend >= 0 ? '#37eb27' : '#f34b22'}">${formatNumber(s.price)} ${arrow}</div><div style="color:var(--text-muted); font-size:1rem;">Possédées: ${safeShares}</div>${profitHtml}</div><div class="stock-graph" style="flex:1; height:60px; display:flex; align-items:flex-end; gap:2px; border-bottom:1px solid var(--border-main);">${graphHtml}</div><div style="flex:0; display:flex; flex-direction:column; gap:5px; margin-left:15px;"><button class="metamorphose-buy-btn" style="background:var(--accent-green); color:var(--bg-dark); font-size:1rem; padding:10px;" onclick="buyStock(${i})">Acheter</button> <button class="metamorphose-buy-btn" style="background:var(--accent-red); color:white; font-size:1rem; padding:10px; border-color:#c23616; box-shadow:0 6px 0 #8c2610;" onclick="sellStock(${i})">Vendre</button></div></div>`;
    });
    container.innerHTML = html;
}

function generateInventory() {
    let equipC = document.getElementById('equipped-container');
    if(equipC && typeof equippedSlots !== 'undefined' && typeof artefacts !== 'undefined') {
        let slotsHtml = "";
        for(let i=0; i<equippedSlots.length; i++) {
            if(equippedSlots[i] !== null) { let art = artefacts.find(a => a.id === equippedSlots[i]); slotsHtml += `<div class="equip-slot" onclick="unequipArtefact(${i})" title="Déséquiper">${art ? art.icon : '?'}</div>`; } 
            else { slotsHtml += `<div class="equip-slot"></div>`; }
        }
        equipC.innerHTML = slotsHtml;
    }
    let artHtml = ""; let hasAny = false;
    if(typeof artefacts !== 'undefined') {
        artefacts.forEach((a, i) => {
            if(a.owned && !a.equipped) {
                hasAny = true; artHtml += `<div class="metamorphose-card"><div class="card-left"><div class="card-icon">${a.icon}</div><div class="card-info"><div class="card-title" style="color:var(--highlight-yellow);">${a.name}</div><div class="card-desc">${a.desc}</div></div></div><button class="metamorphose-buy-btn" style="background:var(--highlight-yellow); border-color:#ff9100; box-shadow:0 6px 0 #b36400; color:var(--bg-dark); width:120px;" onclick="equipArtefact('${a.id}')">Équiper</button></div>`;
            }
        });
    }
    if(!hasAny) artHtml = "<p style='color:var(--text-muted); font-style:italic;'>Vous n'avez aucun artefact en réserve.</p>";
    let ac = document.getElementById('artefacts-container'); if (ac) ac.innerHTML = artHtml;
}

function generateManagers() {
    const container = document.getElementById('managers-container');
    if(!container || typeof managers === 'undefined') return;
    let html = "";
    managers.forEach((m, i) => {
        let isGems = m.currency === "gem"; let safeCost = isNaN(m.cost) ? 0 : m.cost;
        if(typeof currentFaction !== 'undefined' && currentFaction === 3 && m.currency === "res") safeCost /= 2; 
        let costLabel = isGems ? `${safeCost} 💎` : formatNumber(safeCost) + " res.";
        let btnHtml = m.purchased 
            ? `<button class="metamorphose-buy-btn" style="background:var(--panel-light); border-color:var(--border-main); box-shadow:none; color:var(--text-muted); cursor:not-allowed;" disabled>Embauché</button>`
            : `<button class="metamorphose-buy-btn" id="btn-mgr-${m.id}" onclick="hireManager(${i})" style="flex-direction: column; height: auto; padding: 8px;"><span>Embaucher</span><span style="font-size:0.85rem; font-weight:normal; margin-top:2px;">${costLabel}</span></button>`;
        html += `<div class="metamorphose-card"><div class="card-left"><div class="card-icon" style="font-size:2.5rem; width:60px; height:60px;">${m.icon}</div><div class="card-info"><div class="card-title" style="font-size:1.4rem;">${m.name}</div><div class="card-desc">${m.desc}</div></div></div><div class="card-right" style="width:150px;">${btnHtml}</div></div>`;
    });
    container.innerHTML = html;
}

function generateExpeditions() {
    const container = document.getElementById('expeditions-container'); if(!container || typeof expeditions === 'undefined') return;
    let html = "";
    expeditions.forEach((exp, i) => {
        html += `<div class="metamorphose-card" style="position:relative; overflow:hidden;"><div class="card-left"><div class="card-icon" style="font-size:2.5rem; width:60px; height:60px;">${exp.icon}</div><div class="card-info"><div class="card-title" style="font-size:1.4rem;">${exp.name}</div><div class="card-desc" style="color:var(--accent-blue-light); font-weight:bold;">Butin: ${exp.rewardDesc}</div></div></div><div class="card-right" style="z-index:2;"><button class="metamorphose-buy-btn" style="background:var(--panel-light); border-color:var(--border-main); color:white; width:150px;" id="btn-exp-${i}" onclick="actionExpedition(${i})">Lancer (${formatTimeLabel(exp.durationSec)})</button></div><div class="exp-progress-bg" style="position:absolute; bottom:0; left:0; width:100%; height:8px; background:var(--panel-deep);"><div class="exp-progress-fill" id="fill-exp-${i}" style="height:100%; background:var(--accent-purple); width:0%; transition:width 1s linear;"></div></div></div>`;
    });
    container.innerHTML = html;
}

function updateExpeditionsUI() {
    if(typeof expeditions === 'undefined') return; let hasReadyExp = false;
    expeditions.forEach((exp, i) => {
        let btn = document.getElementById(`btn-exp-${i}`); let fill = document.getElementById(`fill-exp-${i}`);
        if(btn && fill) {
            if(exp.active) {
                let now = Date.now();
                if(now >= exp.endTime) {
                    hasReadyExp = true; btn.innerText = "RÉCUPÉRER"; btn.style.background = "var(--highlight-yellow)"; btn.style.color = "var(--bg-dark)"; btn.style.borderColor = "#ff9100"; btn.style.boxShadow = "0 6px 0 #b36400"; fill.style.width = "100%"; fill.style.background = "var(--highlight-yellow)";
                } else {
                    let totalTime = exp.durationSec * 1000; let elapsed = now - exp.startTime; let pct = Math.min(100, (elapsed / totalTime) * 100); let remSec = (exp.endTime - now) / 1000;
                    btn.innerText = formatTimeLabel(remSec); btn.style.background = "var(--panel-light)"; btn.style.color = "var(--text-muted)"; btn.style.boxShadow = "none"; fill.style.width = pct + "%"; fill.style.background = "var(--accent-purple)";
                }
            } else {
                btn.innerText = `Lancer (${formatTimeLabel(exp.durationSec)})`; btn.style.background = "var(--panel-light)"; btn.style.color = "white"; btn.style.borderColor = "var(--border-main)"; btn.style.boxShadow = "none"; fill.style.width = "0%"; fill.style.background = "var(--accent-purple)";
            }
        } else if (exp.active && Date.now() >= exp.endTime) { hasReadyExp = true; }
    });
    let badge = document.getElementById('badge-expeditions'); if (badge) badge.style.display = hasReadyExp ? "flex" : "none";
}

function generateGarden() {
    const container = document.getElementById('garden-container'); if(!container || typeof gardenPlots === 'undefined') return;
    let html = ""; gardenPlots.forEach((p, i) => { html += `<div class="garden-plot" id="plot-${i}" onclick="clickPlot(${i})"></div>`; });
    container.innerHTML = html; updateGardenUI();
}

function updateGardenUI() {
    if(typeof gardenPlots === 'undefined') return; let hasReadyGarden = false;
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

function generateHatchery() {
    const container = document.getElementById('incubator-ui'); if(!container || typeof incubator === 'undefined') return;
    let html = "";
    if (incubator.active) {
        let rem = (incubator.readyTime - Date.now()) / 1000;
        if(rem <= 0) { html = `<div class="egg-bounce" onclick="hatchEgg()">🥚</div><div style="color:var(--accent-green); font-weight:bold; font-size:1.2rem; margin-top:10px;">Prêt à éclore ! Cliquez !</div>`; } 
        else { html = `<div style="font-size:4rem; filter:grayscale(80%);">🥚</div><div style="color:var(--text-muted); font-weight:bold; margin-top:10px;">Incubation : ${formatTimeLabel(rem)}</div>`; }
    } else {
        let safeEggs = isNaN(mysteryEggs) ? 0 : mysteryEggs;
        if(safeEggs > 0) { html = `<div class="egg-bounce" style="font-size:4rem; cursor:pointer;" onclick="startIncubation()">🥚</div><div style="color:var(--accent-blue-light); font-weight:bold; margin-top:10px;">Cliquez pour incuber (5 min)</div>`; } 
        else { html = `<div style="font-size:4rem; opacity:0.3;">🥚</div><div style="color:var(--text-muted); font-weight:bold; margin-top:10px;">Aucun œuf en stock.</div>`; }
    }
    container.innerHTML = html;
    
    let pCont = document.getElementById('pets-container');
    if(pCont && typeof pets !== 'undefined') {
        let pHtml = "";
        pets.forEach(p => {
            if(p.owned) {
                let isEq = equippedPet === p.id;
                let btnHtml = `<button class="metamorphose-buy-btn" style="${isEq ? 'background:var(--accent-red); border-color:#c23616;' : 'background:var(--accent-green);'}" onclick="equipPet('${p.id}')">${isEq ? 'Retirer' : 'Invoquer'}</button>`;
                pHtml += `<div class="metamorphose-card pop-in-anim" style="flex-direction:column; padding:15px; text-align:center;"><div style="font-size:3rem;">${p.icon}</div><h3 style="margin:10px 0; color:var(--text-main); font-family:'Luckiest Guy', cursive;">${p.name} <span style="color:var(--highlight-yellow);">Niv. ${p.level}</span></h3><div class="rarity-${p.rarity}" style="font-weight:bold; margin-bottom:5px;">${p.rarity}</div><div style="color:var(--text-muted); font-size:0.9rem; margin-bottom:15px;">${p.desc} (Bonus x${p.val.toFixed(1)})</div>${btnHtml}</div>`;
            } else {
                pHtml += `<div class="metamorphose-card" style="flex-direction:column; padding:15px; text-align:center; border-color:var(--border-main);"><div style="font-size:3rem;" class="silhouette">${p.icon}</div><h3 style="margin:10px 0; color:var(--text-muted); font-family:'Luckiest Guy', cursive;">???</h3><div style="color:var(--text-muted); font-size:0.9rem;">Familier Inconnu</div></div>`;
            }
        });
        pCont.innerHTML = pHtml;
    }
}
function updateHatcheryUI() {
    let eggC = document.getElementById('egg-count'); if(eggC) eggC.innerText = isNaN(mysteryEggs) ? 0 : mysteryEggs;
    let hasReadyEgg = false; if(typeof incubator !== 'undefined' && incubator.active && Date.now() >= incubator.readyTime) hasReadyEgg = true;
    let badge = document.getElementById('badge-hatchery'); if (badge) badge.style.display = hasReadyEgg ? "flex" : "none";
    if(document.getElementById('tab-hatchery') && document.getElementById('tab-hatchery').classList.contains('active')) generateHatchery();
}

function initMissions() {
    const container = document.getElementById('missions-container'); if(!container || typeof missions === 'undefined') return;
    let html = "";
    missions.forEach((m, i) => {
        let safeLvl = isNaN(m.level) ? 1 : m.level; let safeDesc = m.desc || ""; let safeTarget = isNaN(m.target) ? 100 : m.target; let safeReward = isNaN(m.reward) ? 1 : m.reward;
        html += `<div class="metamorphose-card" style="flex-direction:column; align-items:stretch;"><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><div><div class="card-title" id="mission-title-${i}">${m.name} (Niv. ${safeLvl})</div><div class="card-desc">${safeDesc}</div></div><div style="font-size:1.5rem; font-weight:bold; color:var(--accent-blue-light);" id="mission-reward-${i}">+${safeReward} 💎</div></div><div style="width:100%; height:15px; background:var(--panel-light); border-radius:10px; overflow:hidden; border:2px solid var(--border-main);"><div id="mission-fill-${i}" style="height:100%; width:0%; background:var(--accent-green); transition:width 0.3s;"></div></div><div style="display:flex; justify-content:space-between; margin-top:10px; align-items:center;"><div id="mission-text-${i}" style="color:var(--text-muted); font-weight:bold;">0 / ${safeTarget}</div><button class="metamorphose-buy-btn" id="mission-btn-${i}" style="display:none; width:120px; height:40px; font-size:1rem;" onclick="claimMission(${i})">Réclamer</button></div></div>`;
    });
    container.innerHTML = html;
}

function updateMissionsUI() {
    if(typeof missions === 'undefined') return;
    let hasReadyMission = false;
    missions.forEach((m, i) => {
        let safeT = m.target || 1; let safeP = m.progress || 0;
        if (safeP >= safeT) hasReadyMission = true;
        let percentage = Math.min(100, (safeP / safeT) * 100); 
        let fillEl = document.getElementById(`mission-fill-${i}`);
        if(fillEl) { 
            fillEl.style.width = isNaN(percentage) ? "0%" : (percentage + "%"); 
            let mt = document.getElementById(`mission-text-${i}`); if(mt) mt.innerText = `${safeP} / ${safeT}`; 
            let mb = document.getElementById(`mission-btn-${i}`); if(mb) mb.style.display = (safeP >= safeT) ? "block" : "none"; 
            let mtitle = document.getElementById(`mission-title-${i}`); if(mtitle) mtitle.innerText = `${m.name} (Niv. ${isNaN(m.level) ? 1 : m.level})`; 
            let mr = document.getElementById(`mission-reward-${i}`); if(mr) mr.innerText = `+${isNaN(m.reward) ? 0 : m.reward} 💎`; 
        }
    });
    let badge = document.getElementById('badge-missions'); if (badge) badge.style.display = hasReadyMission ? "flex" : "none";
}

function generateDarkMatter() {
    const container = document.getElementById('dm-upgrades-container'); if(!container || typeof darkUpgrades === 'undefined') return;
    let html = "";
    darkUpgrades.forEach((u, i) => {
        let btnHtml = u.purchased ? `<button class="metamorphose-buy-btn" style="background:var(--panel-light); border-color:var(--border-main); color:var(--text-muted); box-shadow:none;" disabled>Acquis</button>` : `<button class="metamorphose-buy-btn prestige" onclick="buyDarkUpgrade(${i})">Acheter (${u.cost} 🌌)</button>`;
        html += `<div class="metamorphose-card" style="border-color:var(--accent-purple);"><div class="card-left"><div class="card-icon" style="font-size:2.5rem; width:60px; height:60px;">🌌</div><div class="card-info"><div class="card-title" style="color:var(--accent-purple);">${u.name}</div><div class="card-desc">${u.desc}</div></div></div><div class="card-right" style="width:150px;">${btnHtml}</div></div>`;
    });
    container.innerHTML = html;
}

function updateStatsTab() {
    let statC = document.getElementById('stats-container');
    if(statC) {
        let safeLife = typeof lifetimeResources !== 'undefined' ? formatNumber(lifetimeResources) : 0; let safeTime = typeof timePlayedSeconds !== 'undefined' ? formatTimeLabel(timePlayedSeconds) : 0; let safeClicks = typeof totalClicks !== 'undefined' ? formatNumber(totalClicks) : 0; let safeGems = typeof gems !== 'undefined' ? (isNaN(gems) ? 0 : gems) : 0; let safeAsc = typeof ascensionCount !== 'undefined' ? (isNaN(ascensionCount) ? 0 : ascensionCount) : 0;
        statC.innerHTML = `<div class="metamorphose-card" style="padding:15px; margin-bottom:10px;"><span style="color:var(--text-muted); font-size:1.2rem; font-family:'Luckiest Guy', cursive;">Ressources à vie</span><span style="color:var(--text-main); font-size:1.5rem; font-weight:bold;">${safeLife}</span></div><div class="metamorphose-card" style="padding:15px; margin-bottom:10px;"><span style="color:var(--text-muted); font-size:1.2rem; font-family:'Luckiest Guy', cursive;">Temps de jeu</span><span style="color:var(--text-main); font-size:1.5rem; font-weight:bold;">${safeTime}</span></div><div class="metamorphose-card" style="padding:15px; margin-bottom:10px;"><span style="color:var(--text-muted); font-size:1.2rem; font-family:'Luckiest Guy', cursive;">Clics manuels</span><span style="color:var(--text-main); font-size:1.5rem; font-weight:bold;">${safeClicks}</span></div><div class="metamorphose-card" style="padding:15px; margin-bottom:10px;"><span style="color:var(--text-muted); font-size:1.2rem; font-family:'Luckiest Guy', cursive;">Gemmes</span><span style="color:var(--accent-blue-light); font-size:1.5rem; font-weight:bold;">${safeGems} 💎</span></div><div class="metamorphose-card" style="padding:15px; margin-bottom:10px;"><span style="color:var(--text-muted); font-size:1.2rem; font-family:'Luckiest Guy', cursive;">Ascensions</span><span style="color:var(--accent-purple); font-size:1.5rem; font-weight:bold;">${safeAsc}</span></div>`;
    }
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid'); if(!grid || typeof achievements === 'undefined') return;
    grid.innerHTML = ""; achievements.forEach(ach => { let div = document.createElement('div'); div.classList.add('achievement-icon'); if (ach.unlocked) div.classList.add('unlocked'); div.innerText = ach.icon; div.title = `${ach.name} : ${ach.desc}`; grid.appendChild(div); });
}

function updateTowerUI(safeFloor, dps) {
    let tf = document.getElementById('tower-floor'); if(tf) tf.innerText = safeFloor;
    let td = document.getElementById('tower-dps'); if(td) td.innerText = formatNumber(dps);
    let tb = document.getElementById('tower-bonus'); if(tb) tb.innerText = Math.floor(safeFloor-1);
    let isEpic = (safeFloor % 10 === 0); let bossIcon = document.getElementById('boss-icon');
    if(bossIcon) { bossIcon.innerText = isEpic ? "💀" : "👹"; bossIcon.style.color = isEpic ? "#9c27b0" : "inherit"; }
    if (typeof bossHP !== 'undefined' && typeof bossMaxHP !== 'undefined') { let hpt = document.getElementById('boss-hp-text'); if(hpt) hpt.innerText = `${formatNumber(bossHP)} / ${formatNumber(bossMaxHP)}`; let hpf = document.getElementById('boss-hp-fill'); if(hpf) { hpf.style.width = Math.max(0, (bossHP / bossMaxHP) * 100) + "%"; hpf.style.background = isEpic ? "var(--accent-purple)" : "var(--accent-red)"; } }
    if (typeof bossTimer !== 'undefined' && typeof bossTimerMax !== 'undefined') { let tt = document.getElementById('boss-time-text'); if(tt) tt.innerText = bossTimer.toFixed(1) + "s"; let ttf = document.getElementById('boss-time-fill'); if(ttf) ttf.style.width = Math.max(0, (bossTimer / bossTimerMax) * 100) + "%"; }
}

function updateMinigameUI() {
    if(typeof mgLevel === 'undefined' || typeof mgXP === 'undefined') return;
    let lvlT = document.getElementById('mg-level-text'); if(lvlT) lvlT.innerText = mgLevel;
    let xpFill = document.getElementById('mg-xp-fill'); if(xpFill) { let pct = Math.min(100, (mgXP / Math.floor(100 * Math.pow(1.5, mgLevel - 1))) * 100); xpFill.style.width = pct + "%"; }
    if(typeof mgMilestones !== 'undefined') {
        mgMilestones.forEach(m => { let icon = document.getElementById(`ms-icon-${m.level}`); if(icon && mgLevel >= m.level && !icon.classList.contains('reached')) icon.classList.add('reached'); });
        let nxt = document.getElementById('mg-next-milestone');
        if(nxt) { let nextMilestone = mgMilestones.find(m => m.level > mgLevel); if(nextMilestone) { nxt.innerText = `Prochain Jalon: Niv. ${nextMilestone.level} (${nextMilestone.desc})`; } else { nxt.innerText = "Maître Suprême atteint !"; } }
    }
}

function updateUI() {
    try {
        let scoreEl = document.getElementById('currency-ressources'); if(scoreEl) scoreEl.innerText = formatNumber(currentResources);
        let gemsEl = document.getElementById('gems-count'); if(gemsEl) gemsEl.innerText = typeof gems !== 'undefined' && !isNaN(gems) ? gems : 0;
        
        let dmBox = document.getElementById('dm-block'); let dmCount = document.getElementById('dm-count');
        if(typeof darkMatter !== 'undefined' && (darkMatter > 0 || transcendCount > 0)) { if(dmBox) dmBox.style.display = "flex"; if(dmCount) dmCount.innerText = formatNumber(darkMatter); let dmTab = document.getElementById('tab-btn-dm'); if(dmTab) dmTab.style.display = "flex"; }

        let safePrestige = typeof prestigePoints !== 'undefined' && !isNaN(prestigePoints) ? prestigePoints : 0; let unspentPoints = safePrestige;
        if(typeof prestigeSkills !== 'undefined') { unspentPoints -= prestigeSkills.reduce((sum, skill) => skill.purchased ? sum + skill.cost : sum, 0); }
        let ppo = document.getElementById('prestige-points-owned'); if(ppo) ppo.innerText = formatNumber(isNaN(unspentPoints) ? 0 : unspentPoints);
        
        let pBonus = typeof prestigeBonusPerPoint !== 'undefined' ? prestigeBonusPerPoint : 0.02; let aBonus = typeof achievementBonus !== 'undefined' ? achievementBonus : 0.01;
        let achCount = typeof achievements !== 'undefined' ? achievements.filter(a => a.unlocked).length : 0;
        let totalBonus = ((isNaN(unspentPoints) ? 0 : unspentPoints) * pBonus) + (achCount * aBonus);
        
        let safeFloor = typeof towerFloor !== 'undefined' && !isNaN(towerFloor) ? towerFloor : 1; totalBonus += (safeFloor - 1) * 0.01;
        let pMult = document.getElementById('prestige-multiplier'); if(pMult) pMult.innerText = `+${isNaN(totalBonus) ? 0 : Math.round(totalBonus * 100)}%`;
        
        let pendingPoints = getPendingPrestigePoints(); let pPend = document.getElementById('prestige-pending'); if(pPend) pPend.innerText = formatNumber(pendingPoints);
        let btnP = document.getElementById('btn-prestige'); if(btnP) { if(pendingPoints > 0) btnP.classList.remove('disabled'); else btnP.classList.add('disabled'); }

        if(typeof ascensionCount !== 'undefined' && ascensionCount > 0 && currentFaction === 0) { let fc = document.getElementById('faction-container'); if(fc) fc.style.display = "block"; let fa = document.getElementById('faction-active'); if(fa) fa.style.display = "none"; } 
        else if (typeof currentFaction !== 'undefined' && currentFaction > 0) { let fc = document.getElementById('faction-container'); if(fc) fc.style.display = "none"; let fa = document.getElementById('faction-active'); if(fa) { fa.style.display = "block"; let fName = ["", "Guilde des Marchands", "Culte du Doigt Musclé", "Ordre des Architectes"][currentFaction]; fa.innerText = "Faction Actuelle : " + fName; } }

        if (typeof buildings !== 'undefined') {
            buildings.forEach(b => { 
                let btn = document.getElementById(`btn-${b.id}`); if (!btn) return; 
                let details = getPurchaseDetails(b); let costEl = document.getElementById(`cost-${b.id}`); if(costEl) costEl.innerText = "Coût: " + formatNumber(details.cost) + " 💰";
                let lblEl = document.getElementById(`amount-label-${b.id}`); if(lblEl) lblEl.innerText = "(+" + details.amount + ")";
                let ownEl = document.getElementById(`owned-${b.id}`); if(ownEl) ownEl.innerText = isNaN(b.owned) ? 0 : b.owned;
                let safeRes = isNaN(currentResources) ? 0 : currentResources;
                if (safeRes >= details.cost && (b.id !== "galaxy" || !hasWon)) { btn.classList.remove('disabled'); btn.classList.add('affordable'); } else { btn.classList.add('disabled'); btn.classList.remove('affordable'); } 
                let mBtn = document.getElementById(`mastery-btn-${b.id}`);
                if(mBtn) { let safeLvl = isNaN(b.level) ? 1 : b.level; let cost = safeLvl * 2; mBtn.innerHTML = `⭐ Maîtrise (Lvl ${safeLvl}) | 💎 ${cost}`; if((isNaN(gems) ? 0 : gems) >= cost) mBtn.disabled = false; else mBtn.disabled = true; }
            });
        }
        
        if (typeof upgrades !== 'undefined') { upgrades.forEach(u => { let btn = document.getElementById(`btn-upg-${u.id}`); if (!btn) return; let safeRes = isNaN(currentResources) ? 0 : currentResources; if (safeRes >= u.cost) { btn.classList.remove('disabled'); btn.classList.add('affordable'); } else { btn.classList.add('disabled'); btn.classList.remove('affordable'); } }); }

        if (typeof managers !== 'undefined') {
            managers.forEach(m => {
                if(!m.purchased) {
                    let btn = document.getElementById(`btn-mgr-${m.id}`);
                    if(btn) {
                        let canAfford = false; let safeRes = isNaN(currentResources) ? 0 : currentResources; let safeGems = isNaN(gems) ? 0 : gems; let mCost = m.cost;
                        if(typeof currentFaction !== 'undefined' && currentFaction === 3 && m.currency === "res") mCost /= 2;
                        if(m.currency === "res" && safeRes >= mCost) canAfford = true; if(m.currency === "gem" && safeGems >= mCost) canAfford = true;
                        if(canAfford) { btn.style.background = "var(--accent-green)"; btn.style.color = "var(--bg-dark)"; btn.style.borderColor = "#28a01f"; btn.style.boxShadow = "0 6px 0 #1b6613"; btn.disabled = false; }
                        else { btn.style.background = "var(--panel-light)"; btn.style.color = "var(--text-muted)"; btn.style.borderColor = "var(--border-main)"; btn.style.boxShadow = "none"; btn.disabled = true; }
                    }
                }
            });
        }

        updateTowerUI(typeof safeFloor !== 'undefined' ? safeFloor : 1, totalProductionPerSecond);
        updateMinigameUI();
        
        let petDisp = document.getElementById('active-pet-display');
        if(petDisp) { if(typeof equippedPet !== 'undefined' && equippedPet !== null && typeof pets !== 'undefined') { let actP = pets.find(p => p.id === equippedPet); if(actP) { petDisp.innerText = actP.icon; petDisp.style.display = "block"; } } else { petDisp.style.display = "none"; } }
        
        updateMissionsUI(); updateHatcheryUI(); 
        if(document.getElementById('tab-expeditions') && document.getElementById('tab-expeditions').classList.contains('active')) updateExpeditionsUI();
        if(document.getElementById('tab-garden') && document.getElementById('tab-garden').classList.contains('active')) updateGardenUI();

    } catch (e) { throw new Error("UI Update Crash: " + e.message); }
}
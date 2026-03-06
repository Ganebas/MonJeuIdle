function startIncubation() {
    if(typeof mysteryEggs !== 'undefined' && typeof incubator !== 'undefined' && mysteryEggs > 0 && !incubator.active) {
        mysteryEggs--; incubator.active = true; incubator.readyTime = Date.now() + 300000; playSound('buy'); updateUI();
    }
}
function hatchEgg() {
    if(typeof incubator !== 'undefined' && typeof pets !== 'undefined' && incubator.active && Date.now() >= incubator.readyTime) {
        incubator.active = false;
        let rand = Math.random(); let r = rand < 0.1 ? "Légendaire" : (rand < 0.4 ? "Rare" : "Commun");
        let possible = pets.filter(p => p.rarity === r);
        let unlocked = possible[Math.floor(Math.random() * possible.length)];
        playSound('golden');
        if(unlocked.owned) {
            unlocked.level++; unlocked.val = unlocked.baseVal + (unlocked.level - 1) * unlocked.growth;
            showNotification("Évolution !", `Votre ${unlocked.name} est passé Niveau ${unlocked.level} !`);
            createExplosion(window.innerWidth/2, window.innerHeight/2, "Niveau UP !");
        } else {
            unlocked.owned = true;
            showNotification("Éclosion Gacha !", `Vous avez obtenu : ${unlocked.name} (${unlocked.rarity})`);
            createExplosion(window.innerWidth/2, window.innerHeight/2, unlocked.icon);
        }
        recalculateProduction(); updateUI();
    }
}
function equipPet(id) {
    if(typeof equippedPet !== 'undefined') { equippedPet = equippedPet === id ? null : id; playSound('click'); recalculateProduction(); updateUI(); }
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
        if(safeEggs > 0) { html = `<div style="font-size:4rem; cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="startIncubation()">➕</div><div style="color:var(--accent-blue-light); font-weight:bold; margin-top:10px;">Cliquez pour incuber (5 min)</div>`; } 
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
                // MISE EN GRISÉ (SILHOUETTE)
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
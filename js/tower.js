function processTowerCombat(deltaTime, gen) {
    if (typeof bossHP === 'undefined' || typeof bossTimer === 'undefined') return;
    let dmgMult = 1;
    if(typeof equippedPet !== 'undefined' && equippedPet !== null && typeof pets !== 'undefined') {
        let actPet = pets.find(p => p.id === equippedPet);
        if(actPet && actPet.type === "tower") dmgMult = actPet.val;
    }

    // V11: BONUS JALON 20
    if (typeof mgLevel !== 'undefined' && mgLevel >= 20) dmgMult *= 2;
    
    bossHP -= (gen * dmgMult);
    bossTimer -= deltaTime;

    if(bossHP <= 0) {
        towerFloor++; 
        let isEpic = (towerFloor % 10 === 0);
        bossMaxHP = 10000 * Math.pow(1.5, towerFloor - 1); 
        if(isEpic) bossMaxHP *= 5; 
        bossHP = bossMaxHP;
        bossTimerMax = isEpic ? 60 : 30; 
        bossTimer = bossTimerMax; 
        
        playSound('achieve'); 
        if((towerFloor - 1) % 10 === 0 && (towerFloor - 1) !== 0) {
            gems += 50; if(typeof mysteryEggs !== 'undefined') mysteryEggs += 2;
            createExplosion(window.innerWidth/2, window.innerHeight/2, "COFFRE ÉPIQUE ! +50💎 +2🥚");
        } else { createExplosion(window.innerWidth/2, window.innerHeight/2, "BOSS VAINCU ! +1%"); }
        recalculateProduction();
    } else if (bossTimer <= 0) {
        bossHP = bossMaxHP;
        bossTimer = typeof bossTimerMax !== 'undefined' ? bossTimerMax : 30;
        playSound('bad');
    }
}

function updateTowerUI(safeFloor, dps) {
    let tf = document.getElementById('tower-floor'); if(tf) tf.innerText = safeFloor;
    let td = document.getElementById('tower-dps'); if(td) td.innerText = formatNumber(dps);
    let tb = document.getElementById('tower-bonus'); if(tb) tb.innerText = Math.floor(safeFloor-1);
    
    let isEpic = (safeFloor % 10 === 0);
    let bossIcon = document.getElementById('boss-icon');
    if(bossIcon) { bossIcon.innerText = isEpic ? "💀" : "👹"; bossIcon.style.color = isEpic ? "#9c27b0" : "inherit"; }

    if (typeof bossHP !== 'undefined' && typeof bossMaxHP !== 'undefined') {
        let hpt = document.getElementById('boss-hp-text'); if(hpt) hpt.innerText = `${formatNumber(bossHP)} / ${formatNumber(bossMaxHP)}`;
        let hpf = document.getElementById('boss-hp-fill'); 
        if(hpf) { hpf.style.width = Math.max(0, (bossHP / bossMaxHP) * 100) + "%"; hpf.style.background = isEpic ? "var(--accent-purple)" : "var(--accent-red)"; }
    }
    
    if (typeof bossTimer !== 'undefined' && typeof bossTimerMax !== 'undefined') {
        let tt = document.getElementById('boss-time-text'); if(tt) tt.innerText = bossTimer.toFixed(1) + "s";
        let ttf = document.getElementById('boss-time-fill'); if(ttf) ttf.style.width = Math.max(0, (bossTimer / bossTimerMax) * 100) + "%";
    }
}
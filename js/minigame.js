function startMiniGame() { 
    if (typeof mgCooldown === 'undefined' || mgCooldown > 0 || mgActive) return; 
    mgActive = true; 
    mgHits = 0; 
    
    let maxTime = 10;
    if(typeof mgLevel !== 'undefined' && mgLevel >= 10) maxTime = 15; 

    mgTime = maxTime; 
    mgCooldown = 60; 

    let bStart = document.getElementById('btn-start-minigame'); if(bStart) bStart.style.display = 'none'; 
    let mb = document.getElementById('minigame-board'); if(mb) mb.style.display = 'block'; 
    let mh = document.getElementById('minigame-hits'); if(mh) mh.innerText = "Cibles: 0"; 
    let mt = document.getElementById('minigame-timer'); if(mt) mt.innerText = "Temps: " + maxTime + "s"; 
    
    moveMinigameTarget(); 
    playSound('achieve'); 
    
    mgTimerInterval = setInterval(() => { 
        mgTime--; 
        let mt2 = document.getElementById('minigame-timer'); if(mt2) mt2.innerText = `Temps: ${mgTime}s`; 
        if (mgTime <= 0) endMiniGame(); else moveMinigameTarget(); 
    }, 1000); 
}

function hitMinigameTarget(e) { 
    if (!mgActive) return; 
    mgHits++; 
    let mh = document.getElementById('minigame-hits'); if(mh) mh.innerText = `Cibles: ${mgHits}`; 
    playSound('click'); 
    
    let mult = (typeof currentFaction !== 'undefined' && currentFaction===2) ? 5 : 1; 
    let reward = Math.max(50, totalProductionPerSecond * 2) * mult; 
    
    if (typeof mgLevel !== 'undefined' && mgLevel >= 2) reward *= 1.5; 

    currentResources += reward; 
    lifetimeResources += reward; 
    createExplosion(e.clientX, e.clientY, "+" + formatNumber(reward)); 
    moveMinigameTarget(); 
    updateUI(); 
}

function moveMinigameTarget() { 
    const board = document.getElementById('minigame-board'); 
    const target = document.getElementById('minigame-target'); 
    if(!board || !target) return; 
    let maxX = board.clientWidth - 50; 
    let maxY = board.clientHeight - 50; 
    target.style.left = Math.max(10, Math.random() * maxX) + 'px'; 
    target.style.top = Math.max(40, Math.random() * maxY) + 'px'; 
}

function endMiniGame() { 
    mgActive = false; 
    clearInterval(mgTimerInterval); 
    
    let mb = document.getElementById('minigame-board'); if(mb) mb.style.display = 'none'; 
    let bs = document.getElementById('btn-start-minigame'); if(bs) bs.style.display = 'inline-block'; 
    playSound('buy'); 
    showNotification("Entraînement Terminé", `Cibles touchées : ${mgHits} fois !`); 
    
    if(typeof tryDropArtefact === 'function') tryDropArtefact(); 

    // GAIN D'XP
    let xpGained = mgHits * 10;
    if(typeof mgXP !== 'undefined') {
        mgXP += xpGained;
        createExplosion(window.innerWidth/2, window.innerHeight/2, "+" + xpGained + " XP");
        checkMgLevelUp();
    }
}

function checkMgLevelUp() {
    if(typeof getMgXPNeeded !== 'function') return;
    let xpNeeded = getMgXPNeeded();
    while (mgXP >= xpNeeded) {
        mgXP -= xpNeeded;
        mgLevel++;
        playSound('golden');
        showNotification("Niveau UP !", `Camp d'entraînement Niv. ${mgLevel} !`);
        recalculateProduction(); 
        xpNeeded = getMgXPNeeded();
    }
}

function updateMinigameUI() {
    if(typeof mgLevel === 'undefined' || typeof mgXP === 'undefined') return;

    let lvlT = document.getElementById('mg-level-text'); if(lvlT) lvlT.innerText = mgLevel;
    
    let xpFill = document.getElementById('mg-xp-fill');
    if(xpFill && typeof getMgXPNeeded === 'function') {
        let pct = Math.min(100, (mgXP / getMgXPNeeded()) * 100);
        xpFill.style.width = pct + "%";
    }

    // ANIMATION ET COLORATION DES JALONS
    if(typeof mgMilestones !== 'undefined') {
        mgMilestones.forEach(m => {
            let icon = document.getElementById(`ms-icon-${m.level}`);
            if(icon) {
                if (mgLevel >= m.level) {
                    if (!icon.classList.contains('reached')) {
                        icon.classList.add('reached'); 
                    }
                }
            }
        });

        let nxt = document.getElementById('mg-next-milestone');
        if(nxt) {
            let nextMilestone = mgMilestones.find(m => m.level > mgLevel);
            if(nextMilestone) {
                nxt.innerText = `Prochain Jalon: Niv. ${nextMilestone.level} (${nextMilestone.desc})`;
            } else {
                nxt.innerText = "Maître Suprême atteint !";
            }
        }
    }
}
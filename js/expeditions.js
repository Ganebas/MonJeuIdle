function actionExpedition(index) {
    if(typeof expeditions === 'undefined') return;
    let exp = expeditions[index];
    if(exp.active) {
        if(Date.now() >= exp.endTime) {
            exp.active = false; playSound('golden');
            let safeGems = isNaN(gems) ? 0 : gems;
            let gemMult = (typeof darkUpgrades !== 'undefined' && darkUpgrades[2].purchased) ? 2 : 1;
            if(index === 0) { gems = safeGems + (5 * gemMult); if(Math.random()<0.2) mysteryEggs++; } 
            if(index === 1) { gems = safeGems + (25 * gemMult); if(Math.random()<0.5) mysteryEggs++; } 
            if(index === 2) { gems = safeGems + (50 * gemMult); tryDropArtefact(true); mysteryEggs++; } 
            showNotification("Expédition Terminée", "Trésor récupéré !");
            updateUI(); generateExpeditions();
        }
    } else {
        exp.active = true; exp.startTime = Date.now(); exp.endTime = Date.now() + (exp.durationSec * 1000);
        playSound('buy'); updateUI(); generateExpeditions();
    }
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
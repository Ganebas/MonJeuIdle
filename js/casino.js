let isSpinning = false;
function playSlots() {
    let safeGems = isNaN(gems) ? 0 : gems;
    if(safeGems < 1 || isSpinning) { if(safeGems < 1) alert("Pas assez de gemmes !"); return; }
    gems = safeGems - 1; updateUI(); isSpinning = true; playSound('buy');
    let resDiv = document.getElementById('slot-result'); if(resDiv) { resDiv.innerText = "Ça tourne..."; resDiv.style.color = "var(--text-muted)"; }
    const symbols = ["🍒", "💎", "💰", "🍀", "☠️"];
    let r1 = document.getElementById('reel-1'); let r2 = document.getElementById('reel-2'); let r3 = document.getElementById('reel-3');
    if(!r1 || !r2 || !r3) { isSpinning = false; return; }
    let spins = 0;
    let spinInterval = setInterval(() => {
        r1.innerText = symbols[Math.floor(Math.random() * symbols.length)]; r2.innerText = symbols[Math.floor(Math.random() * symbols.length)]; r3.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        spins++;
        if(spins > 20) { clearInterval(spinInterval); evaluateSlots(r1.innerText, r2.innerText, r3.innerText); }
    }, 50);
}
function evaluateSlots(s1, s2, s3) {
    isSpinning = false; let resText = "Perdu..."; let resColor = "var(--accent-red)"; let safeGems = isNaN(gems) ? 0 : gems;
    if (s1 === s2 && s2 === s3) {
        playSound('golden'); resColor = "var(--accent-green)";
        if(s1 === "💎") { gems = safeGems + 50; resText = "JACKPOT ! +50 Gemmes"; createExplosion(window.innerWidth/2, window.innerHeight/2, "JACKPOT !"); }
        else if(s1 === "💰") { let warp = totalProductionPerSecond * 3600; currentResources += warp; lifetimeResources += warp; resText = "L'HEURE D'OR ! +1h Prod"; createExplosion(window.innerWidth/2, window.innerHeight/2, "MEGA PROFIT !"); }
        else if(s1 === "🍒") { gems = safeGems + 5; if(typeof mysteryEggs !== 'undefined') mysteryEggs++; resText = "Bien joué ! +5 💎 et 1 Œuf 🥚 !"; } 
        else if(s1 === "🍀") { tryDropArtefact(true); resText = "NOUVEL ARTEFACT !"; }
        else if(s1 === "☠️") { resText = "La Faucheuse... Rien."; resColor = "var(--accent-red)"; playSound('bad'); }
    } else if (s1 === s2 || s2 === s3 || s1 === s3) { gems = safeGems + 1; resText = "Remboursé (1 Gemme)"; resColor = "var(--highlight-yellow)"; } else { playSound('bad'); }
    let resDiv = document.getElementById('slot-result'); if(resDiv) { resDiv.innerText = resText; resDiv.style.color = resColor; } updateUI();
}
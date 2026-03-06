const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
function formatNumber(num) {
    if (isNaN(num) || num === null || num === undefined || !isFinite(num)) return "0";
    if (num < 1000) return Math.floor(num).toString();
    let tier = Math.floor(Math.log10(num) / 3);
    if (tier >= suffixes.length) return num.toExponential(2);
    return (num / Math.pow(10, tier * 3)).toFixed(2) + " " + suffixes[tier];
}

function formatTimeLabel(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0 s";
    seconds = Math.floor(seconds);
    if (seconds < 60) return `${seconds} s`;
    if (seconds < 3600) return `${Math.floor(seconds/60)} min ${seconds%60} s`;
    return `${Math.floor(seconds/3600)} h ${Math.floor((seconds%3600)/60)} min`;
}

function getPurchaseDetails(b) {
    if (!b) return { amount: 0, cost: 0 };
    if (b.id === "galaxy") return { amount: 1, cost: b.baseCost }; 
    
    let costModifier = 1.0;
    if (typeof prestigeSkills !== 'undefined') {
        if (prestigeSkills.find(s => s.id === "skill_cost_3")?.purchased) costModifier *= 0.7; 
        else if (prestigeSkills.find(s => s.id === "skill_cost_2")?.purchased) costModifier *= 0.8; 
        else if (prestigeSkills.find(s => s.id === "skill_cost_1")?.purchased) costModifier *= 0.9; 
    }
    if (typeof artefacts !== 'undefined') { let wealthArt = artefacts.find(a => a.id === "art_wealth"); if (wealthArt && wealthArt.equipped) costModifier *= wealthArt.val; }
    if (typeof currentFaction !== 'undefined' && currentFaction === 1) costModifier *= 0.8;

    let trueBase = b.baseCost * costModifier; let r = b.rate; let k = isNaN(b.owned) ? 0 : b.owned; let amountToBuy = 0; let totalCost = 0;
    let safeResources = (isNaN(currentResources) || !isFinite(currentResources)) ? 0 : currentResources;

    if (typeof buyMultiplier !== 'undefined' && buyMultiplier === "MAX") {
        let costOfNext = trueBase * Math.pow(r, k);
        if (safeResources < costOfNext) return { amount: 1, cost: costOfNext }; 
        let calc = Math.log( safeResources * (r - 1) / (trueBase * Math.pow(r, k)) + 1 ) / Math.log(r);
        amountToBuy = Math.floor(isNaN(calc) ? 1 : calc);
        if (amountToBuy > 1000000) amountToBuy = 1000000; if (amountToBuy < 1) amountToBuy = 1;
        totalCost = trueBase * Math.pow(r, k) * (Math.pow(r, amountToBuy) - 1) / (r - 1);
        if (totalCost > safeResources) { amountToBuy--; totalCost = trueBase * Math.pow(r, k) * (Math.pow(r, amountToBuy) - 1) / (r - 1); if (amountToBuy <= 0) { amountToBuy = 1; totalCost = trueBase * Math.pow(r, k); } }
    } else {
        amountToBuy = typeof buyMultiplier !== 'undefined' ? buyMultiplier : 1;
        totalCost = trueBase * Math.pow(r, k) * (Math.pow(r, amountToBuy) - 1) / (r - 1);
    }
    return { amount: amountToBuy, cost: totalCost };
}

function getPendingPrestigePoints() { 
    let safeLife = typeof lifetimeResources !== 'undefined' && !isNaN(lifetimeResources) ? lifetimeResources : 0;
    let safeThresh = typeof prestigeThreshold !== 'undefined' ? prestigeThreshold : 1000;
    if (safeLife <= 0) return 0;
    let safePrestige = typeof prestigePoints !== 'undefined' && !isNaN(prestigePoints) ? prestigePoints : 0;
    let p = Math.floor(Math.sqrt(safeLife / safeThresh)) - safePrestige; 
    let spentPoints = typeof prestigeSkills !== 'undefined' ? prestigeSkills.reduce((sum, skill) => skill.purchased ? sum + skill.cost : sum, 0) : 0;
    p -= spentPoints; return p > 0 ? p : 0; 
}

function recalculateProduction() {
    let total = 0;
    if (typeof buildings !== 'undefined') {
        for (let i = 0; i < buildings.length; i++) {
            let b = buildings[i]; if (!b || isNaN(b.owned) || b.owned === 0) continue; 
            let upgradeMultiplier = 1.0;
            if (typeof upgrades !== 'undefined') { for (let j = 0; j < upgrades.length; j++) { if (upgrades[j].isPurchased && upgrades[j].targetId === b.id) upgradeMultiplier *= upgrades[j].multiplier; } }
            let safeLevel = isNaN(b.level) ? 1 : b.level; let levelMultiplier = Math.pow(1.5, safeLevel - 1); let synergyMultiplier = 1.0;
            if (b.synergy) {
                let targetBuilding = buildings.find(target => target.id === b.synergy.targetId);
                if (targetBuilding && !isNaN(targetBuilding.owned) && targetBuilding.owned > 0) {
                    let sBonus = targetBuilding.owned * b.synergy.bonusPerOwned; if (typeof currentFaction !== 'undefined' && currentFaction === 3) sBonus *= 2; synergyMultiplier += sBonus;
                }
            }
            total += (b.baseProduction * b.owned) * levelMultiplier * upgradeMultiplier * synergyMultiplier;
        }
    }

    let safePrestige = typeof prestigePoints !== 'undefined' && !isNaN(prestigePoints) ? prestigePoints : 0;
    let spentPoints = typeof prestigeSkills !== 'undefined' ? prestigeSkills.reduce((sum, skill) => skill.purchased ? sum + skill.cost : sum, 0) : 0;
    let unspentPoints = safePrestige - spentPoints;
    let pBonus = typeof prestigeBonusPerPoint !== 'undefined' ? prestigeBonusPerPoint : 0.02;
    let aBonus = typeof achievementBonus !== 'undefined' ? achievementBonus : 0.01;
    let achCount = typeof achievements !== 'undefined' ? achievements.filter(a => a.unlocked).length : 0;
    let globalMultiplier = 1 + ((isNaN(unspentPoints) ? 0 : unspentPoints) * pBonus) + (achCount * aBonus);
    
    let safeFloor = typeof towerFloor !== 'undefined' && !isNaN(towerFloor) ? towerFloor : 1; globalMultiplier += (safeFloor - 1) * 0.01;
    if (typeof artefacts !== 'undefined') { let timeArt = artefacts.find(a => a.id === "art_time"); if (timeArt && timeArt.equipped) globalMultiplier *= timeArt.val; }
    if (typeof weathers !== 'undefined') { let safeWeatherIndex = typeof currentWeatherIndex !== 'undefined' && !isNaN(currentWeatherIndex) ? currentWeatherIndex : 0; let weatherBonus = weathers[safeWeatherIndex] ? weathers[safeWeatherIndex].bonus : 1.0; globalMultiplier *= weatherBonus; }
    if (typeof gardenBuffTimer !== 'undefined' && gardenBuffTimer > 0) globalMultiplier *= 2.0;
    if (typeof darkUpgrades !== 'undefined' && darkUpgrades[0].purchased) globalMultiplier *= 3.0;
    if (typeof equippedPet !== 'undefined' && equippedPet !== null) { let actPet = pets.find(p => p.id === equippedPet); if(actPet && actPet.type === "prod") globalMultiplier *= actPet.val; }
    if (typeof mgLevel !== 'undefined' && mgLevel >= 5) globalMultiplier *= 1.1; 

    if (typeof prestigeSkills !== 'undefined') {
        if (prestigeSkills.find(s => s.id === "skill_ultimate")?.purchased) globalMultiplier *= 5.0; 
        else if (prestigeSkills.find(s => s.id === "skill_prod_2")?.purchased) globalMultiplier *= 2.0; 
        else if (prestigeSkills.find(s => s.id === "skill_prod_1")?.purchased) globalMultiplier *= 1.5; 
    }

    totalProductionPerSecond = total * globalMultiplier;
    
    let clickMultiplier = 1;
    if (typeof prestigeSkills !== 'undefined') {
        if (prestigeSkills.find(s => s.id === "skill_crit")?.purchased) clickMultiplier = 10;
        else if (prestigeSkills.find(s => s.id === "skill_click_2")?.purchased) clickMultiplier = 5;
        else if (prestigeSkills.find(s => s.id === "skill_click_1")?.purchased) clickMultiplier = 2;
    }
    
    if (typeof artefacts !== 'undefined') { let powerArt = artefacts.find(a => a.id === "art_power"); if (powerArt && powerArt.equipped) clickMultiplier *= powerArt.val; }
    if (typeof currentFaction !== 'undefined' && currentFaction === 2) clickMultiplier *= 5;
    if (typeof equippedPet !== 'undefined' && equippedPet !== null) { let actPet = pets.find(p => p.id === equippedPet); if(actPet && actPet.type === "click") clickMultiplier *= actPet.val; }
    if (typeof mgLevel !== 'undefined' && mgLevel >= 15) clickMultiplier *= 2.0; 

    let bClickVal = typeof baseClickValue !== 'undefined' ? baseClickValue : 1;
    dynamicClickValue = (bClickVal * clickMultiplier) + (totalProductionPerSecond * 0.02);

    let prodEl = document.getElementById('production'); if(prodEl) prodEl.innerText = formatNumber(totalProductionPerSecond) + " / sec";
    let clickEl = document.getElementById('click-power'); if(clickEl) clickEl.innerText = "Puissance du clic : +" + formatNumber(dynamicClickValue);

    let currentRankName = "Mendiant";
    if (typeof playerRanks !== 'undefined') {
        currentRankName = playerRanks[0].name; let safeLifeRank = typeof lifetimeResources !== 'undefined' && !isNaN(lifetimeResources) ? lifetimeResources : 0;
        for(let i=0; i < playerRanks.length; i++) { if(safeLifeRank >= playerRanks[i].threshold) currentRankName = playerRanks[i].name; }
    }
    let rankEl = document.getElementById('player-rank'); if(rankEl) rankEl.innerText = currentRankName;
}
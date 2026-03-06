function saveGame() {
    try {
        let saveData = {
            resources: currentResources, lifetimeResources: lifetimeResources, prestigePoints: prestigePoints, totalClicks: totalClicks, goldenClicks: goldenClicks,
            timePlayedSeconds: timePlayedSeconds, ascensionCount: ascensionCount, isMuted: isMuted, gems: gems, hasWon: hasWon, buyMultiplier: buyMultiplier,
            currentWeatherIndex: currentWeatherIndex, 
            missionsProgress: typeof missions !== 'undefined' ? missions.map(m => m.progress) : [], 
            missionsLevel: typeof missions !== 'undefined' ? missions.map(m => m.level) : [], 
            missionsTarget: typeof missions !== 'undefined' ? missions.map(m => m.target) : [], 
            missionsReward: typeof missions !== 'undefined' ? missions.map(m => m.reward) : [],
            buildingsOwned: typeof buildings !== 'undefined' ? buildings.map(b => b.owned) : [], 
            buildingsLevels: typeof buildings !== 'undefined' ? buildings.map(b => b.level) : [], 
            upgradesPurchased: typeof upgrades !== 'undefined' ? upgrades.map(u => u.isPurchased) : [], 
            achievementsUnlocked: typeof achievements !== 'undefined' ? achievements.map(a => a.unlocked) : [], 
            skillsPurchased: typeof prestigeSkills !== 'undefined' ? prestigeSkills.map(s => s.purchased) : [],
            stocksShares: typeof stocks !== 'undefined' ? stocks.map(s => s.shares) : [], 
            stocksAvgCost: typeof stocks !== 'undefined' ? stocks.map(s => s.avgCost) : [], 
            stocksHistory: typeof stocks !== 'undefined' ? stocks.map(s => s.history) : [],
            artefactsOwned: typeof artefacts !== 'undefined' ? artefacts.map(a => a.owned) : [], 
            equippedSlots: typeof equippedSlots !== 'undefined' ? equippedSlots : [null, null],
            managersPurchased: typeof managers !== 'undefined' ? managers.map(m => m.purchased) : [],
            expeditionsData: typeof expeditions !== 'undefined' ? expeditions.map(e => ({active: e.active, startTime: e.startTime, endTime: e.endTime})) : [],
            gardenPlotsData: typeof gardenPlots !== 'undefined' ? gardenPlots : [],
            gardenBuffTimer: typeof gardenBuffTimer !== 'undefined' ? gardenBuffTimer : 0,
            currentFaction: typeof currentFaction !== 'undefined' ? currentFaction : 0,
            towerFloor: typeof towerFloor !== 'undefined' ? towerFloor : 1,
            bossHP: typeof bossHP !== 'undefined' ? bossHP : 1000, 
            bossMaxHP: typeof bossMaxHP !== 'undefined' ? bossMaxHP : 1000,
            bossTimer: typeof bossTimer !== 'undefined' ? bossTimer : 30, 
            darkMatter: typeof darkMatter !== 'undefined' ? darkMatter : 0, 
            transcendCount: typeof transcendCount !== 'undefined' ? transcendCount : 0,
            darkUpgrades: typeof darkUpgrades !== 'undefined' ? darkUpgrades.map(u => u.purchased) : [],
            mysteryEggs: typeof mysteryEggs !== 'undefined' ? mysteryEggs : 0,
            incubator: typeof incubator !== 'undefined' ? incubator : { active: false, readyTime: 0 },
            equippedPet: typeof equippedPet !== 'undefined' ? equippedPet : null,
            petsOwned: typeof pets !== 'undefined' ? pets.map(p => p.owned) : [],
            petsLevels: typeof pets !== 'undefined' ? pets.map(p => p.level) : [],
            petsVals: typeof pets !== 'undefined' ? pets.map(p => p.val) : [],
            mgLevel: typeof mgLevel !== 'undefined' ? mgLevel : 1,
            mgXP: typeof mgXP !== 'undefined' ? mgXP : 0,
            lastSaveTime: Date.now() 
        };
        localStorage.setItem('monJeuIdleSaveV12', JSON.stringify(saveData));
    } catch(e) { console.error("Impossible de sauvegarder", e); }
}

function loadGame() {
    try {
        let savedString = localStorage.getItem('monJeuIdleSaveV12') || localStorage.getItem('monJeuIdleSaveV11') || localStorage.getItem('monJeuIdleSaveV10') || localStorage.getItem('monJeuIdleSaveV9');
        if (savedString !== null) {
            let s = JSON.parse(savedString); 
            
            currentResources = isNaN(s.resources) || s.resources === null ? 0 : Number(s.resources);
            lifetimeResources = isNaN(s.lifetimeResources) || s.lifetimeResources === null ? 0 : Number(s.lifetimeResources);
            prestigePoints = isNaN(s.prestigePoints) || s.prestigePoints === null ? 0 : Number(s.prestigePoints);
            totalClicks = isNaN(s.totalClicks) ? 0 : Number(s.totalClicks);
            goldenClicks = isNaN(s.goldenClicks) ? 0 : Number(s.goldenClicks);
            timePlayedSeconds = isNaN(s.timePlayedSeconds) ? 0 : Number(s.timePlayedSeconds);
            ascensionCount = isNaN(s.ascensionCount) ? 0 : Number(s.ascensionCount);
            isMuted = s.isMuted || false;
            gems = isNaN(s.gems) ? 0 : Number(s.gems);
            hasWon = s.hasWon || false;
            buyMultiplier = s.buyMultiplier || 1;
            currentWeatherIndex = isNaN(s.currentWeatherIndex) ? 0 : Number(s.currentWeatherIndex);
            currentFaction = isNaN(s.currentFaction) ? 0 : Number(s.currentFaction);
            towerFloor = isNaN(s.towerFloor) || s.towerFloor === 0 ? 1 : Number(s.towerFloor);
            bossMaxHP = isNaN(s.bossMaxHP) || s.bossMaxHP === 0 ? 1000 : Number(s.bossMaxHP);
            bossHP = isNaN(s.bossHP) ? 1000 : Number(s.bossHP);
            bossTimer = isNaN(s.bossTimer) ? 30 : Number(s.bossTimer);
            darkMatter = isNaN(s.darkMatter) ? 0 : Number(s.darkMatter);
            transcendCount = isNaN(s.transcendCount) ? 0 : Number(s.transcendCount);
            mysteryEggs = isNaN(s.mysteryEggs) ? 0 : Number(s.mysteryEggs);
            if(s.incubator) incubator = s.incubator;
            equippedPet = s.equippedPet || null;
            mgLevel = isNaN(s.mgLevel) ? 1 : Number(s.mgLevel);
            mgXP = isNaN(s.mgXP) ? 0 : Number(s.mgXP);

            let muteBtn = document.getElementById('btn-mute');
            if (isMuted && muteBtn) { muteBtn.innerText = "🔇 Son: OFF"; muteBtn.style.background = "#c0392b"; muteBtn.style.borderColor = "#e74c3c"; }

            if(typeof buildings !== 'undefined') buildings.forEach((b, i) => { 
                b.owned = (s.buildingsOwned && !isNaN(s.buildingsOwned[i])) ? Number(s.buildingsOwned[i]) : 0;
                b.level = (s.buildingsLevels && !isNaN(s.buildingsLevels[i])) ? Number(s.buildingsLevels[i]) : 1;
            });
            if(typeof upgrades !== 'undefined') upgrades.forEach((u, i) => { if(s.upgradesPurchased && s.upgradesPurchased[i]) u.isPurchased = s.upgradesPurchased[i]; });
            if(typeof achievements !== 'undefined') achievements.forEach((a, i) => { if(s.achievementsUnlocked && s.achievementsUnlocked[i]) a.unlocked = s.achievementsUnlocked[i]; });
            
            if(typeof prestigeSkills !== 'undefined') {
                if(s.skillsPurchased && s.skillsPurchased.length === prestigeSkills.length) {
                    prestigeSkills.forEach((skill, i) => { skill.purchased = s.skillsPurchased[i]; });
                } else {
                    prestigeSkills.forEach(skill => skill.purchased = false); 
                }
            }

            if(typeof darkUpgrades !== 'undefined') darkUpgrades.forEach((u, i) => { if(s.darkUpgrades && s.darkUpgrades[i]) u.purchased = s.darkUpgrades[i]; });
            if(typeof pets !== 'undefined') pets.forEach((p, i) => { 
                if(s.petsOwned && s.petsOwned[i]) p.owned = s.petsOwned[i]; 
                if(s.petsLevels && s.petsLevels[i]) p.level = s.petsLevels[i];
                if(s.petsVals && s.petsVals[i]) p.val = s.petsVals[i];
            });
            if(typeof stocks !== 'undefined') stocks.forEach((stk, i) => { 
                stk.shares = (s.stocksShares && !isNaN(s.stocksShares[i])) ? Number(s.stocksShares[i]) : 0; 
                stk.avgCost = (s.stocksAvgCost && !isNaN(s.stocksAvgCost[i])) ? Number(s.stocksAvgCost[i]) : 0; 
                if(s.stocksHistory && Array.isArray(s.stocksHistory[i]) && s.stocksHistory[i].length === 20) stk.history = s.stocksHistory[i]; 
            });
            if(typeof artefacts !== 'undefined') artefacts.forEach((art, i) => { if(s.artefactsOwned && s.artefactsOwned[i]) art.owned = s.artefactsOwned[i]; });
            if(typeof equippedSlots !== 'undefined' && s.equippedSlots && Array.isArray(s.equippedSlots)) {
                for(let i=0; i<s.equippedSlots.length; i++) {
                    let id = s.equippedSlots[i];
                    if (id) { let found = artefacts.find(a => a.id === id); if(found) { found.equipped = true; equippedSlots[i] = id; } else { equippedSlots[i] = null; } }
                }
            }
            if(typeof missions !== 'undefined') missions.forEach((m, i) => { 
                if(s.missionsProgress && s.missionsProgress[i] !== undefined) { 
                    m.progress = isNaN(s.missionsProgress[i]) ? 0 : Number(s.missionsProgress[i]); 
                    m.level = isNaN(s.missionsLevel[i]) ? 1 : Number(s.missionsLevel[i]); 
                    m.target = isNaN(s.missionsTarget[i]) ? 500 : Number(s.missionsTarget[i]); 
                    m.reward = isNaN(s.missionsReward[i]) ? 1 : Number(s.missionsReward[i]); 
                } 
            });
            if(typeof managers !== 'undefined') managers.forEach((m, i) => { if(s.managersPurchased && s.managersPurchased[i]) m.purchased = s.managersPurchased[i]; });
            if(typeof expeditions !== 'undefined') expeditions.forEach((e, i) => { 
                if(s.expeditionsData && s.expeditionsData[i]) { e.active = s.expeditionsData[i].active; e.startTime = s.expeditionsData[i].startTime; e.endTime = s.expeditionsData[i].endTime; }
            });
            if(typeof gardenPlots !== 'undefined' && s.gardenPlotsData) { for(let i=0; i<4; i++) { if(s.gardenPlotsData[i]) gardenPlots[i] = s.gardenPlotsData[i]; } }
            gardenBuffTimer = isNaN(s.gardenBuffTimer) ? 0 : Number(s.gardenBuffTimer);

            if(typeof weathers !== 'undefined') {
                let w = weathers[currentWeatherIndex] || weathers[0]; let wIcon = document.getElementById('weather-icon');
                if(wIcon) { wIcon.innerText = w.icon; let wn = document.getElementById('weather-name'); if(wn) { wn.innerText = w.name; wn.style.color = w.color; } let wd = document.getElementById('weather-desc'); if(wd) wd.innerText = w.desc; }
            }

            let timeAwayInSeconds = (Date.now() - (isNaN(s.lastSaveTime) ? Date.now() : s.lastSaveTime)) / 1000; 
            let maxOfflineSeconds = 24 * 60 * 60; let wasCapped = false;
            if (timeAwayInSeconds > maxOfflineSeconds) { timeAwayInSeconds = maxOfflineSeconds; wasCapped = true; }
            if (typeof gardenBuffTimer !== 'undefined' && gardenBuffTimer > 0) { gardenBuffTimer -= timeAwayInSeconds; if (gardenBuffTimer < 0) gardenBuffTimer = 0; }
            if(typeof incubator !== 'undefined' && incubator.active) { incubator.readyTime -= (timeAwayInSeconds * 1000); }

            window.pendingOfflineSeconds = isNaN(timeAwayInSeconds) ? 0 : timeAwayInSeconds;
            window.pendingOfflineCapped = wasCapped;
            
        } else {
            if(typeof prestigeSkills !== 'undefined') { let startSkill = prestigeSkills.find(s => s.id === "skill_start"); if (startSkill && startSkill.purchased) { currentResources = 1000; lifetimeResources = 1000; } }
        }
    } catch(err) { console.error("Erreur fatale dans LoadGame : " + err.message); }
}

function closeOfflineModal() { let md = document.getElementById('offline-modal'); if(md) md.classList.add('hidden'); }
function exportSave() { saveGame(); let saveString = localStorage.getItem('monJeuIdleSaveV12'); if (saveString) prompt("Copiez (Ctrl+C) :", btoa(saveString)); }
function importSave() { let saveCode = prompt("Collez votre code :"); if (saveCode) { try { JSON.parse(atob(saveCode)); localStorage.setItem('monJeuIdleSaveV12', atob(saveCode)); location.reload(); } catch (e) { alert("Code invalide !"); } } }
function hardReset() { if(confirm("Effacer tout ?")) { localStorage.clear(); location.reload(); } }

/* ==========================================
   1. DONNÉES DU JEU (VARIABLES GLOBALES)
========================================== */
let currentResources = 0;
let totalProductionPerSecond = 0;
let baseClickValue = 1;
let dynamicClickValue = 1;
let totalClicks = 0;
let lifetimeResources = 0;
let prestigePoints = 0;
let goldenClicks = 0;
let timePlayedSeconds = 0;
let ascensionCount = 0;
let isMuted = false;
let gems = 0; 
let isSpinning = false; 
let hasWon = false;
let buyMultiplier = 1;
let lastBossAnimTime = 0; 
let lastLotteryTime = 0; // Heure du dernier tirage de la loterie

const prestigeBonusPerPoint = 0.02;
const achievementBonus = 0.01;
const prestigeThreshold = 1000000;

// Mini-Jeu
let mgLevel = 1;
let mgXP = 0;
let mgCooldown = 0;
let mgActive = false;
let mgHits = 0;
let mgTime = 0;
let mgTimerInterval = null;

const mgMilestones = [
    { level: 2, desc: "Récompenses Mini-Jeu +50%", type: "mg_reward", val: 1.5 },
    { level: 5, desc: "Production Globale +10%", type: "prod", val: 1.1 },
    { level: 10, desc: "Temps du Mini-Jeu passe à 15s", type: "mg_time", val: 15 },
    { level: 15, desc: "Puissance du Clic x2", type: "click", val: 2 },
    { level: 20, desc: "Dégâts Tour x2", type: "tower", val: 2 }
];

function getMgXPNeeded() {
    return Math.floor(100 * Math.pow(1.5, mgLevel - 1));
}

// Quêtes Journalières
let lastDailyReset = 0; 
let dailyQuests = [
    { id: "dq_click", desc: "Faire 500 clics manuels", target: 500, progress: 0, reward: 5, completed: false },
    { id: "dq_buy", desc: "Acheter 15 bâtiments", target: 15, progress: 0, reward: 10, completed: false },
    { id: "dq_golden", desc: "Attraper 2 bonus dorés", target: 2, progress: 0, reward: 15, completed: false }
];

// Familiers & Écloserie
let mysteryEggs = 0;
let incubator = { active: false, readyTime: 0 };
let equippedPet = null;

const pets = [
    { id: "pet_slime", name: "Slime Doré", icon: "🍮", rarity: "Commun", type: "prod", level: 1, baseVal: 1.5, growth: 0.1, val: 1.5, owned: false },
    { id: "pet_robot", name: "Robot-Clic", icon: "🤖", rarity: "Rare", type: "click", level: 1, baseVal: 3.0, growth: 0.5, val: 3.0, owned: false },
    { id: "pet_dragon", name: "Dragonnet", icon: "🐉", rarity: "Légendaire", type: "tower", level: 1, baseVal: 2.0, growth: 0.5, val: 2.0, owned: false }
];

// Tour & Factions
let currentFaction = 0;
let towerFloor = 1;
let bossMaxHP = 1000;
let bossHP = 1000;
let bossTimerMax = 30;
let bossTimer = 30;
let darkMatter = 0;
let transcendCount = 0;

const darkUpgrades = [
    { id: "dm_prod", name: "Énergie Sombre", desc: "Production Globale x3", cost: 1, purchased: false },
    { id: "dm_time", name: "Distorsion Temporelle", desc: "Le temps passe 20% plus vite", cost: 3, purchased: false },
    { id: "dm_gems", name: "Cristallisation", desc: "Missions donnent le double de Gemmes", cost: 5, purchased: false }
];

// Jardin & Expéditions
let gardenBuffTimer = 0;
const gardenPlots = [
    { id: 0, state: 0, readyTime: 0 },
    { id: 1, state: 0, readyTime: 0 },
    { id: 2, state: 0, readyTime: 0 },
    { id: 3, state: 0, readyTime: 0 }
];

const expeditions = [
    { id: "exp_1", name: "Forêt de Jade", icon: "🌲", durationSec: 3600, rewardDesc: "5 💎 + 20% Œuf", active: false, endTime: 0 },
    { id: "exp_2", name: "Mines Oubliées", icon: "⛰️", durationSec: 14400, rewardDesc: "25 💎 + 50% Œuf", active: false, endTime: 0 },
    { id: "exp_3", name: "Temple Céleste", icon: "🏛️", durationSec: 28800, rewardDesc: "50 💎 + Œuf Garanti", active: false, endTime: 0 }
];

// Météo & News
let currentWeatherIndex = 0;
const weathers = [
    { name: "Ciel Dégagé", bonus: 1.0, color: "#f1c40f", icon: "☀️", desc: "Production normale (x1.0)" },
    { name: "Pluie Dorée", bonus: 1.5, color: "#e1b12c", icon: "🌧️", desc: "Production accrue (x1.5)" },
    { name: "Éclipse Noire", bonus: 0.7, color: "#8e44ad", icon: "🌑", desc: "Production réduite (x0.7)" },
    { name: "Tempête de Clics", bonus: 2.0, color: "#e84118", icon: "⚡", desc: "Production doublée (x2.0)" }
];

const newsMessages = [
    "La Bourse s'affole : investissez intelligemment !",
    "L'Écloserie vient d'ouvrir : trouvez des œufs mystères !",
    "Attention aux Boss Épiques (💀) de la Tour !"
];

// Rangs & Missions
const playerRanks = [
    { name: "Mendiant", threshold: 0 }, { name: "Paysan", threshold: 500 }, { name: "Artisan", threshold: 5000 },
    { name: "Marchand", threshold: 50000 }, { name: "Noble", threshold: 1000000 }, { name: "Roi", threshold: 50000000 },
    { name: "Empereur", threshold: 1000000000 }, { name: "Maître Galactique", threshold: 1000000000000 }
];

const missions = [
    { id: "m_click", name: "Frénésie de Clics", desc: "Faire des clics manuels", target: 500, progress: 0, reward: 1, level: 1 },
    { id: "m_buy", name: "Magnat de l'Immo", desc: "Acheter des bâtiments", target: 50, progress: 0, reward: 2, level: 1 },
    { id: "m_golden", name: "Chasseur de Trésor", desc: "Bonus dorés attrapés", target: 3, progress: 0, reward: 3, level: 1 }
];

// Bourse & Artefacts
const stocks = [
    { id: "stk_click", name: "ClickCorp", price: 5000, basePrice: 5000, shares: 0, avgCost: 0, vol: 0.08, trend: 0, history: Array(20).fill(5000) },
    { id: "stk_farm", name: "AgriTech", price: 250000, basePrice: 250000, shares: 0, avgCost: 0, vol: 0.20, trend: 0, history: Array(20).fill(250000) },
    { id: "stk_mine", name: "DeepMine", price: 10000000, basePrice: 10000000, shares: 0, avgCost: 0, vol: 0.40, trend: 0, history: Array(20).fill(10000000) }
];

const artefacts = [
    { id: "art_time", name: "Sablier Céleste", icon: "⏳", desc: "Production x2", owned: false, equipped: false, type: "prod", val: 2 },
    { id: "art_power", name: "Gant de Titan", icon: "🥊", desc: "Clic x3", owned: false, equipped: false, type: "click", val: 3 },
    { id: "art_wealth", name: "Bourse Magique", icon: "💰", desc: "Prix -20%", owned: false, equipped: false, type: "cost", val: 0.8 },
    { id: "art_luck", name: "Trèfle à 4 Feuilles", icon: "🍀", desc: "Bonus Doré x2", owned: false, equipped: false, type: "gold", val: 2 }
];
let equippedSlots = [null, null];

// Bâtiments
const buildings = [
    { id: "cursor", icon: "🖱️", name: "Curseur", baseCost: 15, baseProduction: 0.1, owned: 0, rate: 1.10, level: 1 },
    { id: "grandma", icon: "👵", name: "Grand-Mère", baseCost: 100, baseProduction: 1.0, owned: 0, rate: 1.12, level: 1, synergy: { targetId: "grandma", bonusPerOwned: 0.02, description: "+2% par GM" } },
    { id: "farm", icon: "🌾", name: "Ferme", baseCost: 1100, baseProduction: 8.0, owned: 0, rate: 1.15, level: 1, synergy: { targetId: "grandma", bonusPerOwned: 0.02, description: "+2% par GM" } },
    { id: "mine", icon: "⛏️", name: "Mine", baseCost: 12000, baseProduction: 47.0, owned: 0, rate: 1.15, level: 1, synergy: { targetId: "cursor", bonusPerOwned: 0.01, description: "+1% par Curseur" } },
    { id: "factory", icon: "🏭", name: "Usine", baseCost: 130000, baseProduction: 260.0, owned: 0, rate: 1.15, level: 1, synergy: { targetId: "mine", bonusPerOwned: 0.05, description: "+5% par Mine" } },
    { id: "bank", icon: "🏦", name: "Banque", baseCost: 1400000, baseProduction: 1400.0, owned: 0, rate: 1.15, level: 1 },
    { id: "temple", icon: "🏛️", name: "Temple", baseCost: 20000000, baseProduction: 7800.0, owned: 0, rate: 1.15, level: 1, synergy: { targetId: "grandma", bonusPerOwned: 0.10, description: "+10% par GM" } },
    { id: "portal", icon: "🌀", name: "Portail", baseCost: 330000000, baseProduction: 45000.0, owned: 0, rate: 1.15, level: 1 },
    { id: "dyson", icon: "☀️", name: "Dyson", baseCost: 5100000000, baseProduction: 300000.0, owned: 0, rate: 1.15, level: 1 },
    { id: "wormhole", icon: "🕳️", name: "Trou Ver", baseCost: 75000000000, baseProduction: 2500000.0, owned: 0, rate: 1.15, level: 1 },
    { id: "engine", icon: "🚀", name: "Stellaire", baseCost: 1000000000000, baseProduction: 20000000.0, owned: 0, rate: 1.25, level: 1 },
    { id: "galaxy", icon: "🌌", name: "Galaxie", baseCost: 1e18, baseProduction: 0, owned: 0, rate: 1, level: 1 }
];

// Améliorations
const upgrades = [
    { id: "upg_cursor1", icon: "🖱️", name: "Souris Ergo", desc: "Curseurs x2.", cost: 100, targetId: "cursor", multiplier: 2.0, isPurchased: false, reqBuilding: "cursor", reqCount: 1 },
    { id: "upg_cursor2", icon: "🖱️", name: "Clic Renforcé", desc: "Curseurs x2.", cost: 500, targetId: "cursor", multiplier: 2.0, isPurchased: false, reqBuilding: "cursor", reqCount: 10 },
    { id: "upg_cursor3", icon: "🖱️", name: "Molette Magique", desc: "Curseurs x2.", cost: 10000, targetId: "cursor", multiplier: 2.0, isPurchased: false, reqBuilding: "cursor", reqCount: 50 },
    { id: "upg_grandma1", icon: "👵", name: "Rouleau en Fer", desc: "Grand-mères x2.", cost: 1000, targetId: "grandma", multiplier: 2.0, isPurchased: false, reqBuilding: "grandma", reqCount: 1 },
    { id: "upg_grandma2", icon: "👵", name: "Laine en Titane", desc: "Grand-mères x2.", cost: 5000, targetId: "grandma", multiplier: 2.0, isPurchased: false, reqBuilding: "grandma", reqCount: 10 },
    { id: "upg_farm1", icon: "🌾", name: "Engrais Magique", desc: "Fermes x2.", cost: 11000, targetId: "farm", multiplier: 2.0, isPurchased: false, reqBuilding: "farm", reqCount: 1 },
    { id: "upg_mine1", icon: "⛏️", name: "Pioche Diamant", desc: "Mines x2.", cost: 120000, targetId: "mine", multiplier: 2.0, isPurchased: false, reqBuilding: "mine", reqCount: 1 },
    { id: "upg_factory1", icon: "🏭", name: "Automatisation", desc: "Usines x2.", cost: 1300000, targetId: "factory", multiplier: 2.0, isPurchased: false, reqBuilding: "factory", reqCount: 1 },
    { id: "upg_bank1", icon: "🏦", name: "Coffre-fort Lourd", desc: "Banques x2.", cost: 14000000, targetId: "bank", multiplier: 2.0, isPurchased: false, reqBuilding: "bank", reqCount: 1 },
    { id: "upg_portal1", icon: "🌀", name: "Vortex Stable", desc: "Portails x2.", cost: 3300000000, targetId: "portal", multiplier: 2.0, isPurchased: false, reqBuilding: "portal", reqCount: 1 },
    { id: "upg_dyson1", icon: "☀️", name: "Panneaux Purs", desc: "Dyson x2.", cost: 51000000000, targetId: "dyson", multiplier: 2.0, isPurchased: false, reqBuilding: "dyson", reqCount: 1 }
];

const managers = [
    { id: "mgr_cursor", name: "Chef de Projet", icon: "👨‍💼", desc: "Gère les Curseurs", cost: 10000, currency: "res", target: "cursor", purchased: false },
    { id: "mgr_farm", name: "Agriculteur", icon: "👩‍🌾", desc: "Gère les Fermes", cost: 5000000, currency: "res", target: "farm", purchased: false },
    { id: "mgr_mine", name: "Contremaître", icon: "👷‍♂️", desc: "Gère les Mines", cost: 500000000, currency: "res", target: "mine", purchased: false },
    { id: "mgr_bank", name: "Directeur", icon: "🤵", desc: "Gère les Banques", cost: 10000000000, currency: "res", target: "bank", purchased: false },
    { id: "mgr_gold", name: "Faucon Doré", icon: "🦅", desc: "Attrape les Bonus Dorés.", cost: 20, currency: "gem", target: "gold", purchased: false }
];


const achievements = [
    { id: "ach1", icon: "👆", name: "Doigt Musclé", desc: "Cliquer 100 fois", unlocked: false, condition: () => totalClicks >= 100 },
    { id: "ach2", icon: "🏗️", name: "Bâtisseur", desc: "Acheter un bâtiment", unlocked: false, condition: () => buildings.some(b => b.owned > 0) },
    { id: "ach3", icon: "💎", name: "Riche", desc: "Gagner 10 Gemmes", unlocked: false, condition: () => gems >= 10 },
    { id: "ach4", icon: "🛡️", name: "Garde", desc: "Repousser un voleur", unlocked: false, condition: () => false },
    { id: "ach5", icon: "🏭", name: "Industriel", desc: "Posséder une Usine", unlocked: false, condition: () => { let fac = buildings.find(b => b.id === "factory"); return fac && fac.owned >= 1; } },
    { id: "ach6", icon: "🙏", name: "Illumination", desc: "Posséder un Temple", unlocked: false, condition: () => { let tmp = buildings.find(b => b.id === "temple"); return tmp && tmp.owned >= 1; } },
    { id: "ach7", icon: "🎮", name: "Gamer Pro", desc: "Camp Entraînement Niv. 10", unlocked: false, condition: () => mgLevel >= 10 },
    { id: "ach8", icon: "💻", name: "Hackerman", desc: "Piratage Record Niv. 5", unlocked: false, condition: () => typeof maxSimonLevel !== 'undefined' && maxSimonLevel >= 5 }
];

// Arbre de compétences (RPG)
const prestigeSkills = [
    { id: "skill_start", icon: "🚀", name: "Éveil", desc: "Débloque l'Arbre", cost: 1, purchased: false, reqs: [], x: 600, y: 150 },
    { id: "skill_click_1", icon: "👆", name: "Clic de Fer", desc: "Clic x2", cost: 2, purchased: false, reqs: ["skill_start"], x: 400, y: 350 },
    { id: "skill_prod_1", icon: "⚙️", name: "Rendement", desc: "Prod x1.5", cost: 3, purchased: false, reqs: ["skill_start"], x: 800, y: 350 },
    { id: "skill_cost_1", icon: "🤝", name: "Négociateur", desc: "Prix -10%", cost: 2, purchased: false, reqs: ["skill_start"], x: 600, y: 400 },
    { id: "skill_crit", icon: "🎯", name: "Précision", desc: "Clic x10", cost: 20, purchased: false, reqs: ["skill_click_1"], x: 300, y: 600 },
    { id: "skill_tower_1", icon: "⚔️", name: "Héros", desc: "Dégâts Tour x2", cost: 15, purchased: false, reqs: ["skill_prod_1"], x: 900, y: 600 },
    { id: "skill_ultimate", icon: "👑", name: "Ascension", desc: "Prod x5", cost: 50, purchased: false, reqs: ["skill_crit", "skill_tower_1"], x: 600, y: 800 }
];

/* ==========================================
   2. AUDIO ET PARTICULES
========================================== */
// Chargement des fichiers MP3 (assure-toi que le dossier 'audio' existe !)
const sfx = {
    click: new Audio('audio/click.mp3'),
    buy: new Audio('audio/buy.mp3'),
    achieve: new Audio('audio/achieve.mp3'),
    golden: new Audio('audio/golden.mp3'),
    bad: new Audio('audio/bad.mp3')
};

// Réglage du volume général (0.3 = 30% du volume max)
Object.values(sfx).forEach(audio => audio.volume = 0.3);

function toggleMute() {
    isMuted = !isMuted;
    let btn = document.getElementById('btn-mute');
    if (btn) {
        if (isMuted) { btn.innerText = "🔇 Son: OFF"; btn.style.background = "var(--accent-red)"; btn.style.borderColor = "#c23616"; } 
        else { btn.innerText = "🔊 Son: ON"; btn.style.background = "var(--accent-purple)"; btn.style.borderColor = "#831d96"; }
    }
    saveGame();
}

function playSound(type) {
    if (isMuted || !sfx[type]) return;
    // On clone le son pour pouvoir le jouer en rafale sans qu'il se coupe !
    let soundClone = sfx[type].cloneNode();
    soundClone.volume = sfx[type].volume;
    soundClone.play().catch(e => {}); // Le catch évite les erreurs si le navigateur bloque l'audio
}


const canvas = document.getElementById('particle-canvas'); 
const ctx = canvas ? canvas.getContext('2d') : null; 
let particlesArray = [];

function resizeCanvas() { 
    if(!canvas) return; 
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
}
if(canvas) { 
    window.addEventListener('resize', resizeCanvas); 
    resizeCanvas(); 
}

class Particle {
    constructor(x, y) { 
        this.x = x; 
        this.y = y; 
        this.vx = (Math.random() - 0.5) * 10; 
        this.vy = (Math.random() - 1) * 10 - 5; 
        this.size = Math.random() * 5 + 3; 
        this.color = '#fbc531'; 
        this.life = 1.0; 
        this.gravity = 0.5; 
    }
    update() { 
        this.vy += this.gravity; 
        this.x += this.vx; 
        this.y += this.vy; 
        this.life -= 0.02; 
        this.size *= 0.95; 
    }
    draw() { 
        if(!ctx) return; 
        ctx.save(); 
        ctx.globalAlpha = Math.max(0, this.life); 
        ctx.fillStyle = this.color; 
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
        ctx.fill(); 
        ctx.restore(); 
    }
}

function createExplosion(x, y, text) {
    if(!document.body) return; 
    for (let i = 0; i < 15; i++) particlesArray.push(new Particle(x, y));
    const el = document.createElement("div"); 
    el.classList.add("floating-text"); 
    el.innerText = text; 
    el.style.left = `${x + (Math.random() - 0.5) * 40}px`; 
    el.style.top = `${y}px`; 
    document.body.appendChild(el); 
    setTimeout(() => el.remove(), 1000);
}

function animateParticles() { 
    if(ctx && canvas) { 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        for (let i = 0; i < particlesArray.length; i++) { 
            particlesArray[i].update(); 
            particlesArray[i].draw(); 
            if (particlesArray[i].life <= 0) { 
                particlesArray.splice(i, 1); 
                i--; 
            } 
        } 
    } 
    requestAnimationFrame(animateParticles); 
}
if(ctx) animateParticles(); 

// === MOTEUR MUSICAL (PISTE MP3) ===
let isMusicPlaying = false; 
const bgMusic = new Audio('audio/music.mp3');
bgMusic.loop = true; // La musique tourne en boucle
bgMusic.volume = 0.10; // Volume très bas pour ne pas gêner

function toggleMusic() { 
    let btn = document.getElementById('btn-music'); 
    if(isMusicPlaying) { 
        isMusicPlaying = false; 
        bgMusic.pause();
        if(btn) { btn.innerText = "🎵 Musique: OFF"; btn.style.background = "var(--panel-light)"; btn.style.borderColor = "var(--border-main)"; } 
    } else { 
        isMusicPlaying = true; 
        bgMusic.play().catch(e => { isMusicPlaying = false; alert("Le navigateur bloque la musique au démarrage. Recliquez !"); });
        if(btn) { btn.innerText = "🎵 Musique: ON"; btn.style.background = "var(--accent-blue-light)"; btn.style.borderColor = "#0097e6"; } 
    } 
}

function playAmbientChord() { 
    if(!isMusicPlaying || audioCtx.state === 'suspended') return; 
    const notes = [110.00, 130.81, 146.83, 164.81, 196.00]; // Gamme pentatonique mineure (A2, C3, D3, E3, G3)
    let note = notes[Math.floor(Math.random() * notes.length)]; 
    try { 
        let osc = audioCtx.createOscillator(); let gain = audioCtx.createGain(); 
        osc.type = 'sine'; osc.frequency.value = note; 
        gain.gain.setValueAtTime(0, audioCtx.currentTime); 
        gain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 3); 
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 6); 
        osc.connect(gain); gain.connect(audioCtx.destination); 
        osc.start(); osc.stop(audioCtx.currentTime + 6); 
    } catch(e) {} 
}


/* ==========================================
   3. MATHÉMATIQUES & LOGIQUE DE PRODUCTION
========================================== */
const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

function formatNumber(num) { 
    if (isNaN(num) || !isFinite(num)) return "0"; 
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
    if (prestigeSkills.find(s => s.id === "skill_cost_3")?.purchased) costModifier *= 0.7; 
    else if (prestigeSkills.find(s => s.id === "skill_cost_2")?.purchased) costModifier *= 0.8; 
    else if (prestigeSkills.find(s => s.id === "skill_cost_1")?.purchased) costModifier *= 0.9; 
    
    let wealthArt = artefacts.find(a => a.id === "art_wealth"); 
    if (wealthArt && wealthArt.equipped) costModifier *= wealthArt.val;
    if (currentFaction === 1) costModifier *= 0.8;

    let trueBase = b.baseCost * costModifier; 
    let r = b.rate; 
    let k = isNaN(b.owned) ? 0 : b.owned; 
    let amountToBuy = 0; 
    let totalCost = 0; 
    let safeResources = (isNaN(currentResources) || !isFinite(currentResources)) ? 0 : currentResources;

    if (buyMultiplier === "MAX") {
        let costOfNext = trueBase * Math.pow(r, k); 
        if (safeResources < costOfNext) return { amount: 1, cost: costOfNext }; 
        let calc = Math.log( safeResources * (r - 1) / (trueBase * Math.pow(r, k)) + 1 ) / Math.log(r); 
        amountToBuy = Math.floor(isNaN(calc) ? 1 : calc);
        if (amountToBuy > 1000000) amountToBuy = 1000000; 
        if (amountToBuy < 1) amountToBuy = 1;
        totalCost = trueBase * Math.pow(r, k) * (Math.pow(r, amountToBuy) - 1) / (r - 1);
        if (totalCost > safeResources) { 
            amountToBuy--; 
            totalCost = trueBase * Math.pow(r, k) * (Math.pow(r, amountToBuy) - 1) / (r - 1); 
            if (amountToBuy <= 0) { 
                amountToBuy = 1; 
                totalCost = trueBase * Math.pow(r, k); 
            } 
        }
    } else {
        amountToBuy = buyMultiplier;
        totalCost = trueBase * Math.pow(r, k) * (Math.pow(r, amountToBuy) - 1) / (r - 1);
    }
    return { amount: amountToBuy, cost: totalCost };
}

function getPendingPrestigePoints() { 
    if (lifetimeResources <= 0) return 0; 
    let p = Math.floor(Math.sqrt(lifetimeResources / prestigeThreshold)) - prestigePoints; 
    let spentPoints = prestigeSkills.reduce((sum, skill) => skill.purchased ? sum + skill.cost : sum, 0); 
    p -= spentPoints; 
    return p > 0 ? p : 0; 
}

function recalculateProduction() {
    let total = 0;
    buildings.forEach(b => {
        if (isNaN(b.owned) || b.owned === 0) return; 
        let upgradeMultiplier = 1.0; 
        upgrades.forEach(u => { if (u.isPurchased && u.targetId === b.id) upgradeMultiplier *= u.multiplier; });
        let levelMultiplier = Math.pow(1.5, (isNaN(b.level) ? 1 : b.level) - 1); 
        let synergyMultiplier = 1.0;
        if (b.synergy) { 
            let tb = buildings.find(t => t.id === b.synergy.targetId); 
            if (tb && tb.owned > 0) { 
                let sBonus = tb.owned * b.synergy.bonusPerOwned; 
                if (currentFaction === 3) sBonus *= 2; 
                synergyMultiplier += sBonus; 
            } 
        }
        total += (b.baseProduction * b.owned) * levelMultiplier * upgradeMultiplier * synergyMultiplier;
    });

    let spentPoints = prestigeSkills.reduce((sum, skill) => skill.purchased ? sum + skill.cost : sum, 0); 
    let unspentPoints = prestigePoints - spentPoints;
    let achCount = achievements.filter(a => a.unlocked).length; 
    let globalMultiplier = 1 + (unspentPoints * prestigeBonusPerPoint) + (achCount * achievementBonus) + ((towerFloor - 1) * 0.01);
    
    let timeArt = artefacts.find(a => a.id === "art_time"); 
    if (timeArt && timeArt.equipped) globalMultiplier *= timeArt.val;
    
    globalMultiplier *= weathers[currentWeatherIndex].bonus;
    if (gardenBuffTimer > 0) globalMultiplier *= 2.0; 
    if (darkUpgrades[0].purchased) globalMultiplier *= 3.0;
    if (equippedPet !== null) { 
        let actPet = pets.find(p => p.id === equippedPet); 
        if(actPet && actPet.type === "prod") globalMultiplier *= actPet.val; 
    }
    if (mgLevel >= 5) globalMultiplier *= 1.1; 
    
    if (prestigeSkills.find(s => s.id === "skill_ultimate")?.purchased) globalMultiplier *= 5.0; 
    else if (prestigeSkills.find(s => s.id === "skill_prod_2")?.purchased) globalMultiplier *= 2.0; 
    else if (prestigeSkills.find(s => s.id === "skill_prod_1")?.purchased) globalMultiplier *= 1.5; 

    totalProductionPerSecond = total * globalMultiplier;
    
    let clickMultiplier = 1;
    if (prestigeSkills.find(s => s.id === "skill_crit")?.purchased) clickMultiplier = 10; 
    else if (prestigeSkills.find(s => s.id === "skill_click_2")?.purchased) clickMultiplier = 5; 
    else if (prestigeSkills.find(s => s.id === "skill_click_1")?.purchased) clickMultiplier = 2;
    
    let powerArt = artefacts.find(a => a.id === "art_power"); 
    if (powerArt && powerArt.equipped) clickMultiplier *= powerArt.val;
    if (currentFaction === 2) clickMultiplier *= 5;
    if (equippedPet !== null) { 
        let actPet = pets.find(p => p.id === equippedPet); 
        if(actPet && actPet.type === "click") clickMultiplier *= actPet.val; 
    }
    if (mgLevel >= 15) clickMultiplier *= 2.0; 

    dynamicClickValue = (baseClickValue * clickMultiplier) + (totalProductionPerSecond * 0.02);

    let prodEl = document.getElementById('production'); 
    if(prodEl) prodEl.innerText = formatNumber(totalProductionPerSecond) + " / sec";
    let clickEl = document.getElementById('click-power'); 
    if(clickEl) clickEl.innerText = "Puissance du clic : +" + formatNumber(dynamicClickValue);

    let currentRankName = playerRanks[0].name; 
    for(let i=0; i < playerRanks.length; i++) { 
        if(lifetimeResources >= playerRanks[i].threshold) currentRankName = playerRanks[i].name; 
    }
    let rankEl = document.getElementById('player-rank'); 
    if(rankEl) rankEl.innerText = currentRankName;
}


/* ==========================================
   4. ACTIONS JOUEUR (CLIC, ACHATS, ASCENSION)
========================================== */
function doManualClick(e) {
    playSound('click'); 
    currentResources += dynamicClickValue; 
    lifetimeResources += dynamicClickValue; 
    totalClicks++; 
    if (!dailyQuests[0].completed) { dailyQuests[0].progress++; updateDailyQuestsUI(); }
    
    if (missions.length > 0) {
        missions[0].progress++; 
    }

    // Sécurité : au cas où les coordonnées de clic seraient invalides
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number' && e.clientX !== 0) {
        x = e.clientX;
        y = e.clientY;
    }
    
    createExplosion(x, y, "+" + formatNumber(dynamicClickValue)); 
    checkAchievements();
}

function setBuyMultiplier(val) { 
    buyMultiplier = val; 
    document.querySelectorAll('.multi-btn').forEach(btn => btn.classList.remove('active')); 
    let id = val === "MAX" ? "max" : val; 
    let domBtn = document.getElementById(`btn-buy-${id}`); 
    if(domBtn) domBtn.classList.add('active'); 
    updateUI(); 
}

function buyBuilding(i) {
    let b = buildings[i]; 
    let details = getPurchaseDetails(b); 
    let safeRes = isNaN(currentResources) ? 0 : currentResources;
    
    if (safeRes >= details.cost && details.amount > 0) { 
        playSound('buy'); 
        currentResources -= details.cost; 
        b.owned += details.amount; 
        if (!dailyQuests[1].completed) { dailyQuests[1].progress += details.amount; updateDailyQuestsUI(); }
        if (b.id === "galaxy" && !hasWon) { triggerVictory(); return; }
        if (missions.length > 1) missions[1].progress += details.amount; 
        recalculateProduction(); 
        drawVisualEmpire(); 
        checkAchievements(); 
        generateUpgrades(); 
    }
}

function upgradeMastery(i) { 
    let b = buildings[i]; 
    let safeLevel = isNaN(b.level) ? 1 : b.level; 
    let cost = safeLevel * 2; 
    if(gems >= cost) { 
        playSound('achieve'); 
        gems -= cost; 
        b.level = safeLevel + 1; 
        createExplosion(window.innerWidth * 0.75, window.innerHeight * 0.5, "⭐ MAÎTRISE Lvl " + b.level); 
        recalculateProduction(); 
        updateUI(); 
        generateStore(); 
    } else { 
        playSound('bad'); 
        showNotification("Erreur", "Pas assez de gemmes !"); 
    } 
}

function buyUpgrade(i) { 
    let u = upgrades[i]; 
    let safeRes = isNaN(currentResources) ? 0 : currentResources; 
    if (!u.isPurchased && safeRes >= u.cost) { 
        playSound('buy'); 
        currentResources -= u.cost; 
        u.isPurchased = true; 
        recalculateProduction(); 
        generateUpgrades(); 
    } 
}

function buyAllUpgrades() {
    let boughtAny = false;
    upgrades.forEach(u => { 
        if(!u.isPurchased && currentResources >= u.cost) { 
            let reqB = buildings.find(b => b.id === u.reqBuilding); 
            if (reqB && (reqB.owned || 0) >= u.reqCount) { 
                currentResources -= u.cost; 
                u.isPurchased = true; 
                boughtAny = true; 
            } 
        } 
    });
    if(boughtAny) { 
        playSound('buy'); 
        recalculateProduction(); 
        generateUpgrades(); 
        updateUI(); 
    }
}

function buySkill(i) { 
    let skill = prestigeSkills[i]; 
    if (skill.purchased) return; 
    let unspentPoints = prestigePoints - prestigeSkills.reduce((sum, s) => s.purchased ? sum + s.cost : sum, 0); 
    if (unspentPoints >= skill.cost) { 
        playSound('achieve'); 
        skill.purchased = true; 
        recalculateProduction(); 
        generateSkills(); 
        generateStore(); 
    } 
}

function respecSkills() { 
    if(confirm("Voulez-vous réinitialiser votre Arbre de Compétences ?")) { 
        prestigeSkills.forEach(s => s.purchased = false); 
        playSound('achieve'); 
        recalculateProduction(); 
        generateSkills(); 
        generateStore(); 
        updateUI(); 
    } 
}

function joinFaction(fid) { 
    currentFaction = fid; 
    playSound('golden'); 
    showNotification("Faction Rejointe", "Vos bonus sont appliqués !"); 
    recalculateProduction(); 
    updateUI(); 
    generateStore(); 
    generateManagers(); 
}

function doPrestige() { 
    let p = getPendingPrestigePoints(); 
    if (p <= 0) return; 
    if(confirm(`Ascension ? Vous gagnez ${p} points de prestige !`)) { 
        prestigePoints += p; 
        currentResources = 0; 
        ascensionCount++; 
        currentFaction = 0; 
        buildings.forEach(b => { b.owned = 0; b.level = 1; }); 
        upgrades.forEach(u => u.isPurchased = false); 
        let startSkill = prestigeSkills.find(s => s.id === "skill_start"); 
        if (startSkill && startSkill.purchased) currentResources = 1000; 
        gardenBuffTimer = 0; 
        recalculateProduction(); 
        generateStore(); 
        generateUpgrades(); 
        generateSkills(); 
        drawVisualEmpire(); 
        saveGame(); 
        alert("Ascension réussie !"); 
    } 
}

function doTranscend() {
    if(lifetimeResources < 1e15) { 
        alert("Vous avez besoin d'au moins 1 Qa (1 Quintillion) de ressources à vie pour transcender !"); 
        return; 
    }
    if(confirm("ATTENTION ! LE TROU NOIR VA TOUT ABSORBER. Êtes-vous prêt pour le voyage cosmique ?")) {
        let dmGain = Math.floor(Math.pow(lifetimeResources / 1e15, 0.5)); 
        if(dmGain < 1) dmGain = 1;
        document.getElementById('dm-gained').innerText = formatNumber(dmGain); 
        document.getElementById('blackhole-modal').classList.remove('hidden'); 
        playSound('golden');
        
        darkMatter += dmGain; 
        transcendCount++; 
        currentResources = 0; lifetimeResources = 0; prestigePoints = 0; totalClicks = 0; goldenClicks = 0; gems = 0; currentFaction = 0; towerFloor = 1; bossMaxHP = 1000; bossHP = 1000; bossTimer = typeof bossTimerMax !== 'undefined' ? bossTimerMax : 30;
        buildings.forEach(b => { b.owned = 0; b.level = 1; }); 
        upgrades.forEach(u => u.isPurchased = false); 
        prestigeSkills.forEach(s => s.purchased = false); 
        managers.forEach(m => m.purchased = false); 
        stocks.forEach(s => { s.shares = 0; s.avgCost = 0; s.price = s.basePrice; });
        
        recalculateProduction(); 
        generateStore(); 
        generateUpgrades(); 
        generateSkills(); 
        generateManagers(); 
        generateDarkMatter(); 
        drawVisualEmpire(); 
        saveGame();
    }
}

function buyDarkUpgrade(i) { 
    let u = darkUpgrades[i]; 
    if(darkMatter >= u.cost && !u.purchased) { 
        playSound('achieve'); 
        darkMatter -= u.cost; 
        u.purchased = true; 
        recalculateProduction(); 
        generateDarkMatter(); 
        updateUI(); 
    } else { 
        playSound('bad'); 
    } 
}

function closeTutorial() {
    let tm = document.getElementById('tutorial-modal');
    if(tm) tm.classList.add('hidden');
    let mainBtn = document.getElementById('main-click-btn');
    if(mainBtn) mainBtn.classList.remove('pulse-skill');
    currentResources += 100; lifetimeResources += 100; // Petit cadeau de départ !
    playSound('golden'); updateUI();
}


/* ==========================================
   5. SYSTÈMES ANNEXES (Mini-jeu, Bourse...)
========================================== */

function startMiniGame() { 
    if (mgCooldown > 0 || mgActive) return; 
    mgActive = true; 
    mgHits = 0; 
    let maxTime = (mgLevel >= 10) ? 15 : 10; 
    mgTime = maxTime; 
    mgCooldown = 30; 
    
    let bStart = document.getElementById('btn-start-minigame'); if(bStart) bStart.style.display = 'none'; 
    let mb = document.getElementById('minigame-board'); if(mb) mb.style.display = 'block'; 
    let mh = document.getElementById('minigame-hits'); if(mh) mh.innerText = "Cibles: 0"; 
    let mt = document.getElementById('minigame-timer'); if(mt) mt.innerText = "Temps: " + maxTime + "s"; 
    
    moveMinigameTarget(); 
    playSound('achieve'); 
    
    mgTimerInterval = setInterval(() => { 
        mgTime--; 
        let mt2 = document.getElementById('minigame-timer'); 
        if(mt2) mt2.innerText = `Temps: ${mgTime}s`; 
        if (mgTime <= 0) endMiniGame(); 
        else moveMinigameTarget(); 
    }, 1000); 
}

function hitMinigameTarget(e) { 
    if (!mgActive) return; 
    mgHits++; 
    let mh = document.getElementById('minigame-hits'); if(mh) mh.innerText = `Cibles: ${mgHits}`; 
    playSound('click'); 
    
    let mult = currentFaction===2 ? 5 : 1; 
    let reward = Math.max(50, totalProductionPerSecond * 2) * mult; 
    if (mgLevel >= 2) reward *= 1.5; 
    
    currentResources += reward; 
    lifetimeResources += reward; 
    
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number') {
        x = e.clientX;
        y = e.clientY;
    }
    
    createExplosion(x, y, "+" + formatNumber(reward)); 
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
    tryDropArtefact(); 
    
    let xpGained = mgHits * 10; 
    mgXP += xpGained; 
    createExplosion(window.innerWidth/2, window.innerHeight/2, "+" + xpGained + " XP"); 
    checkMgLevelUp(); 
}

function checkMgLevelUp() { 
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

// === PIRATAGE GALACTIQUE (SIMON) ===
let simonSequence = []; let playerSequence = []; let simonLevel = 0; let isSimonPlaying = false; let maxSimonLevel = 0;

function startSimonGame() { 
    if (isSimonPlaying) return; 
    isSimonPlaying = true; simonSequence = []; playerSequence = []; simonLevel = 0; 
    let sl = document.getElementById('simon-level'); if(sl) sl.innerText = simonLevel; 
    let st = document.getElementById('simon-status'); if(st) { st.innerText = "Préparation..."; st.style.color = "var(--text-muted)"; } 
    let bs = document.getElementById('btn-start-simon'); if(bs) bs.style.display = 'none'; 
    let sb = document.getElementById('simon-board'); if(sb) { sb.style.pointerEvents = 'none'; sb.style.opacity = '1'; } 
    playSound('achieve'); setTimeout(nextSimonRound, 1000); 
}

function nextSimonRound() { 
    playerSequence = []; simonLevel++; 
    let sl = document.getElementById('simon-level'); if(sl) sl.innerText = simonLevel; 
    let st = document.getElementById('simon-status'); if(st) { st.innerText = "Observation..."; st.style.color = "var(--accent-blue-light)"; } 
    let sb = document.getElementById('simon-board'); if(sb) sb.style.pointerEvents = 'none'; 
    simonSequence.push(Math.floor(Math.random() * 4)); 
    
    let i = 0; let speed = Math.max(350, 1000 - (simonLevel * 25)); 
    let interval = setInterval(() => { 
        let btns = document.querySelectorAll('.simon-btn'); 
        if(btns[simonSequence[i]]) { playSound('click'); btns[simonSequence[i]].classList.add('simon-active'); setTimeout(() => btns[simonSequence[i]].classList.remove('simon-active'), 250); }
        i++; 
        if (i >= simonSequence.length) { 
            clearInterval(interval); 
            setTimeout(() => { let st2 = document.getElementById('simon-status'); if(st2) { st2.innerText = "À VOUS !"; st2.style.color = "var(--accent-green)"; } let sb2 = document.getElementById('simon-board'); if(sb2) sb2.style.pointerEvents = 'auto'; }, 400); 
        } 
    }, speed); 
}

function simonInput(index) { 
    if (!isSimonPlaying) return; 
    let btns = document.querySelectorAll('.simon-btn'); if(btns[index]) { playSound('click'); btns[index].classList.add('simon-active'); setTimeout(() => btns[index].classList.remove('simon-active'), 200); }
    playerSequence.push(index); 
    
    let curr = playerSequence.length - 1; 
    if (playerSequence[curr] !== simonSequence[curr]) return loseSimonGame(); 
    
    if (playerSequence.length === simonSequence.length) { 
        let sb = document.getElementById('simon-board'); if(sb) sb.style.pointerEvents = 'none'; 
        let st = document.getElementById('simon-status'); if(st) { st.innerText = "VALIDÉ !"; st.style.color = "var(--highlight-yellow)"; } 
        playSound('achieve'); setTimeout(nextSimonRound, 1000); 
    } 
}

function loseSimonGame() { 
    isSimonPlaying = false; playSound('bad'); 
    
    let sw = document.getElementById('simon-wrapper'); 
    if(sw) { sw.classList.add('glitch-anim'); setTimeout(() => sw.classList.remove('glitch-anim'), 600); }
    

    let sb = document.getElementById('simon-board'); if(sb) { sb.style.pointerEvents = 'none'; sb.style.opacity = '0.5'; } 
    let bs = document.getElementById('btn-start-simon'); if(bs) { bs.style.display = 'inline-block'; bs.innerText = "Reboot le Terminal"; } 
    let st = document.getElementById('simon-status'); if(st) { st.innerText = "SYSTÈME VERROUILLÉ !"; st.style.color = "var(--accent-red)"; } 
    
    if (simonLevel > 1) { 
        let rewardMult = Math.pow(1.5, simonLevel - 1); let reward = Math.max(100, totalProductionPerSecond * 15 * rewardMult);
        
        if ((simonLevel - 1) > maxSimonLevel) { 
            maxSimonLevel = simonLevel - 1; 
            let sml = document.getElementById('simon-max-level'); if(sml) sml.innerText = maxSimonLevel; 
            showNotification("Nouveau Record !", "Piratage Niv. " + maxSimonLevel); 
        } 
        currentResources += reward; lifetimeResources += reward; 
        createExplosion(window.innerWidth/2, window.innerHeight/2, "Lvl " + (simonLevel-1) + " : +" + formatNumber(reward)); 
        showNotification("Terminal Piraté !", "Données extraites avec succès."); 
        if (simonLevel >= 8) { gems += 5; showNotification("Bonus Hacker", "+5 Gemmes !"); } 
    } else { createExplosion(window.innerWidth/2, window.innerHeight/2, "Zéro Donnée !"); } 
    checkAchievements(); updateUI(); 
}

function buyStock(index) { 
    let s = stocks[index]; 
    if(currentResources >= s.price) { 
        playSound('click'); 
        let safeCost = s.avgCost || 0; 
        let safeShares = s.shares || 0; 
        let totalC = (safeShares * safeCost) + s.price; 
        s.shares = safeShares + 1; 
        s.avgCost = totalC / s.shares; 
        currentResources -= s.price; 
        generateMarket(); 
    } 
}

function sellStock(index) { 
    let s = stocks[index]; 
    if(s.shares > 0) { 
        playSound('buy'); 
        currentResources += s.price; 
        s.shares -= 1; 
        if(s.shares <= 0) s.avgCost = 0; 
        generateMarket(); 
        checkAchievements(); 
    } 
}

function updateMarketLoop() { 
    stocks.forEach(s => { 
        if (s.price > s.basePrice * 3) s.trend -= 0.05; 
        if (s.price < s.basePrice / 3) s.trend += 0.05; 
        let finalVol = currentFaction === 1 ? s.vol * 2 : s.vol; 
        s.trend += (Math.random() - 0.5) * finalVol; 
        s.trend = Math.max(-0.2, Math.min(0.2, s.trend)); 
        s.price = Math.max(s.basePrice * 0.1, s.price * (1 + s.trend + (Math.random()-0.5)*0.05)); 
        if(!Array.isArray(s.history)) s.history = Array(20).fill(s.basePrice); 
        s.history.shift(); 
        s.history.push(s.price); 
    }); 
    let tm = document.getElementById('tab-market'); 
    if(tm && tm.classList.contains('active')) generateMarket(); 
}

function playSlots() { 
    if(gems < 1 || isSpinning) { 
        if(gems < 1) alert("Pas assez de gemmes !"); 
        return; 
    } 
    gems--; 
    updateUI(); 
    isSpinning = true; 
    playSound('buy'); 
    let resDiv = document.getElementById('slot-result'); 
    if(resDiv) { resDiv.innerText = "Ça tourne..."; resDiv.style.color = "var(--text-muted)"; } 
    const symbols = ["🍒", "💎", "💰", "🍀", "☠️"]; 
    let r1 = document.getElementById('reel-1'); 
    let r2 = document.getElementById('reel-2'); 
    let r3 = document.getElementById('reel-3'); 
    if(!r1 || !r2 || !r3) { isSpinning = false; return; } 
    let spins = 0; 
    let spinInterval = setInterval(() => { 
        r1.innerText = symbols[Math.floor(Math.random() * symbols.length)]; 
        r2.innerText = symbols[Math.floor(Math.random() * symbols.length)]; 
        r3.innerText = symbols[Math.floor(Math.random() * symbols.length)]; 
        spins++; 
        if(spins > 20) { 
            clearInterval(spinInterval); 
            evaluateSlots(r1.innerText, r2.innerText, r3.innerText); 
        } 
    }, 50); 
}

function evaluateSlots(s1, s2, s3) { 
    isSpinning = false; 
    let resText = "Perdu..."; 
    let resColor = "var(--accent-red)"; 
    if (s1 === s2 && s2 === s3) { 
        playSound('golden'); 
        resColor = "var(--accent-green)"; 
        if(s1 === "💎") { gems += 50; resText = "JACKPOT ! +50 Gemmes"; createExplosion(window.innerWidth/2, window.innerHeight/2, "JACKPOT !"); } 
        else if(s1 === "💰") { let warp = totalProductionPerSecond * 3600; currentResources += warp; lifetimeResources += warp; resText = "L'HEURE D'OR ! +1h Prod"; createExplosion(window.innerWidth/2, window.innerHeight/2, "MEGA PROFIT !"); } 
        else if(s1 === "🍒") { gems += 5; mysteryEggs++; resText = "Bien joué ! +5 💎 et 1 Œuf 🥚 !"; } 
        else if(s1 === "🍀") { tryDropArtefact(true); resText = "NOUVEL ARTEFACT !"; } 
        else if(s1 === "☠️") { resText = "La Faucheuse... Rien."; resColor = "var(--accent-red)"; playSound('bad'); } 
    } else if (s1 === s2 || s2 === s3 || s1 === s3) { 
        gems += 1; 
        resText = "Remboursé (1 Gemme)"; 
        resColor = "var(--highlight-yellow)"; 
    } else { 
        playSound('bad'); 
    } 
    let resDiv = document.getElementById('slot-result'); 
    if(resDiv) { resDiv.innerText = resText; resDiv.style.color = resColor; } 
    updateUI(); 
}

// === LOTERIE QUOTIDIENNE ===
function playDailyLottery() { 
    let now = Date.now(); 
    if (now - lastLotteryTime < 86400000) return; // 86400000 ms = 24 heures
    
    lastLotteryTime = now; playSound('golden'); 
    let r = Math.random(); let rewardText = ""; 
    
    if (r < 0.4) { let gain = Math.max(5000, totalProductionPerSecond * 14400); currentResources += gain; lifetimeResources += gain; rewardText = "Ressources massives (+4h) !"; createExplosion(window.innerWidth/2, window.innerHeight/2, "💰💰💰"); } 
    else if (r < 0.7) { gems += 15; rewardText = "+15 Gemmes 💎 !"; createExplosion(window.innerWidth/2, window.innerHeight/2, "💎💎💎"); } 
    else if (r < 0.9) { mysteryEggs += 2; rewardText = "+2 Œufs Mystères 🥚 !"; createExplosion(window.innerWidth/2, window.innerHeight/2, "🥚🥚"); } 
    else { gems += 50; mysteryEggs += 1; rewardText = "JACKPOT ! 50💎 + 1🥚 !"; createExplosion(window.innerWidth/2, window.innerHeight/2, "JACKPOT ABSOLU !"); } 
    
    showNotification("Ticket Gratté !", rewardText); 
    saveGame(); updateUI(); 
}

function startIncubation() { 
    if(mysteryEggs > 0 && !incubator.active) { 
        mysteryEggs--; 
        incubator.active = true; 
        incubator.readyTime = Date.now() + 300000; 
        playSound('buy'); 
        updateUI(); 
    } 
}

function hatchEgg() { 
    if(incubator.active && Date.now() >= incubator.readyTime) { 
        incubator.active = false; 
        let rand = Math.random(); 
        let r = rand < 0.1 ? "Légendaire" : (rand < 0.4 ? "Rare" : "Commun"); 
        let possible = pets.filter(p => p.rarity === r); 
        let unlocked = possible[Math.floor(Math.random() * possible.length)]; 
        playSound('golden'); 
        if(unlocked.owned) { 
            unlocked.level++; 
            unlocked.val = unlocked.baseVal + (unlocked.level - 1) * unlocked.growth; 
            showNotification("Évolution !", `Votre ${unlocked.name} est passé Niveau ${unlocked.level} !`); 
            createExplosion(window.innerWidth/2, window.innerHeight/2, "Niveau UP !"); 
        } else { 
            unlocked.owned = true; 
            showNotification("Éclosion Gacha !", `Vous avez obtenu : ${unlocked.name} (${unlocked.rarity})`); 
            createExplosion(window.innerWidth/2, window.innerHeight/2, unlocked.icon); 
        } 
        recalculateProduction(); 
        updateUI(); 
    } 
}

function equipPet(id) { 
    equippedPet = equippedPet === id ? null : id; 
    playSound('click'); 
    recalculateProduction(); 
    updateUI(); 
}

function clickPlot(index) { 
    let p = gardenPlots[index]; 
    if (p.state === 0 && currentResources >= 5000) { 
        currentResources -= 5000; 
        p.state = 1; 
        p.readyTime = Date.now() + 60000; 
        playSound('buy'); 
        updateGardenUI(); 
    } else if (p.state === 2) { 
        p.state = 0; 
        gardenBuffTimer += 120; 
        playSound('achieve'); 
        createExplosion(window.innerWidth/2, window.innerHeight/2, "JARDIN +100% PROD"); 
        recalculateProduction(); 
        updateGardenUI(); 
    } else if (p.state === 0) { 
        alert("Pas assez de ressources (Coût: 5000)"); 
    } 
}

function processGardenTick(deltaTime) { 
    if (gardenBuffTimer > 0) { 
        gardenBuffTimer -= deltaTime; 
        if (gardenBuffTimer <= 0) { 
            gardenBuffTimer = 0; 
            recalculateProduction(); 
            updateGardenUI(); 
        } 
    } 
}

function actionExpedition(index) { 
    let exp = expeditions[index]; 
    if(exp.active) { 
        if(Date.now() >= exp.endTime) { 
            exp.active = false; 
            playSound('golden'); 
            let gemMult = (darkUpgrades[2].purchased) ? 2 : 1; 
            if(index === 0) { gems += (5 * gemMult); if(Math.random()<0.2) mysteryEggs++; } 
            if(index === 1) { gems += (25 * gemMult); if(Math.random()<0.5) mysteryEggs++; } 
            if(index === 2) { gems += (50 * gemMult); tryDropArtefact(true); mysteryEggs++; } 
            showNotification("Expédition Terminée", "Trésor récupéré !"); 
            updateUI(); 
            generateExpeditions(); 
        } 
    } else { 
        exp.active = true; 
        exp.startTime = Date.now(); 
        exp.endTime = Date.now() + (exp.durationSec * 1000); 
        playSound('buy'); 
        updateUI(); 
        generateExpeditions(); 
    } 
}

function processTowerCombat(deltaTime, gen) { 
    let dmgMult = 1; 
    if(equippedPet !== null) { 
        let actPet = pets.find(p => p.id === equippedPet); 
        if(actPet && actPet.type === "tower") dmgMult = actPet.val; 
    } 
    if (mgLevel >= 20) dmgMult *= 2; 
    
    bossHP -= (gen * dmgMult); 
    bossTimer -= deltaTime; 

    // Animation de dégâts sur le boss 
    let now = Date.now();
    let bIcon = document.getElementById('boss-icon');
    if (bIcon && gen > 0 && (now - lastBossAnimTime > 500)) { 
        lastBossAnimTime = now;
        bIcon.classList.remove('boss-taking-damage');
        void bIcon.offsetWidth; 
        bIcon.classList.add('boss-taking-damage'); 
    }
    
    if(bossHP <= 0) { 
        towerFloor++; 
        let isEpic = (towerFloor % 10 === 0); 
        bossMaxHP = 10000 * Math.pow(1.8, towerFloor - 1); 
        if(isEpic) bossMaxHP *= 10; 
        bossHP = bossMaxHP; 
        bossTimerMax = isEpic ? 60 : 30; 
        bossTimer = bossTimerMax; 
        playSound('achieve'); 
        if((towerFloor - 1) % 10 === 0 && (towerFloor - 1) !== 0) { 
            gems += 50; 
            mysteryEggs += 2; 
            createExplosion(window.innerWidth/2, window.innerHeight/2, "COFFRE ÉPIQUE ! +50💎 +2🥚"); 
        } else { 
            createExplosion(window.innerWidth/2, window.innerHeight/2, "BOSS VAINCU ! +1%"); 
        } 
        recalculateProduction(); 
    } else if (bossTimer <= 0) { 
        bossHP = bossMaxHP; 
        bossTimer = bossTimerMax; 
        playSound('bad'); 
    } 
}

function tryDropArtefact(force = false) { 
    if(force || Math.random() < 0.25) { 
        let unowned = artefacts.filter(a => !a.owned); 
        if(unowned.length > 0) { 
            let drop = unowned[Math.floor(Math.random() * unowned.length)]; 
            drop.owned = true; 
            playSound('golden'); 
            showNotification("NOUVEL ARTEFACT !", drop.name); 
            let ti = document.getElementById('tab-inventory'); 
            if(ti && ti.classList.contains('active')) generateInventory(); 
            checkAchievements(); 
        } else if (force) { 
            showNotification("INVENTAIRE", "Tous les artefacts obtenus !"); 
        } 
    } 
}

function equipArtefact(id) { 
    let emptyIndex = equippedSlots.indexOf(null); 
    if(emptyIndex !== -1) { 
        equippedSlots[emptyIndex] = id; 
        artefacts.find(a => a.id === id).equipped = true; 
        recalculateProduction(); 
        generateInventory(); 
        generateStore(); 
    } else { 
        alert("Déséquipez un artefact d'abord."); 
    } 
}

function unequipArtefact(index) { 
    if(equippedSlots[index] !== null) { 
        artefacts.find(a => a.id === equippedSlots[index]).equipped = false; 
        equippedSlots[index] = null; 
        recalculateProduction(); 
        generateInventory(); 
        generateStore(); 
    } 
}

function changeWeather() { 
    if(hasWon) return; 
    currentWeatherIndex = Math.floor(Math.random() * weathers.length); 
    let w = weathers[currentWeatherIndex]; 
    playSound('achieve'); 
    showNotification("MÉTÉO", "Le temps change : " + w.name); 
    let wi = document.getElementById('weather-icon'); if(wi) wi.innerText = w.icon; 
    let wn = document.getElementById('weather-name'); if(wn) { wn.innerText = w.name; wn.style.color = w.color; } 
    let wd = document.getElementById('weather-desc'); if(wd) wd.innerText = w.desc; 
    recalculateProduction(); 
}

const redEventElement = document.getElementById('red-event'); let redEventActive = false;
function spawnRedEvent() { 
    if (redEventActive || hasWon) return; 
    redEventActive = true; 
    let zc = document.getElementById('zone-centre'); if(!zc) return; 
    redEventElement.style.left = Math.max(20, Math.random() * (zc.clientWidth - 80)) + 'px'; 
    redEventElement.style.top = Math.max(20, Math.random() * (zc.clientHeight - 80)) + 'px'; 
    redEventElement.style.display = 'block'; 
    playSound('bad'); 
    setTimeout(() => { 
        if (redEventActive) { 
            redEventElement.style.display = 'none'; 
            redEventActive = false; 
            let loss = currentResources * 0.05; 
            currentResources -= loss; 
            playSound('bad'); 
            createExplosion(window.innerWidth/2, window.innerHeight/2, "- " + formatNumber(loss) + " (Volé!)"); 
            updateNewsTicker("Un voleur a frappé !");
            scheduleEvents(); 
        } 
    }, 4000); 
}

function clickRedEvent(e) { 
    redEventElement.style.display = 'none'; 
    redEventActive = false; 
    playSound('achieve'); 
    
    let x = window.innerWidth / 2; let y = window.innerHeight / 2;
    if (e && typeof e.clientX === 'number') { x = e.clientX; y = e.clientY; }
    
    createExplosion(x, y, "Défense Réussie !"); 
    let defAch = achievements.find(a => a.id === "ach4"); 
    if(defAch && !defAch.unlocked) { 
        defAch.unlocked = true; 
        showNotification(defAch.name, "+1% Prod"); 
        renderAchievements(); 
        recalculateProduction(); 
    } 
    tryDropArtefact(); 
    scheduleEvents(); 
}

const goldenBonusElement = document.getElementById('golden-bonus'); let goldenBonusActive = false;
function spawnGoldenBonus() { 
    if (goldenBonusActive || hasWon) return; 
    goldenBonusActive = true; 
    let zc = document.getElementById('zone-centre'); if(!zc) return; 
    goldenBonusElement.style.left = Math.max(20, Math.random() * (zc.clientWidth - 80)) + 'px'; 
    goldenBonusElement.style.top = Math.max(20, Math.random() * (zc.clientHeight - 80)) + 'px'; 
    goldenBonusElement.style.display = 'block'; 
    playSound('achieve'); 
    setTimeout(() => { 
        if (goldenBonusActive) { 
            goldenBonusElement.style.display = 'none'; 
            goldenBonusActive = false; 
            scheduleEvents(); 
        } 
    }, 5000); 
}

function collectGoldenBonus(e) { 
    goldenBonusElement.style.display = 'none'; 
    goldenBonusActive = false; 
    goldenClicks++; 
    if (!dailyQuests[2].completed) { dailyQuests[2].progress++; updateDailyQuestsUI(); }
    playSound('golden'); 
    missions[2].progress++; 
    let durationMultiplier = 5; 
    let goldenSkill = prestigeSkills.find(s => s.id === "skill_golden"); 
    if(goldenSkill && goldenSkill.purchased) durationMultiplier = 10; 
    let luckArt = artefacts.find(a => a.id === "art_luck"); 
    if (luckArt && luckArt.equipped) durationMultiplier *= luckArt.val; 
    let bonusGains = Math.max(50, totalProductionPerSecond * 60 * durationMultiplier); 
    currentResources += bonusGains; 
    lifetimeResources += bonusGains; 
    
    let x = window.innerWidth / 2; let y = window.innerHeight / 2;
    if (e && typeof e.clientX === 'number') { x = e.clientX; y = e.clientY; }
    
    createExplosion(x, y, "+" + formatNumber(bonusGains) + " !!!"); 
    checkAchievements(); 
    scheduleEvents(); 
}

// === ÉVÉNEMENTS ALÉATOIRES (BONUS ET DANGERS) ===
function spawnMeteor() { 
    if (hasWon) return; 
    let m = document.createElement('div'); m.className = 'meteorite-danger'; m.innerText = '☄️'; 
    let startX = Math.max(20, Math.random() * (window.innerWidth - 100)); m.style.left = startX + 'px'; 
    let duration = 3000 + Math.random() * 2000; m.style.animationDuration = duration + 'ms'; // Tombe en 3 à 5 secondes
    
    let isDestroyed = false; 
    m.onclick = (e) => { 
        isDestroyed = true; playSound('achieve'); gems += 1; 
        createExplosion(e.clientX, e.clientY, "+1 💎 Sauvetage !"); 
        m.remove(); updateUI(); 
    }; 
    
    m.onanimationend = () => { 
        if (!isDestroyed) { 
            playSound('bad'); let loss = currentResources * 0.02; currentResources -= loss; 
            createExplosion(startX, window.innerHeight - 80, "IMPACT ! -" + formatNumber(loss)); 
            updateNewsTicker("ALERTE : Une météorite a détruit des installations !");
            updateUI(); 
        } 
        m.remove(); 
    }; 
    document.body.appendChild(m); 
}

function scheduleEvents() { 
    setTimeout(() => { 
        let r = Math.random();
        if(r > 0.8) spawnMeteor(); // 20% de chances d'avoir une météorite
        else if(r > 0.5) spawnRedEvent(); // 30% d'avoir un voleur
        else spawnGoldenBonus(); // 50% d'avoir un bonus doré
        
        scheduleEvents(); // Relance la boucle infinie
    }, 20000 + Math.random() * 20000); 
}

function updateNewsTicker(customMessage) { 
    const newsEl = document.getElementById('news-text'); 
    if(!newsEl) return; 
    newsEl.style.opacity = 0; 
    setTimeout(() => { 
        if(customMessage) {
            newsEl.innerText = "Flash Info : " + customMessage;
        } else {
            let randomNews = newsMessages[Math.floor(Math.random() * newsMessages.length)]; 
            newsEl.innerText = "Flash Info : " + randomNews; 
        }
        newsEl.style.opacity = 1; 
    }, 500); 
}

function claimMission(index) { 
    try {
        let m = missions[index]; 
        if (m.progress >= m.target) { 
            playSound('achieve'); 
            let gemGain = m.reward; 
            if(darkUpgrades[2].purchased) gemGain *= 2; 
            gems += gemGain; 
            m.progress = 0; 
            m.level++; 
            m.target = Math.floor(m.target * 1.5); 
            m.reward++; 
            let btn = document.getElementById(`mission-btn-${index}`); 
            if (btn) { 
                let rect = btn.getBoundingClientRect(); 
                createExplosion(rect.left + rect.width/2, rect.top, "+" + gemGain + " 💎"); 
            } 
            updateUI(); 
            checkAchievements(); 
        } 
    } catch(e) { console.error(e); } 
}

function buyTimeWarp() { 
    if (gems >= 5) { 
        playSound('golden'); 
        gems -= 5; 
        let warpGains = totalProductionPerSecond * 3600; 
        currentResources += warpGains; 
        lifetimeResources += warpGains; 
        createExplosion(window.innerWidth/2, window.innerHeight/2, "SAUT TEMPOREL !"); 
        updateUI(); 
    } else { 
        alert("Pas assez de Gemmes !"); 
    } 
}

function triggerVictory() { 
    hasWon = true; 
    playSound('golden'); 
    let vs = document.getElementById('victory-stats'); 
    if(vs) vs.innerHTML = `Temps de jeu : ${formatTimeLabel(timePlayedSeconds)}<br>Clics Totaux : ${formatNumber(totalClicks)}<br>Ascensions : ${ascensionCount}`; 
    let vm = document.getElementById('victory-modal'); 
    if(vm) vm.classList.remove('hidden'); 
}

function checkAchievements() { 
    let newlyUnlocked = false; 
    achievements.forEach(ach => { 
        if (!ach.unlocked && ach.condition()) { 
            ach.unlocked = true; 
            newlyUnlocked = true; 
            playSound('achieve'); 
            showNotification(ach.name, "+1% Prod Globale"); 
        } 
    }); 
    if (newlyUnlocked) { 
        renderAchievements(); 
        recalculateProduction(); 
    } 
}

function hireManager(index) { 
    let m = managers[index]; 
    let canAfford = false; 
    let mCost = m.cost; 
    if(currentFaction === 3 && m.currency === "res") mCost /= 2; 
    if(m.currency === "res" && currentResources >= mCost) { currentResources -= mCost; canAfford = true; } 
    if(m.currency === "gem" && gems >= mCost) { gems -= mCost; canAfford = true; } 
    if(canAfford) { 
        playSound('achieve'); 
        m.purchased = true; 
        updateUI(); 
        generateManagers(); 
    } 
}

function managerAutoBuy() {
    let mCursor = managers.find(m => m.id === "mgr_cursor"); 
    if (mCursor && mCursor.purchased) { let b = buildings.find(x => x.id === "cursor"); if(b) { let d = getPurchaseDetails(b); if(currentResources >= d.cost && d.amount > 0) { currentResources-=d.cost; b.owned+=d.amount; recalculateProduction(); drawVisualEmpire(); } } }
    
    let mFarm = managers.find(m => m.id === "mgr_farm"); 
    if (mFarm && mFarm.purchased) { let b = buildings.find(x => x.id === "farm"); if(b) { let d = getPurchaseDetails(b); if(currentResources >= d.cost && d.amount > 0) { currentResources-=d.cost; b.owned+=d.amount; recalculateProduction(); drawVisualEmpire(); } } }
    
    let mMine = managers.find(m => m.id === "mgr_mine"); 
    if (mMine && mMine.purchased) { let b = buildings.find(x => x.id === "mine"); if(b) { let d = getPurchaseDetails(b); if(currentResources >= d.cost && d.amount > 0) { currentResources-=d.cost; b.owned+=d.amount; recalculateProduction(); drawVisualEmpire(); } } }
    
    let mBank = managers.find(m => m.id === "mgr_bank"); 
    if (mBank && mBank.purchased) { let b = buildings.find(x => x.id === "bank"); if(b) { let d = getPurchaseDetails(b); if(currentResources >= d.cost && d.amount > 0) { currentResources-=d.cost; b.owned+=d.amount; recalculateProduction(); drawVisualEmpire(); } } }
    
    let mGold = managers.find(m => m.id === "mgr_gold"); 
    if (mGold && mGold.purchased && typeof goldenBonusActive !== 'undefined' && goldenBonusActive) { 
        collectGoldenBonus({clientX: window.innerWidth/2, clientY: window.innerHeight/2}); 
    }
}
setInterval(managerAutoBuy, 1000); 
setInterval(checkDailyReset, 10000);

/* ==========================================
   6. INTERFACE ET GENERATION (UI)
========================================== */
function switchTab(tabName) { 
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); 
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active')); 
    let tBtn = document.getElementById(`tab-btn-${tabName}`); if(tBtn) tBtn.classList.add('active'); 
    let tContent = document.getElementById(`tab-${tabName}`); if(tContent) tContent.classList.add('active'); 
    if(tabName === 'market') generateMarket(); 
    if(tabName === 'inventory') generateInventory(); 
    if(tabName === 'managers') generateManagers(); 
    if(tabName === 'expeditions') generateExpeditions(); 
    if(tabName === 'garden') generateGarden(); 
    if(tabName === 'skills') generateSkills(); 
    if(tabName === 'dm') generateDarkMatter(); 
    if(tabName === 'hatchery') generateHatchery(); 
    if(tabName === 'stats') updateStatsTab(); 
}

function drawVisualEmpire() { 
    let html = ""; 
    buildings.forEach(b => { 
        let safeOwned = isNaN(b.owned) ? 0 : b.owned; 
        if (b.id !== "galaxy" && safeOwned > 0) { 
            let count = Math.min(safeOwned, 50); 
            for(let i=0; i<count; i++) html += `<span style="font-size:1.8rem; margin:-5px;">${b.icon}</span>`; 
        } 
    }); 
    let empire = document.getElementById('visual-empire'); 
    if(empire) empire.innerHTML = html; 
}

function generateStore() { 
    const container = document.getElementById('buildings-container'); 
    if(!container) return; 
    let html = ""; 
    buildings.forEach((b, i) => { 
        let synergyText = b.synergy ? `<br><span style="color:var(--accent-purple);">Synergie: ${b.synergy.description}</span>` : ""; 
        let details = getPurchaseDetails(b); 
        let safeLevel = b.level || 1; 
        let gemCost = safeLevel * 2; 
        let masteryBtnHtml = b.id !== "galaxy" ? `<button id="mastery-btn-${b.id}" class="mastery-btn prestige" onclick="event.stopPropagation(); upgradeMastery(${i})">⭐ Maîtrise (Lvl ${safeLevel}) | 💎 ${gemCost}</button>` : ""; 
        html += `<div id="btn-${b.id}" class="metamorphose-card disabled buildings" onclick="buyBuilding(${i})"><div class="card-left"><div class="card-icon">${b.icon}</div><div class="card-info"><div class="card-title">${b.name} <span id="amount-label-${b.id}" style="font-size:1rem; color:var(--accent-blue-light);">(+${details.amount})</span></div><div class="card-desc">Prod : +${formatNumber(b.baseProduction)} /s ${synergyText}</div><div class="card-cost" id="cost-${b.id}">Coût : ${formatNumber(details.cost)} 💰</div></div></div><div class="card-right"><div class="card-owned" id="owned-${b.id}">${b.owned || 0}</div>${masteryBtnHtml}</div></div>`; 
    }); 
    container.innerHTML = html; 
}

function generateUpgrades() { 
    const container = document.getElementById('upgrades-container'); 
    if(!container) return; 
    let html = ""; 
    upgrades.forEach((u, i) => { 
        if (u.isPurchased) return; 
        let reqB = buildings.find(b => b.id === u.reqBuilding); 
        if (reqB && (reqB.owned || 0) < u.reqCount) return; 
        html += `<div id="btn-upg-${u.id}" class="metamorphose-card disabled upgrades" onclick="buyUpgrade(${i})"><div class="card-left"><div class="card-icon">${u.icon}</div><div class="card-info"><div class="card-title">${u.name}</div><div class="card-desc">${u.desc}</div><div class="card-cost" id="cost-upg-${u.id}">Coût : ${formatNumber(u.cost)} 💰</div></div></div><div class="card-right"><button class="metamorphose-buy-btn" style="width: 120px;">Acheter</button></div></div>`; 
    }); 
    container.innerHTML = html; 
}

function generateSkills() { 
    const container = document.getElementById('skills-container'); if(!container) return; 
    container.innerHTML = ""; 
    let unspentPoints = prestigePoints - prestigeSkills.reduce((sum, s) => s.purchased ? sum + s.cost : sum, 0); 
    
    
    prestigeSkills.forEach(skill => { 
        skill.reqs.forEach(reqId => { 
            let req = prestigeSkills.find(s => s.id === reqId); 
            if(req) { 
                let isPurchased = skill.purchased && req.purchased;
                let line = document.createElement('div'); 
                line.className = isPurchased ? 'skill-connection skill-conn-active' : 'skill-connection'; 
                let startX = req.x; let startY = req.y; let endX = skill.x; let endY = skill.y; 
                let distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)); 
                let angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI); 
                line.style.width = distance + 'px'; line.style.left = startX + 'px'; line.style.top = startY + 'px'; line.style.transform = `rotate(${angle}deg)`; 
                container.appendChild(line); 
            } 
        }); 
    }); 
    
    
    prestigeSkills.forEach((skill, i) => { 
        const areReqsPurchased = skill.reqs.every(reqId => prestigeSkills.find(s => s.id === reqId).purchased); 
        if (!areReqsPurchased && skill.reqs.length > 0 && !skill.purchased) return; // Cache les nœuds inaccessibles
        
        let statusClass = "locked"; 
        if (skill.purchased) statusClass = "purchased"; 
        else if (areReqsPurchased && unspentPoints >= skill.cost) statusClass = "affordable pulse-skill"; 
        else if (areReqsPurchased) statusClass = ""; 
        
        let node = document.createElement('div'); node.className = `skill-node ${statusClass} pop-in-anim`; node.id = `skill-node-${skill.id}`; node.setAttribute('onclick', `buySkill(${i})`); 
        node.style.left = skill.x + 'px'; node.style.top = skill.y + 'px'; node.style.transform = 'translate(-50%, -50%)'; 
        node.innerHTML = `<div class="skill-icon">${skill.icon}</div><h4>${skill.name}</h4><div class="skill-desc">${skill.desc}</div><div class="skill-cost">${skill.purchased ? "Acquis" : `Coût: ${skill.cost} pts`}</div>`; 
        container.appendChild(node); 
    }); 
}

function generateMarket() { 
    const container = document.getElementById('market-container'); 
    if(!container) return; 
    let html = ""; 
    stocks.forEach((s, i) => { 
        let arrow = s.trend >= 0 ? '▲' : '▼'; 
        let maxH = Math.max(...s.history); let minH = Math.min(...s.history); let range = maxH - minH || 1; 
        let graphHtml = s.history.map(val => { let pct = ((val - minH) / range) * 100; return `<div class="graph-bar" style="height: ${Math.max(5, isNaN(pct) ? 5 : pct)}%; background: ${s.trend >= 0 ? '#37eb27' : '#f34b22'};"></div>`; }).join(''); 
        let profitHtml = ""; 
        if(s.shares > 0) { 
            let safeCost = s.avgCost || 1; let profitPct = ((s.price - safeCost) / safeCost) * 100; let pColor = profitPct >= 0 ? '#37eb27' : '#f34b22'; 
            profitHtml = `<div style="color:${pColor}; font-size:0.9rem; font-weight:bold; margin-top:5px;">Moyenne: ${formatNumber(safeCost)} (${profitPct > 0 ? '+':''}${profitPct.toFixed(1)}%)</div>`; 
        } 
        html += `<div class="metamorphose-card"><div style="flex:1;"><div class="card-title">${s.name}</div><div style="font-size:1.5rem; font-weight:bold; color:${s.trend >= 0 ? '#37eb27' : '#f34b22'}">${formatNumber(s.price)} ${arrow}</div><div style="color:var(--text-muted); font-size:1rem;">Possédées: ${s.shares}</div>${profitHtml}</div><div class="stock-graph" style="flex:1; height:60px; display:flex; align-items:flex-end; gap:2px; border-bottom:1px solid var(--border-main);">${graphHtml}</div><div style="flex:0; display:flex; flex-direction:column; gap:5px; margin-left:15px;"><button class="metamorphose-buy-btn" style="background:var(--accent-green); color:var(--bg-dark); font-size:1rem; padding:10px;" onclick="buyStock(${i})">Acheter</button> <button class="metamorphose-buy-btn" style="background:var(--accent-red); color:white; font-size:1rem; padding:10px; border-color:#c23616; box-shadow:0 6px 0 #8c2610;" onclick="sellStock(${i})">Vendre</button></div></div>`; 
    }); 
    container.innerHTML = html; 
}

function generateInventory() { 
    let equipC = document.getElementById('equipped-container'); 
    if(equipC) { 
        let slotsHtml = ""; 
        for(let i=0; i<equippedSlots.length; i++) { 
            if(equippedSlots[i] !== null) { let art = artefacts.find(a => a.id === equippedSlots[i]); slotsHtml += `<div class="equip-slot" onclick="unequipArtefact(${i})" title="Déséquiper">${art ? art.icon : '?'}</div>`; } 
            else { slotsHtml += `<div class="equip-slot"></div>`; } 
        } 
        equipC.innerHTML = slotsHtml; 
    } 
    let artHtml = ""; let hasAny = false; 
    artefacts.forEach((a, i) => { 
        if(a.owned && !a.equipped) { 
            hasAny = true; 
            artHtml += `<div class="metamorphose-card"><div class="card-left"><div class="card-icon">${a.icon}</div><div class="card-info"><div class="card-title" style="color:var(--highlight-yellow);">${a.name}</div><div class="card-desc">${a.desc}</div></div></div><button class="metamorphose-buy-btn" style="background:var(--highlight-yellow); border-color:#ff9100; box-shadow:0 6px 0 #b36400; color:var(--bg-dark); width:120px;" onclick="equipArtefact('${a.id}')">Équiper</button></div>`; 
        } 
    }); 
    if(!hasAny) artHtml = "<p style='color:var(--text-muted); font-style:italic;'>Vous n'avez aucun artefact en réserve.</p>"; 
    let ac = document.getElementById('artefacts-container'); 
    if (ac) ac.innerHTML = artHtml; 
}

function generateManagers() { 
    const container = document.getElementById('managers-container'); 
    if(!container) return; 
    let html = ""; 
    managers.forEach((m, i) => { 
        let isGems = m.currency === "gem"; let safeCost = m.cost; 
        if(currentFaction === 3 && m.currency === "res") safeCost /= 2; 
        let costLabel = isGems ? `${safeCost} 💎` : formatNumber(safeCost) + " res."; 
        let btnHtml = m.purchased ? `<button class="metamorphose-buy-btn" style="background:var(--panel-light); border-color:var(--border-main); box-shadow:none; color:var(--text-muted); cursor:not-allowed;" disabled>Embauché</button>` : `<button class="metamorphose-buy-btn" id="btn-mgr-${m.id}" onclick="hireManager(${i})" style="flex-direction: column; height: auto; padding: 8px;"><span>Embaucher</span><span style="font-size:0.85rem; font-weight:normal; margin-top:2px;">${costLabel}</span></button>`; 
        html += `<div class="metamorphose-card"><div class="card-left"><div class="card-icon" style="font-size:2.5rem; width:60px; height:60px;">${m.icon}</div><div class="card-info"><div class="card-title" style="font-size:1.4rem;">${m.name}</div><div class="card-desc">${m.desc}</div></div></div><div class="card-right" style="width:150px;">${btnHtml}</div></div>`; 
    }); 
    container.innerHTML = html; 
}

function generateExpeditions() { 
    const container = document.getElementById('expeditions-container'); 
    if(!container) return; 
    let html = ""; 
    expeditions.forEach((exp, i) => { 
        html += `<div class="metamorphose-card" style="position:relative; overflow:hidden;"><div class="card-left"><div class="card-icon" style="font-size:2.5rem; width:60px; height:60px;">${exp.icon}</div><div class="card-info"><div class="card-title" style="font-size:1.4rem;">${exp.name}</div><div class="card-desc" style="color:var(--accent-blue-light); font-weight:bold;">Butin: ${exp.rewardDesc}</div></div></div><div class="card-right" style="z-index:2;"><button class="metamorphose-buy-btn" style="background:var(--panel-light); border-color:var(--border-main); color:white; width:150px;" id="btn-exp-${i}" onclick="actionExpedition(${i})">Lancer (${formatTimeLabel(exp.durationSec)})</button></div><div class="exp-progress-bg" style="position:absolute; bottom:0; left:0; width:100%; height:8px; background:var(--panel-deep);"><div class="exp-progress-fill" id="fill-exp-${i}" style="height:100%; background:var(--accent-purple); width:0%; transition:width 1s linear;"></div></div></div>`; 
    }); 
    container.innerHTML = html; 
}

function updateExpeditionsUI() { 
    let hasReadyExp = false; 
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
    const container = document.getElementById('garden-container'); 
    if(!container) return; 
    let html = ""; 
    gardenPlots.forEach((p, i) => { html += `<div class="garden-plot" id="plot-${i}" onclick="clickPlot(${i})"></div>`; }); 
    container.innerHTML = html; 
    updateGardenUI(); 
}

function updateGardenUI() { 
    let hasReadyGarden = false; 
    gardenPlots.forEach((p, i) => { 
        let plot = document.getElementById(`plot-${i}`); if(!plot) return; 
        if(p.state === 0) { plot.innerHTML = `<span style="color:var(--text-muted); font-size:1rem; font-family:'Luckiest Guy', cursive;">Planter<br>(5000 res)</span>`; } 
        else if (p.state === 1) { let rem = (p.readyTime - Date.now()) / 1000; if(rem <= 0) { p.state = 2; hasReadyGarden = true; updateGardenUI(); return; } plot.innerHTML = `<div class="garden-icon">🌱</div><div class="garden-timer">${Math.ceil(rem)}s</div>`; } 
        else if (p.state === 2) { hasReadyGarden = true; plot.innerHTML = `<div class="garden-icon">🌻</div><div class="garden-timer" style="background:var(--accent-green); color:var(--bg-dark);">Récolter !</div>`; } 
    }); 
    let badge = document.getElementById('badge-garden'); if (badge) badge.style.display = hasReadyGarden ? "flex" : "none"; 
    let buffUI = document.getElementById('garden-buff-ui'); 
    if(buffUI) { if(gardenBuffTimer > 0) { buffUI.style.display = "block"; document.getElementById('garden-buff-time').innerText = Math.ceil(gardenBuffTimer); } else { buffUI.style.display = "none"; } } 
}

function generateHatchery() { 
    const container = document.getElementById('incubator-ui'); 
    if(!container) return; 
    let html = ""; 
    if (incubator.active) { 
        let rem = (incubator.readyTime - Date.now()) / 1000; 
        if(rem <= 0) { html = `<div class="egg-bounce" onclick="hatchEgg()">🥚</div><div style="color:var(--accent-green); font-weight:bold; font-size:1.2rem; margin-top:10px;">Prêt à éclore ! Cliquez !</div>`; } 
        else { html = `<div style="font-size:4rem; filter:grayscale(80%);">🥚</div><div style="color:var(--text-muted); font-weight:bold; margin-top:10px;">Incubation : ${formatTimeLabel(rem)}</div>`; } 
    } else { 
        if(mysteryEggs > 0) { html = `<div class="egg-bounce" style="font-size:4rem; cursor:pointer;" onclick="startIncubation()">🥚</div><div style="color:var(--accent-blue-light); font-weight:bold; margin-top:10px;">Cliquez pour incuber (5 min)</div>`; } 
        else { html = `<div style="font-size:4rem; opacity:0.3;">🥚</div><div style="color:var(--text-muted); font-weight:bold; margin-top:10px;">Aucun œuf en stock.</div>`; } 
    } 
    container.innerHTML = html; 
    
    let pCont = document.getElementById('pets-container'); 
    if(pCont) { 
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
    let eggC = document.getElementById('egg-count'); if(eggC) eggC.innerText = mysteryEggs; 
    let hasReadyEgg = false; if(incubator.active && Date.now() >= incubator.readyTime) hasReadyEgg = true; 
    let badge = document.getElementById('badge-hatchery'); if (badge) badge.style.display = hasReadyEgg ? "flex" : "none"; 
    if(document.getElementById('tab-hatchery') && document.getElementById('tab-hatchery').classList.contains('active')) generateHatchery(); 
}

function initMissions() { 
    const container = document.getElementById('missions-container'); if(!container) return; 
    let html = ""; 
    missions.forEach((m, i) => { 
        html += `<div class="metamorphose-card" style="flex-direction:column; align-items:stretch;"><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><div><div class="card-title" id="mission-title-${i}">${m.name} (Niv. ${m.level})</div><div class="card-desc">${m.desc}</div></div><div style="font-size:1.5rem; font-weight:bold; color:var(--accent-blue-light);" id="mission-reward-${i}">+${m.reward} 💎</div></div><div style="width:100%; height:15px; background:var(--panel-light); border-radius:10px; overflow:hidden; border:2px solid var(--border-main);"><div id="mission-fill-${i}" style="height:100%; width:0%; background:var(--accent-green); transition:width 0.3s;"></div></div><div style="display:flex; justify-content:space-between; margin-top:10px; align-items:center;"><div id="mission-text-${i}" style="color:var(--text-muted); font-weight:bold;">0 / ${m.target}</div><button class="metamorphose-buy-btn" id="mission-btn-${i}" style="display:none; width:120px; height:40px; font-size:1rem;" onclick="claimMission(${i})">Réclamer</button></div></div>`; 
    }); 
    container.innerHTML = html; 
}

// === QUÊTES JOURNALIÈRES ===
function checkDailyReset() {
    let now = Date.now();
    // 86400000 ms = 24 heures
    if (now - lastDailyReset > 86400000) {
        lastDailyReset = now;
        dailyQuests.forEach(q => { q.progress = 0; q.completed = false; });
        showNotification("Nouveau Jour !", "Vos Quêtes Journalières sont disponibles !");
        updateDailyQuestsUI();
    }
}

function updateDailyQuestsUI() {
    const container = document.getElementById('daily-quests-container'); if(!container) return;
    let html = "";
    dailyQuests.forEach((q, i) => {
        let isDone = q.progress >= q.target;
        let pct = Math.min(100, (q.progress / q.target) * 100);
        let btnHtml = q.completed ? `<button class="metamorphose-buy-btn" style="background:var(--panel-light); border-color:var(--border-main); color:var(--text-muted); box-shadow:none;" disabled>Terminé</button>` : (isDone ? `<button class="metamorphose-buy-btn" style="background:var(--highlight-yellow); border-color:#ff9100; color:var(--bg-dark); box-shadow:0 6px 0 #b36400;" onclick="claimDailyQuest(${i})">Réclamer (+${q.reward}💎)</button>` : `<div style="color:var(--text-muted); font-weight:bold; text-align:center; padding:10px;">${q.progress} / ${q.target}</div>`);
        
        html += `<div class="metamorphose-card" style="border-color:${q.completed ? 'var(--border-main)' : 'var(--highlight-yellow)'}; opacity:${q.completed ? '0.6' : '1'};"><div class="card-left"><div class="card-info"><div class="card-title" style="color:${q.completed ? 'var(--text-muted)' : 'var(--highlight-yellow)'};">${q.desc}</div><div style="width:100%; height:10px; background:var(--panel-light); border-radius:5px; overflow:hidden; border:1px solid var(--border-main); margin-top:10px;"><div style="height:100%; width:${isNaN(pct)?0:pct}%; background:var(--accent-green); transition:width 0.3s;"></div></div></div></div><div class="card-right" style="width:140px; margin-top:0;">${btnHtml}</div></div>`;
    });
    container.innerHTML = html;
}

function claimDailyQuest(index) {
    let q = dailyQuests[index];
    if (q.progress >= q.target && !q.completed) {
        playSound('achieve');
        q.completed = true;
        gems += q.reward;
        createExplosion(window.innerWidth/2, window.innerHeight/2, "+" + q.reward + " 💎");
        updateDailyQuestsUI();
        updateUI();
        saveGame();
    }
}

function updateMissionsUI() { 
    let hasReadyMission = false; 
    missions.forEach((m, i) => { 
        if (m.progress >= m.target) hasReadyMission = true; 
        let pct = Math.min(100, (m.progress / m.target) * 100); 
        let fillEl = document.getElementById(`mission-fill-${i}`); 
        if(fillEl) { 
            fillEl.style.width = isNaN(pct) ? "0%" : (pct + "%"); 
            let mt = document.getElementById(`mission-text-${i}`); if(mt) mt.innerText = `${m.progress} / ${m.target}`; 
            let mb = document.getElementById(`mission-btn-${i}`); if(mb) mb.style.display = (m.progress >= m.target) ? "block" : "none"; 
            let mtitle = document.getElementById(`mission-title-${i}`); if(mtitle) mtitle.innerText = `${m.name} (Niv. ${m.level})`; 
            let mr = document.getElementById(`mission-reward-${i}`); if(mr) mr.innerText = `+${m.reward} 💎`; 
        } 
    }); 
    let badge = document.getElementById('badge-missions'); if (badge) badge.style.display = hasReadyMission ? "flex" : "none"; 
}

function generateDarkMatter() { 
    const container = document.getElementById('dm-upgrades-container'); if(!container) return; 
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
        // Calcul du rang actuel et suivant
        let currRank = playerRanks[0], nextRank = playerRanks[1]; 
        for(let i=0; i < playerRanks.length; i++) { if(lifetimeResources >= playerRanks[i].threshold) { currRank = playerRanks[i]; nextRank = playerRanks[i+1] || null; } } 
        
        // Création de la barre de progression
        let progressHtml = ""; 
        if (nextRank) { 
            let prevT = currRank.threshold; let nextT = nextRank.threshold; let pct = Math.min(100, Math.max(0, ((lifetimeResources - prevT) / (nextT - prevT)) * 100)); 
            progressHtml = `<div style="margin-top:10px; font-size:0.9rem; color:var(--text-muted);">Prochain: ${nextRank.name} (${formatNumber(nextT)})</div><div style="width:100%; height:12px; background:var(--bg-dark); border-radius:6px; overflow:hidden; border:1px solid var(--border-main); margin-top:5px;"><div style="height:100%; width:${pct}%; background:var(--accent-red); transition:width 0.5s;"></div></div>`; 
        } else { progressHtml = `<div style="margin-top:10px; font-size:1rem; color:var(--highlight-yellow); font-weight:bold;">👑 Rang Suprême Atteint !</div>`; } 
        
        // Injection du code
        statC.innerHTML = `<div class="metamorphose-card" style="padding:15px; margin-bottom:10px; flex-direction:column; align-items:flex-start; grid-column: span 2;"><span style="color:var(--accent-red); font-size:1.8rem; font-family:'Luckiest Guy', cursive;">Rang : ${currRank.name}</span>${progressHtml}</div><div class="metamorphose-card" style="padding:15px; margin-bottom:10px;"><span style="color:var(--text-muted); font-size:1.2rem; font-family:'Luckiest Guy', cursive;">Ressources à vie</span><span style="color:var(--text-main); font-size:1.5rem; font-weight:bold;">${formatNumber(lifetimeResources)}</span></div><div class="metamorphose-card" style="padding:15px; margin-bottom:10px;"><span style="color:var(--text-muted); font-size:1.2rem; font-family:'Luckiest Guy', cursive;">Temps de jeu</span><span style="color:var(--text-main); font-size:1.5rem; font-weight:bold;">${formatTimeLabel(timePlayedSeconds)}</span></div><div class="metamorphose-card" style="padding:15px; margin-bottom:10px;"><span style="color:var(--text-muted); font-size:1.2rem; font-family:'Luckiest Guy', cursive;">Clics manuels</span><span style="color:var(--text-main); font-size:1.5rem; font-weight:bold;">${formatNumber(totalClicks)}</span></div><div class="metamorphose-card" style="padding:15px; margin-bottom:10px;"><span style="color:var(--text-muted); font-size:1.2rem; font-family:'Luckiest Guy', cursive;">Gemmes</span><span style="color:var(--accent-blue-light); font-size:1.5rem; font-weight:bold;">${gems} 💎</span></div><div class="metamorphose-card" style="padding:15px; margin-bottom:10px;"><span style="color:var(--text-muted); font-size:1.2rem; font-family:'Luckiest Guy', cursive;">Ascensions</span><span style="color:var(--accent-purple); font-size:1.5rem; font-weight:bold;">${ascensionCount}</span></div>`; 
    } 
}

function renderAchievements() { 
    const grid = document.getElementById('achievements-grid'); if(!grid) return; 
    grid.innerHTML = ""; 
    achievements.forEach(ach => { 
        let div = document.createElement('div'); 
        div.classList.add('achievement-icon'); 
        if (ach.unlocked) div.classList.add('unlocked'); 
        div.innerText = ach.icon; 
        div.title = `${ach.name} : ${ach.desc}`; 
        grid.appendChild(div); 
    }); 
}

function updateTowerUI(safeFloor, dps) { 
    let tf = document.getElementById('tower-floor'); if(tf) tf.innerText = safeFloor; 
    let td = document.getElementById('tower-dps'); if(td) td.innerText = formatNumber(dps); 
    let tb = document.getElementById('tower-bonus'); if(tb) tb.innerText = Math.floor(safeFloor-1); 
    let isEpic = (safeFloor % 10 === 0); 
    let bossIcon = document.getElementById('boss-icon'); 
    if(bossIcon) { bossIcon.innerText = isEpic ? "💀" : "👹"; bossIcon.style.color = isEpic ? "#9c27b0" : "inherit"; } 
    let hpt = document.getElementById('boss-hp-text'); if(hpt) hpt.innerText = `${formatNumber(bossHP)} / ${formatNumber(bossMaxHP)}`; 
    let hpf = document.getElementById('boss-hp-fill'); if(hpf) { hpf.style.width = Math.max(0, (bossHP / bossMaxHP) * 100) + "%"; hpf.style.background = isEpic ? "var(--accent-purple)" : "var(--accent-red)"; } 
    let tt = document.getElementById('boss-time-text'); if(tt) tt.innerText = bossTimer.toFixed(1) + "s"; 
    let ttf = document.getElementById('boss-time-fill'); if(ttf) ttf.style.width = Math.max(0, (bossTimer / bossTimerMax) * 100) + "%"; 
}

function updateMinigameUI() { 
    let lvlT = document.getElementById('mg-level-text'); if(lvlT) lvlT.innerText = mgLevel; 
    let xpFill = document.getElementById('mg-xp-fill'); if(xpFill) { let pct = Math.min(100, (mgXP / getMgXPNeeded()) * 100); xpFill.style.width = pct + "%"; } 
    mgMilestones.forEach(m => { let icon = document.getElementById(`ms-icon-${m.level}`); if(icon && mgLevel >= m.level && !icon.classList.contains('reached')) icon.classList.add('reached'); }); 
    let nxt = document.getElementById('mg-next-milestone'); 
    if(nxt) { let nextMilestone = mgMilestones.find(m => m.level > mgLevel); if(nextMilestone) { nxt.innerText = `Prochain Jalon: Niv. ${nextMilestone.level} (${nextMilestone.desc})`; } else { nxt.innerText = "Maître Suprême atteint !"; } } 
}

function updateUI() {
    try {
        let scoreEl = document.getElementById('currency-ressources'); if(scoreEl) scoreEl.innerText = formatNumber(currentResources);
        let gemsEl = document.getElementById('gems-count'); if(gemsEl) gemsEl.innerText = gems;
        
        let dmBox = document.getElementById('dm-block'); let dmCount = document.getElementById('dm-count'); 
        if(darkMatter > 0 || transcendCount > 0) { if(dmBox) dmBox.style.display = "flex"; if(dmCount) dmCount.innerText = formatNumber(darkMatter); let dmTab = document.getElementById('tab-btn-dm'); if(dmTab) dmTab.style.display = "flex"; }

        let spentPoints = prestigeSkills.reduce((sum, skill) => skill.purchased ? sum + skill.cost : sum, 0); 
        let unspentPoints = prestigePoints - spentPoints; 
        let ppo = document.getElementById('prestige-points-owned'); if(ppo) ppo.innerText = formatNumber(unspentPoints);
        
        let achCount = achievements.filter(a => a.unlocked).length; 
        let totalBonus = (unspentPoints * prestigeBonusPerPoint) + (achCount * achievementBonus) + ((towerFloor - 1) * 0.01); 
        let pMult = document.getElementById('prestige-multiplier'); if(pMult) pMult.innerText = `+${Math.round(totalBonus * 100)}%`;
        
        let pendingPoints = getPendingPrestigePoints(); 
        let pPend = document.getElementById('prestige-pending'); if(pPend) pPend.innerText = formatNumber(pendingPoints); 
        let btnP = document.getElementById('btn-prestige'); if(btnP) { if(pendingPoints > 0) btnP.classList.remove('disabled'); else btnP.classList.add('disabled'); }

        if(ascensionCount > 0 && currentFaction === 0) { let fc = document.getElementById('faction-container'); if(fc) fc.style.display = "block"; let fa = document.getElementById('faction-active'); if(fa) fa.style.display = "none"; } 
        else if (currentFaction > 0) { let fc = document.getElementById('faction-container'); if(fc) fc.style.display = "none"; let fa = document.getElementById('faction-active'); if(fa) { fa.style.display = "block"; let fName = ["", "Guilde des Marchands", "Culte du Doigt Musclé", "Ordre des Architectes"][currentFaction]; fa.innerText = "Faction Actuelle : " + fName; } }

        buildings.forEach(b => { 
            let btn = document.getElementById(`btn-${b.id}`); if (!btn) return; 
            let details = getPurchaseDetails(b); let costEl = document.getElementById(`cost-${b.id}`); if(costEl) costEl.innerText = "Coût: " + formatNumber(details.cost) + " 💰";
            let lblEl = document.getElementById(`amount-label-${b.id}`); if(lblEl) lblEl.innerText = "(+" + details.amount + ")";
            let ownEl = document.getElementById(`owned-${b.id}`); if(ownEl) ownEl.innerText = b.owned;
            if (currentResources >= details.cost && (b.id !== "galaxy" || !hasWon)) { btn.classList.remove('disabled'); btn.classList.add('affordable'); } else { btn.classList.add('disabled'); btn.classList.remove('affordable'); } 
            let mBtn = document.getElementById(`mastery-btn-${b.id}`);
            if(mBtn) { let cost = b.level * 2; mBtn.innerHTML = `⭐ Maîtrise (Lvl ${b.level}) | 💎 ${cost}`; if(gems >= cost) mBtn.disabled = false; else mBtn.disabled = true; }
        });
        
        upgrades.forEach(u => { let btn = document.getElementById(`btn-upg-${u.id}`); if (!btn) return; if (currentResources >= u.cost) { btn.classList.remove('disabled'); btn.classList.add('affordable'); } else { btn.classList.add('disabled'); btn.classList.remove('affordable'); } });
        
        managers.forEach(m => { 
            if(!m.purchased) { 
                let btn = document.getElementById(`btn-mgr-${m.id}`); 
                if(btn) { 
                    let canAfford = false; let mCost = m.cost; 
                    if(currentFaction === 3 && m.currency === "res") mCost /= 2; 
                    if(m.currency === "res" && currentResources >= mCost) canAfford = true; 
                    if(m.currency === "gem" && gems >= mCost) canAfford = true; 
                    if(canAfford) { btn.style.background = "var(--accent-green)"; btn.style.color = "var(--bg-dark)"; btn.style.borderColor = "#28a01f"; btn.style.boxShadow = "0 6px 0 #1b6613"; btn.disabled = false; } 
                    else { btn.style.background = "var(--panel-light)"; btn.style.color = "var(--text-muted)"; btn.style.borderColor = "var(--border-main)"; btn.style.boxShadow = "none"; btn.disabled = true; } 
                } 
            } 
        });

        updateTowerUI(towerFloor, totalProductionPerSecond); 
        updateMinigameUI();
        
        let petDisp = document.getElementById('active-pet-display'); 
        if(petDisp) { 
            if(equippedPet !== null) { 
                let actP = pets.find(p => p.id === equippedPet); 
                if(actP) { petDisp.innerText = actP.icon; petDisp.style.display = "block"; } 
            } else { petDisp.style.display = "none"; } 
        }
        
        updateMissionsUI(); 
        updateHatcheryUI(); 
        if(document.getElementById('tab-expeditions') && document.getElementById('tab-expeditions').classList.contains('active')) updateExpeditionsUI(); 
        if(document.getElementById('tab-garden') && document.getElementById('tab-garden').classList.contains('active')) updateGardenUI();

        // Mise à jour du chrono de la Loterie
        let lotBtn = document.getElementById('btn-daily-lottery'); let lotTim = document.getElementById('lottery-timer'); let lotTL = document.getElementById('lottery-time-left');
        if(lotBtn && lotTim && lotTL) {
            let rem = 86400000 - (Date.now() - (lastLotteryTime || 0));
            if(rem > 0) { 
                lotBtn.classList.add('disabled'); lotBtn.style.background = "var(--panel-light)"; lotBtn.style.borderColor = "var(--border-main)"; lotBtn.innerText = "Ticket épuisé"; 
                lotTim.style.display = "block"; lotTL.innerText = formatTimeLabel(rem / 1000); 
            } else { 
                lotBtn.classList.remove('disabled'); lotBtn.style.background = "var(--accent-purple)"; lotBtn.style.borderColor = "#831d96"; lotBtn.innerText = "🎟️ Tirer au sort"; 
                lotTim.style.display = "none"; 
            }
        }

    } catch (e) { throw new Error("UI Update Crash: " + e.message); }
}

/* ==========================================
   7. SAUVEGARDE ET CHARGEMENT
========================================== */
function saveGame() { 
    try { 
        let saveData = { 
            resources: currentResources, lifetimeResources: lifetimeResources, prestigePoints: prestigePoints, totalClicks: totalClicks, goldenClicks: goldenClicks, timePlayedSeconds: timePlayedSeconds, ascensionCount: ascensionCount, isMuted: isMuted, gems: gems, hasWon: hasWon, buyMultiplier: buyMultiplier, currentWeatherIndex: currentWeatherIndex, 
            missionsProgress: missions.map(m => m.progress), missionsLevel: missions.map(m => m.level), missionsTarget: missions.map(m => m.target), missionsReward: missions.map(m => m.reward), 
            buildingsOwned: buildings.map(b => b.owned), buildingsLevels: buildings.map(b => b.level), 
            upgradesPurchased: upgrades.map(u => u.isPurchased), 
            achievementsUnlocked: achievements.map(a => a.unlocked), 
            skillsPurchased: prestigeSkills.map(s => s.purchased), 
            stocksShares: stocks.map(s => s.shares), stocksAvgCost: stocks.map(s => s.avgCost), stocksHistory: stocks.map(s => s.history), 
            artefactsOwned: artefacts.map(a => a.owned), equippedSlots: equippedSlots, 
            managersPurchased: managers.map(m => m.purchased), 
            expeditionsData: expeditions.map(e => ({active: e.active, startTime: e.startTime, endTime: e.endTime})), 
            gardenPlotsData: gardenPlots, gardenBuffTimer: gardenBuffTimer, 
            currentFaction: currentFaction, towerFloor: towerFloor, bossHP: bossHP, bossMaxHP: bossMaxHP, bossTimer: bossTimer, 
            darkMatter: darkMatter, transcendCount: transcendCount, darkUpgrades: darkUpgrades.map(u => u.purchased), 
            mysteryEggs: mysteryEggs, incubator: incubator, equippedPet: equippedPet, petsOwned: pets.map(p => p.owned), petsLevels: pets.map(p => p.level), petsVals: pets.map(p => p.val), 
            mgLevel: mgLevel, mgXP: mgXP, maxSimonLevel: typeof maxSimonLevel !== 'undefined' ? maxSimonLevel : 0, 
            
            // 👇 Les Quêtes et la Loterie bien formatées pour la sauvegarde :
            lastDailyReset: lastDailyReset, 
            dailyQuestsProgress: dailyQuests.map(q => q.progress), 
            dailyQuestsCompleted: dailyQuests.map(q => q.completed),
            lastLotteryTime: typeof lastLotteryTime !== 'undefined' ? lastLotteryTime : 0,
            
            lastSaveTime: Date.now() 
        }; 
        localStorage.setItem('monJeuIdleSaveV13', JSON.stringify(saveData)); 
        
        // Affichage visuel du cloud
        let cloud = document.getElementById('cloud-save-indicator');
        if(cloud) {
            cloud.style.opacity = '1';
            setTimeout(() => { cloud.style.opacity = '0'; }, 1500);
        }
    } catch(e) { console.error(e); } 
}

function loadGame() { 
    try { 
        let savedString = localStorage.getItem('monJeuIdleSaveV13') || localStorage.getItem('monJeuIdleSaveV12') || localStorage.getItem('monJeuIdleSaveV11') || localStorage.getItem('monJeuIdleSaveV10') || localStorage.getItem('monJeuIdleSaveV9'); 
        if (savedString !== null) { 
            let s = JSON.parse(savedString); 
            currentResources = Number(s.resources)||0; lifetimeResources = Number(s.lifetimeResources)||0; prestigePoints = Number(s.prestigePoints)||0; totalClicks = Number(s.totalClicks)||0; goldenClicks = Number(s.goldenClicks)||0; timePlayedSeconds = Number(s.timePlayedSeconds)||0; ascensionCount = Number(s.ascensionCount)||0; isMuted = s.isMuted||false; gems = Number(s.gems)||0; hasWon = s.hasWon||false; buyMultiplier = s.buyMultiplier||1; currentWeatherIndex = Number(s.currentWeatherIndex)||0; currentFaction = Number(s.currentFaction)||0; towerFloor = Number(s.towerFloor)||1; bossMaxHP = Number(s.bossMaxHP)||1000; bossHP = Number(s.bossHP)||1000; bossTimer = Number(s.bossTimer)||30; darkMatter = Number(s.darkMatter)||0; transcendCount = Number(s.transcendCount)||0; mysteryEggs = Number(s.mysteryEggs)||0; if(s.incubator) incubator = s.incubator; equippedPet = s.equippedPet||null; mgLevel = Number(s.mgLevel)||1; mgXP = Number(s.mgXP)||0; maxSimonLevel = Number(s.maxSimonLevel)||0; 
            let sml = document.getElementById('simon-max-level'); if(sml) sml.innerText = maxSimonLevel;

            let muteBtn = document.getElementById('btn-mute'); 
            if (isMuted && muteBtn) { muteBtn.innerText = "🔇 Son: OFF"; muteBtn.style.background = "#c0392b"; muteBtn.style.borderColor = "#e74c3c"; } 
            
            buildings.forEach((b, i) => { b.owned = Number(s.buildingsOwned?.[i])||0; b.level = Number(s.buildingsLevels?.[i])||1; }); 
            upgrades.forEach((u, i) => { if(s.upgradesPurchased?.[i]) u.isPurchased = s.upgradesPurchased[i]; }); 
            achievements.forEach((a, i) => { if(s.achievementsUnlocked?.[i]) a.unlocked = s.achievementsUnlocked[i]; }); 
            if(s.skillsPurchased && s.skillsPurchased.length === prestigeSkills.length) { prestigeSkills.forEach((skill, i) => { skill.purchased = s.skillsPurchased[i]; }); } else { prestigeSkills.forEach(skill => skill.purchased = false); } 
            darkUpgrades.forEach((u, i) => { if(s.darkUpgrades?.[i]) u.purchased = s.darkUpgrades[i]; }); 
            pets.forEach((p, i) => { if(s.petsOwned?.[i]) p.owned = s.petsOwned[i]; if(s.petsLevels?.[i]) p.level = s.petsLevels[i]; if(s.petsVals?.[i]) p.val = s.petsVals[i]; }); 
            stocks.forEach((stk, i) => { stk.shares = Number(s.stocksShares?.[i])||0; stk.avgCost = Number(s.stocksAvgCost?.[i])||0; if(Array.isArray(s.stocksHistory?.[i]) && s.stocksHistory[i].length===20) stk.history = s.stocksHistory[i]; }); 
            artefacts.forEach((art, i) => { if(s.artefactsOwned?.[i]) art.owned = s.artefactsOwned[i]; }); 
            if(Array.isArray(s.equippedSlots)) { for(let i=0; i<s.equippedSlots.length; i++) { let id = s.equippedSlots[i]; if (id) { let found = artefacts.find(a => a.id === id); if(found) { found.equipped = true; equippedSlots[i] = id; } else { equippedSlots[i] = null; } } } } 
            missions.forEach((m, i) => { if(s.missionsProgress?.[i] !== undefined) { m.progress = Number(s.missionsProgress[i])||0; m.level = Number(s.missionsLevel[i])||1; m.target = Number(s.missionsTarget[i])||500; m.reward = Number(s.missionsReward[i])||1; } }); 
            managers.forEach((m, i) => { if(s.managersPurchased?.[i]) m.purchased = s.managersPurchased[i]; }); 
            expeditions.forEach((e, i) => { if(s.expeditionsData?.[i]) { e.active = s.expeditionsData[i].active; e.startTime = s.expeditionsData[i].startTime; e.endTime = s.expeditionsData[i].endTime; } }); 
            if(s.gardenPlotsData) { for(let i=0; i<4; i++) { if(s.gardenPlotsData[i]) gardenPlots[i] = s.gardenPlotsData[i]; } } 
            gardenBuffTimer = Number(s.gardenBuffTimer)||0; 

            // Chargement de la Loterie et des Quêtes
            lastLotteryTime = Number(s.lastLotteryTime) || 0;
            lastDailyReset = Number(s.lastDailyReset) || Date.now(); 
            if (s.dailyQuestsProgress && s.dailyQuestsCompleted) {
                dailyQuests.forEach((q, i) => { 
                    if (s.dailyQuestsProgress[i] !== undefined) q.progress = Number(s.dailyQuestsProgress[i]); 
                    if (s.dailyQuestsCompleted[i] !== undefined) q.completed = s.dailyQuestsCompleted[i]; 
                });
            }
            
            let w = weathers[currentWeatherIndex] || weathers[0]; let wIcon = document.getElementById('weather-icon'); if(wIcon) { wIcon.innerText = w.icon; let wn = document.getElementById('weather-name'); if(wn) { wn.innerText = w.name; wn.style.color = w.color; } let wd = document.getElementById('weather-desc'); if(wd) wd.innerText = w.desc; } 
            let timeAwayInSeconds = (Date.now() - (Number(s.lastSaveTime)||Date.now())) / 1000; let maxOfflineSeconds = 24 * 60 * 60; let wasCapped = false; if (timeAwayInSeconds > maxOfflineSeconds) { timeAwayInSeconds = maxOfflineSeconds; wasCapped = true; } 
            if (gardenBuffTimer > 0) { gardenBuffTimer -= timeAwayInSeconds; if (gardenBuffTimer < 0) gardenBuffTimer = 0; } 
            if(incubator.active) { incubator.readyTime -= (timeAwayInSeconds * 1000); } 
            window.pendingOfflineSeconds = timeAwayInSeconds; window.pendingOfflineCapped = wasCapped; 
        } else { 
            let startSkill = prestigeSkills.find(s => s.id === "skill_start"); if (startSkill && startSkill.purchased) { currentResources = 1000; lifetimeResources = 1000; } 
        } 
    } catch(err) { console.error("Erreur fatale dans LoadGame : " + err.message); } 
}

function closeOfflineModal() { let md = document.getElementById('offline-modal'); if(md) md.classList.add('hidden'); } 

// === GESTION DE SAUVEGARDE VISUELLE ===
function openExportModal() { 
    saveGame(); let saveString = localStorage.getItem('monJeuIdleSaveV13'); if (!saveString) return alert("Aucune sauvegarde trouvée."); 
    let encodedSave = btoa(saveString); 
    document.getElementById('save-modal-title').innerText = "📤 Exporter ma partie"; 
    document.getElementById('save-modal-desc').innerText = "Copiez ce code pour partager ou sauvegarder votre progression."; 
    let ta = document.getElementById('save-textarea'); ta.value = encodedSave; ta.readOnly = true; 
    document.getElementById('btn-copy-save').style.display = "flex"; document.getElementById('btn-apply-save').style.display = "none"; 
    document.getElementById('save-modal').classList.remove('hidden'); 
}

function openImportModal() { 
    document.getElementById('save-modal-title').innerText = "📥 Importer une partie"; 
    document.getElementById('save-modal-desc').innerText = "Collez un code de sauvegarde. ATTENTION : Cela écrasera votre partie actuelle !"; 
    let ta = document.getElementById('save-textarea'); ta.value = ""; ta.readOnly = false; 
    document.getElementById('btn-copy-save').style.display = "none"; document.getElementById('btn-apply-save').style.display = "flex"; 
    document.getElementById('save-modal').classList.remove('hidden'); 
}

function closeSaveModal() { document.getElementById('save-modal').classList.add('hidden'); }

function copySaveToClipboard() { 
    let ta = document.getElementById('save-textarea'); ta.select(); document.execCommand('copy'); 
    let btn = document.getElementById('btn-copy-save'); btn.innerHTML = "✅ Copié !"; 
    setTimeout(() => { btn.innerHTML = "📋 Copier"; }, 2000); 
    showNotification("Export réussi", "Le code est dans votre presse-papier !"); 
}

function applyImportedSave() { 
    let saveCode = document.getElementById('save-textarea').value; if (!saveCode) return alert("Veuillez coller un code."); 
    try { 
        let decoded = atob(saveCode); JSON.parse(decoded); // Sécurité : vérifie que c'est du JSON valide
        localStorage.setItem('monJeuIdleSaveV13', decoded); location.reload(); 
    } catch (e) { alert("Code de sauvegarde invalide ou corrompu !"); } 
}
function hardReset() { if(confirm("Effacer tout ?")) { localStorage.clear(); location.reload(); } }

/* ==========================================
   8. DÉMARRAGE ET BOUCLE DE JEU
========================================== */
window.addEventListener('DOMContentLoaded', () => {
    try {
        let mainBtn = document.getElementById('main-click-btn');
        if(mainBtn) {
            // C'est ici que l'audio se débloque au premier clic sans planter !
            mainBtn.addEventListener('mousedown', () => initAudio(), { once: true });
            mainBtn.addEventListener('click', doManualClick);
        }

        loadGame(); 
        recalculateProduction();
        
        if (window.pendingOfflineSeconds && window.pendingOfflineSeconds > 60 && totalProductionPerSecond > 0 && !hasWon) { 
            let offlineGains = window.pendingOfflineSeconds * totalProductionPerSecond; 
            currentResources += offlineGains; lifetimeResources += offlineGains; timePlayedSeconds += window.pendingOfflineSeconds; 
            let ot = document.getElementById('offline-time'); if(ot) ot.innerText = formatTimeLabel(window.pendingOfflineSeconds); 
            let og = document.getElementById('offline-gains'); if(og) og.innerText = "+" + formatNumber(offlineGains);
            let omd = document.getElementById('offline-modal'); if(omd) omd.classList.remove('hidden');
        }

        // Lancement du Tutoriel si nouveau joueur
        if (lifetimeResources === 0 && totalClicks === 0) {
            let tm = document.getElementById('tutorial-modal');
            if(tm) tm.classList.remove('hidden');
            let mainBtn = document.getElementById('main-click-btn');
            if(mainBtn) mainBtn.classList.add('pulse-skill'); // Fait briller le gros bouton !
        }
        
        generateStore(); 
        generateUpgrades(); 
        generateSkills(); 
        initMissions(); 
        updateDailyQuestsUI();
        renderAchievements(); 
        generateMarket(); 
        generateInventory(); 
        generateManagers(); 
        generateExpeditions(); 
        generateGarden(); 
        generateDarkMatter(); 
        generateHatchery(); 
        drawVisualEmpire(); 
        setBuyMultiplier(buyMultiplier); 
        scheduleEvents(); 
        
        setInterval(updateMarketLoop, 3000); 
        setInterval(changeWeather, 180000); 
        setInterval(() => { 
            let autoSkill = prestigeSkills.find(s => s.id === "skill_auto_1"); 
            if (autoSkill && autoSkill.purchased) doManualClick(null); 
        }, 500); 
        setInterval(() => { 
            let ts = document.getElementById('tab-stats'); 
            if(ts && ts.classList.contains('active')) updateStatsTab(); 
        }, 1000); 
        setInterval(updateNewsTicker, 12000); 
        setInterval(saveGame, 10000); 
        
        let lastTime = performance.now();
        
        function gameLoop(currentTime) {
            try {
                if (hasWon) return; 
                let deltaTime = (currentTime - lastTime) / 1000; 
                lastTime = currentTime; 
                
                if(darkUpgrades[1].purchased) deltaTime *= 1.2; 
                timePlayedSeconds += deltaTime; 
                processGardenTick(deltaTime);

                if (totalProductionPerSecond > 0) { 
                    let gen = totalProductionPerSecond * deltaTime; 
                    currentResources += gen; 
                    lifetimeResources += gen; 
                    processTowerCombat(deltaTime, gen); 
                }

                if (mgCooldown > 0) { 
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
                
                updateUI(); 
                requestAnimationFrame(gameLoop); 
            } catch (loopError) {
                console.error("Crash dans la Game Loop :", loopError);
                let crashScreen = document.getElementById('crash-screen');
                if (crashScreen) { 
                    crashScreen.style.display = 'block'; 
                    document.getElementById('crash-message').innerText = loopError.stack || loopError.message; 
                }
            }
        }
        
        requestAnimationFrame(gameLoop); 
        
    } catch (erreurFatale) {
        console.error("Erreur Fatale au Lancement :", erreurFatale);
        let crashScreen = document.getElementById('crash-screen');
        if (crashScreen) { 
            crashScreen.style.display = 'block'; 
            document.getElementById('crash-message').innerText = erreurFatale.stack || erreurFatale.message; 
        }
    }
});

// === DRAG & DROP ARBRE DE COMPÉTENCES ===
const skillsWrapper = document.getElementById('skills-wrapper');
let isDragging = false; let startX, startY, scrollLeft, scrollTop;
if (skillsWrapper) {
    skillsWrapper.addEventListener('mousedown', (e) => { isDragging = true; startX = e.pageX - skillsWrapper.offsetLeft; startY = e.pageY - skillsWrapper.offsetTop; scrollLeft = skillsWrapper.scrollLeft; scrollTop = skillsWrapper.scrollTop; });
    skillsWrapper.addEventListener('mouseleave', () => isDragging = false);
    skillsWrapper.addEventListener('mouseup', () => isDragging = false);
    skillsWrapper.addEventListener('mousemove', (e) => { if (!isDragging) return; e.preventDefault(); const x = e.pageX - skillsWrapper.offsetLeft; const y = e.pageY - skillsWrapper.offsetTop; skillsWrapper.scrollLeft = scrollLeft - (x - startX); skillsWrapper.scrollTop = scrollTop - (y - startY); });
}

// === FIN DU FICHIER ===
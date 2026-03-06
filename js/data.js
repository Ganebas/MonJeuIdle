let currentResources = 0; let totalProductionPerSecond = 0;
let baseClickValue = 1; let dynamicClickValue = 1; 
let totalClicks = 0; let lifetimeResources = 0; let prestigePoints = 0; let goldenClicks = 0;
let timePlayedSeconds = 0; let ascensionCount = 0; let isMuted = false;
let gems = 0; let hasWon = false; let buyMultiplier = 1; 

const prestigeBonusPerPoint = 0.02; const achievementBonus = 0.01; const prestigeThreshold = 1000;     

let mgLevel = 1; let mgXP = 0; let mgCooldown = 0; let mgActive = false; let mgHits = 0; let mgTime = 0; let mgTimerInterval = null;
const mgMilestones = [
    { level: 2, desc: "Récompenses Mini-Jeu +50%", type: "mg_reward", val: 1.5 },
    { level: 5, desc: "Production Globale +10%", type: "prod", val: 1.1 },
    { level: 10, desc: "Temps du Mini-Jeu passe à 15s", type: "mg_time", val: 15 },
    { level: 15, desc: "Puissance du Clic x2", type: "click", val: 2 },
    { level: 20, desc: "Dégâts Tour x2", type: "tower", val: 2 }
];
function getMgXPNeeded() { return Math.floor(100 * Math.pow(1.5, mgLevel - 1)); }

let mysteryEggs = 0; let incubator = { active: false, readyTime: 0 }; let equippedPet = null;
const pets = [
    { id: "pet_slime", name: "Slime Doré", icon: "🍮", rarity: "Commun", type: "prod", level: 1, baseVal: 1.5, growth: 0.1, val: 1.5, owned: false },
    { id: "pet_robot", name: "Robot-Clic", icon: "🤖", rarity: "Rare", type: "click", level: 1, baseVal: 3.0, growth: 0.5, val: 3.0, owned: false },
    { id: "pet_dragon", name: "Dragonnet", icon: "🐉", rarity: "Légendaire", type: "tower", level: 1, baseVal: 2.0, growth: 0.5, val: 2.0, owned: false }
];

let currentFaction = 0; let towerFloor = 1; let bossMaxHP = 1000; let bossHP = 1000; let bossTimerMax = 30; let bossTimer = 30; let darkMatter = 0; let transcendCount = 0;

const darkUpgrades = [
    { id: "dm_prod", name: "Énergie Sombre", desc: "Production Globale x3", cost: 1, purchased: false },
    { id: "dm_time", name: "Distorsion Temporelle", desc: "Le temps passe 20% plus vite", cost: 3, purchased: false },
    { id: "dm_gems", name: "Cristallisation", desc: "Missions donnent le double de Gemmes", cost: 5, purchased: false }
];

let gardenBuffTimer = 0; 
const gardenPlots = [ { id: 0, state: 0, readyTime: 0 }, { id: 1, state: 0, readyTime: 0 }, { id: 2, state: 0, readyTime: 0 }, { id: 3, state: 0, readyTime: 0 } ];

const expeditions = [
    { id: "exp_1", name: "Forêt de Jade", icon: "🌲", durationSec: 3600, rewardDesc: "5 💎 + 20% Œuf", active: false, endTime: 0 },
    { id: "exp_2", name: "Mines Oubliées", icon: "⛰️", durationSec: 14400, rewardDesc: "25 💎 + 50% Œuf", active: false, endTime: 0 },
    { id: "exp_3", name: "Temple Céleste", icon: "🏛️", durationSec: 28800, rewardDesc: "50 💎 + Œuf Garanti", active: false, endTime: 0 }
];

const managers = [
    { id: "mgr_cursor", name: "Chef de Projet", icon: "👨‍💼", desc: "Gère les Curseurs", cost: 10000, currency: "res", target: "cursor", purchased: false },
    { id: "mgr_farm", name: "Agriculteur", icon: "👩‍🌾", desc: "Gère les Fermes", cost: 5000000, currency: "res", target: "farm", purchased: false },
    { id: "mgr_mine", name: "Contremaître", icon: "👷‍♂️", desc: "Gère les Mines", cost: 500000000, currency: "res", target: "mine", purchased: false },
    { id: "mgr_bank", name: "Directeur", icon: "🤵", desc: "Gère les Banques", cost: 10000000000, currency: "res", target: "bank", purchased: false },
    { id: "mgr_gold", name: "Faucon Doré", icon: "🦅", desc: "Attrape les Bonus Dorés.", cost: 20, currency: "gem", target: "gold", purchased: false }
];

let currentWeatherIndex = 0;
const weathers = [
    { name: "Ciel Dégagé", bonus: 1.0, color: "#f1c40f", icon: "☀️", desc: "Production normale (x1.0)" },
    { name: "Pluie Dorée", bonus: 1.5, color: "#e1b12c", icon: "🌧️", desc: "Production accrue (x1.5)" },
    { name: "Éclipse Noire", bonus: 0.7, color: "#8e44ad", icon: "🌑", desc: "Production réduite (x0.7)" },
    { name: "Tempête de Clics", bonus: 2.0, color: "#e84118", icon: "⚡", desc: "Production doublée (x2.0)" }
];

const newsMessages = [ "La Bourse s'affole !", "L'Écloserie vient d'ouvrir !", "Attention aux Boss Épiques de la Tour !" ];

const playerRanks = [ { name: "Mendiant", threshold: 0 }, { name: "Paysan", threshold: 500 }, { name: "Artisan", threshold: 5000 }, { name: "Marchand", threshold: 50000 }, { name: "Noble", threshold: 1000000 }, { name: "Roi", threshold: 50000000 }, { name: "Empereur", threshold: 1000000000 }, { name: "Maître Galactique", threshold: 1000000000000 } ];

const missions = [
    { id: "m_click", name: "Frénésie de Clics", desc: "Faire des clics manuels", target: 500, progress: 0, reward: 1, level: 1 },
    { id: "m_buy", name: "Magnat de l'Immo", desc: "Acheter des bâtiments", target: 50, progress: 0, reward: 2, level: 1 },
    { id: "m_golden", name: "Chasseur de Trésor", desc: "Bonus dorés attrapés", target: 3, progress: 0, reward: 3, level: 1 }
];

const stocks = [
    { id: "stk_click", name: "ClickCorp", price: 50, basePrice: 50, shares: 0, avgCost: 0, vol: 0.05, trend: 0, history: Array(20).fill(50) },
    { id: "stk_farm", name: "AgriTech", price: 500, basePrice: 500, shares: 0, avgCost: 0, vol: 0.15, trend: 0, history: Array(20).fill(500) },
    { id: "stk_mine", name: "DeepMine", price: 5000, basePrice: 5000, shares: 0, avgCost: 0, vol: 0.30, trend: 0, history: Array(20).fill(5000) }
];

const artefacts = [
    { id: "art_time", name: "Sablier Céleste", icon: "⏳", desc: "Production x2", owned: false, equipped: false, type: "prod", val: 2 },
    { id: "art_power", name: "Gant de Titan", icon: "🥊", desc: "Clic x3", owned: false, equipped: false, type: "click", val: 3 },
    { id: "art_wealth", name: "Bourse Magique", icon: "💰", desc: "Prix -20%", owned: false, equipped: false, type: "cost", val: 0.8 },
    { id: "art_luck", name: "Trèfle à 4 Feuilles", icon: "🍀", desc: "Bonus Doré x2", owned: false, equipped: false, type: "gold", val: 2 }
];
let equippedSlots = [null, null]; 

const buildings = [
    { id: "cursor", icon: "🖱️", name: "Curseur", baseCost: 15, baseProduction: 0.1, owned: 0, rate: 1.15, level: 1 },
    { id: "grandma", icon: "👵", name: "Grand-Mère", baseCost: 100, baseProduction: 1.0, owned: 0, rate: 1.15, level: 1, synergy: { targetId: "grandma", bonusPerOwned: 0.02, description: "+2% par GM" } },
    { id: "farm", icon: "🌾", name: "Ferme", baseCost: 1100, baseProduction: 8.0, owned: 0, rate: 1.15, level: 1, synergy: { targetId: "grandma", bonusPerOwned: 0.02, description: "+2% par GM" } },
    { id: "mine", icon: "⛏️", name: "Mine", baseCost: 12000, baseProduction: 47.0, owned: 0, rate: 1.15, level: 1, synergy: { targetId: "cursor", bonusPerOwned: 0.01, description: "+1% par Curseur" } },
    { id: "factory", icon: "🏭", name: "Usine", baseCost: 130000, baseProduction: 260.0, owned: 0, rate: 1.15, level: 1, synergy: { targetId: "mine", bonusPerOwned: 0.05, description: "+5% par Mine" } },
    { id: "bank", icon: "🏦", name: "Banque", baseCost: 1400000, baseProduction: 1400.0, owned: 0, rate: 1.15, level: 1 },
    { id: "temple", icon: "🏛️", name: "Temple", baseCost: 20000000, baseProduction: 7800.0, owned: 0, rate: 1.15, level: 1, synergy: { targetId: "grandma", bonusPerOwned: 0.10, description: "+10% par GM" } },
    { id: "portal", icon: "🌀", name: "Portail", baseCost: 330000000, baseProduction: 45000.0, owned: 0, rate: 1.15, level: 1 },
    { id: "dyson", icon: "☀️", name: "Dyson", baseCost: 5100000000, baseProduction: 300000.0, owned: 0, rate: 1.15, level: 1 },
    { id: "wormhole", icon: "🕳️", name: "Trou Ver", baseCost: 75000000000, baseProduction: 2500000.0, owned: 0, rate: 1.15, level: 1 },
    { id: "engine", icon: "🚀", name: "Stellaire", baseCost: 1000000000000, baseProduction: 20000000.0, owned: 0, rate: 1.15, level: 1 },
    { id: "galaxy", icon: "🌌", name: "Galaxie", baseCost: 1e21, baseProduction: 0, owned: 0, rate: 1, level: 1 }
];

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

const achievements = [
    { id: "ach1", icon: "👆", name: "Doigt Musclé", desc: "Cliquer 100 fois", unlocked: false, condition: () => totalClicks >= 100 },
    { id: "ach2", icon: "🏗️", name: "Bâtisseur", desc: "Acheter un bâtiment", unlocked: false, condition: () => { return (typeof buildings !== 'undefined') && buildings.some(b => b.owned > 0) } },
    { id: "ach3", icon: "💎", name: "Riche", desc: "Gagner 10 Gemmes", unlocked: false, condition: () => gems >= 10 },
    { id: "ach4", icon: "🛡️", name: "Garde", desc: "Repousser un voleur", unlocked: false, condition: () => false },
    { id: "ach5", icon: "🏭", name: "Industriel", desc: "Posséder une Usine", unlocked: false, condition: () => { let fac = (typeof buildings !== 'undefined') ? buildings.find(b => b.id === "factory") : null; return fac && fac.owned >= 1; } },
    { id: "ach6", icon: "🙏", name: "Illumination", desc: "Posséder un Temple", unlocked: false, condition: () => { let tmp = (typeof buildings !== 'undefined') ? buildings.find(b => b.id === "temple") : null; return tmp && tmp.owned >= 1; } }
];

const prestigeSkills = [
    { id: "skill_start", icon: "🚀", name: "Éveil", desc: "Débloque l'Arbre.", cost: 1, purchased: false, reqs: [], x: 50, y: 5 },
    { id: "skill_click_1", icon: "👆", name: "Doigt de Fer", desc: "Clic x2.", cost: 2, purchased: false, reqs: ["skill_start"], x: 20, y: 20 },
    { id: "skill_click_2", icon: "⚡", name: "Foudre", desc: "Clic x5.", cost: 5, purchased: false, reqs: ["skill_click_1"], x: 20, y: 40 },
    { id: "skill_auto_1", icon: "🤖", name: "Fantômes", desc: "Auto-clic (2/s).", cost: 10, purchased: false, reqs: ["skill_click_2"], x: 10, y: 60 },
    { id: "skill_crit", icon: "🎯", name: "Précision", desc: "Clic x10.", cost: 20, purchased: false, reqs: ["skill_click_2"], x: 30, y: 60 },
    { id: "skill_prod_1", icon: "⚙️", name: "Rendement", desc: "Prod +50%.", cost: 3, purchased: false, reqs: ["skill_start"], x: 50, y: 20 },
    { id: "skill_prod_2", icon: "🏭", name: "Surcadençage", desc: "Prod x2.", cost: 8, purchased: false, reqs: ["skill_prod_1"], x: 50, y: 40 },
    { id: "skill_tower_1", icon: "⚔️", name: "Héros", desc: "Dégâts Tour x2.", cost: 15, purchased: false, reqs: ["skill_prod_2"], x: 50, y: 60 },
    { id: "skill_tower_2", icon: "⏳", name: "Temps Boss", desc: "Boss +10 sec.", cost: 25, purchased: false, reqs: ["skill_tower_1"], x: 50, y: 80 },
    { id: "skill_cost_1", icon: "🤝", name: "Négociateur", desc: "Bâtiments -10%.", cost: 2, purchased: false, reqs: ["skill_start"], x: 80, y: 20 },
    { id: "skill_cost_2", icon: "📜", name: "Contrats", desc: "Bâtiments -20%.", cost: 5, purchased: false, reqs: ["skill_cost_1"], x: 80, y: 40 },
    { id: "skill_gold_1", icon: "🌟", name: "Aura Dorée", desc: "Durée Dorée x2.", cost: 10, purchased: false, reqs: ["skill_cost_2"], x: 70, y: 60 },
    { id: "skill_cost_3", icon: "🏛️", name: "Monopole", desc: "Bâtiments -30%.", cost: 15, purchased: false, reqs: ["skill_cost_2"], x: 90, y: 60 },
    { id: "skill_ultimate", icon: "👑", name: "Ascension Divine", desc: "Prod globale x5.", cost: 50, purchased: false, reqs: ["skill_crit", "skill_tower_2", "skill_cost_3"], x: 50, y: 95 }
];
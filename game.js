/* ==========================================================================
   Keeper Word Quest — game logic (vanilla JS)
   Fan-made word search inspired by Keeper of the Lost Cities.
   - 50 themed puzzles
   - Deterministic word-search grid generator
   - Touch + mouse drag selection (8 directions)
   - Progress / stars / hints in localStorage
   - PWA service worker registration
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     Storage keys & defaults
     -------------------------------------------------------------------------- */
  const STORAGE = {
    progress: "kwq.progress.v1",
    settings: "kwq.settings.v1",
    onboarding: "kwq.onboarding.done"
  };

  const FREE_HINTS = 8;

  /* --------------------------------------------------------------------------
     Theme palettes (CSS variable maps + emoji)
     -------------------------------------------------------------------------- */
  const PALETTES = {
    moonlark: { primary: "#5B8DEF", secondary: "#A8D5E5", accent: "#F7D060", bg: "#EEF6FB", found: "#3B6FB6", grid: "#E8F1F8", emoji: "🌙" },
    foxfire: { primary: "#E67E22", secondary: "#F5B041", accent: "#1ABC9C", bg: "#FFF8F0", found: "#CA6F1E", grid: "#FEF3E8", emoji: "🔥" },
    mind: { primary: "#8E44AD", secondary: "#BB8FCE", accent: "#5DADE2", bg: "#F5EEF8", found: "#6C3483", grid: "#F0E6F6", emoji: "🧠" },
    swan: { primary: "#2C3E50", secondary: "#85929E", accent: "#ECF0F1", bg: "#F4F6F7", found: "#1C2833", grid: "#EBEFF2", emoji: "🦢" },
    neverseen: { primary: "#922B21", secondary: "#E74C3C", accent: "#F5B7B1", bg: "#FDF2F0", found: "#7B241C", grid: "#F9EBEA", emoji: "👁️" },
    keefe: { primary: "#1ABC9C", secondary: "#76D7C4", accent: "#F4D03F", bg: "#E8F8F5", found: "#148F77", grid: "#D5F5E3", emoji: "😏" },
    fitz: { primary: "#2471A3", secondary: "#5DADE2", accent: "#F8C471", bg: "#EAF2F8", found: "#1A5276", grid: "#D6EAF8", emoji: "💙" },
    biana: { primary: "#C0392B", secondary: "#F1948A", accent: "#F9E79F", bg: "#FDEDEC", found: "#922B21", grid: "#FADBD8", emoji: "✨" },
    dex: { primary: "#B7950B", secondary: "#F7DC6F", accent: "#58D68D", bg: "#FEF9E7", found: "#9A7D0A", grid: "#FCF3CF", emoji: "⚙️" },
    haven: { primary: "#196F3D", secondary: "#82E0AA", accent: "#F9E79F", bg: "#E9F7EF", found: "#145A32", grid: "#D5F5E3", emoji: "🏡" },
    everglen: { primary: "#1A5276", secondary: "#7FB3D5", accent: "#AED6F1", bg: "#EBF5FB", found: "#154360", grid: "#D4E6F1", emoji: "🏰" },
    atlantis: { primary: "#0E6655", secondary: "#48C9B0", accent: "#5DADE2", bg: "#E8F6F3", found: "#0B5345", grid: "#D0ECE7", emoji: "🌊" },
    eternalia: { primary: "#6C3483", secondary: "#D2B4DE", accent: "#F7DC6F", bg: "#F5EEF8", found: "#5B2C6F", grid: "#EBDEF0", emoji: "🏛️" },
    leap: { primary: "#2874A6", secondary: "#85C1E9", accent: "#F8C471", bg: "#EBF5FB", found: "#1B4F72", grid: "#D6EAF8", emoji: "💫" },
    abilities: { primary: "#AF601A", secondary: "#E59866", accent: "#58D68D", bg: "#FDF2E9", found: "#935116", grid: "#FAE5D3", emoji: "⚡" },
    council: { primary: "#1C2833", secondary: "#5D6D7E", accent: "#D5D8DC", bg: "#F4F6F7", found: "#17202A", grid: "#E5E8E8", emoji: "⚖️" },
    cognate: { primary: "#9B59B6", secondary: "#D7BDE2", accent: "#F5B041", bg: "#F5EEF8", found: "#7D3C98", grid: "#EBDEF0", emoji: "🔗" },
    silveny: { primary: "#D4AC0D", secondary: "#F9E79F", accent: "#AED6F1", bg: "#FEF9E7", found: "#B7950B", grid: "#FCF3CF", emoji: "🦄" },
    project: { primary: "#117A65", secondary: "#73C6B6", accent: "#F7DC6F", bg: "#E8F6F3", found: "#0E6655", grid: "#D1F2EB", emoji: "🔬" },
    fashion: { primary: "#B03A2E", secondary: "#F5B7B1", accent: "#D7BDE2", bg: "#FDEDEC", found: "#922B21", grid: "#FADBD8", emoji: "🧥" },
    gnomes: { primary: "#1E8449", secondary: "#7DCEA0", accent: "#F8C471", bg: "#E9F7EF", found: "#196F3D", grid: "#D5F5E3", emoji: "🌿" },
    sanctuary: { primary: "#1A5276", secondary: "#7FB3D5", accent: "#82E0AA", bg: "#EAF2F8", found: "#154360", grid: "#D4E6F1", emoji: "🐾" },
    exile: { primary: "#4A235A", secondary: "#A569BD", accent: "#85929E", bg: "#F5EEF8", found: "#3B1C4A", grid: "#E8DAEF", emoji: "🔒" },
    empath: { primary: "#E74C3C", secondary: "#F5B7B1", accent: "#F9E79F", bg: "#FDEDEC", found: "#C0392B", grid: "#FADBD8", emoji: "💗" },
    hydro: { primary: "#1A5276", secondary: "#5DADE2", accent: "#76D7C4", bg: "#EBF5FB", found: "#154360", grid: "#D4E6F1", emoji: "💧" },
    pyro: { primary: "#CA6F1E", secondary: "#E59866", accent: "#F5B041", bg: "#FDF2E9", found: "#A04000", grid: "#FAE5D3", emoji: "🔥" },
    shade: { primary: "#212F3D", secondary: "#5D6D7E", accent: "#A569BD", bg: "#EBEDEF", found: "#1B2631", grid: "#D5D8DC", emoji: "🌑" },
    flasher: { primary: "#F4D03F", secondary: "#F9E79F", accent: "#5DADE2", bg: "#FEF9E7", found: "#B7950B", grid: "#FCF3CF", emoji: "💡" },
    teleport: { primary: "#6C3483", secondary: "#BB8FCE", accent: "#5DADE2", bg: "#F5EEF8", found: "#5B2C6F", grid: "#EBDEF0", emoji: "🌀" },
    cities: { primary: "#1B4F72", secondary: "#5DADE2", accent: "#F7DC6F", bg: "#EBF5FB", found: "#154360", grid: "#D6EAF8", emoji: "🌆" },
    humans: { primary: "#7B7D7D", secondary: "#BFC9CA", accent: "#5DADE2", bg: "#F4F6F7", found: "#5D6D7E", grid: "#E5E8E8", emoji: "🌍" },
    lodestar: { primary: "#1A5276", secondary: "#F4D03F", accent: "#ECF0F1", bg: "#FEF9E7", found: "#154360", grid: "#FCF3CF", emoji: "⭐" },
    memory: { primary: "#5B2C6F", secondary: "#D2B4DE", accent: "#85C1E9", bg: "#F5EEF8", found: "#4A235A", grid: "#EBDEF0", emoji: "💭" },
    crystal: { primary: "#148F77", secondary: "#76D7C4", accent: "#AED6F1", bg: "#E8F8F5", found: "#0E6655", grid: "#D1F2EB", emoji: "💎" },
    creatures: { primary: "#196F3D", secondary: "#82E0AA", accent: "#F5B041", bg: "#E9F7EF", found: "#145A32", grid: "#D5F5E3", emoji: "🐉" },
    vacker: { primary: "#1A5276", secondary: "#85C1E9", accent: "#F8C471", bg: "#EAF2F8", found: "#154360", grid: "#D6EAF8", emoji: "🔷" },
    sencen: { primary: "#117A65", secondary: "#76D7C4", accent: "#F5B041", bg: "#E8F8F5", found: "#0E6655", grid: "#D5F5E3", emoji: "🎭" },
    ruewen: { primary: "#1E8449", secondary: "#82E0AA", accent: "#F9E79F", bg: "#E9F7EF", found: "#196F3D", grid: "#D4EFDF", emoji: "💚" },
    team: { primary: "#2874A6", secondary: "#F1948A", accent: "#76D7C4", bg: "#EBF5FB", found: "#1B4F72", grid: "#D6EAF8", emoji: "🤝" },
    school: { primary: "#B9770E", secondary: "#F8C471", accent: "#5DADE2", bg: "#FEF5E7", found: "#9C640C", grid: "#FDEBD0", emoji: "📚" },
    feast: { primary: "#A04000", secondary: "#E59866", accent: "#F9E79F", bg: "#FDF2E9", found: "#873600", grid: "#FAE5D3", emoji: "🍇" },
    regalia: { primary: "#6C3483", secondary: "#F7DC6F", accent: "#AED6F1", bg: "#F5EEF8", found: "#5B2C6F", grid: "#EBDEF0", emoji: "👑" },
    stars: { primary: "#1B2631", secondary: "#5DADE2", accent: "#F7DC6F", bg: "#EBF5FB", found: "#0B5345", grid: "#D6EAF8", emoji: "🌌" },
    friends: { primary: "#C0392B", secondary: "#85C1E9", accent: "#82E0AA", bg: "#FDEDEC", found: "#922B21", grid: "#FADBD8", emoji: "💫" },
    threats: { primary: "#7B241C", secondary: "#E74C3C", accent: "#85929E", bg: "#FDF2F0", found: "#641E16", grid: "#F5B7B1", emoji: "⚠️" },
    healing: { primary: "#148F77", secondary: "#A3E4D7", accent: "#F5B7B1", bg: "#E8F8F5", found: "#0E6655", grid: "#D1F2EB", emoji: "🩺" },
    paths: { primary: "#2471A3", secondary: "#AED6F1", accent: "#F8C471", bg: "#EAF2F8", found: "#1A5276", grid: "#D4E6F1", emoji: "🗺️" },
    secrets: { primary: "#4A235A", secondary: "#A569BD", accent: "#F7DC6F", bg: "#F5EEF8", found: "#3B1C4A", grid: "#E8DAEF", emoji: "🔐" },
    hope: { primary: "#1ABC9C", secondary: "#F7DC6F", accent: "#85C1E9", bg: "#E8F8F5", found: "#148F77", grid: "#D5F5E3", emoji: "🌅" },
    ultimate: { primary: "#1B4F72", secondary: "#F4D03F", accent: "#E74C3C", bg: "#FEF9E7", found: "#154360", grid: "#FCF3CF", emoji: "🏆" }
  };

  /**
   * Found-word highlights — medium saturation, used at high opacity under dark letters.
   * Avoid pure neon pastels that wash out grid text.
   */
  const FOUND_COLORS = [
    "#f9a8d4", "#c4b5fd", "#5eead4", "#fcd34d", "#93c5fd", "#f9a8d4",
    "#6ee7b7", "#ddd6fe", "#fdba74", "#67e8f9", "#f0abfc", "#fca5a5",
    "#5eead4", "#fde047", "#a5b4fc", "#fda4af", "#86efac", "#d8b4fe"
  ];

  /** Matching darker stroke colors for the selection canvas underline */
  const FOUND_STROKES = [
    "#be185d", "#6d28d9", "#0f766e", "#a16207", "#1d4ed8", "#be185d",
    "#047857", "#5b21b6", "#c2410c", "#0e7490", "#a21caf", "#b91c1c",
    "#0f766e", "#a16207", "#4338ca", "#be123c", "#15803d", "#7e22ce"
  ];

  /* --------------------------------------------------------------------------
     50 puzzle definitions
     gridSize: 10 | 12 | 15
     words: uppercase letters only, length <= gridSize, 10–18 words
     -------------------------------------------------------------------------- */
  const PUZZLES = [
    { id: 1, title: "Sophie Foster", subtitle: "The girl who changed everything", category: "Characters", gridSize: 10, palette: "moonlark", words: ["SOPHIE", "FOSTER", "HUMAN", "TELEPATH", "BROWN", "EYES", "CURIOUS", "BRAVE", "LEADER", "MOONLARK"] },
    { id: 2, title: "Foxfire Academy", subtitle: "Levels, mentors & midterms", category: "Places", gridSize: 12, palette: "foxfire", words: ["FOXFIRE", "ACADEMY", "LEVEL", "MENTOR", "SESSION", "CAMPUS", "MIDTERM", "HALL", "UNIFORM", "PRODIGY", "TOWER", "LIBRARY"] },
    { id: 3, title: "Mind & Telepathy", subtitle: "Thoughts that leap between minds", category: "Abilities", gridSize: 12, palette: "mind", words: ["TELEPATH", "THOUGHT", "MIND", "PROBE", "SHIELD", "COGNATE", "FOCUS", "MEMORY", "WHISPER", "LINK", "BRAIN", "SIGNAL"] },
    { id: 4, title: "The Black Swan", subtitle: "Masks, missions & moonlarks", category: "Factions", gridSize: 12, palette: "swan", words: ["BLACK", "SWAN", "MASK", "MISSION", "CACHE", "CODE", "ALLIES", "PLAN", "SECRET", "CELL", "GUIDE", "TRUST"] },
    { id: 5, title: "The Neverseen", subtitle: "Shadows against the Council", category: "Factions", gridSize: 12, palette: "neverseen", words: ["NEVERSEEN", "REBEL", "THREAT", "HOOD", "PLOT", "ENEMY", "RAID", "BASE", "CLOAK", "DANGER", "STRIKE", "LIES"] },
    { id: 6, title: "Keefe Sencen", subtitle: "Empath, artist, chaos gremlin", category: "Characters", gridSize: 12, palette: "keefe", words: ["KEEFE", "SENCEN", "EMPATH", "SMIRK", "SKETCH", "TEASE", "LOYAL", "REBEL", "FEELING", "JOKES", "ARTIST", "FOSTER"] },
    { id: 7, title: "Fitz Vacker", subtitle: "Cognate, telepath, team heart", category: "Characters", gridSize: 10, palette: "fitz", words: ["FITZ", "VACKER", "COGNATE", "TELEPATH", "NOBLE", "FOCUS", "BROTHER", "ALLY", "TRAIN", "PRIDE"] },
    { id: 8, title: "Biana Vacker", subtitle: "Vanisher with fierce style", category: "Characters", gridSize: 10, palette: "biana", words: ["BIANA", "VANISHER", "STYLE", "SPARKLE", "SISTER", "BRAVE", "GLAMOUR", "FRIEND", "GLOW", "BOLD"] },
    { id: 9, title: "Dex the Tinkerer", subtitle: "Technopath gadgets & grit", category: "Characters", gridSize: 12, palette: "dex", words: ["DEX", "DIZZNEE", "TECHNOPATH", "GADGET", "INVENT", "GEAR", "FIX", "CLEVER", "TOOLS", "SPARK", "BUILD", "FRIEND"] },
    { id: 10, title: "Havenfield Home", subtitle: "Pastures, pets & family", category: "Places", gridSize: 12, palette: "haven", words: ["HAVENFIELD", "PASTURE", "HOME", "STABLE", "GNOME", "GARDEN", "FAMILY", "COZY", "FIELD", "NEST", "SAFE", "GROVE"] },
    { id: 11, title: "Everglen Estate", subtitle: "Gates, glory & Vacker legacy", category: "Places", gridSize: 12, palette: "everglen", words: ["EVERGLEN", "ESTATE", "GATE", "MANOR", "LEGACY", "LAKE", "GARDEN", "HALL", "NOBLE", "PATH", "VIEW", "STONE"] },
    { id: 12, title: "Atlantis Below", subtitle: "Domes, markets & deep blue", category: "Places", gridSize: 12, palette: "atlantis", words: ["ATLANTIS", "DOME", "OCEAN", "MARKET", "CORAL", "DEPTH", "CITY", "WATER", "BRIDGE", "GLOW", "REEF", "TIDE"] },
    { id: 13, title: "Eternalia Capital", subtitle: "Seat of elvin power", category: "Places", gridSize: 12, palette: "eternalia", words: ["ETERNALIA", "CAPITAL", "COUNCIL", "PLAZA", "TOWER", "CRYSTAL", "THRONE", "COURT", "GOLD", "PRIDE", "ORDER", "LAW"] },
    { id: 14, title: "Light Leaping", subtitle: "Beams, crystals & destinations", category: "Magic", gridSize: 12, palette: "leap", words: ["LEAP", "LIGHT", "CRYSTAL", "BEAM", "PATH", "FOCUS", "DESTINY", "GLINT", "TRAVEL", "SPARK", "ROUTE", "FLASH"] },
    { id: 15, title: "Special Abilities", subtitle: "The talent that defines you", category: "Abilities", gridSize: 15, palette: "abilities", words: ["ABILITY", "TALENT", "MANIFEST", "TRAINING", "SKILL", "POWER", "GIFT", "CONTROL", "FOCUS", "RARE", "STRONG", "UNIQUE", "LESSON", "TEST"] },
    { id: 16, title: "The Council", subtitle: "Twelve voices, one order", category: "Politics", gridSize: 12, palette: "council", words: ["COUNCIL", "RULE", "VOTE", "ORDER", "LAW", "DEBATE", "POWER", "JUDGE", "SEAT", "DECREE", "NOBLE", "CROWN"] },
    { id: 17, title: "Cognates Bound", subtitle: "Trust that unlocks minds", category: "Relationships", gridSize: 10, palette: "cognate", words: ["COGNATE", "TRUST", "BOND", "PAIR", "SHARE", "OPEN", "MIND", "UNITY", "VOW", "LINK"] },
    { id: 18, title: "Silveny Rising", subtitle: "Alicorn wings & starlight", category: "Creatures", gridSize: 12, palette: "silveny", words: ["SILVENY", "ALICORN", "WINGS", "HORN", "FLIGHT", "SPARKLE", "HERD", "STAR", "GENTLE", "MAGIC", "GREY", "HOOVES"] },
    { id: 19, title: "Project Moonlark", subtitle: "Genetics, hope & mystery", category: "Plot", gridSize: 12, palette: "project", words: ["PROJECT", "MOONLARK", "GENES", "PLAN", "SECRET", "ORIGIN", "DESIGN", "HOPE", "CODE", "LAB", "CHANGE", "FATE"] },
    { id: 20, title: "Capes & Couture", subtitle: "Elvin fashion statements", category: "Culture", gridSize: 12, palette: "fashion", words: ["CAPE", "TUNIC", "JEWEL", "SILK", "STYLE", "FABRIC", "GLOW", "TRIM", "BOOTS", "SASH", "GLITTER", "LOOK"] },
    { id: 21, title: "Gnomes of Green", subtitle: "Earth magic & gardens", category: "Species", gridSize: 10, palette: "gnomes", words: ["GNOME", "GARDEN", "PLANT", "ROOT", "EARTH", "GROW", "SEED", "LEAF", "SOIL", "HARVEST"] },
    { id: 22, title: "The Sanctuary", subtitle: "Creatures under watchful care", category: "Places", gridSize: 12, palette: "sanctuary", words: ["SANCTUARY", "CREATURE", "CARE", "CAGE", "HEAL", "GUARD", "WILD", "SAFE", "NEST", "BEAST", "KEEP", "WATCH"] },
    { id: 23, title: "Exile & Lumenaria", subtitle: "Prisons of light and stone", category: "Places", gridSize: 12, palette: "exile", words: ["EXILE", "PRISON", "CELL", "GUARD", "LOCK", "STONE", "ISOLATE", "WALL", "CHAIN", "JUDGE", "GATE", "DARK"] },
    { id: 24, title: "Empath Waves", subtitle: "Feelings as clear as words", category: "Abilities", gridSize: 10, palette: "empath", words: ["EMPATH", "FEEL", "MOOD", "HEART", "SENSE", "WAVE", "PAIN", "JOY", "CALM", "READ"] },
    { id: 25, title: "Hydrokinetic Tide", subtitle: "Water bends to will", category: "Abilities", gridSize: 12, palette: "hydro", words: ["HYDRO", "WATER", "WAVE", "TIDE", "STREAM", "FLOOD", "MIST", "RIVER", "FLOW", "DROP", "POOL", "CURRENT"] },
    { id: 26, title: "Pyrokinetic Flame", subtitle: "Fire that must be mastered", category: "Abilities", gridSize: 10, palette: "pyro", words: ["PYRO", "FLAME", "FIRE", "HEAT", "BURN", "SPARK", "BLAZE", "ASH", "SMOKE", "CONTROL"] },
    { id: 27, title: "Shade & Shadow", subtitle: "Darkness shaped by skill", category: "Abilities", gridSize: 12, palette: "shade", words: ["SHADE", "SHADOW", "DARK", "VEIL", "NIGHT", "CLOAK", "GLOOM", "DUSK", "SILENT", "EDGE", "BLACK", "MIST"] },
    { id: 28, title: "Flasher Bright", subtitle: "Light as weapon and beacon", category: "Abilities", gridSize: 10, palette: "flasher", words: ["FLASHER", "LIGHT", "BEAM", "GLOW", "BLIND", "SHINE", "RAY", "BURST", "BRIGHT", "LAMP"] },
    { id: 29, title: "Teleporter Leap", subtitle: "Blink and you are gone", category: "Abilities", gridSize: 10, palette: "teleport", words: ["TELEPORT", "BLINK", "JUMP", "VANISH", "ARRIVE", "SHIFT", "SPACE", "MOVE", "SNAP", "AWAY"] },
    { id: 30, title: "Lost Cities Map", subtitle: "Hidden realms of the elves", category: "World", gridSize: 12, palette: "cities", words: ["LOST", "CITIES", "ELVES", "REALM", "HIDDEN", "WORLD", "MAP", "BORDER", "LAND", "HOME", "MYTH", "REAL"] },
    { id: 31, title: "Forbidden Cities", subtitle: "Where humans unknowingly live", category: "World", gridSize: 12, palette: "humans", words: ["HUMAN", "FORBID", "MORTAL", "EARTH", "CITY", "SECRET", "RULE", "HIDE", "NORMAL", "WORLD", "VEIL", "LAW"] },
    { id: 32, title: "Lodestar Night", subtitle: "Stars that guide (and bind)", category: "Plot", gridSize: 12, palette: "lodestar", words: ["LODESTAR", "STAR", "GUIDE", "NIGHT", "SIGNAL", "BEACON", "PATH", "SKY", "CODE", "LIGHT", "MARK", "CALL"] },
    { id: 33, title: "Memory Wipes", subtitle: "What the mind chooses to lose", category: "Magic", gridSize: 12, palette: "memory", words: ["MEMORY", "WIPE", "FORGET", "RECALL", "WASH", "PAST", "BLOCK", "TRUTH", "HIDE", "SCENE", "BLANK", "MIND"] },
    { id: 34, title: "Crystal Cities", subtitle: "Glass spires and gleam", category: "World", gridSize: 12, palette: "crystal", words: ["CRYSTAL", "SPIRE", "GLASS", "GLEAM", "TOWER", "SHINE", "FACET", "PRISM", "CLEAR", "STONE", "GLOW", "HALL"] },
    { id: 35, title: "Elvin Creatures", subtitle: "Beasts of legend and stable", category: "Creatures", gridSize: 12, palette: "creatures", words: ["IMP", "MURCAT", "ARGENT", "GORGODON", "FLAREADON", "SAURIAN", "BEAST", "WINGS", "TAIL", "CLAW", "ROAR", "NEST"] },
    { id: 36, title: "Vacker Legacy", subtitle: "Blue blood and heavy names", category: "Families", gridSize: 12, palette: "vacker", words: ["VACKER", "LEGACY", "NOBLE", "NAME", "HEIR", "PRIDE", "HOUSE", "FAME", "DUTY", "LINE", "HONOR", "CLAN"] },
    { id: 37, title: "Sencen Shadows", subtitle: "Empaths, expectations, escape", category: "Families", gridSize: 12, palette: "sencen", words: ["SENCEN", "EMPATH", "FATHER", "MOTHER", "PRESSURE", "ESCAPE", "HOME", "MASK", "PAIN", "ART", "SMILE", "WALL"] },
    { id: 38, title: "Ruewen Heart", subtitle: "Adopted family, real love", category: "Families", gridSize: 10, palette: "ruewen", words: ["RUEWEN", "ADOPT", "FAMILY", "LOVE", "CARE", "HOME", "SAFE", "PARENT", "BOND", "HEART"] },
    { id: 39, title: "Team Moonlark", subtitle: "Friends who face the fire", category: "Relationships", gridSize: 12, palette: "team", words: ["TEAM", "FRIEND", "SQUAD", "LOYAL", "FIGHT", "TRUST", "UNITY", "BRAVE", "HELP", "CREW", "TOGETHER", "HOPE"] },
    { id: 40, title: "Foxfire Classes", subtitle: "Elvin subjects & study halls", category: "School", gridSize: 12, palette: "school", words: ["HISTORY", "LINGUISTICS", "MULTISPECIES", "PHYSICAL", "ELEMENTAL", "FOCUS", "STUDY", "EXAM", "TUTOR", "NOTES", "BOOKS", "QUIZ"] },
    { id: 41, title: "Elvin Feasts", subtitle: "Mallowmelt & more", category: "Culture", gridSize: 10, palette: "feast", words: ["MALLOWMELT", "FEAST", "SWEET", "FRUIT", "CAKE", "TABLE", "GUEST", "TOAST", "SPICE", "TREAT"] },
    { id: 42, title: "Regalia Night", subtitle: "Crowns, jewels, ceremony", category: "Culture", gridSize: 12, palette: "regalia", words: ["REGALIA", "CROWN", "JEWEL", "CEREMONY", "SASH", "GOLD", "FORMAL", "GALA", "HONOR", "DRESS", "LIGHT", "BALL"] },
    { id: 43, title: "Stars & Sky", subtitle: "Constellations over the cities", category: "World", gridSize: 10, palette: "stars", words: ["STAR", "SKY", "NIGHT", "COMET", "MOON", "GLOW", "COSMOS", "ORBIT", "LIGHT", "VOID"] },
    { id: 44, title: "Circle of Friends", subtitle: "Names that stand with Sophie", category: "Characters", gridSize: 15, palette: "friends", words: ["SOPHIE", "KEEFE", "FITZ", "BIANA", "DEX", "LINH", "TAM", "MARELLA", "WYLIE", "JOLIE", "EDALINE", "GRADY", "SANDOR", "ALLY"] },
    { id: 45, title: "Rising Threats", subtitle: "Plots that shake the realms", category: "Plot", gridSize: 12, palette: "threats", words: ["THREAT", "DANGER", "TRAP", "AMBUSH", "ENEMY", "CRISIS", "WAR", "FEAR", "RISK", "ALARM", "HUNT", "CHAOS"] },
    { id: 46, title: "Healing Hands", subtitle: "Physicians of the Lost Cities", category: "Culture", gridSize: 10, palette: "healing", words: ["HEAL", "PHYSIC", "CARE", "CURE", "BALM", "REST", "MEND", "VITAL", "TREAT", "SAFE"] },
    { id: 47, title: "Leapmasters", subtitle: "Paths mapped in crystal light", category: "Magic", gridSize: 12, palette: "paths", words: ["LEAPMASTER", "PATH", "MAP", "CRYSTAL", "ROUTE", "HOME", "SAFE", "LIST", "PLACE", "JUMP", "KEY", "MARK"] },
    { id: 48, title: "Secrets & Codes", subtitle: "Caches, ciphers, clues", category: "Plot", gridSize: 12, palette: "secrets", words: ["SECRET", "CODE", "CACHE", "CLUE", "CIPHER", "NOTE", "HIDDEN", "RIDDLE", "KEY", "LOCK", "TRUTH", "HINT"] },
    { id: 49, title: "Hope Remains", subtitle: "Courage when the night is long", category: "Themes", gridSize: 12, palette: "hope", words: ["HOPE", "COURAGE", "LIGHT", "BRAVE", "TRUST", "FAITH", "RISE", "DAWN", "STRENGTH", "HEART", "WILL", "PEACE"] },
    { id: 50, title: "Ultimate Quest", subtitle: "Everything on the line", category: "Themes", gridSize: 15, palette: "ultimate", words: ["QUEST", "LEGEND", "HERO", "TRIAL", "DESTINY", "POWER", "CHOICE", "VICTORY", "BATTLE", "SACRIFICE", "UNITY", "FUTURE", "TRUTH", "HOME", "ENDURE"] }
  ];

  /* --------------------------------------------------------------------------
     Seeded PRNG (mulberry32) — same puzzle id → same grid every time
     -------------------------------------------------------------------------- */
  function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  const DIRS = [
    { dr: 0, dc: 1 }, { dr: 0, dc: -1 },
    { dr: 1, dc: 0 }, { dr: -1, dc: 0 },
    { dr: 1, dc: 1 }, { dr: 1, dc: -1 },
    { dr: -1, dc: 1 }, { dr: -1, dc: -1 }
  ];

  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  /**
   * Place all words into a grid. Returns { grid, placed, words }.
   * @param {object} def Puzzle definition (theme + word list)
   * @param {number} [scrambleSeed] Optional seed — different value → new layout, same words
   */
  function generatePuzzle(def, scrambleSeed) {
    const size = def.gridSize;
    const seedMix = scrambleSeed == null ? 0 : scrambleSeed >>> 0;
    let words = def.words
      .map((w) => String(w).toUpperCase().replace(/[^A-Z]/g, ""))
      .filter((w) => w.length >= 2 && w.length <= size);

    // Longer words first
    words = words.slice().sort((a, b) => b.length - a.length);

    for (let attempt = 0; attempt < 50; attempt++) {
      const rng = mulberry32(
        (def.id * 2654435761) ^ (attempt * 97) ^ (seedMix * 0x9e3779b9)
      );
      const result = tryPlace(words, size, rng);
      if (result) {
        return {
          def,
          grid: result.grid,
          placed: result.placed,
          words: result.placed.map((p) => p.word),
          scrambleSeed: seedMix || null
        };
      }
    }

    // Soft fallback: drop shortest words
    const shorter = words.slice(0, Math.max(8, words.length - 2));
    const rng = mulberry32((def.id * 13 + 7) ^ (seedMix * 0x85ebca6b));
    const result = tryPlace(shorter, size, rng);
    if (result) {
      return {
        def,
        grid: result.grid,
        placed: result.placed,
        words: result.placed.map((p) => p.word),
        scrambleSeed: seedMix || null
      };
    }

    // Absolute minimal fallback
    const grid = Array.from({ length: size }, () => Array(size).fill("A"));
    const w = words[0] || "FUN";
    for (let i = 0; i < w.length && i < size; i++) grid[0][i] = w[i];
    return {
      def,
      grid,
      placed: [{ word: w, cells: w.split("").map((_, i) => ({ r: 0, c: i })) }],
      words: [w],
      scrambleSeed: seedMix || null
    };
  }

  function tryPlace(words, size, rng) {
    const grid = Array.from({ length: size }, () => Array(size).fill(null));
    const placed = [];

    for (const word of words) {
      const candidates = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          for (const d of DIRS) candidates.push({ r, c, d });
        }
      }
      // Shuffle candidates
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = candidates[i];
        candidates[i] = candidates[j];
        candidates[j] = tmp;
      }

      let ok = false;
      for (const cand of candidates) {
        if (canPlace(word, cand.r, cand.c, cand.d, grid, size)) {
          const cells = place(word, cand.r, cand.c, cand.d, grid);
          placed.push({ word, cells });
          ok = true;
          break;
        }
      }
      if (!ok) return null;
    }

    // Fill empties
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) grid[r][c] = ALPHA[Math.floor(rng() * 26)];
      }
    }
    return { grid, placed };
  }

  function canPlace(word, r, c, d, grid, size) {
    for (let i = 0; i < word.length; i++) {
      const rr = r + i * d.dr;
      const cc = c + i * d.dc;
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) return false;
      const existing = grid[rr][cc];
      if (existing && existing !== word[i]) return false;
    }
    return true;
  }

  function place(word, r, c, d, grid) {
    const cells = [];
    for (let i = 0; i < word.length; i++) {
      const rr = r + i * d.dr;
      const cc = c + i * d.dc;
      grid[rr][cc] = word[i];
      cells.push({ r: rr, c: cc });
    }
    return cells;
  }

  /* --------------------------------------------------------------------------
     Progress & settings
     -------------------------------------------------------------------------- */
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      /* quota / private mode — ignore */
    }
  }

  function defaultProgress() {
    return {
      puzzles: {}, // id -> { stars, bestTime, timesCompleted }
      freeHints: FREE_HINTS,
      totalWords: 0,
      badges: [],
      lastPlayedId: null
    };
  }

  function defaultSettings() {
    return {
      playerName: "Explorer",
      sound: true,
      timer: true,
      haptics: true
    };
  }

  let progress = Object.assign(defaultProgress(), loadJSON(STORAGE.progress, {}));
  let settings = Object.assign(defaultSettings(), loadJSON(STORAGE.settings, {}));

  function saveProgress() {
    saveJSON(STORAGE.progress, progress);
  }

  function saveSettings() {
    saveJSON(STORAGE.settings, settings);
  }

  function puzzleProgress(id) {
    return progress.puzzles[id] || { stars: 0, bestTime: null, timesCompleted: 0 };
  }

  function completedCount() {
    return Object.values(progress.puzzles).filter((p) => p.stars > 0).length;
  }

  function calcStars(timeSec, hintsUsed, gridSize) {
    let s = 1;
    const target = gridSize <= 10 ? 120 : gridSize <= 12 ? 180 : 300;
    if (timeSec <= target) s += 1;
    if (hintsUsed === 0) s += 1;
    return Math.min(3, s);
  }

  function evaluateBadges() {
    const done = completedCount();
    const rules = [
      ["First Leap", done >= 1],
      ["City Walker", done >= 5],
      ["Pathfinder", done >= 10],
      ["Council Star", done >= 25],
      ["Lost Cities Legend", done >= 50],
      ["Light Leaper", Object.values(progress.puzzles).some((p) => p.bestTime != null && p.bestTime < 90)],
      ["Triple Star", Object.values(progress.puzzles).filter((p) => p.stars === 3).length >= 5]
    ];
    rules.forEach(([name, ok]) => {
      if (ok && !progress.badges.includes(name)) progress.badges.push(name);
    });
  }

  function recordWin(puzzleId, stars, timeSec, wordsFound) {
    const prev = puzzleProgress(puzzleId);
    const next = {
      stars: Math.max(prev.stars || 0, stars),
      bestTime: prev.bestTime == null ? timeSec : Math.min(prev.bestTime, timeSec),
      timesCompleted: (prev.timesCompleted || 0) + 1
    };
    progress.puzzles[puzzleId] = next;
    progress.totalWords = (progress.totalWords || 0) + wordsFound;
    progress.lastPlayedId = puzzleId;
    evaluateBadges();
    saveProgress();
  }

  /* --------------------------------------------------------------------------
     Sound & haptics (no external assets — Web Audio beeps + vibration)
     -------------------------------------------------------------------------- */
  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(function () {});
    }
  }

  function beep(freq, dur, type) {
    if (!settings.sound) return;
    try {
      ensureAudio();
      if (!audioCtx) return;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.value = 0.06;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      o.stop(audioCtx.currentTime + dur);
    } catch (_) {
      /* ignore */
    }
  }

  function sfxFound() {
    beep(660, 0.08);
    setTimeout(function () { beep(880, 0.1); }, 70);
  }

  function sfxWin() {
    beep(523, 0.1);
    setTimeout(function () { beep(659, 0.1); }, 90);
    setTimeout(function () { beep(784, 0.18); }, 180);
  }

  function sfxHint() {
    beep(440, 0.12, "triangle");
  }

  function haptic(ms) {
    if (!settings.haptics) return;
    if (navigator.vibrate) {
      try { navigator.vibrate(ms || 12); } catch (_) { /* ignore */ }
    }
  }

  /* --------------------------------------------------------------------------
     DOM helpers
     -------------------------------------------------------------------------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function showScreen(id) {
    $$(".screen").forEach((el) => {
      const on = el.id === id;
      el.hidden = !on;
      el.classList.toggle("active", on);
    });
    // Close overlays when leaving game intentionally handled elsewhere
    window.scrollTo(0, 0);
  }

  function applyPalette(key) {
    const p = PALETTES[key] || PALETTES.unicorn;
    const root = document.documentElement;
    // Theme accents only (card art, orbs). Never light pastels as body text.
    root.style.setProperty("--primary", p.primary);
    root.style.setProperty("--secondary", p.secondary);
    root.style.setProperty("--accent", p.accent);
    // Soft theme wash — keep overall page light enough for dark ink
    root.style.setProperty("--bg", p.bg || "#eef6fb");
    // Lock high-contrast ink regardless of theme
    root.style.setProperty("--text", "#0f172a");
    root.style.setProperty("--muted", "#334155");
    root.style.setProperty("--found", "#1e3a5f");
    root.style.setProperty("--grid-cell", "#e8f1f8");
    // Prefer a darker meta theme-color for browser chrome
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#1B4F72");
  }

  function difficultyLabel(size) {
    if (size <= 10) return "Easy";
    if (size <= 12) return "Medium";
    return "Challenge";
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function starString(n) {
    return "★".repeat(n) + "☆".repeat(Math.max(0, 3 - n));
  }

  /* --------------------------------------------------------------------------
     Screens: Home, Gallery, Collection, Settings
     -------------------------------------------------------------------------- */
  function renderHome() {
    applyPalette("moonlark");
    const total = PUZZLES.length;
    const done = completedCount();
    const pct = Math.round((done / total) * 100);
    $("#home-stats").innerHTML =
      chip("Completed", done + "/" + total) +
      chip("Progress", pct + "%") +
      chip("Hints left", String(progress.freeHints ?? FREE_HINTS)) +
      chip("Words found", String(progress.totalWords || 0));

    const cont = $("#btn-continue");
    if (progress.lastPlayedId) {
      const def = PUZZLES.find((p) => p.id === progress.lastPlayedId);
      cont.hidden = !def;
      cont.textContent = def ? "Continue · " + def.title : "Continue";
    } else {
      cont.hidden = true;
    }
  }

  function chip(label, value) {
    return '<div class="stat-chip"><strong>' + escapeHtml(value) + "</strong><span>" + escapeHtml(label) + "</span></div>";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  let galleryCategory = "All";
  let galleryQuery = "";

  function renderGallery() {
    // Neutral page wash — keep theme color only on each card's art strip
    applyPaletteNeutral();
    const cats = ["All"].concat(
      Array.from(new Set(PUZZLES.map((p) => p.category))).sort()
    );
    const chips = $("#category-chips");
    chips.innerHTML = cats
      .map(
        (c) =>
          '<button type="button" class="chip' +
          (c === galleryCategory ? " active" : "") +
          '" data-cat="' +
          escapeHtml(c) +
          '">' +
          escapeHtml(c) +
          "</button>"
      )
      .join("");

    chips.onclick = function (e) {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      galleryCategory = btn.getAttribute("data-cat");
      renderGallery();
    };

    const q = galleryQuery.trim().toLowerCase();
    const list = PUZZLES.filter((p) => {
      if (galleryCategory !== "All" && p.category !== galleryCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.words.join(" ").toLowerCase().includes(q)
      );
    });

    const grid = $("#gallery-grid");
    grid.innerHTML = list
      .map((p) => {
        const pal = PALETTES[p.palette] || PALETTES.unicorn;
        const prog = puzzleProgress(p.id);
        // Bright strip colors for emoji header only (not used for text)
        return (
          '<button type="button" class="puzzle-card" data-id="' +
          p.id +
          '" style="--card-a:' +
          pal.primary +
          ";--card-b:" +
          pal.secondary +
          '">' +
          '<div class="card-art" aria-hidden="true">' +
          pal.emoji +
          "</div>" +
          '<div class="card-body">' +
          '<div class="card-diff">' +
          difficultyLabel(p.gridSize) +
          " · " +
          p.gridSize +
          "×" +
          p.gridSize +
          "</div>" +
          "<h3>" +
          escapeHtml(p.title) +
          "</h3>" +
          "<p>" +
          escapeHtml(p.subtitle) +
          "</p>" +
          '<div class="card-foot"><span class="stars" aria-label="' +
          (prog.stars || 0) +
          ' stars">' +
          starString(prog.stars || 0) +
          '</span><span class="word-count">' +
          p.words.length +
          " words</span></div>" +
          "</div></button>"
        );
      })
      .join("");

    grid.onclick = function (e) {
      const card = e.target.closest("[data-id]");
      if (!card) return;
      startGame(Number(card.getAttribute("data-id")));
    };
  }

  /** Light gray/lavender page — high contrast for lists & labels */
  function applyPaletteNeutral() {
    const root = document.documentElement;
    root.style.setProperty("--primary", "#4b5563");
    root.style.setProperty("--secondary", "#9ca3af");
    root.style.setProperty("--accent", "#0d9488");
    root.style.setProperty("--bg", "#f3f4f6");
    root.style.setProperty("--text", "#111827");
    root.style.setProperty("--muted", "#374151");
    root.style.setProperty("--found", "#1f2937");
    root.style.setProperty("--grid-cell", "#e8f1f8");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#1B4F72");
  }

  function renderCollection() {
    applyPalette("crystal");
    const done = PUZZLES.filter((p) => puzzleProgress(p.id).stars > 0);
    const totalStars = PUZZLES.reduce((n, p) => n + (puzzleProgress(p.id).stars || 0), 0);
    const pct = Math.round((done.length / PUZZLES.length) * 100);

    let html =
      '<div class="profile-card"><h3>' +
      escapeHtml(settings.playerName || "Explorer") +
      "</h3><p>" +
      done.length +
      " of " +
      PUZZLES.length +
      " themes · " +
      totalStars +
      " stars</p>" +
      '<div class="profile-bar" aria-hidden="true"><i style="width:' +
      pct +
      '%"></i></div></div>';

    html += "<h3>Badges</h3>";
    if (!progress.badges.length) {
      html += '<div class="empty-card">Complete quests to unlock badges ✦</div>';
    } else {
      html +=
        '<div class="badge-grid">' +
        progress.badges
          .map(function (b) {
            return (
              '<div class="badge-item"><span class="emoji">' +
              badgeEmoji(b) +
              "</span>" +
              escapeHtml(b) +
              "</div>"
            );
          })
          .join("") +
        "</div>";
    }

    html += "<h3>Completed Themes</h3>";
    if (!done.length) {
      html += '<div class="empty-card">Your Codex is waiting — finish a quest and it will shine here.</div>';
    } else {
      html +=
        '<div class="done-grid">' +
        done
          .map(function (p) {
            const pal = PALETTES[p.palette] || PALETTES.unicorn;
            const prog = puzzleProgress(p.id);
            return (
              '<div class="done-item"><span class="emoji">' +
              pal.emoji +
              "</span>" +
              escapeHtml(p.title) +
              '<div class="stars">' +
              starString(prog.stars) +
              "</div></div>"
            );
          })
          .join("") +
        "</div>";
    }

    $("#collection-body").innerHTML = html;
  }

  function badgeEmoji(name) {
    const map = {
      "First Leap": "✨",
      "City Walker": "🗺️",
      "Pathfinder": "🧭",
      "Council Star": "👑",
      "Lost Cities Legend": "🏆",
      "Light Leaper": "⚡",
      "Triple Star": "🌟"
    };
    return map[name] || "🎖️";
  }

  function renderSettings() {
    applyPalette("council");
    $("#setting-name").value = settings.playerName || "";
    $("#setting-sound").checked = !!settings.sound;
    $("#setting-timer").checked = !!settings.timer;
    $("#setting-haptics").checked = !!settings.haptics;
  }

  /* --------------------------------------------------------------------------
     Game session
     -------------------------------------------------------------------------- */
  let session = null;
  let timerId = null;
  let gridCache = {}; // id -> default (unscrambled) layout
  /** scrambleRound by puzzle id — how many times Scramble was used this visit */
  let scrambleRounds = {};

  function getGenerated(id) {
    if (!gridCache[id]) {
      const def = PUZZLES.find((p) => p.id === id);
      if (!def) return null;
      gridCache[id] = generatePuzzle(def);
    }
    return gridCache[id];
  }

  /**
   * @param {number} id Puzzle id
   * @param {{ scrambleSeed?: number, scrambleRound?: number }} [opts]
   */
  function startGame(id, opts) {
    opts = opts || {};
    const def = PUZZLES.find((p) => p.id === id);
    if (!def) return;

    let generated;
    if (opts.scrambleSeed != null) {
      // Fresh layout, same theme & word list
      generated = generatePuzzle(def, opts.scrambleSeed);
    } else {
      generated = getGenerated(id);
    }
    if (!generated) return;

    progress.lastPlayedId = id;
    saveProgress();

    const pal = PALETTES[generated.def.palette] || PALETTES.moonlark;
    applyPalette(generated.def.palette);

    const scrambleRound =
      opts.scrambleRound != null
        ? opts.scrambleRound
        : scrambleRounds[id] || 0;

    session = {
      id: id,
      gen: generated,
      found: new Set(),
      foundPaths: {}, // word -> cells
      score: 0,
      hintsUsed: 0,
      elapsed: 0,
      selecting: false,
      path: [],
      complete: false,
      scrambleRound: scrambleRound
    };

    $("#game-title").textContent = generated.def.title;
    let meta =
      difficultyLabel(generated.def.gridSize) +
      " · " +
      generated.def.gridSize +
      "×" +
      generated.def.gridSize +
      " · " +
      pal.emoji;
    if (scrambleRound > 0) {
      meta += " · Scramble #" + scrambleRound;
    }
    $("#game-meta").textContent = meta;

    $("#score-value").textContent = "0";
    $("#timer-value").textContent = "0:00";
    $("#hud-timer").style.display = settings.timer ? "" : "none";

    buildGrid();
    buildWordList();
    updateWordProgress();
    hideWin();
    showScreen("screen-game");

    // Timer
    clearInterval(timerId);
    if (settings.timer) {
      timerId = setInterval(function () {
        if (!session || session.complete) return;
        session.elapsed += 1;
        $("#timer-value").textContent = formatTime(session.elapsed);
      }, 1000);
    }

    // Resize canvas after layout
    requestAnimationFrame(function () {
      resizeCanvas();
      paintFoundPaths();
    });
  }

  /**
   * Replay the same theme with a newly shuffled letter grid.
   * Same words & palette; placement and filler letters change.
   */
  function scrambleReplay() {
    if (!session) return;
    const id = session.id;
    const nextRound = (session.scrambleRound || 0) + 1;
    scrambleRounds[id] = nextRound;
    // Unique seed each scramble so the grid is always different
    const seed =
      ((Date.now() & 0xffffffff) ^
        (Math.floor(Math.random() * 0xffffffff) >>> 0) ^
        (nextRound * 0x85ebca6b) ^
        (id * 0xc2b2ae35)) >>>
      0;

    clearInterval(timerId);
    timerId = null;
    hideWin();
    sfxFound();
    haptic(15);
    startGame(id, { scrambleSeed: seed, scrambleRound: nextRound });
  }

  function buildGrid() {
    const gen = session.gen;
    const size = gen.def.gridSize;
    const el = $("#word-grid");
    el.style.gridTemplateColumns = "repeat(" + size + ", 1fr)";
    el.style.gridTemplateRows = "repeat(" + size + ", 1fr)";
    el.innerHTML = "";

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.r = String(r);
        cell.dataset.c = String(c);
        cell.setAttribute("role", "gridcell");
        cell.textContent = gen.grid[r][c];
        el.appendChild(cell);
      }
    }
  }

  function buildWordList() {
    const ul = $("#word-list");
    ul.innerHTML = session.gen.words
      .map(function (w) {
        return '<li data-word="' + w + '">' + w + "</li>";
      })
      .join("");
  }

  function updateWordProgress() {
    const total = session.gen.words.length;
    const n = session.found.size;
    $("#word-progress").textContent = n + "/" + total;
    $("#word-progress-fill").style.width = (total ? (n / total) * 100 : 0) + "%";
  }

  function cellAtPoint(clientX, clientY) {
    const grid = $("#word-grid");
    const rect = grid.getBoundingClientRect();
    const size = session.gen.def.gridSize;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const c = Math.min(size - 1, Math.max(0, Math.floor((x / rect.width) * size)));
    const r = Math.min(size - 1, Math.max(0, Math.floor((y / rect.height) * size)));
    return { r: r, c: c };
  }

  function straightLine(a, b) {
    const dr = b.r - a.r;
    const dc = b.c - a.c;
    if (dr === 0 && dc === 0) return [a];
    const absR = Math.abs(dr);
    const absC = Math.abs(dc);
    if (!(dr === 0 || dc === 0 || absR === absC)) return null;
    const steps = Math.max(absR, absC);
    const sr = dr === 0 ? 0 : dr / absR;
    const sc = dc === 0 ? 0 : dc / absC;
    const path = [];
    for (let i = 0; i <= steps; i++) {
      path.push({ r: a.r + i * sr, c: a.c + i * sc });
    }
    return path;
  }

  function pathToWord(path) {
    return path.map(function (p) {
      return session.gen.grid[p.r][p.c];
    }).join("");
  }

  function cellKey(p) {
    return p.r + "," + p.c;
  }

  function onPointerDown(e) {
    if (!session || session.complete) return;
    ensureAudio();
    const pt = e.touches ? e.touches[0] : e;
    const cell = cellAtPoint(pt.clientX, pt.clientY);
    if (!cell) return;
    e.preventDefault();
    session.selecting = true;
    session.path = [cell];
    paintSelection();
    haptic(8);
  }

  function onPointerMove(e) {
    if (!session || !session.selecting || session.complete) return;
    const pt = e.touches ? e.touches[0] : e;
    const cell = cellAtPoint(pt.clientX, pt.clientY);
    if (!cell) return;
    e.preventDefault();
    const start = session.path[0];
    const line = straightLine(start, cell);
    if (line) {
      session.path = line;
      paintSelection();
    }
  }

  function onPointerUp(e) {
    if (!session || !session.selecting) return;
    if (e) e.preventDefault();
    session.selecting = false;
    tryCommitSelection();
    session.path = [];
    paintSelection();
  }

  function tryCommitSelection() {
    const path = session.path;
    if (!path || path.length < 2) return;
    const forward = pathToWord(path);
    const backward = pathToWord(path.slice().reverse());
    if (acceptWord(forward, path)) return;
    acceptWord(backward, path.slice().reverse());
  }

  function acceptWord(word, path) {
    if (!session.gen.words.includes(word)) return false;
    if (session.found.has(word)) return false;
    if (path.length !== word.length) return false;

    session.found.add(word);
    session.foundPaths[word] = path.slice();
    session.score += word.length * 10 + Math.max(0, 50 - Math.floor(session.elapsed / 4));
    $("#score-value").textContent = String(session.score);

    // Mark list item
    const li = $('#word-list [data-word="' + word + '"]');
    if (li) li.classList.add("found");

    updateWordProgress();
    paintFoundPaths();
    showFoundToast(word);
    sfxFound();
    haptic(20);

    if (session.found.size >= session.gen.words.length) {
      completePuzzle();
    }
    return true;
  }

  function showFoundToast(word) {
    const t = $("#found-toast");
    t.hidden = false;
    t.textContent = "✨ " + word + " ✨";
    clearTimeout(showFoundToast._tid);
    showFoundToast._tid = setTimeout(function () {
      t.hidden = true;
    }, 900);
  }

  /* Canvas selection + found underlines */
  function resizeCanvas() {
    const canvas = $("#selection-canvas");
    const panel = $(".grid-panel");
    if (!canvas || !panel) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = panel.clientWidth;
    const h = panel.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function cellCenter(r, c) {
    const grid = $("#word-grid");
    const panel = $(".grid-panel");
    const size = session.gen.def.gridSize;
    const gr = grid.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const cellW = gr.width / size;
    const cellH = gr.height / size;
    return {
      x: gr.left - pr.left + (c + 0.5) * cellW,
      y: gr.top - pr.top + (r + 0.5) * cellH
    };
  }

  function paintSelection() {
    const canvas = $("#selection-canvas");
    if (!canvas || !session) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Found paths — darker strokes so they read on white grid
    const words = session.gen.words;
    words.forEach(function (word, idx) {
      const cells = session.foundPaths[word];
      if (!cells || !cells.length) return;
      drawPath(ctx, cells, FOUND_STROKES[idx % FOUND_STROKES.length], 0.42);
    });

    // Active selection
    if (session.path && session.path.length) {
      drawPath(ctx, session.path, "#1B4F72", 0.55);
    }
  }

  function paintFoundPaths() {
    paintSelection();
    // Solid-ish tints under dark letter color (high contrast)
    $$(".cell").forEach(function (el) {
      el.classList.remove("found");
      el.style.background = "";
      el.style.color = "";
    });
    session.gen.words.forEach(function (word, idx) {
      const cells = session.foundPaths[word];
      if (!cells) return;
      const color = FOUND_COLORS[idx % FOUND_COLORS.length];
      cells.forEach(function (p) {
        const el = $('.cell[data-r="' + p.r + '"][data-c="' + p.c + '"]');
        if (el) {
          el.classList.add("found");
          el.style.background = color;
          el.style.color = "#0f172a";
        }
      });
    });
  }

  function drawPath(ctx, cells, color, alpha) {
    if (!cells.length) return;
    const pts = cells.map(function (p) {
      return cellCenter(p.r, p.c);
    });
    const size = session.gen.def.gridSize;
    const grid = $("#word-grid");
    const thickness = Math.max(14, (grid.clientWidth / size) * 0.72);

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    if (pts.length === 1) {
      ctx.lineTo(pts[0].x + 0.1, pts[0].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function useHint() {
    if (!session || session.complete) return;
    const remaining = session.gen.words.filter(function (w) {
      return !session.found.has(w);
    });
    if (!remaining.length) return;

    if ((progress.freeHints || 0) <= 0) {
      showHintLocked();
      sfxHint();
      return;
    }

    progress.freeHints -= 1;
    saveProgress();
    session.hintsUsed += 1;
    session.score = Math.max(0, session.score - 25);
    $("#score-value").textContent = String(session.score);

    const word = remaining[0];
    const placed = session.gen.placed.find(function (p) {
      return p.word === word;
    });
    if (!placed) return;
    const first = placed.cells[0];
    $$(".cell").forEach(function (el) {
      el.classList.remove("hint-pulse");
    });
    const el = $('.cell[data-r="' + first.r + '"][data-c="' + first.c + '"]');
    if (el) el.classList.add("hint-pulse");
    sfxHint();
    haptic(15);
  }

  function showHintLocked() {
    const b = $("#hint-locked");
    b.hidden = false;
    clearTimeout(showHintLocked._tid);
    showHintLocked._tid = setTimeout(function () {
      b.hidden = true;
    }, 2800);
  }

  function completePuzzle() {
    session.complete = true;
    clearInterval(timerId);
    session.score += Math.max(0, 500 - session.elapsed);
    $("#score-value").textContent = String(session.score);

    const stars = calcStars(session.elapsed, session.hintsUsed, session.gen.def.gridSize);
    recordWin(session.id, stars, session.elapsed, session.found.size);
    sfxWin();
    haptic([20, 40, 20]);

    const pal = PALETTES[session.gen.def.palette] || PALETTES.moonlark;
    $("#win-emoji").textContent = pal.emoji;
    $("#win-subtitle").textContent = session.gen.def.title;
    $("#win-stars").textContent = starString(stars);
    $("#win-stars").setAttribute("aria-label", stars + " of 3 stars");
    $("#win-time").textContent = formatTime(session.elapsed);
    $("#win-score").textContent = String(session.score);
    $("#win-hints").textContent = String(session.hintsUsed);
    const scrambleNote =
      " Tap Scramble for the same theme with a brand-new letter grid.";
    $("#win-message").textContent =
      (stars === 3
        ? "Triple stars! The Council would be impressed. ✦"
        : stars === 2
          ? "Strong work — leap faster next time for the third star!"
          : "Quest complete! Return anytime to chase more stars.") + scrambleNote;

    spawnConfetti();
    $("#overlay-win").hidden = false;
  }

  function hideWin() {
    $("#overlay-win").hidden = true;
    $("#confetti").innerHTML = "";
  }

  function spawnConfetti() {
    const box = $("#confetti");
    box.innerHTML = "";
    const colors = ["#FF6B9D", "#C77DFF", "#FBBF24", "#4ECDC4", "#F472B6", "#60A5FA"];
    for (let i = 0; i < 40; i++) {
      const bit = document.createElement("i");
      bit.style.left = Math.random() * 100 + "%";
      bit.style.background = colors[i % colors.length];
      bit.style.animationDuration = 1.2 + Math.random() * 1.4 + "s";
      bit.style.animationDelay = Math.random() * 0.3 + "s";
      box.appendChild(bit);
    }
  }

  /* --------------------------------------------------------------------------
     Onboarding
     -------------------------------------------------------------------------- */
  const ONB_PAGES = [
    {
      emoji: "🌙",
      title: "Welcome, Moonlark",
      body: "Fifty word quests inspired by Keeper of the Lost Cities — academies, abilities, allies, and secrets of the elvin world."
    },
    {
      emoji: "🔍",
      title: "Hunt every letter path",
      body: "Drag in any direction — across, down, diagonal, even backwards. Words glow when you find them."
    },
    {
      emoji: "✦",
      title: "Earn your stars",
      body: "Finish quests, collect stars, and fill My Codex. Hints are limited — think like a Cognate."
    },
    {
      emoji: "✨",
      title: "Claim your leap name",
      body: "Every great Moonlark needs a name before the first light leap. It shows on your quest progress.",
      name: true,
      nameLabel: "What name will sparkle on your leaps?",
      namePlaceholder: "e.g. Sophie"
    }
  ];
  let onbPage = 0;

  function maybeShowOnboarding() {
    if (localStorage.getItem(STORAGE.onboarding) === "1") return;
    onbPage = 0;
    const nameInput = $("#onb-name");
    if (nameInput) nameInput.value = "";
    renderOnboarding();
    $("#overlay-onboarding").hidden = false;
  }

  function renderOnboarding() {
    const page = ONB_PAGES[onbPage];
    const isNameStep = !!page.name;
    $("#onb-emoji").textContent = page.emoji;
    $("#onb-title").textContent = page.title;
    $("#onb-body").textContent = page.body;

    const nameWrap = $("#onb-name-wrap");
    const nameInput = $("#onb-name");
    nameWrap.hidden = !isNameStep;
    if (isNameStep) {
      const label = $("#onb-name-label");
      if (label && page.nameLabel) label.textContent = page.nameLabel;
      if (page.namePlaceholder) nameInput.placeholder = page.namePlaceholder;
      // Defer focus so the field is visible first
      requestAnimationFrame(function () {
        try {
          nameInput.focus();
        } catch (e) {
          /* ignore */
        }
      });
    }

    $("#btn-onb-next").textContent = isNameStep
      ? "Start Questing"
      : onbPage === ONB_PAGES.length - 2
        ? "Almost there"
        : "Next";
    $("#onb-dots").innerHTML = ONB_PAGES.map(function (_, i) {
      return '<span class="' + (i === onbPage ? "on" : "") + '"></span>';
    }).join("");
  }

  function finishOnboarding() {
    const name = ($("#onb-name").value || "").trim();
    settings.playerName = name || "Explorer";
    saveSettings();
    localStorage.setItem(STORAGE.onboarding, "1");
    $("#overlay-onboarding").hidden = true;
    renderHome();
  }

  /* --------------------------------------------------------------------------
     Event wiring
     -------------------------------------------------------------------------- */
  function wireEvents() {
    $("#btn-browse").addEventListener("click", function () {
      renderGallery();
      showScreen("screen-gallery");
    });

    $("#btn-continue").addEventListener("click", function () {
      if (progress.lastPlayedId) startGame(progress.lastPlayedId);
    });

    $("#btn-collection").addEventListener("click", function () {
      renderCollection();
      showScreen("screen-collection");
    });

    $("#btn-settings").addEventListener("click", function () {
      renderSettings();
      showScreen("screen-settings");
    });

    $$("[data-nav='home']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        leaveGame();
        renderHome();
        showScreen("screen-home");
      });
    });

    $("#btn-game-back").addEventListener("click", function () {
      leaveGame();
      renderGallery();
      showScreen("screen-gallery");
    });

    $("#btn-hint").addEventListener("click", useHint);

    $("#btn-win-scramble").addEventListener("click", function () {
      scrambleReplay();
    });

    $("#btn-win-gallery").addEventListener("click", function () {
      hideWin();
      leaveGame();
      renderGallery();
      showScreen("screen-gallery");
    });

    $("#btn-win-home").addEventListener("click", function () {
      hideWin();
      leaveGame();
      renderHome();
      showScreen("screen-home");
    });

    $("#gallery-search").addEventListener("input", function (e) {
      galleryQuery = e.target.value;
      renderGallery();
    });

    // Settings
    $("#setting-name").addEventListener("change", function (e) {
      settings.playerName = e.target.value.trim() || "Explorer";
      saveSettings();
    });
    $("#setting-sound").addEventListener("change", function (e) {
      settings.sound = e.target.checked;
      saveSettings();
    });
    $("#setting-timer").addEventListener("change", function (e) {
      settings.timer = e.target.checked;
      saveSettings();
    });
    $("#setting-haptics").addEventListener("change", function (e) {
      settings.haptics = e.target.checked;
      saveSettings();
    });

    // Onboarding — name field only on the last step
    $("#btn-onb-next").addEventListener("click", function () {
      if (onbPage < ONB_PAGES.length - 1) {
        onbPage += 1;
        renderOnboarding();
        return;
      }
      finishOnboarding();
    });
    $("#onb-name").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (onbPage === ONB_PAGES.length - 1) finishOnboarding();
      }
    });

    // Grid pointer events (touch + mouse)
    const panel = $(".grid-panel");
    panel.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    panel.addEventListener("touchstart", onPointerDown, { passive: false });
    panel.addEventListener("touchmove", onPointerMove, { passive: false });
    panel.addEventListener("touchend", onPointerUp, { passive: false });
    panel.addEventListener("touchcancel", onPointerUp, { passive: false });

    window.addEventListener("resize", function () {
      if (session) {
        resizeCanvas();
        paintFoundPaths();
      }
    });

    // Orientation change on iPad
    window.addEventListener("orientationchange", function () {
      setTimeout(function () {
        if (session) {
          resizeCanvas();
          paintFoundPaths();
        }
      }, 200);
    });
  }

  function leaveGame() {
    clearInterval(timerId);
    timerId = null;
    session = null;
    hideWin();
  }

  /* --------------------------------------------------------------------------
     PWA service worker
     -------------------------------------------------------------------------- */
  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    // Only register when served over http(s) — file:// cannot cache SW
    if (location.protocol === "file:") {
      console.info("Keeper Word Quest: open via a local server for offline PWA caching.");
      return;
    }
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function (err) {
        console.warn("SW registration failed", err);
      });
    });
  }

  /* --------------------------------------------------------------------------
     Boot
     -------------------------------------------------------------------------- */
  function init() {
    // Normalize progress fields for older saves
    if (typeof progress.freeHints !== "number") progress.freeHints = FREE_HINTS;
    if (!progress.puzzles) progress.puzzles = {};
    if (!progress.badges) progress.badges = [];

    wireEvents();
    renderHome();
    showScreen("screen-home");
    maybeShowOnboarding();
    registerSW();

    // Sanity: 50 puzzles
    if (PUZZLES.length !== 50) {
      console.warn("Expected 50 puzzles, found", PUZZLES.length);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

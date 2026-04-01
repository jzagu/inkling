// generate.js — run once with: node generate.js
// Produces words.js and scrabble-words.js for the Inkling game.

const fs = require('fs');

// ─── Curated word pool (~580 common 7-letter words) ──────────────────────────
const CURATED_RAW = [
  // A
  "ABILITY","ABSENCE","ACCOUNT","ACHIEVE","ACTIONS","ADDRESS","ADVANCE",
  "ALCOHOL","AMAZING","ANCIENT","ANIMALS","ANOTHER","ANSWERS","ANXIETY",
  "AIRPORT","ARRIVAL","ARTICLE","ASPECTS","ATTRACT","AUCTION","AWARDED",
  // B
  "BALANCE","BANANAS","BARRIER","BATTERY","BATTLES","BEACHES","BECAUSE",
  "BEDROOM","BELIEVE","BENEATH","BETWEEN","BIGGEST","BLANKET","BORDERS",
  "BOTTLES","BOWLING","BRAVERY","BRIDGES","BROTHER","BROUGHT","BURNING",
  "BUTTONS",
  // C
  "CABINET","CAMPING","CAPABLE","CAPTAIN","CAPTURE","CAREFUL","CARRIES",
  "CARROTS","CENTRAL","CENTURY","CERTAIN","CHAPTER","CHARITY","CHECKED",
  "CHICKEN","CHOICES","CIRCLES","CLASSIC","CLEARLY","CLIMATE","CLOSEST",
  "CLOSING","CLUSTER","COMFORT","COMMAND","COMPANY","COMPARE","CONCERN",
  "CONSENT","CONTENT","CONTROL","CORNERS","COTTAGE","COURAGE","COVERED",
  "CREATED","CRUCIAL","CRYSTAL","CULTURE","CURIOUS","CURRENT","CYCLING",
  "CURTAIN","CHANNEL","CIRCUIT","COLLECT","CONNECT","COMPILE","CONFIRM",
  // D
  "DAMAGED","DANCERS","DEALING","DECIDED","DEMANDS","DESPITE","DETAILS",
  "DEVOTED","DIGITAL","DISEASE","DISTANT","DIVIDED","DOCTORS","DOLLARS",
  "DRAWING","DRIVING","DROPPED","DECLINE","DIPLOMA","DISPLAY","DISCUSS",
  // E
  "EASTERN","ECONOMY","ELDERLY","EMBASSY","ENDLESS","EPISODE","EVENING",
  "EXACTLY","EXCITED","EXPLAIN","EXTREME","EFFECTS","ELECTED","ENGAGED",
  // F
  "FACTORS","FAILURE","FARMERS","FASHION","FATHERS","FEARFUL","FEELING",
  "FIGURES","FINALLY","FINDING","FINGERS","FISHING","FLOWERS","FOCUSED",
  "FOLLOWS","FOREIGN","FOREVER","FORMULA","FORWARD","FREEDOM","FRIENDS",
  "FURTHER","FALLING","FARMING","FEATURE","FIGHTER",
  // G
  "GARDENS","GARBAGE","GENERAL","GETTING","GLACIAL","GLASSES","GRANTED",
  "GROWING","GATEWAY","GENUINE","GLIMPSE",
  // H
  "HANDLES","HANDFUL","HANGING","HAPPENS","HARVEST","HEADING","HEIGHTS",
  "HELPFUL","HERSELF","HIMSELF","HISTORY","HOLDING","HOLIDAY","HOSTILE",
  "HUNDRED","HUNTERS","HUSBAND","HEALTHY","HIGHWAY","HOUSING",
  // I
  "ILLEGAL","IMAGINE","IMPROVE","INCLUDE","INSTEAD","ISLANDS","INITIAL",
  "INSTALL","INVITED",
  // J
  "JACKPOT","JOURNEY","JUMPING","JUSTICE","JOURNAL","JOINING",
  // K
  "KIDNEYS","KITCHEN","KNOWING","KINGDOM","KEEPING",
  // L
  "LABELED","LANTERN","LARGEST","LASTING","LEADERS","LEADING","LEAVING",
  "LETTERS","LIBRARY","LIMITED","LINKING","LOGICAL","LOOKING","LEARNED",
  "LANDING","LEATHER","LESSONS","LIGHTER","LISTING","LOTTERY",
  // M
  "MACHINE","MAGICAL","MANAGED","MANAGER","MARRIED","MASSIVE","MAXIMUM",
  "MEANING","MEDICAL","MEETING","MESSAGE","METHODS","MILLION","MINIMUM",
  "MINUTES","MIRRORS","MISSING","MONTHLY","MORNING","MOTHERS","MOUNTED",
  "MURDERS","MUSCLES","MUSICAL","MARKING","MEASURE","MENTION","MISSILE",
  "MISSION","MIXTURE","MONITOR","MOMENTS",
  // N
  "NATIONS","NATURAL","NETWORK","NEUTRAL","NERVOUS","NOTHING","NOWHERE",
  "NUMBERS","NOODLES","NOTABLE",
  // O
  "OBVIOUS","OFFICER","OPENING","OPINION","ORDERED","OUTCOME","OUTSIDE",
  "ORANGES","OFFENSE","OPERATE","OPTIONS","ORGANIC",
  // P
  "PACKAGE","PAINFUL","PAINTED","PARKING","PARENTS","PASSING","PATIENT",
  "PATTERN","PERHAPS","PERFECT","PERSONS","PLAYERS","PLAYING","POPULAR",
  "PRIVATE","PROBLEM","PROGRAM","PROJECT","PROTECT","PROTEIN","PROVIDE",
  "PULLING","PUSHING","PARTNER","PERCENT","PICKING","PLACING","PLANNED",
  "POINTED","POWERED","PRINTED","PROMOTE","PROFITS",
  // Q
  "QUALITY","QUARTER","QUICKLY","QUANTUM",
  // R
  "REACHED","READING","REASONS","RECEIPT","REBUILD","REGIONS","REGULAR",
  "REMAINS","REMOVED","REPAIRS","REPLACE","RESCUED","RESPECT","RESPOND",
  "RESULTS","RETURNS","ROLLING","ROMANCE","ROUTINE","RUNNING","RAISING",
  "RECORDS","REPORTS","REQUIRE","RESERVE","RESOLVE","REVENUE","REVIEWS",
  // S
  "SAILING","SCHOOLS","SEASONS","SECTION","SECRETS","SEEKING","SENDING",
  "SERIOUS","SERVICE","SERVING","SEVERAL","SHADOWS","SHELTER","SHOWING",
  "SIGNALS","SILENCE","SIMILAR","SINCERE","SINGING","SISTERS","SITTING",
  "SKILLED","SMOKING","SOCIETY","SOLDIER","SOMEONE","SOLVING","SPECIAL",
  "STORIES","STRANGE","STREAMS","STUDENT","SUBJECT","SUGGEST","SUPPORT",
  "SURFACE","SURFING","STATION","STAYING","STORAGE","SETTING","SHARING",
  "SCANNER","SECURED","SETTLED","SHAKING","SMALLER","SORTING","SOURCES",
  "STARTED","STOPPED","STUDIES","SUCCEED",
  // T
  "TEACHER","TELLING","TESTING","THERAPY","THROUGH","THUNDER","TONIGHT",
  "TOWARDS","TRACTOR","TROUBLE","TRUSTED","TURNING","TARGETS","TICKETS",
  "TRADING","TRAINED","TRAVELS","TOUCHED","TRACKED","TREATED",
  // U
  "UNIFORM","UNKNOWN","UPDATES","UNUSUAL","USUALLY","UPGRADE","UNDERGO",
  // V
  "VACANCY","VICTIMS","VILLAGE","VIRTUAL","VISIBLE","VISITED","VITAMIN",
  "VOLTAGE","VARYING","VEHICLE","VERSION",
  // W
  "WAITING","WALKING","WARNING","WARRIOR","WARRANT","WEATHER","WEBSITE",
  "WELCOME","WHETHER","WESTERN","WINDOWS","WINNERS","WITHOUT","WORKING",
  "WORRIED","WRITERS","WRITING","WEARING","WANTING","WASHING","WASTING",
  // Y
  "YOUNGER",
];

// ─── Load scrabble word list ──────────────────────────────────────────────────
console.log('Loading Scrabble word list...');
const scrabbleSet = new Set(
  fs.readFileSync('scrabble_7.txt', 'utf8')
    .trim().split(/\r?\n/)
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length === 7)
);
console.log(`Loaded ${scrabbleSet.size} valid 7-letter Scrabble words.`);

// ─── Filter curated pool ──────────────────────────────────────────────────────
const CURATED = [...new Set(CURATED_RAW)].filter(w => {
  if (!scrabbleSet.has(w)) {
    console.log(`  Filtered out (not in Scrabble dict): ${w}`);
    return false;
  }
  return true;
});
console.log(`Curated pool: ${CURATED.length} valid words.`);

// ─── Build neighbor graph ────────────────────────────────────────────────────
// Two words are neighbors if they differ in exactly 1 or 2 positions.
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function buildNeighborGraph(wordSet) {
  const words = [...wordSet];
  const neighborMap = new Map();

  console.log(`Building neighbor graph for ${words.length} words...`);
  const start = Date.now();
  let processed = 0;

  for (const word of words) {
    const neighbors = [];
    const w = word.split('');

    // 1-letter changes
    for (let i = 0; i < 7; i++) {
      const orig = w[i];
      for (const c of ALPHA) {
        if (c === orig) continue;
        w[i] = c;
        const candidate = w.join('');
        if (wordSet.has(candidate)) neighbors.push(candidate);
        w[i] = orig;
      }
    }

    // 2-letter changes
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 7; j++) {
        const oi = w[i], oj = w[j];
        for (const c1 of ALPHA) {
          for (const c2 of ALPHA) {
            if (c1 === oi && c2 === oj) continue;
            w[i] = c1; w[j] = c2;
            const candidate = w.join('');
            if (wordSet.has(candidate)) neighbors.push(candidate);
            w[i] = oi; w[j] = oj;
          }
        }
      }
    }

    neighborMap.set(word, neighbors);
    processed++;
    if (processed % 2000 === 0) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      process.stdout.write(`\r  ${processed}/${words.length} words processed (${elapsed}s)...`);
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nNeighbor graph built in ${elapsed}s.`);
  return neighborMap;
}

const neighborMap = buildNeighborGraph(scrabbleSet);

// ─── BFS from a single source ─────────────────────────────────────────────────
function bfs(start, maxDepth = 7) {
  const dist = new Map([[start, 0]]);
  const prev = new Map([[start, null]]);
  const queue = [start];
  let qi = 0;
  while (qi < queue.length) {
    const word = queue[qi++];
    const d = dist.get(word);
    if (d >= maxDepth) continue;
    for (const nb of (neighborMap.get(word) || [])) {
      if (!dist.has(nb)) {
        dist.set(nb, d + 1);
        prev.set(nb, word);
        queue.push(nb);
      }
    }
  }
  return { dist, prev };
}

function getPath(prev, start, end) {
  const path = [];
  let cur = end;
  while (cur !== null && cur !== undefined) {
    path.unshift(cur);
    cur = prev.get(cur);
  }
  return path[0] === start ? path : null;
}

// ─── Generate daily pairs ─────────────────────────────────────────────────────
console.log(`Generating daily pairs from ${CURATED.length} curated words...`);
const curatedSet = new Set(CURATED);

const pairs = [];
const usedPairs = new Set();
const MAX_PER_START = 3; // max pairs where a given word is the start

// Shuffle curated words for variety
const shuffled = [...CURATED].sort(() => Math.random() - 0.5);

for (let si = 0; si < shuffled.length; si++) {
  const start = shuffled[si];
  const { dist, prev } = bfs(start, 7);

  // Shuffle end candidates so we don't always pick the same endpoints
  const endCandidates = [...shuffled].sort(() => Math.random() - 0.5);
  let foundForThisStart = 0;

  for (const end of endCandidates) {
    if (end === start) continue;
    if (!dist.has(end)) continue;

    const minMoves = dist.get(end);
    if (minMoves < 3 || minMoves > 6) continue;

    const key = `${start}|${end}`;
    if (usedPairs.has(key)) continue;

    const optimalPath = getPath(prev, start, end);
    if (!optimalPath) continue;

    usedPairs.add(key);
    usedPairs.add(`${end}|${start}`); // avoid reverse duplicates
    pairs.push({ start, end, minMoves, optimalPath });
    foundForThisStart++;

    if (foundForThisStart >= MAX_PER_START) break;
  }

  process.stdout.write(`\r  ${si + 1}/${shuffled.length} source words searched, ${pairs.length} pairs found...`);
}

console.log(`\nFound ${pairs.length} valid pairs.`);

if (pairs.length < 100) {
  console.error('ERROR: Not enough pairs generated. Check word list connectivity.');
  process.exit(1);
}

// Shuffle for variety and cap at 950
pairs.sort(() => Math.random() - 0.5);
const finalPairs = pairs.slice(0, 950);

// ─── Write words.js ───────────────────────────────────────────────────────────
const wordsJs = `// Auto-generated by generate.js — do not edit manually.

const WORD_POOL = ${JSON.stringify(CURATED)};

const DAILY_PAIRS = ${JSON.stringify(finalPairs, null, 2)};
`;

fs.writeFileSync('words.js', wordsJs);
console.log(`Wrote words.js (${CURATED.length} pool words, ${finalPairs.length} daily pairs).`);

// ─── Write scrabble-words.js ──────────────────────────────────────────────────
const scrabbleWords = [...scrabbleSet];
const scrabbleJs = `// Auto-generated by generate.js — do not edit manually.
// ${scrabbleWords.length} valid 7-letter Scrabble words (TWL06).
const SCRABBLE_WORDS = new Set(${JSON.stringify(scrabbleWords)});
`;

fs.writeFileSync('scrabble-words.js', scrabbleJs);
console.log(`Wrote scrabble-words.js (${scrabbleWords.length} words).`);

console.log('\nDone! Run the game by opening index.html.');

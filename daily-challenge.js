// Daily Challenge Module for Word Chain Game
// This module handles generating daily start and target word pairs
// that change at midnight Pacific time

// Embedded list of common six-letter words directly in the code
// This eliminates the need to load from an external file
const embeddedWordList = [
  "accept", "access", "accord", "across", "action", "active", "actual", "adding", "adjust", "admire",
  "affair", "affect", "afford", "afraid", "agency", "agreed", "allows", "almost", "alters", "always",
  "amount", "amused", "animal", "annual", "answer", "anyone", "anyway", "appeal", "appear", "around",
  "arrive", "artist", "asking", "aspect", "assess", "assign", "assume", "assure", "attach", "attack",
  "attain", "attend", "author", "autumn", "avoids", "backup", "badly", "battle", "beauty", "became",
  "become", "before", "begins", "behalf", "behave", "behind", "beings", "belief", "belong", "better",
  "beyond", "bigger", "binary", "bishop", "blocks", "blonde", "bodies", "border", "borrow", "bother",
  "bottom", "bought", "branch", "brands", "breach", "breaks", "breath", "breeds", "brief", "brings",
  "broken", "budget", "builds", "burden", "bureau", "butter", "button", "buying", "cables", "called",
  "cannot", "canton", "carbon", "career", "caring", "carved", "casual", "caught", "caused", "center",
  "chance", "change", "charge", "choice", "choose", "chosen", "church", "circle", "claims", "clarify",
  "classes", "cleared", "clearly", "client", "closed", "closer", "closes", "coding", "coffee", "column",
  "coming", "common", "comply", "copper", "corner", "correct", "cosmic", "costing", "cotton", "counts",
  "county", "couple", "course", "covers", "create", "credit", "crisis", "critic", "cross", "crucial",
  "crying", "cursor", "cycle", "damage", "danger", "dating", "debate", "decade", "decide", "deeply",
  "defeat", "defect", "defend", "define", "degree", "delays", "deliver", "demand", "denied", "depend",
  "deploy", "depth", "design", "desire", "detail", "detect", "device", "devote", "differ", "digit",
  "dinner", "direct", "divide", "divine", "doctor", "dollar", "domain", "donate", "double", "doubts",
  "dozens", "drafts", "dragon", "drains", "drawer", "dreams", "drinks", "driven", "driver", "drives",
  "during", "duties", "eager", "earned", "easier", "easily", "eating", "editor", "effect", "effort",
  "eighth", "either", "eleven", "emerge", "employ", "enable", "ending", "energy", "engage", "engine",
  "enjoys", "enough", "ensure", "enters", "entire", "entity", "entree", "equals", "errors", "escape",
  "ethics", "events", "exactly", "exceed", "except", "excess", "excited", "exclude", "excuse", "exists",
  "expand", "expect", "expert", "explain", "export", "expose", "extend", "extent", "extern", "extra",
  "facing", "factor", "failed", "fairly", "fallen", "family", "famous", "faster", "father", "fear",
  "feature", "federal", "feeding", "feeling", "female", "fields", "fierce", "fifth", "fifty", "fights",
  "figure", "filing", "filled", "filter", "finals", "finder", "finest", "finger", "finish", "firing",
  "firmly", "fiscal", "fitted", "fixing", "flight", "flower", "flying", "follow", "forced", "forces",
  "forest", "forgot", "formal", "format", "former", "foster", "fought", "fourth", "freely", "french",
  "friend", "front", "fruits", "funded", "funnel", "future", "gained", "garden", "gather", "gender",
  "genius", "gentle", "giving", "glance", "global", "golden", "gotten", "grades", "grants", "greatly",
  "ground", "groups", "growth", "guards", "guided", "habits", "handle", "happen", "harbor", "hardly",
  "having", "headed", "header", "health", "heard", "hearth", "hearts", "height", "helped", "hereby",
  "hidden", "higher", "highly", "hiring", "hissed", "holder", "honest", "hoping", "hosted", "hotels",
  "houses", "humans", "hurdle", "hybrid", "ideals", "ideas", "ignore", "images", "impact", "import",
  "impose", "inches", "income", "indeed", "infant", "inform", "injury", "inland", "inputs", "insert",
  "inside", "insist", "insure", "intact", "intend", "intent", "invest", "invite", "island", "issued",
  "issues", "itself", "joined", "joints", "judged", "justice", "keeper", "kernel", "kicked", "killed",
  "kindly", "knight", "knives", "labors", "lacked", "ladies", "laden", "lands", "larger", "lasted",
  "lately", "latest", "latter", "launch", "lawyer", "leaders", "league", "leaves", "legacy", "legend",
  "length", "lessen", "lesser", "lesson", "letter", "levels", "liable", "lifted", "lights", "liking",
  "limits", "linear", "linked", "listed", "listen", "little", "living", "loaded", "locals", "locate",
  "locked", "lodged", "logged", "lonely", "longer", "looked", "loose", "losing", "losses", "louder",
  "loudly", "lovely", "lovers", "loving", "lowest", "lumber", "luxury", "lyrics", "mailed", "mainly",
  "making", "manage", "manner", "manual", "margin", "marked", "market", "master", "matter", "mature",
  "medium", "member", "memory", "mental", "mentor", "merely", "merger", "merits", "method", "middle",
  "mighty", "mining", "minute", "mirror", "mister", "misuse", "mixing", "mobile", "models", "modern",
  "modify", "moment", "months", "mostly", "mother", "motion", "moving", "murder", "museum", "mutual",
  "myself", "namely", "narrow", "nation", "native", "nature", "nearby", "nearly", "needed", "needle",
  "neural", "newest", "nicely", "nights", "nobody", "noises", "normal", "notice", "notify", "notion",
  "number", "object", "obtain", "occupy", "occurs", "oceans", "offers", "office", "offset", "oldest",
  "omitted", "online", "opened", "openly", "oppose", "option", "orders", "origin", "others", "outfit",
  "outlay", "outlet", "output", "owners", "owning", "oxygen", "packed", "paired", "palace", "panels",
  "papers", "parent", "parish", "partly", "passed", "passes", "pastor", "patent", "patrol", "pause",
  "paying", "peanut", "people", "period", "permit", "person", "petite", "phrase", "pieces", "placed",
  "places", "planet", "played", "player", "please", "pledge", "plenty", "pocket", "poetry", "points",
  "police", "policy", "polls", "popped", "portal", "posted", "pounds", "poured", "powers", "praise",
  "prayer", "prefer", "pretty", "priced", "prices", "priest", "primal", "prime", "prince", "prints",
  "prison", "prized", "proper", "proved", "proven", "public", "pulled", "punish", "pursue", "pushed",
  "puzzle", "quoted", "rabbit", "racial", "raised", "random", "ranger", "rarely", "rather", "rating",
  "reader", "really", "reason", "recall", "recent", "recipe", "record", "redeem", "reduce", "refers",
  "refine", "reform", "refuge", "refuse", "regain", "regard", "regime", "region", "regret", "reject",
  "relate", "relied", "relief", "remain", "remake", "remind", "remove", "render", "rental", "repair",
  "repeat", "replay", "report", "rescue", "resist", "resort", "result", "resume", "retain", "retake",
  "return", "reveal", "review", "reward", "rhythm", "ribbon", "richer", "riding", "rights", "rivers",
  "robust", "rocket", "rolled", "roller", "romans", "rookie", "rooted", "rounds", "routes", "rubbed",
  "rubber", "ruling", "runner", "runway", "rushed", "rustic", "sacred", "saddle", "safely", "safety",
  "sailed", "salary", "salmon", "sample", "saving", "saying", "scales", "scared", "scenes", "scheme",
  "school", "scored", "scores", "screen", "script", "scroll", "sealed", "search", "season", "second",
  "secret", "secure", "seeing", "seemed", "seized", "seldom", "select", "seller", "senior", "sensed",
  "serial", "series", "served", "server", "serves", "settle", "sevens", "severe", "sewing", "shades",
  "shadow", "shaken", "shaped", "shapes", "shared", "shares", "sheets", "shells", "shield", "shifts",
  "shines", "shirts", "shoots", "shores", "shorts", "should", "showed", "shower", "shrank", "shrink",
  "sighed", "signal", "signed", "silent", "silver", "simple", "simply", "singer", "single", "sister",
  "sitting", "skilled", "skills", "skirts", "slaves", "sleeve", "sliced", "slides", "slight", "slopes",
  "slowed", "slowly", "smiled", "smooth", "snakes", "soccer", "social", "solely", "solved", "sooner",
  "sorted", "sought", "sounds", "source", "spaces", "speaks", "speech", "speeds", "spend", "spent",
  "sphere", "spikes", "spirit", "splits", "spoken", "sports", "spouse", "spread", "spring", "square",
  "stable", "staged", "stages", "stakes", "stands", "stared", "starts", "stated", "states", "status",
  "stayed", "steady", "stolen", "stomach", "stones", "stored", "stores", "storms", "strain", "strand",
  "street", "stress", "strict", "strike", "string", "strips", "stroke", "strong", "struck", "studio",
  "submit", "subtle", "suburb", "sucked", "sudden", "suffer", "suited", "suites", "summer", "summit",
  "summon", "sunset", "supper", "supply", "surely", "survey", "sweets", "switch", "symbol", "syntax",
  "system", "tables", "tackle", "taking", "talents", "talked", "taller", "target", "tasted", "tastes",
  "taught", "teased", "temple", "tenant", "tended", "tennis", "terror", "tested", "thanks", "theirs",
  "themes", "theory", "thirty", "though", "thread", "threat", "throat", "throne", "thrown", "throws",
  "ticket", "tigers", "timber", "timing", "tissue", "titled", "titles", "tongue", "topics", "topped",
  "tossed", "toward", "traced", "tracks", "trader", "tragic", "trains", "traits", "trauma", "travel",
  "treats", "treaty", "trends", "trials", "tribes", "tricks", "troops", "trophy", "trucks", "trusts",
  "truths", "trying", "tubing", "tucked", "turned", "twelve", "twenty", "typing", "unable", "uneven",
  "unfair", "unhappy", "unique", "united", "unless", "unlike", "update", "upheld", "upward", "urgent",
  "usable", "useful", "username", "usual", "valley", "values", "varied", "varies", "vastly", "vector",
  "vendor", "venue", "verbal", "verify", "versus", "vessels", "victim", "viewed", "viewer", "viking",
  "virtue", "vision", "visits", "voiced", "voices", "volume", "voters", "voting", "voyage", "waited",
  "waiver", "waking", "walked", "wallet", "walnut", "wanted", "warden", "warned", "washed", "wasted",
  "waters", "waving", "wealth", "weapon", "weekly", "weight", "whales", "wheels", "whilst", "whites",
  "wholly", "widget", "widely", "widens", "widely", "wilder", "wildly", "window", "winner", "winter",
  "wisdom", "wished", "wishes", "within", "wizard", "wolves", "wonder", "wooden", "worker", "worthy",
  "writer", "writes", "yellow", "yields", "younger", "youths"
];

// Simple list of words for validating path existence
let simpleWordList = [];
let isWordListLoaded = false;

// Load the simple word list for path validation
async function loadSimpleWordList() {
  try {
    // Use the embedded word list as the primary source
    simpleWordList = [...embeddedWordList];
    isWordListLoaded = true;
    console.log(`Using embedded word list with ${simpleWordList.length} words`);
    
    // Optionally try to load additional words
    try {
      // First check if the preloaded data is available
      if (window.simpleWordListData && window.simpleWordListData.length > 0) {
        // Add any words that aren't already in our list
        for (const word of window.simpleWordListData) {
          if (!simpleWordList.includes(word)) {
            simpleWordList.push(word);
          }
        }
        console.log(`Added words from preloaded data, now have ${simpleWordList.length} words`);
      } else {
        // If not preloaded, try to load from file but don't wait for it
        fetch('six_letter_simple_word_list.csv.csv').then(async response => {
          const text = await response.text();
          const additionalWords = text.split('\n')
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length === 6);
            
          // Add any words that aren't already in our list
          for (const word of additionalWords) {
            if (!simpleWordList.includes(word)) {
              simpleWordList.push(word);
            }
          }
          console.log(`Added words from file, now have ${simpleWordList.length} words`);
        }).catch(e => {
          console.log("Could not load additional words from file, using embedded list only");
        });
      }
    } catch (e) {
      console.log("Error trying to load additional words, using embedded list only");
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up word list:', error);
    // Even in case of error, our embedded list should be available
    if (simpleWordList.length === 0) {
      simpleWordList = [...embeddedWordList];
      isWordListLoaded = true;
    }
    return true;
  }
}

// Function to count letter differences between two words
function countDifferences(word1, word2) {
  let diff = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) diff++;
  }
  return diff;
}

// Function to check if a word can be reached from another word in the game
function areWordsConnectable(word1, word2) {
  const diff = countDifferences(word1, word2);
  return diff === 1 || diff === 2;
}

// Find all words that can be reached from a given word
function findConnections(word, wordList) {
  // Optimization: For large dictionaries, use a more efficient approach
  if (wordList.length > 200) {
    // First filter by length to ensure we're only checking words of the same length
    // This is already guaranteed for our list, but keeping for robustness
    const sameLength = wordList.filter(w => w.length === word.length && w !== word);
    
    // Then find words that are 1-2 letters different
    return sameLength.filter(w => {
      const diff = countDifferences(word, w);
      return diff === 1 || diff === 2;
    });
  }
  
  // Original implementation for smaller word lists
  return wordList.filter(w => 
    w !== word && areWordsConnectable(word, w)
  );
}

// Check if there's a possible path between start and target words
// using breadth-first search algorithm with a depth limit
function canFindPath(startWord, targetWord, wordList) {
  if (startWord === targetWord) return true;
  if (!wordList.includes(startWord) || !wordList.includes(targetWord)) return false;
  
  // Direct check - if they're 1-2 letters apart, return true immediately
  if (areWordsConnectable(startWord, targetWord)) return true;
  
  // For larger dictionaries, limit the search depth to avoid excessive computation
  const maxDepth = 4;
  
  const queue = [[startWord, 0]]; // [word, depth]
  const visited = new Set([startWord]);
  
  while (queue.length > 0) {
    const [currentWord, depth] = queue.shift();
    
    // Stop searching if we've reached the maximum depth
    if (depth >= maxDepth) continue;
    
    // Found a direct connection to target word
    if (areWordsConnectable(currentWord, targetWord)) {
      return true;
    }
    
    // Check all possible connections from current word
    const connections = findConnections(currentWord, wordList);
    
    for (const nextWord of connections) {
      if (!visited.has(nextWord)) {
        visited.add(nextWord);
        queue.push([nextWord, depth + 1]);
      }
    }
  }
  
  // No path found within the depth limit
  return false;
}

// Find the shortest path between start and target words
// Returns the path length or -1 if no path exists
function findShortestPath(startWord, targetWord, wordList) {
  // Check for direct connection first (this is the key fix)
  if (areWordsConnectable(startWord, targetWord)) {
    return 1; // If words differ by 1-2 letters, it's just 1 move
  }
  
  if (startWord === targetWord) return 0;
  if (!wordList.includes(startWord) || !wordList.includes(targetWord)) return -1;
  
  const queue = [[startWord, 0]]; // [word, distance]
  const visited = new Set([startWord]);
  
  while (queue.length > 0) {
    const [currentWord, distance] = queue.shift();
    
    // Found a direct connection to target word
    if (areWordsConnectable(currentWord, targetWord)) {
      return distance + 1; // Add one for the final step to target
    }
    
    // Check all possible connections from current word
    const connections = findConnections(currentWord, wordList);
    
    for (const nextWord of connections) {
      if (!visited.has(nextWord)) {
        visited.add(nextWord);
        queue.push([nextWord, distance + 1]);
      }
    }
  }
  
  // No path found
  return -1;
}

// Count number of possible paths up to a certain length
// This is an estimate of path diversity (capped to avoid excessive computation)
function countPossiblePaths(startWord, targetWord, wordList, maxDepth = 4) {
  // Use a depth-limited search to count potential paths
  let pathCount = 0;
  const visited = new Set();
  
  function dfs(currentWord, depth) {
    if (depth > maxDepth) return;
    
    // Found a connection to target
    if (areWordsConnectable(currentWord, targetWord)) {
      pathCount++;
      return;
    }
    
    visited.add(currentWord);
    const connections = findConnections(currentWord, wordList);
    
    for (const nextWord of connections) {
      if (!visited.has(nextWord)) {
        dfs(nextWord, depth + 1);
      }
    }
    visited.delete(currentWord); // Backtrack
  }
  
  dfs(startWord, 0);
  return pathCount;
}

// Calculate difficulty score between 1-5 (1=easy, 5=hard)
function calculateDifficulty(startWord, targetWord, wordList) {
  // Get metrics that contribute to difficulty
  const letterDifference = countDifferences(startWord, targetWord);
  const shortestPath = findShortestPath(startWord, targetWord, wordList);
  
  // Log the metrics for debugging
  console.log(`Difficulty calculation for ${startWord} → ${targetWord}:`);
  console.log(`Letter difference: ${letterDifference}`);
  console.log(`Shortest path: ${shortestPath}`);
  
  // If no path exists, return maximum difficulty
  if (shortestPath === -1) {
    return {
      score: 5,
      letterDifference,
      shortestPath: -1,
      possiblePaths: 0,
      difficultyText: "Extreme"
    };
  }
  
  // Simplified difficulty scale based solely on shortest path length:
  // 1 move = Easy
  // 2 moves = Medium
  // 3-4 moves = Hard
  // 5+ moves = Extreme
  let difficultyScore, difficultyText;
  
  if (shortestPath === 1) {
    difficultyScore = 1;
    difficultyText = "Easy";
  } else if (shortestPath === 2) {
    difficultyScore = 2;
    difficultyText = "Medium";
  } else if (shortestPath >= 3 && shortestPath <= 4) {
    difficultyScore = 3;
    difficultyText = "Hard";
  } else { // shortestPath >= 5
    difficultyScore = 5;
    difficultyText = "Extreme";
  }
  
  // Count possible paths for informational purposes
  const possiblePaths = countPossiblePaths(startWord, targetWord, wordList);
  
  // Return difficulty metrics
  return {
    score: difficultyScore,
    letterDifference,
    shortestPath,
    possiblePaths,
    difficultyText: difficultyText
  };
}

// Convert numerical difficulty to text description - simplified for new scale
function getDifficultyText(score) {
  if (score === 1) return "Easy";
  if (score === 2) return "Medium";
  if (score === 3) return "Hard";
  return "Extreme";
}

// Generate a seed for consistent random number generation based on the date
function getDateSeed() {
  // Get current date 
  const now = new Date();
  
  // Output the current date for debugging
  console.log("Current date (local): ", now.toString());
  
  // Try to get Pacific time more reliably
  let pacificTime;
  try {
    // First attempt: Using Intl.DateTimeFormat for proper time zone support
    pacificTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(now);
    
    // Convert to date components
    const [month, day, year] = pacificTime.split('/').map(num => parseInt(num, 10));
    
    // Use consistent format for seed
    const seedString = `${year}_${month}_${day}`;
    console.log("Generated seed (Pacific Time): ", seedString);
    return seedString;
  } catch (e) {
    console.warn("Error using Intl.DateTimeFormat, falling back to manual calculation", e);
    
    // Fallback to manual calculation (original code)
    // Automatically determine if daylight saving is in effect
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    const isDST = now.getTimezoneOffset() < stdTimezoneOffset;
    
    // Adjust for daylight saving time if needed
    const pacificOffset = isDST ? -7 * 60 : -8 * 60; // -7 or -8 hours in minutes
    
    // Convert to Pacific time
    pacificTime = new Date(now.getTime() + (now.getTimezoneOffset() + pacificOffset) * 60000);
    
    // Use year/month/day as seed
    const seedString = `${pacificTime.getFullYear()}_${pacificTime.getMonth() + 1}_${pacificTime.getDate()}`;
    console.log("Generated seed (fallback method): ", seedString);
    return seedString;
  }
}

// Simple pseudo-random number generator with a seed
class SeededRandom {
  constructor(seed) {
    this.seed = this.hash(seed);
  }
  
  // Simple string hash function
  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  
  // Generate random number between 0 and 1
  random() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  // Get random integer between min and max (inclusive)
  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
}

// Generate a daily challenge with start and target words
function generateDailyChallenge() {
  // Default values in case something goes wrong
  let startWord = "forest";
  let targetWord = "winter";
  let difficulty = {
    score: 3,
    letterDifference: 4,
    shortestPath: 3,
    possiblePaths: 5,
    difficultyText: "Medium"
  };
  
  try {
    // Make sure we have words to work with - now we always do!
    if (simpleWordList.length < 10) {
      console.log("Word list not loaded yet, initializing with embedded list");
      simpleWordList = [...embeddedWordList];
      isWordListLoaded = true;
    }
    
    console.log(`Generating daily challenge using ${simpleWordList.length} words`);
    
    // Use today's date as seed for random number generator
    const dateSeed = getDateSeed();
    const rng = new SeededRandom(dateSeed);
    
    // Only attempt a limited number of times to avoid infinite loops
    const maxAttempts = 100;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Pick two random words from our word list
      const index1 = rng.randomInt(0, simpleWordList.length - 1);
      const index2 = rng.randomInt(0, simpleWordList.length - 1);
      
      const candidate1 = simpleWordList[index1];
      const candidate2 = simpleWordList[index2];
      
      // Ensure we have valid words
      if (!candidate1 || !candidate2) continue;
      
      // Make sure the words are different and not too similar
      if (candidate1 !== candidate2 && countDifferences(candidate1, candidate2) >= 3) {
        // Check if there's a possible path between them
        if (canFindPath(candidate1, candidate2, simpleWordList)) {
          startWord = candidate1;
          targetWord = candidate2;
          difficulty = calculateDifficulty(startWord, targetWord, simpleWordList);
          break;
        }
      }
    }
    
    console.log(`Daily challenge generated for ${dateSeed}: ${startWord} → ${targetWord} (${difficulty.difficultyText})`);
  } catch (error) {
    console.error('Error generating daily challenge:', error);
  }
  
  return { startWord, targetWord, difficulty };
}

// Initialize the word list immediately
const wordListPromise = loadSimpleWordList();

// Main function to get the daily challenge
async function getDailyChallenge() {
  // If word list is not loaded yet, try to load it
  if (!isWordListLoaded) {
    // If the word list isn't loaded, initialize with embedded list
    if (simpleWordList.length === 0) {
      simpleWordList = [...embeddedWordList];
      isWordListLoaded = true;
      console.log("Initialized with embedded word list for immediate use");
    }
    
    try {
      // Try to load additional words asynchronously
      await wordListPromise;
    } catch (error) {
      console.error("Error loading additional words:", error);
      // Even on error, we still have the embedded list
    }
  }
  
  // Generate the challenge
  return generateDailyChallenge();
} 

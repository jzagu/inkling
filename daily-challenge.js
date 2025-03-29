// Daily Challenge Module for Word Chain Game
// This module handles generating daily start and target word pairs
// that change at midnight Pacific time

// Simple list of words for validating path existence
let simpleWordList = [];
let isWordListLoaded = false;

// Load the simple word list for path validation
async function loadSimpleWordList() {
  try {
    // First check if the preloaded data is available
    if (window.simpleWordListData && window.simpleWordListData.length > 0) {
      simpleWordList = window.simpleWordListData;
      isWordListLoaded = true;
      console.log(`Using preloaded simple word list with ${simpleWordList.length} words`);
      return true;
    }

    // If not preloaded, try to load it directly
    const response = await fetch('six_letter_simple_word_list.csv.csv');
    const text = await response.text();
    simpleWordList = text.split('\n')
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length === 6);
    
    isWordListLoaded = true;
    console.log(`Simple word list loaded with ${simpleWordList.length} words for path validation`);
    return true;
  } catch (error) {
    console.error('Error loading simple word list:', error);
    // Fallback to a minimal list if loading fails
    simpleWordList = ["forest", "foster", "faster", "master", "mister", "winter", 
                      "sudden", "garden", "golden", "wonder", "worker", "winner"];
    isWordListLoaded = true;
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
  return wordList.filter(w => 
    w !== word && areWordsConnectable(word, w)
  );
}

// Check if there's a possible path between start and target words
// using breadth-first search algorithm
function canFindPath(startWord, targetWord, wordList) {
  if (startWord === targetWord) return true;
  if (!wordList.includes(startWord) || !wordList.includes(targetWord)) return false;
  
  const queue = [startWord];
  const visited = new Set([startWord]);
  
  while (queue.length > 0) {
    const currentWord = queue.shift();
    
    // Found a direct connection to target word
    if (areWordsConnectable(currentWord, targetWord)) {
      return true;
    }
    
    // Check all possible connections from current word
    const connections = findConnections(currentWord, wordList);
    
    for (const nextWord of connections) {
      if (!visited.has(nextWord)) {
        visited.add(nextWord);
        queue.push(nextWord);
      }
    }
  }
  
  // No path found
  return false;
}

// Find the shortest path between start and target words
// Returns the path length or -1 if no path exists
function findShortestPath(startWord, targetWord, wordList) {
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
  
  // If no path exists, return maximum difficulty
  if (shortestPath === -1) return 5;
  
  // If the shortest path requires 3 or more moves, automatically assign maximum difficulty
  if (shortestPath >= 3) {
    return {
      score: 5,
      letterDifference,
      shortestPath,
      possiblePaths: countPossiblePaths(startWord, targetWord, wordList),
      difficultyText: "Master"
    };
  }
  
  // Calculate path diversity (limited to avoid expensive computation)
  const possiblePaths = countPossiblePaths(startWord, targetWord, wordList);
  
  // Calculate difficulty score (1-5)
  let difficultyScore = 0;
  
  // Letter difference contributes to difficulty with more granular scoring
  // 1 letter different = 0.2 points
  // 2 letters different = 0.4 points
  // 3 letters different = 0.6 points
  // 4 letters different = 0.8 points
  // 5 letters different = 1.0 points
  // 6 letters different = 1.2 points
  difficultyScore += Math.min(letterDifference * 0.2, 1.2);
  
  // Path length contributes much more to difficulty (longer = harder)
  // Worth double what it was before
  difficultyScore += Math.min(shortestPath * 2, 3.0); // 0-3.0 points
  
  // Path diversity inversely contributes more (fewer paths = harder)
  if (possiblePaths === 0) {
    difficultyScore += 1.5; // Maximum difficulty for no paths
  } else if (possiblePaths < 3) {
    difficultyScore += 1.2; // Very few paths
  } else if (possiblePaths < 8) {
    difficultyScore += 0.6; // Some paths
  }
  
  // Round to nearest 0.5 and ensure in range 1-5
  difficultyScore = Math.max(1, Math.min(5, Math.round(difficultyScore * 2) / 2));
  
  // Return difficulty metrics
  return {
    score: difficultyScore,
    letterDifference,
    shortestPath,
    possiblePaths,
    difficultyText: getDifficultyText(difficultyScore)
  };
}

// Convert numerical difficulty to text description
function getDifficultyText(score) {
  if (score <= 1.5) return "Easy";
  if (score <= 2.5) return "Medium";
  if (score <= 3.5) return "Hard";
  if (score <= 4.5) return "Expert";
  return "Master";
}

// Generate a seed for consistent random number generation based on the date
function getDateSeed() {
  // Get current date in Pacific timezone
  const now = new Date();
  // Pacific time is UTC-7 or UTC-8 depending on daylight saving
  // Automatically determine if daylight saving is in effect
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const isDST = now.getTimezoneOffset() < stdTimezoneOffset;
  
  // Adjust for daylight saving time if needed
  const pacificOffset = isDST ? -7 * 60 : -8 * 60; // -7 or -8 hours in minutes
  
  // Convert to Pacific time
  const pacificTime = new Date(now.getTime() + (now.getTimezoneOffset() + pacificOffset) * 60000);
  
  // Use year/month/day as seed
  return `${pacificTime.getFullYear()}_${pacificTime.getMonth() + 1}_${pacificTime.getDate()}`;
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
    // Make sure we have a word list to work with
    if (!isWordListLoaded || simpleWordList.length < 10) {
      console.warn("Word list not fully loaded yet, using default words");
      return { startWord, targetWord, difficulty };
    }
    
    // Use today's date as seed for random number generator
    const dateSeed = getDateSeed();
    const rng = new SeededRandom(dateSeed);
    
    // Only attempt a limited number of times to avoid infinite loops
    const maxAttempts = 50;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Pick two random words from the simple list
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
  // If word list is not loaded yet, wait for it to load
  if (!isWordListLoaded) {
    try {
      await wordListPromise;
    } catch (error) {
      console.error("Error waiting for word list to load:", error);
    }
  }
  
  return generateDailyChallenge();
} 

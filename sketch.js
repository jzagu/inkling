let startWord = "loading...";  // Will be replaced by daily challenge
let targetWord = "loading...";  // Will be replaced by daily challenge
let currentWord = "";           // Current word in the chain
let wordChain = [];             // Array to track the word chain
let inputBox;
let submitButton;
let message = "";
let gameWon = false;
let loadingIndicator;
let lastCheckTime = 0; // Used to track when to check for the next day
let challengeDifficulty = null; // Store the difficulty of the current challenge

// Colors
let colors = {
  background: "#1a1a2e",
  primary: "#e94560",
  secondary: "#0f3460",
  accent: "#16213e",
  text: "#ffffff",
  highlight: "#ffde59"
};

// Dictionary is loaded from the word-list files defined in index.html
let dictionary = [];

// Help popup state
let showHelpPopup = false;
let helpButton;

function setup() {
  createCanvas(500, 600);
  
  // Set the dictionary from the word list loaded in index.html
  if (typeof allSixLetterWords !== 'undefined') {
    dictionary = allSixLetterWords;
    console.log("Dictionary loaded initially with: " + dictionary.length + " words");
  } else {
    console.error("Word list not initialized. Make sure the core word list is defined in index.html");
    // Fallback minimal dictionary if word list isn't loaded
    dictionary = ["forest", "foster", "faster", "master", "mister", "winter", "rarest"];
  }

  // Set up the daily challenge
  setupDailyChallenge().catch(error => {
    console.error("Failed to set up daily challenge:", error);
  });
  
  // Create input box with improved styling
  inputBox = createInput("");
  inputBox.size(200);  // Fixed width for input box
  inputBox.style('padding', '12px');
  inputBox.style('font-size', '18px');
  inputBox.style('border-radius', '25px');
  inputBox.style('border', '2px solid #e94560');
  inputBox.style('background-color', '#16213e');
  inputBox.style('color', '#ffffff');
  inputBox.style('text-align', 'center');
  
  // Create submit button with improved styling
  submitButton = createButton("SUBMIT");
  submitButton.size(80, 45);
  submitButton.style('background-color', '#e94560');
  submitButton.style('color', '#ffffff');
  submitButton.style('font-size', '16px');
  submitButton.style('font-weight', 'bold');
  submitButton.style('border', 'none');
  submitButton.style('border-radius', '25px');
  submitButton.style('cursor', 'pointer');
  submitButton.mousePressed(checkWord);
  
  // Create help button with styling
  helpButton = createButton("?");
  helpButton.size(40, 40);
  helpButton.style('background-color', colors.highlight);
  helpButton.style('color', colors.accent);
  helpButton.style('font-size', '24px');
  helpButton.style('font-weight', 'bold');
  helpButton.style('border', 'none');
  helpButton.style('border-radius', '50%');
  helpButton.style('cursor', 'pointer');
  helpButton.style('z-index', '1000'); // Ensure button stays on top
  helpButton.mousePressed(toggleHelpPopup);

  // Also add direct DOM event listener to ensure clicks are captured
  helpButton.elt.addEventListener('click', function(e) {
    toggleHelpPopup();
    e.stopPropagation(); // Prevent event from bubbling up
  });

  // Position elements relative to canvas
  const canvas = document.querySelector('canvas');
  if (canvas) {
    const canvasRect = canvas.getBoundingClientRect();
    const canvasLeft = canvasRect.left;
    
    // Center the input box (200px width)
    const inputBoxX = canvasLeft + width/2 - 100;  // Center point minus half the input box width
    inputBox.position(inputBoxX, height - 130);
    
    // Position submit button to the right of the input box
    const submitButtonX = inputBoxX + 210;  // Input box x + input box width (200) + spacing (10)
    submitButton.position(submitButtonX, height - 130);
    
    // Position help button at the top right corner
    helpButton.position(canvasLeft + width - 50, 10);
  }
}

// Function to toggle help popup visibility
function toggleHelpPopup() {
  showHelpPopup = !showHelpPopup;
  console.log("Help popup toggled. Current state:", showHelpPopup);
}

// Add window resize handler
function windowResized() {
  // Resize the canvas to match window size while maintaining aspect ratio
  const canvasWidth = min(windowWidth, 800);  // Max width of 800px
  const canvasHeight = min(windowHeight, 800);  // Max height of 800px
  resizeCanvas(canvasWidth, canvasHeight);
  
  // Get the canvas element and its position
  const canvas = document.querySelector('canvas');
  if (canvas) {
    const canvasRect = canvas.getBoundingClientRect();
    const canvasLeft = canvasRect.left;
    
    // Center the input box (200px width)
    const inputBoxX = canvasLeft + width/2 - 100;  // Center point minus half the input box width
    inputBox.position(inputBoxX, height - 130);
    
    // Position submit button to the right of the input box
    const submitButtonX = inputBoxX + 210;  // Input box x + input box width (200) + spacing (10)
    submitButton.position(submitButtonX, height - 130);
    
    // Position help button at the top right corner
    helpButton.position(canvasLeft + width - 50, 10);
  }
}

// Function to set up the daily challenge
async function setupDailyChallenge() {
  if (typeof getDailyChallenge === 'function') {
    try {
      const challenge = await getDailyChallenge();
      startWord = challenge.startWord;
      targetWord = challenge.targetWord;
      challengeDifficulty = challenge.difficulty;
      
      // Initialize game with the start word
      currentWord = startWord;
      wordChain = [startWord];
      message = "New daily challenge loaded!";
      
      console.log(`Daily Challenge: ${startWord} → ${targetWord}`);
      if (challengeDifficulty) {
        console.log(`Difficulty: ${challengeDifficulty.difficultyText} (${challengeDifficulty.score}/5)`);
        console.log(`Challenge data:`, challengeDifficulty);
        
        // Add warning if the definition of shortestPath is inconsistent with our understanding
        if (startWord && targetWord && wordChain.length === 1) {
          const letterDiff = countDifferences(startWord, targetWord);
          if (letterDiff <= 2 && challengeDifficulty.shortestPath > 1) {
            console.warn(`⚠️ DEFINITION MISMATCH: Target word is ${letterDiff} letters away from start word, ` +
                         `but shortestPath is set to ${challengeDifficulty.shortestPath}. ` +
                         `This suggests shortestPath might be counting something else!`);
          }
        }
      }
    } catch (error) {
      console.error("Error setting up daily challenge:", error);
      // Keep default values if there's an error
      if (startWord === "loading..." || targetWord === "loading...") {
        // Set fallback values if still on loading state
        startWord = "forest";
        targetWord = "winter";
        currentWord = startWord;
        wordChain = [startWord];
        message = "Using default words (failed to load daily challenge).";
        challengeDifficulty = {
          score: 3,
          difficultyText: "Medium",
          letterDifference: 4,
          shortestPath: 3,
          possiblePaths: 5
        };
      }
    }
  } else {
    console.warn("Daily challenge module not loaded. Using default words.");
    // Set fallback values if module not available
    startWord = "forest";
    targetWord = "winter";
    currentWord = startWord;
    wordChain = [startWord];
    challengeDifficulty = {
      score: 3,
      difficultyText: "Medium",
      letterDifference: 4,
      shortestPath: 3,
      possiblePaths: 5
    };
  }
  
  // Store today's date to check for changes
  lastCheckTime = Date.now();
}

// Function to check if we've reached a new day (Pacific time)
function checkForNewDay() {
  // Only check once per minute to avoid excessive calculations
  const now = Date.now();
  if (now - lastCheckTime < 60000) return false;
  
  lastCheckTime = now;
  
  // Get current date in Pacific timezone
  const pacificTime = getTodayInPacificTime();
  
  // Get stored date from localStorage or default to a past date
  const storedDateStr = localStorage.getItem('lastChallengeDate') || '2000-01-01';
  const storedDate = new Date(storedDateStr);
  
  // Check if the day has changed
  if (pacificTime.toDateString() !== storedDate.toDateString()) {
    // Store new date
    localStorage.setItem('lastChallengeDate', pacificTime.toISOString());
    return true;
  }
  
  return false;
}

// Helper function to get today's date in Pacific Time
function getTodayInPacificTime() {
  const now = new Date();
  
  // Automatically determine if daylight saving is in effect
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const isDST = now.getTimezoneOffset() < stdTimezoneOffset;
  
  // Adjust for daylight saving time if needed
  const pacificOffset = isDST ? -7 * 60 : -8 * 60; // -7 or -8 hours in minutes
  
  // Convert to Pacific time
  return new Date(now.getTime() + (now.getTimezoneOffset() + pacificOffset) * 60000);
}

function draw() {
  background(colors.background);
  
  // Check if we need to update the daily challenge (at midnight Pacific time)
  if (checkForNewDay() && !gameWon) {
    setupDailyChallenge().catch(error => {
      console.error("Error refreshing daily challenge:", error);
    });
  }
  
  // Update dictionary from allSixLetterWords which is loaded asynchronously
  if (typeof allSixLetterWords !== 'undefined' && allSixLetterWords.length !== dictionary.length) {
    dictionary = allSixLetterWords;
    console.log("Dictionary updated: " + dictionary.length + " words");
  }
  
  // Draw title
  textSize(48);
  textAlign(CENTER);
  textStyle(BOLD);
  fill(colors.primary);
  text("INKLING", width/2, 45);
  textStyle(NORMAL);
  
  if (gameWon) {
    // Get victory screen card dimensions before displaying
    const { cardHeight, topMargin } = calculateVictoryCardDimensions();
    
    displayVictoryScreen();
    // Hide input elements on victory screen
    inputBox.style('display', 'none');
    submitButton.style('display', 'none');
    
    // Show "Daily Challenge" label with date, positioned relative to victory card
    const pacificDate = getTodayInPacificTime();
    const dateString = pacificDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    fill(colors.primary);
    textSize(14);
    textAlign(RIGHT);
    text(`DAILY CHALLENGE · ${dateString}`, width - 60, topMargin + cardHeight + 25);
    
    // Show difficulty level if available, positioned relative to victory card
    if (challengeDifficulty) {
      fill(colors.highlight);
      textSize(14);
      textAlign(LEFT);
      text(`DIFFICULTY: ${challengeDifficulty.difficultyText.toUpperCase()}`, 60, topMargin + cardHeight + 25);
    }
  } else {
    displayGameScreen();
    // Show input elements during gameplay
    inputBox.style('display', 'block');
    submitButton.style('display', 'block');
    
    // Get today's date in Pacific Time for the label
    const pacificDate = getTodayInPacificTime();
    const dateString = pacificDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    // Show "Daily Challenge" label with date
    fill(colors.primary);
    textSize(14);
    textAlign(RIGHT);
    text(`DAILY CHALLENGE · ${dateString}`, width - 60, height - 6);
    
    // Show difficulty level if available
    if (challengeDifficulty) {
      fill(colors.highlight);
      textSize(14);
      textAlign(LEFT);
      text(`DIFFICULTY: ${challengeDifficulty.difficultyText.toUpperCase()}`, 60, height - 6);
    }
  }
  
  // Show dictionary loading status if dictionary is still loading
  if (typeof dictionaryState !== 'undefined' && dictionaryState.isLoading) {
    fill(colors.highlight);
    textSize(14);
    textAlign(LEFT);
    text(`Dictionary: ${dictionary.length} words loaded (${dictionaryState.loadedSections}/${dictionaryState.totalSections} files)`, 
         60, height - 20);
  }
  
  // Draw help popup if visible - moved to the end to ensure it's drawn on top
  if (showHelpPopup) {
    displayHelpPopup();
  }
}

function displayGameScreen() {
  // Calculate the height needed for the word chain box
  const wordChainHeight = Math.max(300, wordChain.length * 30 + 60); // Base height of 300, or more if needed
  const boxTop = 100;
  
  // Calculate how much to shift elements down based on number of guesses
  const shiftAmount = Math.max(0, (wordChain.length - 3) * 30); // Start shifting after 3 guesses
  
  // Draw a card-like container with dynamic height
  fill(colors.accent);
  rect(50, boxTop, width-100, wordChainHeight, 15);
  
  // Display start and target words
  textSize(24);
  textAlign(CENTER);
  fill(colors.text);
  
  // Start word with styling
  fill(colors.secondary);
  rect(width/2 - 150, boxTop + 20, 140, 50, 10);
  fill(colors.text);
  text(startWord.toUpperCase(), width/2 - 80, boxTop + 55);
  text("START", width/2 - 80, boxTop + 10);
  
  // Target word with styling
  fill(colors.primary);
  rect(width/2 + 10, boxTop + 20, 140, 50, 10);
  fill(colors.text);
  text(targetWord.toUpperCase(), width/2 + 80, boxTop + 55);
  text("TARGET", width/2 + 80, boxTop + 10);
  
  // Draw arrow pointing from start to target word (triangle only, no line)
  fill(colors.text);
  // Arrow head pointing right (towards target)
  triangle(width/2, boxTop + 45, width/2 - 15, boxTop + 35, width/2 - 15, boxTop + 55);
  
  // Display current word chain
  textSize(18);
  fill(colors.text);
  textAlign(LEFT);
  text("Your word chain:", 100, boxTop + 110);
  
  // Draw word chain with nice styling
  for (let i = 0; i < wordChain.length; i++) {
    if (i === wordChain.length - 1) {
      // Highlight current word
      fill(colors.primary);
    } else {
      fill(colors.text);
    }
    text(wordChain[i].toUpperCase(), 110, boxTop + 140 + i * 30);
  }
  
  // Calculate the bottom position of the game box
  const gameBoxBottom = boxTop + wordChainHeight;
  
  // Position input elements relative to the game box bottom, with additional shift
  const inputY = gameBoxBottom + 30 + shiftAmount;
  
  // Update input elements position
  const canvas = document.querySelector('canvas');
  if (canvas) {
    const canvasRect = canvas.getBoundingClientRect();
    const canvasLeft = canvasRect.left;
    
    // Center the input box (200px width)
    const inputBoxX = canvasLeft + width/2 - 100;
    inputBox.position(inputBoxX, inputY);
    
    // Position submit button to the right of the input box
    const submitButtonX = inputBoxX + 210;
    submitButton.position(submitButtonX, inputY);
  }
  
  // Display feedback message
  fill(colors.highlight);
  textSize(16);
  textAlign(CENTER);
  text(message, width/2, inputY - 10);
  
  // Show "Daily Challenge" label with date
  fill(colors.primary);
  textSize(14);
  textAlign(RIGHT);
  text(`DAILY CHALLENGE · ${getTodayInPacificTime().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })}`, width - 60, height - 6);
  
  // Show difficulty level if available
  if (challengeDifficulty) {
    fill(colors.highlight);
    textSize(14);
    textAlign(LEFT);
    text(`DIFFICULTY: ${challengeDifficulty.difficultyText.toUpperCase()}`, 60, height - 6);
  }
  
  // Show dictionary loading status if dictionary is still loading
  if (typeof dictionaryState !== 'undefined' && dictionaryState.isLoading) {
    fill(colors.highlight);
    textSize(14);
    textAlign(LEFT);
    text(`Dictionary: ${dictionary.length} words loaded (${dictionaryState.loadedSections}/${dictionaryState.totalSections} files)`, 
         60, height - 20);
  }
}

// Helper function to calculate victory card dimensions
function calculateVictoryCardDimensions() {
  // Create a complete chain with target word (if not already included)
  let completeChain = [...wordChain];
  if (completeChain[completeChain.length - 1] !== targetWord) {
    completeChain.push(targetWord);
  }
  
  // Fixed spacing values
  const topMargin = 100;       // Y position where card starts
  const titleSpace = 100;      // Space for victory title
  const wordSpacing = 35;      // Vertical space between words
  const statsSectionHeight = 120; // Height for stats section at bottom
  const minCardHeight = 400;   // Minimum card height
  const maxCardHeight = height - topMargin - 40; // Maximum card height with some margin
  
  // Calculate chain display area
  const chainHeight = completeChain.length * wordSpacing + 60; // Words + header + padding
  
  // Calculate total required card height
  const requiredCardHeight = titleSpace + chainHeight + statsSectionHeight;
  
  // Limit the card height to prevent overflow
  const cardHeight = Math.min(maxCardHeight, Math.max(minCardHeight, requiredCardHeight));
  
  // Determine if we need to scale or compress the word display
  const needsCompression = requiredCardHeight > maxCardHeight;
  
  return { 
    cardHeight, 
    topMargin, 
    completeChain,
    needsCompression,
    idealChainHeight: chainHeight,
    availableChainSpace: cardHeight - titleSpace - statsSectionHeight
  };
}

function displayVictoryScreen() {
  // Get card dimensions and chain
  const { 
    cardHeight, 
    topMargin, 
    completeChain,
    needsCompression,
    idealChainHeight,
    availableChainSpace
  } = calculateVictoryCardDimensions();
  
  // Fixed spacing values
  const titleSpace = 100;      // Space for victory title
  const statsSectionHeight = 120; // Height for stats section at bottom
  const sidePadding = 50;      // Padding on each side
  
  // Calculate word spacing dynamically if we need to compress
  let wordSpacing = 35; // Default spacing
  if (needsCompression && completeChain.length > 3) {
    // Reduce spacing to fit within available space (with minimum spacing)
    const minSpacing = 20; // Minimum allowed spacing between words
    wordSpacing = Math.max(minSpacing, availableChainSpace / (completeChain.length + 1));
  }
  
  // Draw the card with calculated height
  fill(colors.accent);
  rect(sidePadding, topMargin, width - sidePadding * 2, cardHeight, 15);
  
  // Draw the top buttons on either side of the title (these stay fixed)
  // Play again button (left)
  fill(colors.primary);
  rect(60, 40, 120, 40, 20);
  
  fill(colors.text);
  textSize(14);
  textAlign(CENTER);
  text("PLAY AGAIN", 120, 60);
  
  // Share results button (right)
  fill("#000000");  // Black background for X
  rect(width - 180, 40, 120, 40, 20);
  
  fill(colors.text);
  textSize(14);
  text("SHARE ON 𝕏", width - 120, 60);
  
  // Card top position
  const cardTop = topMargin;
  
  // Victory text - positioned relative to card top
  textSize(48);
  textAlign(CENTER);
  fill(colors.primary);
  text("VICTORY!", width/2, cardTop + 50);
  
  textSize(22);
  fill(colors.text);
  text("Word chain complete!", width/2, cardTop + 90);
  
  // Chain section - positioned relative to card top
  const chainStartY = cardTop + titleSpace + 30;
  
  // Chain header
  textSize(18);
  fill(colors.highlight);
  text("Your winning path:", width/2, chainStartY);
  
  // Display the chain vertically with relative positioning
  // For longer chains, create a more compressed display
  
  // Adjust text size for very long chains
  let wordTextSize = 22; // Default
  if (completeChain.length > 10) {
    wordTextSize = 18; // Smaller text for long chains
  }
  
  // Will scale this down for longer chains
  textSize(wordTextSize);
  
  // Draw scroll indicator if the chain is compressed
  if (needsCompression && completeChain.length > 6) {
    fill(colors.text);
    textSize(14);
    text("(Long solution - words compressed to fit)", width/2, chainStartY + 22);
  }
  
  // Display words with appropriate spacing
  for (let i = 0; i < completeChain.length; i++) {
    // Calculate color interpolation for word gradient
    let c = lerpColor(color(colors.secondary), color(colors.primary), i/(completeChain.length-1));
    fill(c);
    
    // Position words relative to chain start
    const wordY = chainStartY + 40 + (i * wordSpacing);
    text(completeChain[i].toUpperCase(), width/2, wordY);
    
    // Draw connecting arrow if not the last word
    if (i < completeChain.length - 1) {
      fill(colors.text);
      
      // For compressed chains, use smaller arrows
      const arrowSize = needsCompression ? 3 : 5;
      triangle(
        width/2, wordY + (wordSpacing/2), 
        width/2 - arrowSize, wordY + (wordSpacing/2) - arrowSize, 
        width/2 + arrowSize, wordY + (wordSpacing/2) - arrowSize
      );
    }
  }
  
  // Stats section - positioned relative to card bottom
  const statsY = cardTop + cardHeight - statsSectionHeight;
  
  // Calculate and display performance rating
  // Count the number of player moves (words added after start word)
  const playerMoves = wordChain.length - 1;
  let performanceRating = calculatePerformanceRating(playerMoves);
  
  // Debug info directly in the game (only in console, not on screen)
  console.log("Victory stats:");
  console.log(`- Word chain: ${wordChain.join(' -> ')}`);
  console.log(`- Player moves: ${playerMoves}`);
  console.log(`- Theoretical fewest moves: ${performanceRating.theoreticalFewestMoves}`);
  console.log(`- Last word in chain: ${performanceRating.lastWord}`);
  console.log(`- Last word is exactly target: ${performanceRating.isExactTarget}`);
  console.log(`- Last word is close enough to target: ${performanceRating.isCloseToTarget}`);
  console.log(`- Target considered reached: ${performanceRating.targetReached}`);
  console.log(`- Is optimal solution: ${performanceRating.isOptimal}`);
  console.log(`- Rating: ${performanceRating.ratingText} (score: ${performanceRating.score})`);
  
  // Add a divider line between chain and stats
  stroke(colors.text);
  strokeWeight(1);
  line(
    sidePadding + 30, 
    statsY - 15, 
    width - sidePadding - 30, 
    statsY - 15
  );
  noStroke();
  
  // Display stats at consistent positions from bottom of card
  fill(colors.text);
  textSize(18);
  textAlign(CENTER);
  text("Moves: " + playerMoves, width/2, statsY + 20);
  
  // Show challenge difficulty and performance in compact format
  fill(colors.highlight);
  textSize(14);
  textAlign(CENTER);
  text(`DIFF: ${challengeDifficulty?.difficultyText || "Medium"} | PERF: ${performanceRating.ratingText}`, 
       width/2, statsY + 50);
  
  // Add special highlight for optimal solution
  if (performanceRating.isOptimal) {
    fill(colors.highlight);
    textSize(18);
    text("🏆 PERFECT OPTIMAL SOLUTION! 🏆", width/2, statsY + 80);
  }
  
  // Display comparison to theoretical fewest moves
  if (challengeDifficulty) {
    const optimalText = performanceRating.theoreticalFewestMoves === 1 
      ? "1 move" 
      : `${performanceRating.theoreticalFewestMoves} moves`;
      
    fill(colors.text);
    textSize(14);
    // Position this text relative to card bottom with fixed margin of 20px
    const bottomTextMargin = 20;
    text(`Theoretical fewest moves: ${optimalText}`, width/2, cardTop + cardHeight - bottomTextMargin);
  }
  
  // Change cursor to pointer when hovering over buttons
  if ((mouseX > 60 && mouseX < 180 && mouseY > 40 && mouseY < 80) || 
      (mouseX > width - 180 && mouseX < width - 60 && mouseY > 40 && mouseY < 80)) {
    cursor('pointer');
  } else {
    cursor(ARROW);
  }
}

function keyPressed() {
  if (key === 'Enter' && !gameWon) {
    checkWord();
  }
  
  if (gameWon && key === ' ') {
    // Reset game
    currentWord = startWord;
    wordChain = [startWord];
    message = "";
    gameWon = false;
  }
  
  // Add keyboard shortcut for help popup (h key)
  if (key === 'h' || key === 'H') {
    toggleHelpPopup();
  }
}

function checkWord() {
  let newWord = inputBox.value().toLowerCase();
  inputBox.value(""); // Clear input
  
  // Don't process input if game is already won
  if (gameWon) return;
  
  // Check if word is valid
  if (!dictionary.includes(newWord)) {
    message = "Not a valid word!";
    return;
  }
  
  // Check word length
  if (newWord.length !== startWord.length) {
    message = "Word must be " + startWord.length + " letters long!";
    return;
  }
  
  // Count letter differences
  let differences = countDifferences(currentWord, newWord);
  if (differences === 0) {
    message = "Word must be different!";
    return;
  } else if (differences > 2) {
    message = "Change only 1 or 2 letters!";
    return;
  }
  
  // Valid move! Update chain
  currentWord = newWord;
  wordChain.push(newWord);
  
  // Check win condition (1 or 2 letters away from target or exact match)
  let targetDiff = countDifferences(currentWord, targetWord);
  if (targetDiff <= 2 || currentWord === targetWord) {
    gameWon = true;
    message = "You win! You're " + targetDiff + " letter(s) away from the target!";
  } else {
    message = "Good move! You're " + targetDiff + " letters away.";
  }
}

function countDifferences(word1, word2) {
  let diff = 0;
  for (let i = 0; i < word1.length; i++) {
    if (word1[i] !== word2[i]) diff++;
  }
  return diff;
}

// Calculate performance rating based on how close the player's solution is to optimal
function calculatePerformanceRating(solutionLength) {
  // If we don't have difficulty data, use a fallback rating
  if (!challengeDifficulty || !challengeDifficulty.shortestPath || challengeDifficulty.shortestPath <= 0) {
    return { score: 3, ratingText: "Good" };
  }
  
  // Debug info - full breakdown of the comparison
  console.log("============= PERFORMANCE CALCULATION =============");
  console.log(`Start word: ${startWord}`);
  console.log(`Target word: ${targetWord}`);
  console.log(`Player's word chain: ${wordChain.join(' -> ')}`);
  console.log(`Words added by player: ${wordChain.length - 1}`);
  
  // We need to dynamically calculate the theoretical fewest moves 
  // based on the game's rules and available dictionary
  
  // First check if direct move is possible (can change 1-2 letters to go directly to target)
  const directLetterDiff = countDifferences(startWord, targetWord);
  const directMoveIsPossible = directLetterDiff <= 2;
  
  // Calculate the theoretical minimum
  let theoreticalFewestMoves;
  
  if (directMoveIsPossible) {
    // If you can go directly from start to target with 1-2 letter changes, only 1 move is needed
    theoreticalFewestMoves = 1;
    console.log(`Direct move possible (${directLetterDiff} letter difference): theoretical fewest = 1`);
  } 
  // CRUCIAL FIX: Check if there's a bridge word that would connect start and target with one move each
  // Example: FASTER → WANTER → WONDER (where WANTER is 1-2 letters away from both start and target)
  else {
    // Look for a bridge word
    const bridgeWord = findBridgeWord(startWord, targetWord);
    if (bridgeWord) {
      // If a bridge word exists, we need only 1 move (the bridge word)
      theoreticalFewestMoves = 1;
      console.log(`Bridge word exists (${bridgeWord}): theoretical fewest = 1`);
    }
    else {
      // Otherwise, use the reported value (but with a maximum sanity check)
      // Most 6-letter word puzzles can be solved in 2-4 moves
      const reportedPath = challengeDifficulty.shortestPath;
      theoreticalFewestMoves = Math.min(reportedPath, 5); // Sanity cap at 5 moves
      console.log(`Using reported shortest path: ${reportedPath} (capped at 5)`);
    }
  }
  
  // Number of moves (words added by player)
  const playerMoves = wordChain.length - 1;
  
  // IMPORTANT: Check two ways of target being reached:
  // 1. Last word in chain equals target exactly
  // 2. Last word in chain is 1-2 letters away from target (valid win state)
  const lastWord = wordChain[wordChain.length-1];
  const isExactTarget = lastWord === targetWord;
  const isCloseToTarget = countDifferences(lastWord, targetWord) <= 2;
  const targetReached = isExactTarget || isCloseToTarget;
  
  // Player achieves optimal solution if they used exactly the theoretical fewest moves
  const isOptimalSolution = targetReached && playerMoves === theoreticalFewestMoves;
  
  console.log(`Calculated theoretical fewest moves: ${theoreticalFewestMoves}`);
  console.log(`Player moves: ${playerMoves}`);
  console.log(`Last word in chain: ${lastWord}`);
  console.log(`Last word equals target exactly: ${isExactTarget}`);
  console.log(`Last word is close to target (≤2 letters): ${isCloseToTarget}`);
  console.log(`Target considered reached: ${targetReached}`);
  console.log(`Is optimal solution: ${isOptimalSolution}`);
  
  // Determine rating based on comparison with optimal
  let score, ratingText;
  
  if (isOptimalSolution) {
    // Player found the exact optimal solution!
    score = 5;
    ratingText = "Perfect! (Optimal Solution)";
    console.log("🏆 OPTIMAL SOLUTION DETECTED! 🏆");
  } else if (playerMoves <= theoreticalFewestMoves + 1) {
    // Very close to optimal
    score = 4.5;
    ratingText = "Exceptional!";
    console.log("Very close to optimal - Exceptional rating");
  } else if (playerMoves <= theoreticalFewestMoves + 2) {
    // Still very good
    score = 4;
    ratingText = "Excellent";
  } else if (playerMoves <= theoreticalFewestMoves * 1.5) {
    // Good solution
    score = 3.5;
    ratingText = "Very Good";
  } else if (playerMoves <= theoreticalFewestMoves * 2) {
    // Decent solution
    score = 3;
    ratingText = "Good";
  } else if (playerMoves <= theoreticalFewestMoves * 3) {
    // Somewhat inefficient
    score = 2.5;
    ratingText = "Decent";
  } else {
    // Very inefficient solution
    score = 2;
    ratingText = "Completed";
  }
  
  return { 
    score, 
    ratingText,
    playerMoves,
    theoreticalFewestMoves,
    isOptimal: isOptimalSolution,
    // Include additional data for debugging
    targetReached,
    isExactTarget,
    isCloseToTarget,
    lastWord
  };
}

// Function to find if there's a bridge word that connects start and target
// A bridge word is one that differs by 1-2 letters from both start and target
function findBridgeWord(start, target) {
  // Try to find a word that's 1-2 letters away from both start and target
  for (let word of dictionary) {
    if (word === start || word === target) continue;
    
    // Check if word is 1-2 letters away from both start and target
    const diffFromStart = countDifferences(start, word);
    const diffFromTarget = countDifferences(word, target);
    
    if (diffFromStart <= 2 && diffFromTarget <= 2) {
      console.log(`Found bridge word: ${word} (diffs: ${diffFromStart} from start, ${diffFromTarget} from target)`);
      return word;
    }
  }
  
  return null; // No bridge word found
}

// Function to create shareable result text for social media
function createShareableResult() {
  const pacificDate = getTodayInPacificTime();
  const dateString = pacificDate.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit'
  });
  
  // Calculate the number of player moves
  const playerMoves = wordChain.length - 1;
  const performance = calculatePerformanceRating(playerMoves);
  
  // Create emoji ratings based on difficulty and performance
  const difficultyLevel = challengeDifficulty ? challengeDifficulty.score : 3;
  const performanceLevel = performance ? performance.score : 3;
  
  // Difficulty emoji indicators (1-5 flame emojis)
  let difficultyEmojis = "";
  for (let i = 0; i < Math.round(difficultyLevel); i++) {
    difficultyEmojis += "🔥";
  }
  
  // Performance emoji indicators (1-5 star emojis)
  let performanceEmojis = "";
  for (let i = 0; i < Math.round(performanceLevel); i++) {
    performanceEmojis += "⭐";
  }
  
  // Create a pattern of emojis representing the word chain
  let chainEmojis = '';
  for (let i = 0; i < wordChain.length - 1; i++) {
    chainEmojis += '🔄';
  }
  chainEmojis += '✅'; // Final success indicator
  
  // Create the shareable message with clear formatting
  return `Inkling Daily Challenge ${dateString}\n` +
         `${startWord.toUpperCase()} ➡️ ${targetWord.toUpperCase()}\n` +
         `Solved in ${playerMoves} move${playerMoves !== 1 ? 's' : ''}!\n\n` +
         `Difficulty: ${challengeDifficulty?.difficultyText || "Medium"} ${difficultyEmojis}\n` +
         `Performance: ${performance.ratingText} ${performanceEmojis}\n` +
         `${chainEmojis}\n\n` +
         `Play at ${window.location.href}`;
}

// Function to share results on social media
function shareResults() {
  const shareText = createShareableResult();
  
  // Create the share URL for Twitter/X
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  
  // Open a new window to share
  window.open(shareUrl, '_blank');
}

function mousePressed() {
  // Handle clicks when help popup is showing
  if (showHelpPopup) {
    // Make sure we're not clicking the help button itself
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const canvasRect = canvas.getBoundingClientRect();
      const canvasLeft = canvasRect.left;
      const helpButtonX = canvasLeft + width - 50;
      const helpButtonY = 10;
      const helpButtonWidth = 40;
      const helpButtonHeight = 40;
      
      // Check if clicking help button
      const isClickOnHelpButton = 
        mouseX >= helpButtonX && mouseX <= helpButtonX + helpButtonWidth &&
        mouseY >= helpButtonY && mouseY <= helpButtonY + helpButtonHeight;
      
      // Close popup if clicking outside help button
      if (!isClickOnHelpButton) {
        showHelpPopup = false;
        
        // Show input elements again if not in victory screen
        if (!gameWon) {
          inputBox.style('display', 'block');
          submitButton.style('display', 'block');
        }
        
        return false; // Prevent default behavior
      }
    }
    
    return false; // Prevent any clicks while popup is open
  }
  
  // Check if user is on victory screen and clicks the share button (top right)
  if (gameWon && 
      mouseX > width - 180 && mouseX < width - 60 && 
      mouseY > 40 && mouseY < 80) {
    shareResults();
    return false; // Prevent default behavior
  }
  
  // Check if user is on victory screen and clicks the play again button (top left)
  if (gameWon && 
      mouseX > 60 && mouseX < 180 && 
      mouseY > 40 && mouseY < 80) {
    // Reset game (same as pressing space)
    currentWord = startWord;
    wordChain = [startWord];
    message = "";
    gameWon = false;
    return false; // Prevent default behavior
  }
  
  return true;
}

// Function to display the help popup
function displayHelpPopup() {
  // Hide input elements when help popup is visible
  if (inputBox) inputBox.style('display', 'none');
  if (submitButton) submitButton.style('display', 'none');
  
  // Create full-screen semi-transparent overlay
  fill(0, 0, 0, 220);
  rect(0, 0, width, height);
  
  // Calculate popup dimensions
  const popupWidth = width - 80; // Increased side margins
  const popupHeight = height - 80;
  const popupX = 40; // Increased left margin
  const popupY = 40;
  
  // Draw popup box with better dimensions
  fill(colors.accent);
  rect(popupX, popupY, popupWidth, popupHeight, 15);
  
  // Popup title
  fill(colors.primary);
  textSize(26); // Slightly smaller title
  textAlign(CENTER);
  text("How to Play Inkling", width/2, popupY + 40);
  
  // Calculate text positioning
  const textLeftMargin = popupX + 30; // Increased text left margin
  const textWidth = popupWidth - 60; // Reduced text width
  let currentY = popupY + 80;
  const lineHeight = 24; // Slightly reduced line height
  
  // Game description
  fill(colors.text);
  textSize(15); // Smaller text size
  textAlign(LEFT);
  text("Inkling is a word chain puzzle where you transform a", textLeftMargin, currentY);
  currentY += lineHeight;
  text("starting word into a target word through a series of steps.", textLeftMargin, currentY);
  currentY += lineHeight * 1.5;
  
  // Rules section
  fill(colors.highlight);
  textSize(18); // Smaller section headers
  text("Rules:", textLeftMargin, currentY);
  currentY += lineHeight * 1.2;
  
  // Rules content
  fill(colors.text);
  textSize(15); // Smaller text size
  text("1. Each move, you can change only 1 or 2 letters in the", textLeftMargin, currentY);
  currentY += lineHeight;
  text("   current word", textLeftMargin, currentY);
  currentY += lineHeight;
  text("2. Each new word must be a valid word in the dictionary", textLeftMargin, currentY);
  currentY += lineHeight;
  text("3. You win when you either:", textLeftMargin, currentY);
  currentY += lineHeight;
  text("   - Reach the exact target word, or", textLeftMargin, currentY);
  currentY += lineHeight;
  text("   - Create a word that's only 1-2 letters away from", textLeftMargin, currentY);
  currentY += lineHeight;
  text("     the target", textLeftMargin, currentY);
  currentY += lineHeight * 1.5;
  
  // Example section
  fill(colors.highlight);
  textSize(18); // Smaller section headers
  text("Example:", textLeftMargin, currentY);
  currentY += lineHeight * 1.2;
  
  // Example chain
  fill(colors.text);
  textSize(15); // Smaller text size
  text("FOREST → PUREST → PURIST → PARISH", textLeftMargin, currentY);
  currentY += lineHeight * 1.5;
  
  // Explanation of example
  text("In this example:", textLeftMargin, currentY);
  currentY += lineHeight;
  text("- FOREST to PUREST: Changed F→P and O→U (2 letters)", textLeftMargin + 10, currentY);
  currentY += lineHeight;
  text("- PUREST to PURIST: Changed E→I (1 letter)", textLeftMargin + 10, currentY);
  currentY += lineHeight;
  text("- PURIST to PARISH: Changed U→A and T→H (2 letters)", textLeftMargin + 10, currentY);
  
  // Close instruction at bottom of popup
  fill(colors.primary);
  textSize(14);
  textAlign(CENTER);
  text("Click anywhere to close", width/2, popupY + popupHeight - 20);
}

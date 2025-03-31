// Simple word list loader
// This pre-loads the simple word list to ensure it's ready for the daily challenge module

// Create a global variable to store the simple word list
window.simpleWordListData = [];

// Function to load the simple word list
async function preloadSimpleWordList() {
  console.log("Preloading simple word list...");
  try {
    const response = await fetch('six_letter_simple_word_list.csv.csv');
    const text = await response.text();
    window.simpleWordListData = text.split('\n')
      .map(word => word.trim().toLowerCase())
      .filter(word => word.length === 6);
    
    console.log(`Preloaded simple word list with ${window.simpleWordListData.length} words`);
    
    // Dispatch an event to signal that the word list is loaded
    const event = new CustomEvent('simpleWordListLoaded', { 
      detail: { wordCount: window.simpleWordListData.length }
    });
    document.dispatchEvent(event);
    
    return window.simpleWordListData;
  } catch (error) {
    console.error('Error preloading simple word list:', error);
    // Set a minimal fallback list
    window.simpleWordListData = ["forest", "foster", "faster", "master", "mister", "winter", 
                            "sudden", "garden", "golden", "wonder", "worker", "winner"];
    return window.simpleWordListData;
  }
}

// Start loading the word list immediately
preloadSimpleWordList(); 
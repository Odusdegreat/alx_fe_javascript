const API_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated API Endpoint
const SYNC_INTERVAL = 10000; // Sync every 10 seconds

// Load quotes from localStorage or use default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    id: 1,
    text: "The only way to do great work is to love what you do.",
    category: "Motivation",
  },
  {
    id: 2,
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
  {
    id: 3,
    text: "You miss 100% of the shots you don’t take.",
    category: "Sports",
  },
];

// Function to display a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];
  document.getElementById(
    "quoteDisplay"
  ).innerHTML = `<p>"${text}"</p><small>Category: ${category}</small>`;
}

// Function to populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map((q) => q.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = localStorage.getItem("selectedCategory") || "all";
}

// Function to display filtered quotes
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);
  filteredQuotes.forEach(({ text, category }) => {
    const quoteElement = document.createElement("p");
    quoteElement.innerHTML = `"${text}" <small>(${category})</small>`;
    quoteDisplay.appendChild(quoteElement);
  });
}

// Function to add a new quote
async function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText === "" || newQuoteCategory === "") {
    alert("Please enter both quote text and category.");
    return;
  }

  const newQuote = {
    id: Date.now(),
    text: newQuoteText,
    category: newQuoteCategory,
  };

  // Add new quote to the local array
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  // Send new quote to the server
  try {
    const response = await fetch(API_URL, {
      method: "POST", // Use POST method
      headers: {
        "Content-Type": "application/json", // Set Content-Type header
      },
      body: JSON.stringify(newQuote), // Send the new quote as JSON
    });

    if (!response.ok) {
      throw new Error("Failed to send quote to the server.");
    }

    const data = await response.json();
    console.log("Quote sent to server:", data);
  } catch (error) {
    console.error("Error sending quote to server:", error);
  }
}

// Function to save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to export quotes as JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes))
        throw new Error("Invalid file format");

      quotes.push(...importedQuotes);
      saveQuotes();
      alert("Quotes imported successfully!");

      populateCategories();
      filterQuotes();
    } catch (error) {
      alert("Error importing file: " + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to sync with server (fetch and merge quotes)
async function syncWithServer() {
  try {
    const response = await fetch(API_URL);
    const serverQuotes = await response.json();

    // Convert server response to match our quote structure
    const formattedQuotes = serverQuotes.map((q) => ({
      id: q.id,
      text: q.title, // Simulated text from API
      category: "General",
    }));

    // Merge local and server quotes, avoiding duplicates
    const mergedQuotes = mergeQuotes(quotes, formattedQuotes);
    quotes = mergedQuotes;

    saveQuotes();
    populateCategories();
    filterQuotes();
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}

// Function to merge local and server quotes and resolve conflicts
function mergeQuotes(localQuotes, serverQuotes) {
  const quoteMap = new Map();

  localQuotes.forEach((q) => quoteMap.set(q.id, q));
  serverQuotes.forEach((q) => {
    if (!quoteMap.has(q.id)) {
      quoteMap.set(q.id, q);
    }
  });

  return Array.from(quoteMap.values());
}

// Start periodic sync with server
setInterval(syncWithServer, SYNC_INTERVAL);

// Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes();
  showRandomQuote();
  document
    .getElementById("exportQuotes")
    .addEventListener("click", exportToJsonFile);
});

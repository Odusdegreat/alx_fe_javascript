const API_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL = 10000;

// Load quotes from localStorage or use default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    id: 1,
    text: "The only way to do great work is to love what you do.",
    category: "Motivation",
    synced: true,
  },
  {
    id: 2,
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
    synced: true,
  },
  {
    id: 3,
    text: "You miss 100% of the shots you don't take.",
    category: "Sports",
    synced: true,
  },
];

function showRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];
  document.getElementById(
    "quoteDisplay"
  ).innerHTML = `<p>"${text}"</p><small>Category: ${category}</small>`;
}

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
    synced: false,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newQuote.text,
        body: newQuote.category,
        userId: 1,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send quote to server");
    }

    newQuote.synced = true;
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();

    // Clear input fields
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } catch (error) {
    console.error("Error adding quote:", error);
    alert("Failed to add quote. Please try again.");
  }
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

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

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes))
        throw new Error("Invalid file format");

      quotes.push(...importedQuotes.map((q) => ({ ...q, synced: false })));
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

async function syncWithServer() {
  try {
    // First, sync any unsynced quotes to server
    const unsyncedQuotes = quotes.filter((q) => !q.synced);

    const postPromises = unsyncedQuotes.map((quote) =>
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quote.text,
          body: quote.category,
          userId: 1,
        }),
      })
    );

    await Promise.all(postPromises);

    // Mark all quotes as synced
    quotes = quotes.map((q) => ({ ...q, synced: true }));

    // Then fetch latest quotes from server
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const serverQuotes = await response.json();

    const formattedQuotes = serverQuotes.map((q) => ({
      id: q.id,
      text: q.title,
      category: q.body || "General",
      synced: true,
    }));

    // Merge quotes
    const mergedQuotes = mergeQuotes(quotes, formattedQuotes);
    quotes = mergedQuotes;

    saveQuotes();
    populateCategories();
    filterQuotes();
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const serverQuotes = await response.json();

    const formattedQuotes = serverQuotes.map((q) => ({
      id: q.id,
      text: q.title,
      category: q.body || "General",
      synced: true,
    }));

    quotes = formattedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
  }
}

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
  document
    .getElementById("fetchQuotesBtn")
    .addEventListener("click", fetchQuotesFromServer);
});

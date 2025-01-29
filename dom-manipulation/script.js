// Load quotes from localStorage or use default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  {
    text: "The only way to do great work is to love what you do.",
    category: "Motivation",
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    category: "Life",
  },
  { text: "You miss 100% of the shots you don’t take.", category: "Sports" },
];

// Function to populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`; // Reset options

  // Get unique categories
  const categories = [...new Set(quotes.map((q) => q.category))];

  // Populate dropdown
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category from localStorage
  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedFilter;
}

// Function to display quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory); // Save filter selection

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = ""; // Clear current quotes

  // Filter quotes based on category
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);

  // Display filtered quotes
  filteredQuotes.forEach(({ text, category }) => {
    const quoteElement = document.createElement("p");
    quoteElement.innerHTML = `"${text}" <small>(${category})</small>`;
    quoteDisplay.appendChild(quoteElement);
  });
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText === "" || newQuoteCategory === "") {
    alert("Please enter both quote text and category.");
    return;
  }

  // Add new quote to the array
  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  // Save to local storage
  saveQuotes();

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Update category dropdown
  populateCategories();

  // Refresh the displayed quotes
  filterQuotes();
}

// Function to save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to export quotes as a JSON file
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

      // Update category dropdown and reapply the filter
      populateCategories();
      filterQuotes();
    } catch (error) {
      alert("Error importing file: " + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Attach event listeners on page load
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes(); // Show quotes based on last selected filter

  document
    .getElementById("exportQuotes")
    .addEventListener("click", exportToJsonFile);
});

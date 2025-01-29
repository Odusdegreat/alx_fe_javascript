// Initialize quotes array from local storage or use default quotes
const quotes = JSON.parse(localStorage.getItem("quotes")) || [
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

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quoteDisplay = document.getElementById("quoteDisplay");
  const { text, category } = quotes[randomIndex];

  quoteDisplay.innerHTML = `<p>"${text}"</p><small>Category: ${category}</small>`;

  // Save last viewed quote to session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify({ text, category }));
}

// Function to create and append the quote form dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  // Create input for new quote text
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  // Create input for new quote category
  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  // Create button to add quote
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  // Create button to export quotes as JSON
  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Quotes";
  exportButton.onclick = exportToJsonFile;

  // Create file input for importing JSON
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json";
  importInput.onchange = importFromJsonFile;

  // Append elements to the form container
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
  formContainer.appendChild(exportButton);
  formContainer.appendChild(importInput);
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

  // Save updated quotes to local storage
  saveQuotes();

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Display updated quote
  showRandomQuote();
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

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes))
        throw new Error("Invalid JSON format");

      // Add new quotes to the array
      quotes.push(...importedQuotes);

      // Save updated quotes to local storage
      saveQuotes();

      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Error importing quotes: " + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Add event listener for "Show New Quote" button
document
  .getElementById("showNewQuote")
  .addEventListener("click", showRandomQuote);

// Display an initial random quote on page load
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();
  showRandomQuote();
  document
    .getElementById("exportQuotes")
    .addEventListener("click", exportToJsonFile);

  // Restore last viewed quote from session storage (if exists)
  const lastViewedQuote = JSON.parse(sessionStorage.getItem("lastViewedQuote"));
  if (lastViewedQuote) {
    document.getElementById(
      "quoteDisplay"
    ).innerHTML = `<p>"${lastViewedQuote.text}"</p><small>Category: ${lastViewedQuote.category}</small>`;
  }
});

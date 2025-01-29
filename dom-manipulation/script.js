// Array to store quotes
const quotes = [
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

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quoteDisplay = document.getElementById("quoteDisplay");
  const { text, category } = quotes[randomIndex];

  quoteDisplay.innerHTML = `<p>"${text}"</p><small>Category: ${category}</small>`;
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

  // Clear input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // Update the DOM with the new quote
  showRandomQuote();
}

// Function to create the quote addition form dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById("quoteFormContainer");
  formContainer.innerHTML = `
      <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
      <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
      <button id="addQuoteButton">Add Quote</button>
  `;

  // Attach event listener to the add quote button
  document.getElementById("addQuoteButton").addEventListener("click", addQuote);
}

// Display an initial random quote on page load
document.addEventListener("DOMContentLoaded", () => {
  showRandomQuote();
  createAddQuoteForm();

  // Event listener for "Show New Quote" button
  document
    .getElementById("showNewQuoteButton")
    .addEventListener("click", showRandomQuote);
});

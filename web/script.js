const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");

// Generate random ID
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// Add transactions to DOM list
function addTransactionDOM(transaction) {
  // Get sign
  const sign = transaction.amount < 0 ? "-" : "+";

  const item = document.createElement("li");

  // Add class based on value
  item.classList.add(transaction.amount < 0 ? "minus" : "plus");

  item.innerHTML = `
      ${transaction.text} <span>${sign}${Math.abs(
    transaction.amount
  )}</span> <button class="delete-btn" onclick="removeTransaction(${
    transaction.id
  })">x</button>
    `;

  list.appendChild(item);
}

// Update the balance, income and expense
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);
  
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  
    const income = amounts
      .filter(item => item > 0)
      .reduce((acc, item) => (acc += item), 0)
      .toFixed(2);
  
    const expense = (
      amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) *
      -1
    ).toFixed(2);
  
    balance.innerText = `$${total}`;
    money_plus.innerText = `$${income}`;
    money_minus.innerText = `$${expense}`;
  }

// Function to add transaction with API call
async function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === "" || amount.value.trim() === "") {
    alert("Please add a text and amount");
  } else {
    const transaction = {
      id: generateID(),
      text: text.value,
      amount: +amount.value,
    };

    try {
      // Make POST request to API
      const response = await fetch("http://localhost:8000/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error("Failed to add transaction");
      }

      const addedTransaction = await response.json();

      transactions.push(addedTransaction);

      addTransactionDOM(addedTransaction);

      updateValues();

      updateLocalStorage();

      text.value = "";
      amount.value = "";
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add transaction. Please try again.");
    }
  }
}

// Modify updateLocalStorage to sync with API
async function updateLocalStorage() {
  try {
    const response = await fetch("http://localhost:8000/transactions");
    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }
    const serverTransactions = await response.json();
    localStorage.setItem("transactions", JSON.stringify(serverTransactions));
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}

// Modify init to fetch from API
async function init() {
  try {
    const response = await fetch("http://localhost:8000/transactions");
    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }
    transactions = await response.json();

    list.innerHTML = "";
    transactions.forEach(addTransactionDOM);
    updateValues();
  } catch (error) {
    console.error("Error initializing transactions:", error);
  }
}

// Modify removeTransaction to use API
async function removeTransaction(id) {
  try {
    const response = await fetch(`http://localhost:8000/transactions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete transaction");
    }

    transactions = transactions.filter((transaction) => transaction.id !== id);

    updateLocalStorage();

    init();
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to delete transaction. Please try again.");
  }
}

// Init app
// function init() {
//     list.innerHTML = '';

//     transactions.forEach(addTransactionDOM);
//     updateValues();
//   }

// Initial load
init();

form.addEventListener("submit", addTransaction);

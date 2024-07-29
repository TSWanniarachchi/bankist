"use strict";

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2024-04-28T14:11:59.604Z",
    "2024-05-02T17:01:17.194Z",
    "2024-05-03T13:36:17.929Z",
    "2024-05-04T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2024-05-04T10:51:36.790Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// DOM Elements

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelErrorTransfer = document.querySelector(".error__message--transfer");
const labelErrorLoan = document.querySelector(".error__message--loan");
const labelErrorClose = document.querySelector(".error__message--close");
const labelTimer = document.querySelector(".timer");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

/////////////////////////////////////////////////
// State Variables

let currentAccount, timer;
let sorted = false;

/////////////////////////////////////////////////
// Functions

// Create usernames from account owner names
const createUsernames = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .trim()
      .toLowerCase()
      .split(" ")
      .map(function (name) {
        return name.at(0);
      })
      .join("");
  });
};
createUsernames(accounts);

// Start logout timer
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);

      // Reset welcome message & Hide UI
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }

    // Decrese 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

// Format currency
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

// Format movement date
const formatMovementDate = function (date, locale) {
  const calsDayPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calsDayPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

// Calculate and display balance
const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce(
    (accumulator, movement) => accumulator + movement,
    0
  );
  labelBalance.textContent = formatCurrency(
    account.balance,
    account.locale,
    account.currency
  );
};

// Display account movements
const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (movement, index) {
    const type = movement > 0 ? "deposit" : "withdrawal";
    const date = new Date(account.movementsDates[index]);
    const displayDate = formatMovementDate(date, account.locale);
    const formattedMovement = formatCurrency(
      movement,
      account.locale,
      account.currency
    );

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMovement}</div>
      </div>
      `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// Calculate and display summary
const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter((movement) => movement > 0)
    .reduce((totDeposit, deposit) => totDeposit + deposit, 0);
  labelSumIn.textContent = formatCurrency(
    incomes,
    account.locale,
    account.currency
  );

  const out = account.movements
    .filter((movement) => movement < 0)
    .reduce((totWithdraw, withdraw) => totWithdraw + withdraw, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    account.locale,
    account.currency
  );

  const interest = account.movements
    .filter((movement) => movement > 0)
    .map((deposit) => (deposit * account.interestRate) / 100)
    .filter((interest) => interest >= 1)
    .reduce((totInterest, interest) => totInterest + interest, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    account.locale,
    account.currency
  );
};

// Update UI with account details
const updateUI = function (account) {
  // Display balance
  calcDisplayBalance(account);

  // Display movements
  displayMovements(account);

  // Display summary
  calcDisplaySummary(account);
};

/////////////////////////////////////////////////
// Event Handlers

// Handles the login process
const handleLogin = function (event) {
  event.preventDefault();

  currentAccount = accounts.find(
    (account) => account.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner
      .split(" ")
      .at(0)}`;

    // Create current date and time using the Internationalization API
    const dateTimeDisplay = function () {
      const now = new Date();
      const options = {
        minute: "numeric",
        hour: "numeric",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      };

      labelDate.textContent = new Intl.DateTimeFormat(
        currentAccount.locale,
        options
      ).format(now);
    };

    dateTimeDisplay();
    setInterval(dateTimeDisplay, 1000);

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginUsername.blur();
    inputLoginPin.blur();

    // Display UI
    containerApp.style.opacity = 100;
  } else {
    // Error message
    labelWelcome.textContent = `Login Error, Please check your credentials`;

    // Hide UI
    containerApp.style.opacity = 0;
  }
};

// Handles the transfer of funds between accounts
const handleTransfer = function (event) {
  event.preventDefault();

  const receiverAcc = accounts.find(
    (account) => account.username === inputTransferTo.value
  );
  const amount = +inputTransferAmount.value;

  if (
    receiverAcc &&
    receiverAcc?.username !== currentAccount.username &&
    amount > 0 &&
    amount <= currentAccount.balance
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();

    // Clear input fields
    inputTransferTo.value = inputTransferAmount.value = "";
    inputTransferTo.blur();
    inputTransferAmount.blur();

    // Hide error message
    labelErrorTransfer.style.opacity = 0;
  } else {
    // Display error message
    labelErrorTransfer.style.opacity = 100;
  }
};

// Handles the loan request from the user
function handleLoan(event) {
  event.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((movement) => movement >= amount * 0.1)
  ) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);

    // Clear input fields
    inputLoanAmount.value = "";

    // Hide error message
    labelErrorLoan.style.opacity = 0;
  } else {
    // Display error message
    labelErrorLoan.style.opacity = 100;
  }
}

// Handles the account closure process
function handleCloseAccount(event) {
  event.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (account) => account.username === currentAccount.username
    );

    // Delete account
    accounts.splice(index, 1);

    // Reset welcome message
    labelWelcome.textContent = "Log in to get started";

    // Clear input fields
    inputCloseUsername.value = inputClosePin.value = "";

    // Hide UIs
    labelErrorClose.style.opacity = 0;
    containerApp.style.opacity = 0;
  } else {
    // Display error message
    labelErrorClose.style.opacity = 100;
  }
}

// Toggles the sorting order of movements
function handleSortMovements(event) {
  event.preventDefault();

  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
}

///////////////////////////////////////
// Event Listeners

// Authentication
btnLogin.addEventListener("click", handleLogin);

// Banking operations
btnTransfer.addEventListener("click", handleTransfer);
btnLoan.addEventListener("click", handleLoan);
btnClose.addEventListener("click", handleCloseAccount);

// Movements display
btnSort.addEventListener("click", handleSortMovements);

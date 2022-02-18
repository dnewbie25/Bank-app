'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//////////////////////////////////////////
// displayMovements
let order = 'newest';

const displayMovements = (movements) => {
  containerMovements.innerHTML = '';
  movements.forEach((move, index) => {
    const type = move >= 0 ? 'deposit' : 'withdrawal';
    const html_content = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${index+1} ${type}</div>
      <div class="movements__date">DATE HERE</div>
      <div class="movements__value">${formatCurrency(move)}</div>
    </div>
    `;
    if (order === 'newest') {
      containerMovements.insertAdjacentHTML("afterbegin", html_content);
    } else if (order === 'oldest') {
      containerMovements.insertAdjacentHTML("beforeend", html_content);
    }
  });
}

// create usernames
function createUserNames(user) {
  const userLowerCase = user.owner.toLowerCase().split(' ');
  const initials = [];
  userLowerCase.forEach(word => initials.push(word[0]));
  user.username = initials.join('')
  return user.username
}
///////////////////////////////// functional way
// const users = accounts.map(acc =>
//   acc.owner
//   .toLocaleLowerCase()
//   .split(' ')
//   .map(name => name[0])
//   .join('')
// )

// classic way and more readable for me
const users = accounts.map(name => createUserNames(name));

// Event Handlers
let loggedUser;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  loggedUser = accounts.find(acc => acc.username === inputLoginUsername.value);
  console.log(loggedUser);
  if (loggedUser && loggedUser.pin === Number(inputLoginPin.value)) {
    // display UI and message
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome ${loggedUser.owner.split(' ')[0]}`
    // display movements
    displayMovements(loggedUser.movements);
    //display balance
    calcAndPrintBalance(loggedUser.movements, loggedUser.interestRate);
    // clear input fields after succesful login
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();
  }
});

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// accumulator is like a snowball
const balance = movements.reduce((acc, current) => acc + current, 0);

// calc and print balance for the current user

const calcAndPrintBalance = (movements, interest) => {
  const balance = movements.reduce((acc, current) => acc + current, 0)
  labelBalance.textContent = formatCurrency(balance);
  labelSumIn.textContent = formatCurrency(calcIncomes(movements))
  labelSumOut.textContent = formatCurrency(calcOutcomes(movements))
  labelSumInterest.textContent = formatCurrency(calcInterest(movements, interest))
}

// const max = movements.reduce((acc, current) => {
//   if (acc >= current) {
//     return acc
//   } else {
//     return current
//   }
// }, movements[0])

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

function calcIncomes(movements) {
  const incomes = movements
    .filter(move => move >= 0)
    .reduce((acc, curr) => acc + curr, 0)
  return incomes
}

function calcOutcomes(movements) {
  const outcomes = movements
    .filter(move => move < 0)
    .reduce((acc, curr) => acc + curr, 0)
  if (outcomes <= 0) {
    return outcomes
  }
  return outcomes * -1
}

function calcInterest(movements, interestRate) {
  const interest = movements
    .filter(mov => mov > 0)
    .map(mov => mov * interestRate / 100)
    .filter(mov => mov >= 1)
    .reduce((sum, item) => sum + item, 0)
  return interest
}

function updateUI(currentAccount) {
  displayMovements(currentAccount.movements);
  calcAndPrintBalance(currentAccount.movements, currentAccount.interestRate)
}

/////////////////////////////////
// transfer event
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);
  if (receiver && amount > 0) {
    loggedUser.movements.push(amount * -1);
    receiver.movements.push(amount);
    updateUI(loggedUser);
  } else {
    alert('Invalid account name or amount');
  }
  inputTransferAmount.value = '';
  inputTransferTo.value = '';
  inputTransferAmount.blur();
  inputTransferTo.blur();
});

// closing account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const user = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);
  const currentAccIndex = accounts.findIndex(acc => acc.username === user);
  if (currentAccIndex !== -1 && user === loggedUser.username && pin === loggedUser.pin) {
    if (confirm("Do you want to delete your account")) {
      accounts.splice(currentAccIndex, 1);
      containerApp.style.opacity = 0;
    }
  }
  inputCloseUsername.value = '';
  inputClosePin.value = '';
  inputCloseUsername.blur();
  inputClosePin.blur();
});

// requesting loan - needs at leats 10% of requested money to complete

function checkLoanRequiredAmount(account) {
  const balance = account.movements.reduce((accumulator, current) => accumulator + current, 0);
  const requestedLoan = Number(inputLoanAmount.value);
  const loanCurrency = formatCurrency(requestedLoan);
  if (requestedLoan > 0 && requestedLoan <= balance * 0.1) {
    if (confirm(`Do you want to ask a loan for ${loanCurrency}?`)) {
      account.movements.push(requestedLoan);
      updateUI(account);
    }
  } else {
    alert("We cannot apply a loan at this moment")
  }
}

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  checkLoanRequiredAmount(loggedUser);
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
})

// sorting button
btnSort.addEventListener('click', function () {
  if (order === 'newest') {
    order = 'oldest';
  } else {
    order = 'newest';
  }
  updateUI(loggedUser);
})

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
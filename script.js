'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-09-05T17:01:17.194Z',
    '2023-09-07T23:36:17.929Z',
    '2023-09-08T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
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

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.abs(Math.round((date2 - date1) / (1000 * 60 * 60 * 24))); // Calculating days passed

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  /* const day = `${date.getDate()}`.padStart(2, 0); // to use padStart it must be a string
  const month = `${date.getMonth() + 1}`.padStart(2, 0); // Same again, and don't forget add +1 cuz of months 0 based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; */
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => Math.abs(acc + mov), 0);
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Time is Expired. Log in to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  };

  // Set Time to 5 minutes
  let time = 120;
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //! Experimenting API to DATES
    const now = new Date();
    const options = {
      // Use this obj to set second argument to DateTimeFormat
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // Also 'long' to string, '2-digit' to 08
      year: 'numeric',
      // weekday: 'long', // Days name forexample 'Wednesday'
    };

    /*
    const locale = navigator.language; // And use it for first arg to DateTimeFormat
    console.log(locale); */

    // Intl = Internationalizing, DateTimeFormat('lang-COUNTRY').format(istediğimiz format)
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Get Year to display
    /* const day = `${now.getDate()}`.padStart(2, 0); // to use padStart it must be a string
    const month = `${now.getMonth() + 1}`.padStart(2, 0); // Same again, and don't forget add +1 cuz of months 0 based
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`; */

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Clear if there is any timer before other login
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
      // Reset Timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
//! IN JS ALL NUMBERS ARE DECIMAL
/* console.log(23 === 23.0);
console.log(0.1 + 0.2 === 0.3); // FALSE */

//! Type Conversion
/* console.log(Number('23'));
console.log(+'23'); */ // Simply 23

//! Parsing [ REGEX ] 10 Based
/* console.log(Number.parseInt('30px', 10)); // 30
console.log(Number.parseInt('px30', 10)); // NaN
console.log(Number.parseFloat('2.5rem')); */ // 2.5

//! Check if value is NaN
/* console.log(Number.isNaN(20)); // False
console.log(Number.isNaN('20')); // False
console.log(Number.isNaN('20X')); // False
console.log(Number.isNaN(23 / 0)); */ // False

//! Checking if value is number
/* console.log(Number.isFinite(20)); // True
console.log(Number.isFinite('20')); // False
console.log(Number.isFinite('20X')); // False
console.log(Number.isFinite(23 / 0)); */ // False

//! Check if value is integer
/* console.log(Number.isInteger(20)); // True
console.log(Number.isInteger(20.0)); // True
console.log(Number.isInteger(23 / 0)); */ // False

// Sqrt
/* console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); */

//! Max - Min
/* console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2)); // Type conversion
console.log(Math.max(5, 18, '23px', 11, 2)); */ // Can't parse ( NaN )

//! Creating random number between spesified values like min - max .
/* const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20)); */

//! Rounding integers
/* console.log(Math.round(23.3)); // 23
console.log(Math.round(23.9)); */ // 24

//! Rounding highest integer
/* console.log(Math.ceil(23.3)); // 24
console.log(Math.ceil(23.9));  */ // 24

//! Rounding smallest integer
/* console.log(Math.floor(23.3)); //23
console.log(Math.floor('23.9')); //23

console.log(Math.trunc(-23.3)); // -23
console.log(Math.floor(-23.3)); */ // -24 [ Correct for negatives ]

//! Rounding decimals
/* console.log((2.7).toFixed(0)); // 3
console.log((2.7).toFixed(3)); // 2.700 [ But String ]
console.log((2.345).toFixed(2)); // 2.35 [ Still String ]
console.log(+(2.345).toFixed(2));  */ // 2.35 [ NUmber ]

//! Reminder operator
/* const isEven = n => n % 2 === 0; // Çift - Tek
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered'; // Doubles

    if (i % 3 === 0) row.style.backgroundColor = 'blue'; // Trios
  });
}); */

//! Numerik Seperator [ For Read Easlier a Huge Number ]
// 287,460,000,000
/* const diameter = 287_460_000_000; // 287460000000
console.log(diameter);

const price = 345_99;
console.log(price);

const transferFee1 = 15_00;
const transferFee2 = 1_500;
console.log(transferFee1);
console.log(transferFee2);

const PI = 3.14_15;
console.log(PI); */

//! BIGINT
// To find max safe number js can manipulate
/* console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);

console.log(46574415646574316468786435468n); // To do bigint use 'n'
console.log(BigInt(8657441564657435)); // Can't use larger

// Operations
console.log(10000n + 10000n);
console.log(1235413513548678644135468n * 10000n);

const huge = 1213433856983213n;
const num = 23; */

// console.log(huge * num); // TypeError : Can't use normal num with bigInt

//! CREATING DATES
/* const now = new Date();
console.log(now); // Returns now

console.log(new Date('Aug 02 2020 18:05:41'));
console.log(new Date('December 24, 2015')); // Not useful
console.log(new Date(account1.movementsDates.at(0))); // Take from somewhere

console.log(new Date(2037, 10, 19, 15, 23, 5)); // Year , month, day, hour, minute, seconds
console.log(new Date(2037, 10, 31)); // November has 30 days, so its 01 December.

console.log(new Date(0)); // JS starter date point 01 Jan 1970
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // Adds 3 Days with miliseconds to Date(0)
console.log(3 * 24 * 60 * 60 * 1000); */ // TimeStamp ( Zaman Damgası )

//! Working with dates
/* const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(future);
console.log(future.getFullYear()); // 2037
console.log(future.getMonth()); // 10 [ 0 Based ]
console.log(future.getDate()); // 19
console.log(future.getDay()); // 4 [ 0 is PAZAR ]
console.log(future.getHours()); // 15
console.log(future.getMinutes()); // 23
console.log(future.getSeconds()); // 5
console.log(future.toISOString()); // 2037-11-19T12:23:05.000Z [ ISO FORMATTED ]
console.log(future.getTime()); // 2142246185000
console.log(new Date(2142246185000)); // Returns same date as future
console.log(Date.now()); //? To get now's Time Stamp [ ITS IMPORTANT ]

future.setFullYear(2070);
console.log(future.getFullYear());  */ // 2070

//! NUMBER FORMATING INTERNATIONALIZATION EXAMPLES
/* const num = 384654154.23;

const options = {
  style: 'currency', // Cash units
  currency: 'EUR',
  useGrouping: true,
};

console.log('US:  ', new Intl.NumberFormat('en-US', options).format(num));
console.log('GER:  ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('SYRIA:  ', new Intl.NumberFormat('ar-SY', options).format(num));
console.log('TR:  ', new Intl.NumberFormat('tr-TR', options).format(num));

console.log('Locale:  ', new Intl.NumberFormat(navigator.language).format(num)); */

//! [ TIMERS ] setTimeOut [ Returns func after spesified seconds ]
/* setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3000,
  'olives',
  'cheese'
);
console.log('Waiting...'); */

// Also we can cancel timeout
/* const ingredients = ['olives', 'cheese'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is you pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);

if (ingredients.includes('cheese')) clearTimeout(pizzaTimer); */ // Simply don't return function.

//! SetInterval [ Returns func everys spesified seconds]
/* setInterval(() => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  console.log(
    `${hour}:${`${`${minutes}`.padStart(2, 0)}`.padStart(
      2,
      0
    )}:${`${seconds}`.padStart(2, 0)}`
  );
}, 1000); */

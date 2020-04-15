const PERCENT = 100;
const ONE = 1;
const ZERO = 0;
const sumHelper = (arr) => arr.reduce((acc, val) => acc + val, ZERO);

const separateDecimalsFromArrayOfNumbers = (arrNumbers) => {
  let integers = [];
  let decimals = [];
  for (const floatNumber of arrNumbers) {
    const floatDecimal = floatNumber % ONE;
    decimals.push(floatDecimal);
    integers.push(floatNumber - floatDecimal);
  }
  return [integers, decimals];
};

const largestRemainderRound = (arrNumbers) => {
  let [integers, decimals] = separateDecimalsFromArrayOfNumbers(arrNumbers);

  const roundedSum = sumHelper(integers);
  const diff = PERCENT - roundedSum;

  const decimalsCopy = [...decimals];
  decimalsCopy.sort((a, b) => b - a);
  for (let i = ZERO; i < diff; i++) {
    const index = decimals.indexOf(decimalsCopy[i]);
    integers[index] += ONE;
  }

  return integers;
};

const arr = [
  31.655255739025375,
  23.157470801449858,
  20.338300443012486,
  5.2356020942408374,
  19.653644784534837,
];
const result = largestRemainderRound(arr);
console.log("Result", result);
console.log(`Percentage: ${sumHelper(result)}%`);

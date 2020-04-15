const sumHelper = (arr) => arr.reduce((acc, val) => acc + val, 0);
const PERCENT = 100;
const ONE = 1;

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
  decimalsCopy.sort().reverse();
  for (let i = 0; i < diff; i++) {
    const index = decimals.indexOf(decimalsCopy[i]);
    integers[index] += ONE;
  }

  return integers;
};

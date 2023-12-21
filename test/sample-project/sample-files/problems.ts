const notUsed = 1;

if (typeof true === 'bla') {
  throw new Error('This should not happen!');
}

console.log(`This ${'sentense'} contains a typo!`);

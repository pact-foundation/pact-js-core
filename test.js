const Pact = require('bindings')('pact.node');

result = Pact.verifyProvider(
  '--file\ntest/paaeuocts/foo.json',
  (err, result) => {
    if (err) {
      throw err;
    }

    console.log(result);
  }
);

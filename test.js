const Pact = require('bindings')('pact.node');

// result = Pact.pactffiVerify(
//   '--file\ntest/paaeuocts/foo.json',
//   (err, result) => {
//     if (err) {
//       throw err;
//     }

//     console.log(result);
//   }
// );

// console.log(Pact.pactffiVersion());

// result = Pact.foo(['arg1', 'arg2']);

Pact.pactffiInitWithLogLevel('debug');

handle = Pact.pactffiVerifierNewForApplication('pact-node', '1.x.x');
console.log(handle);
Pact.pactffiVerifierSetProviderInfo(
  handle,
  'pactflow-example-provider',
  'http',
  'localhost',
  1234,
  '/'
);
Pact.pactffiVerifierBrokerSourceWithSelectors(
  handle,
  'https://testdemo.pactflow.io',
  '',
  '',
  'AtDElACja4sv6l_RtI-bAw',
  true,
  '',
  ['dev', 'prod'],
  'main',
  [`{"mainBranch": true}`],
  ['dev', 'prod']
);
// Pact.pactffiVerifierAddFileSource(
//   handle,
//   '/Users/matthewfellows/development/public/pact-js/examples/mocha/pacts/myconsumer-myprovider.json'
// );
Pact.pactffiVerifierExecute(handle, (a, b) => {
  console.log('done', a, b);
  Pact.pactffiVerifierShutdown(handle);
});

console.log('done!');

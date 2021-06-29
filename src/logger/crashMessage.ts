export const pactCrashMessage = (
  extraMessage: string
): string => `!!!!!!!!! PACT CRASHED !!!!!!!!!

${extraMessage}

This is almost certainly a bug in pact-js-core. It would be great if you could
open a bug report at: https://github.com/pact-foundation/pact-js-core/issues
so that we can fix it.

There is additional debugging information above. If you open a bug report, 
please rerun with logLevel: 'debug' set in the VerifierOptions, and include the
full output.

SECURITY WARNING: Before including your log in the issue tracker, make sure you
have removed sensitive info such as login credentials and urls that you don't want
to share with the world.

We're sorry about this!
`;

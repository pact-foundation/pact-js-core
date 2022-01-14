// import chai = require('chai');
// import path = require('path');
// import chaiAsPromised = require('chai-as-promised');
// import { LogLevel } from '../src/logger/types';
// import {} from '../src/ffi/index'

// const expect = chai.expect;
// chai.use(chaiAsPromised);

// describe('Consumer Integration Spec', () => {
//   context('a consumer test', () => {
//     it('should work', () => {
//         const pactDir = path.join(__dirname, "pacts")

//         const like = (value) => {
//           if (isNil(value) || isFunction(value)) {
//             throw new MatcherError(
//               "Error creating a Pact somethingLike Match. Value cannot be a function or undefined"
//             )
//           }

//           return {
//             "pact:matcher:type": "type",
//             value,
//           }
//         }

//         //
//         // Example project
//         //

//         // Create the Pact and interaction
//         const p = newPact("foo-consumer", "bar-provider", SPECIFICATION_VERSION_V2)
//         const i = newInteraction(p, "some description")
//         uponReceiving(i, "a request to get a dog") // not sure why a description here is needed if newInteraction also has it?
//         given(i, "fido exists")
//         withRequest(i, "GET", "/dogs/1234")
//         withRequestHeader(i, "x-special-header", 0, "header")
//         withQuery(i, "someParam", 0, "someValue")
//         withJSONResponseBody(i, {
//           name: like("fido"),
//           age: like(23),
//           alive: like(true)
//         })
//         withResponseHeader(i, "x-special-header", 0, "header")
//         withStatus(i, 200)

//         lib.log("INFO", "this message came frome Pact JS")

//         // Start the mock service
//         const host = "127.0.0.1"
//         const port = lib.create_mock_server_for_pact(p, `${host}:0`, false)
//         console.log("have a port: ", port)

//         // Run the test
//         try {
//           const res = await axios.request({
//             baseURL: `http://${host}:${port}`,
//             headers: { Accept: "application/json", "x-special-header": "header" },
//             params: {
//               someParam: "someValue"
//             },
//             method: "GET",
//             url: "/dogs/1234", // break me, I dare you!
//           })

//           console.log('successful response!', res.status, res.data)

//         } catch (e) {
//           console.error("error making dogs API call: ", e.response.status, e.response.data)
//         }

//         // Exit status
//         let status = 0

//         // Check for any mismatches
//         const mismatches = JSON.parse(lib.mock_server_mismatches(port))
//         if (mismatches.length > 0) {
//           console.dir("mismatches: ")
//           console.dir(mismatches, { depth: 10 })
//           status = 1
//         } else {
//           // Write pact file
//           const status = lib.write_pact_file(port, pactDir)
//           console.log("write pact done => ", status)
//         }

//         // Cleanup any remaining processes
//         console.log("cleaning up")
//         const clean = lib.cleanup_mock_server(port)
//         console.log("shutdown server on port", port, "success?", clean)
//     })
//   });
// });

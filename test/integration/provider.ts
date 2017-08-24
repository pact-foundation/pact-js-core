import cors = require("cors");
import express = require("express");
import bodyParser = require("body-parser");
import basicAuth = require("basic-auth");

const server: express.Express = express();
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
	extended: true
}));

let stateData = "";

server.get("/", (req, res) => {
	res.json({
		greeting: "Hello"
	});
});

server.get("/fail", (req, res) => {
	res.json({
		greeting: "Oh noes!"
	});
});

server.get("/provider-states", (req, res) => {
	res.json({
		me: ["There is a greeting"],
		anotherclient: ["There is a greeting"]
	});
});

server.post("/provider-state", (req, res) => {
	stateData = "State data!";
	res.json({
		greeting: stateData
	});
});

server.get("/somestate", (req, res) => {
	res.json({
		greeting: stateData
	});
});

server.post("/", (req, res) => {
	res.json({
		greeting: "Hello " + req.body.name
	});
});

server.get("/contract/:name", (req, res) => {
	const options = {
		root: __dirname,
		dotfiles: "deny",
		headers: {
			"x-timestamp": Date.now(),
			"x-sent": true
		}
	};

	const fileName = req.params.name;
	res.sendFile(fileName, options, (err) => {
		if (err) {
			console.log(err);
			res.status(500).end();
		} else {
			console.log("Sent:", fileName);
		}
	});
});

// Pretend to be a Pact Broker (https://github.com/bethesque/pact_broker) for integration tests
// Let"s add Auth for good measure
const auth = (req, res, next) => {
	const user = basicAuth(req);
	if (user && user.name === "foo" && user.pass === "bar") {
		return next();
	} else {
		res.set("WWW-Authenticate", "Basic realm=Authorization Required");
		return res.sendStatus(401);
	}
};

// Verification result
server.post("/pacts/provider/:provider/consumer/:consumer/pact-version/:version/verification-results", (req, res) => res.json({}));

server.get("/pacts/provider/they/consumer/me/latest", auth, (req, res) => {
	res.json({
		"consumer": {
			"name": "me"
		},
		"provider": {
			"name": "they"
		},
		"interactions": [{
			"description": "Provider state success",
			"provider_state": "There is a greeting",
			"request": {
				"method": "GET",
				"path": "/somestate"
			},
			"response": {
				"status": 200,
				"headers": {},
				"body": {
					"greeting": "State data!"
				}
			}
		}],
		"metadata": {
			"pactSpecificationVersion": "2.0.0"
		},
		"updatedAt": "2016-05-15T00:09:33+00:00",
		"createdAt": "2016-05-15T00:09:06+00:00",
		"_links": {
			"self": {
				"title": "Pact",
				"name": "Pact between me (v1.0.0) and they",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0"
			},
			"pb:consumer": {
				"title": "Consumer",
				"name": "me",
				"href": "http://pact.onegeek.com.au/pacticipants/me"
			},
			"pb:provider": {
				"title": "Provider",
				"name": "they",
				"href": "http://pact.onegeek.com.au/pacticipants/they"
			},
			"pb:latest-pact-version": {
				"title": "Pact",
				"name": "Latest version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/latest"
			},
			"pb:previous-distinct": {
				"title": "Pact",
				"name": "Previous distinct version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct"
			},
			"pb:diff-previous-distinct": {
				"title": "Diff",
				"name": "Diff with previous distinct version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct"
			},
			"pb:pact-webhooks": {
				"title": "Webhooks for the pact between me and they",
				"href": "http://pact.onegeek.com.au/webhooks/provider/they/consumer/me"
			},
			"pb:tag-prod-version": {
				"title": "Tag this version as \'production\'",
				"href": "http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/prod"
			},
			"pb:tag-version": {
				"title": "Tag version",
				"href": "http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/{tag}"
			},
			"curies": [{
				"name": "pb",
				"href": "http://pact.onegeek.com.au/doc/{rel}",
				"templated": true
			}]
		}
	});
});

server.get("/pacts/provider/they/consumer/anotherclient/latest", auth, (req, res) => {
	res.json({
		"consumer": {
			"name": "anotherclient"
		},
		"provider": {
			"name": "they"
		},
		"interactions": [{
			"description": "Provider state success",
			"provider_state": "There is a greeting",
			"request": {
				"method": "GET",
				"path": "/somestate"
			},
			"response": {
				"status": 200,
				"headers": {},
				"body": {
					"greeting": "State data!"
				}
			}
		}],
		"metadata": {
			"pactSpecificationVersion": "2.0.0"
		},
		"updatedAt": "2016-05-15T00:09:33+00:00",
		"createdAt": "2016-05-15T00:09:06+00:00",
		"_links": {
			"self": {
				"title": "Pact",
				"name": "Pact between me (v1.0.0) and they",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0"
			},
			"pb:consumer": {
				"title": "Consumer",
				"name": "anotherclient",
				"href": "http://pact.onegeek.com.au/pacticipants/me"
			},
			"pb:provider": {
				"title": "Provider",
				"name": "they",
				"href": "http://pact.onegeek.com.au/pacticipants/they"
			},
			"pb:latest-pact-version": {
				"title": "Pact",
				"name": "Latest version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/latest"
			},
			"pb:previous-distinct": {
				"title": "Pact",
				"name": "Previous distinct version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct"
			},
			"pb:diff-previous-distinct": {
				"title": "Diff",
				"name": "Diff with previous distinct version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct"
			},
			"pb:pact-webhooks": {
				"title": "Webhooks for the pact between me and they",
				"href": "http://pact.onegeek.com.au/webhooks/provider/they/consumer/me"
			},
			"pb:tag-prod-version": {
				"title": "Tag this version as \'production\'",
				"href": "http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/prod"
			},
			"pb:tag-version": {
				"title": "Tag version",
				"href": "http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/{tag}"
			},
			"curies": [{
				"name": "pb",
				"href": "http://pact.onegeek.com.au/doc/{rel}",
				"templated": true
			}]
		}
	});
});

server.get("/noauth/pacts/provider/they/consumer/me/latest", (req, res) => {
	res.json({
		"consumer": {
			"name": "me"
		},
		"provider": {
			"name": "they"
		},
		"interactions": [{
			"description": "Provider state success",
			"provider_state": "There is a greeting",
			"request": {
				"method": "GET",
				"path": "/somestate"
			},
			"response": {
				"status": 200,
				"headers": {},
				"body": {
					"greeting": "State data!"
				}
			}
		}],
		"metadata": {
			"pactSpecificationVersion": "2.0.0"
		},
		"updatedAt": "2016-05-15T00:09:33+00:00",
		"createdAt": "2016-05-15T00:09:06+00:00",
		"_links": {
			"self": {
				"title": "Pact",
				"name": "Pact between me (v1.0.0) and they",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0"
			},
			"pb:consumer": {
				"title": "Consumer",
				"name": "me",
				"href": "http://pact.onegeek.com.au/pacticipants/me"
			},
			"pb:provider": {
				"title": "Provider",
				"name": "they",
				"href": "http://pact.onegeek.com.au/pacticipants/they"
			},
			"pb:latest-pact-version": {
				"title": "Pact",
				"name": "Latest version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/latest"
			},
			"pb:previous-distinct": {
				"title": "Pact",
				"name": "Previous distinct version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct"
			},
			"pb:diff-previous-distinct": {
				"title": "Diff",
				"name": "Diff with previous distinct version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct"
			},
			"pb:pact-webhooks": {
				"title": "Webhooks for the pact between me and they",
				"href": "http://pact.onegeek.com.au/webhooks/provider/they/consumer/me"
			},
			"pb:tag-prod-version": {
				"title": "Tag this version as 'production'",
				"href": "http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/prod"
			},
			"pb:tag-version": {
				"title": "Tag version",
				"href": "http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/{tag}"
			},
			"curies": [{
				"name": "pb",
				"href": "http://pact.onegeek.com.au/doc/{rel}",
				"templated": true
			}]
		}
	});
});

server.get("/noauth/pacts/provider/they/consumer/anotherclient/latest", (req, res) => {
	res.json({
		"consumer": {
			"name": "anotherclient"
		},
		"provider": {
			"name": "they"
		},
		"interactions": [{
			"description": "Provider state success",
			"provider_state": "There is a greeting",
			"request": {
				"method": "GET",
				"path": "/somestate"
			},
			"response": {
				"status": 200,
				"headers": {},
				"body": {
					"greeting": "State data!"
				}
			}
		}],
		"metadata": {
			"pactSpecificationVersion": "2.0.0"
		},
		"updatedAt": "2016-05-15T00:09:33+00:00",
		"createdAt": "2016-05-15T00:09:06+00:00",
		"_links": {
			"self": {
				"title": "Pact",
				"name": "Pact between me (v1.0.0) and they",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0"
			},
			"pb:consumer": {
				"title": "Consumer",
				"name": "anotherclient",
				"href": "http://pact.onegeek.com.au/pacticipants/me"
			},
			"pb:provider": {
				"title": "Provider",
				"name": "they",
				"href": "http://pact.onegeek.com.au/pacticipants/they"
			},
			"pb:latest-pact-version": {
				"title": "Pact",
				"name": "Latest version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/latest"
			},
			"pb:previous-distinct": {
				"title": "Pact",
				"name": "Previous distinct version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct"
			},
			"pb:diff-previous-distinct": {
				"title": "Diff",
				"name": "Diff with previous distinct version of this pact",
				"href": "http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct"
			},
			"pb:pact-webhooks": {
				"title": "Webhooks for the pact between me and they",
				"href": "http://pact.onegeek.com.au/webhooks/provider/they/consumer/me"
			},
			"pb:tag-prod-version": {
				"title": "Tag this version as 'production'",
				"href": "http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/prod"
			},
			"pb:tag-version": {
				"title": "Tag version",
				"href": "http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/{tag}"
			},
			"curies": [{
				"name": "pb",
				"href": "http://pact.onegeek.com.au/doc/{rel}",
				"templated": true
			}]
		}
	});
});

export default server;

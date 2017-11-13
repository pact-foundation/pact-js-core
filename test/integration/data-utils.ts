import express = require("express");
import basicAuth = require("basic-auth");

export function returnJsonFile(filename: string): (req: express.Request, res: express.Response) => express.Response {
	return returnJson(require(filename));
}

export function returnJson(json: any): (req: express.Request, res: express.Response) => express.Response {
	return (req, res) => res.json(json);
}

export function auth(req: express.Request, res: express.Response, next: express.NextFunction): express.Response {
	const user = basicAuth(req);
	if (user && user.name === "foo" && user.pass === "bar") {
		next();
		return;
	}

	res.set("WWW-Authenticate", "Basic realm=Authorization Required");
	return res.sendStatus(401);
}

import _ = require("underscore");
import checkTypes = require("check-types");

export class PactUtil {
	public createArguments(args, mappings) {
		return _.chain(args)
			.map((value, key) => {
				if (value && mappings[key]) {
					return [mappings[key], `'${checkTypes.array(value) ? value.join(",") : value}'`];
				}
			})
			.flatten()
			.compact()
			.value();
	}
}

export default new PactUtil();

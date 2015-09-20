/**
 * Parser.js
 * written by Colin Kuebler 2012
 * Updated by Roman Parpalak, 2015.
 * Part of LDT, dual licensed under GPLv3 and MIT
 * Generates a tokenizer from regular expressions for TextareaDecorator
 */

function Parser(rules, i) {
	/* INIT */
	var api = this;

	// variables used internally
	i = i ? 'i' : '';
	var parseRE = null;
	var ruleSrc = [];
	var ruleMap = {};

	api.add = function (rules) {
		for (var rule in rules) {
			if (rules.hasOwnProperty(rule)) {
				var s = rules[rule].source;
				ruleSrc.push(s);
				ruleMap[rule] = new RegExp('^(' + s + ')$', i);
			}
		}
		parseRE = new RegExp( ruleSrc.join('|'), 'g'+i );
	};
	api.tokenize = function (input) {
		var matches = input.match(parseRE),
			len = matches.length,
			i = 0,
			result = [];

		for (; i < len; i++) {
			result.push({
				token: matches[i],
				block: ''
			});
		}

		return result;
	};
	api.identifyInline = function (tokenObj) {
		for (var rule in ruleMap) {
			if (ruleMap.hasOwnProperty(rule)) {
				if (ruleMap[rule].test(tokenObj.token)) {
					return rule;
				}
			}
		}

		return '';
	};

	api.add(rules);

	return api;
}

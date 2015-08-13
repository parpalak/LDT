/* TextareaDecorator.js
 * written by Colin Kuebler 2012
 * Part of LDT, dual licensed under GPLv3 and MIT
 * Builds and maintains a styled output layer under a textarea input layer
 */

function TextareaDecorator(textarea, parser) {
	/* INIT */
	var api = this;

	// construct editor DOM
	var parent = document.createElement("div");
	var output = document.createElement("pre");
	output.className = 'ldt-pre';
	parent.appendChild(output);

	var label = document.createElement("label");
	label.className = 'ldt-label';

	parent.appendChild(label);

	// replace the textarea with RTA DOM and reattach on label
	textarea.parentNode.replaceChild(parent, textarea);
	label.appendChild(textarea);

	// transfer the CSS styles to our editor
	parent.className = 'ldt ' + textarea.className;
	textarea.className = 'ldt-textarea';

	function getClass(class1, class2) {
		return class1 + (class1 !== '' && class2 !== '' ? ' ' : '') + class2;
	}

	// coloring algorithm
	var color = function (input, output, parser) {
		var lastChar = input !== '' && input.substring(input.length - 1) || '';
		if (lastChar == "\r" || lastChar == "\n") {
			// Hack for the case when the last line in textarea is empty
			input += ' ';
		}

		var oldTokens = output.childNodes,
			newTokens = parser.tokenize(input),
			firstDiff, lastDiffNew, lastDiffOld;

		// find the first difference
		for (firstDiff = 0; firstDiff < newTokens.length && firstDiff < oldTokens.length; firstDiff++) {
			if (newTokens[firstDiff].token !== oldTokens[firstDiff].textContent) {
				break;
			}
		}

		// trim the length of output nodes to the size of the input
		while (newTokens.length < oldTokens.length) {
			output.removeChild(oldTokens[firstDiff]);
		}

		// find the last difference
		for (lastDiffNew = newTokens.length - 1, lastDiffOld = oldTokens.length - 1; firstDiff < lastDiffOld; lastDiffNew--, lastDiffOld--) {
			if (newTokens[lastDiffNew].token !== oldTokens[lastDiffOld].textContent) {
				break;
			}
		}

		// update modified spans
		for (; firstDiff <= lastDiffOld; firstDiff++) {
			var token = newTokens[firstDiff].token;

			oldTokens[firstDiff].textContent = oldTokens[firstDiff].innerText = token;
			oldTokens[firstDiff].className = getClass(
				newTokens[firstDiff].block, parser.identifyInline(newTokens[firstDiff])
			);
		}

		// add in modified spans
		for (var insertionPt = oldTokens[firstDiff] || null; firstDiff <= lastDiffNew; firstDiff++) {
			var span = document.createElement("span");

			span.textContent = span.innerText = newTokens[firstDiff].token;
			span.className   = getClass(
				newTokens[firstDiff].block, parser.identifyInline(newTokens[firstDiff])
			);

			output.insertBefore(span, insertionPt);
		}
	};

	api.input = textarea;
	api.output = output;
	api.recalcHeight = function () {
		api.input.style.height = Math.max(api.output.offsetHeight, 100) + 'px';
	};
	api.update = function () {
		var input = textarea.value;
		if (input) {
			color(input, output, parser);

		} else {
			// clear the display
			output.innerHTML = '';
		}
		api.recalcHeight();
	};

	// detect all changes to the textarea,
	// including keyboard input, cut/copy/paste, drag & drop, etc
	if (textarea.addEventListener) {
		// standards browsers: oninput event
		textarea.addEventListener("input", api.update, false);
	} else {
		// MSIE: detect changes to the 'value' property
		textarea.attachEvent("onpropertychange",
			function (e) {
				if (e.propertyName.toLowerCase() === 'value') {
					api.update();
				}
			}
		);
	}
	// initial highlighting
	api.update();

	return api;
}

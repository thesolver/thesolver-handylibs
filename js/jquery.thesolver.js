/**
 * Handy functions that extend jQuery
 *
 * E.g. to get a list of classes in the body of a page (broken down to single classes too):
 *
 * var classes = $('body').thesolver('list_classes',true)
 *
 */
(function ($) {
	var methods = {
		/**
		 * Unused function for now...it is the default
		 *
		 * @param {Object} options Optional options
		 */
		init        :function (options) {

		},
		/**
		 * Returns a list of classes for a given jQuery selector
		 *
		 * @param {Boolean} [verbose=false] If an element has multiple classes, also output entries for each individual one.
		 * For example, if there is <div class="this that theother"> verbose = false would lead to an array with just
		 *   div.this.that.theother
		 * With verbose = true
		 *   div.that
		 *   div.theother
		 *   div.this
		 *   div.this.that.theother
		 * @param {Boolean} [sort_classnames=false] If this is set to true, when an element has multiple classes it will
		 * sort the classnames.  Imagine you have two divs
		 *   div.this.that.theother
		 *   div.this.theother.that
		 * If this is set to false, then you'll get those as separate entries.  Set to true you'll get only one entry:
		 *   div.that.theother.this
		 * With a count of two.
		 * @return {Array} An associative array with the key being the element/class and the value being the count (sorted
		 * by the key)
		 */
		list_classes:function (verbose, sort_classnames) {
			if (undefined === verbose) {
				verbose = false;
			}
			if (undefined === sort_classnames) {
				sort_classnames = false;
			}
			var elem_classes = [];
			// get our classes
			$(this).find('[class]').each(function () {
				var jQueryThis = $(this);
				// split our class entry
				var classes = jQueryThis.attr('class').split(/\s+/);
				// sort the names if needed
				if (sort_classnames) {
					classes.sort();
				}
				// get our tag name (lower case it because it is given upper case)
				var tagName = jQueryThis.prop('tagName').toLowerCase();
				// put it together in a useful key for our array
				var descripter = tagName + '.' + classes.join('.');
				// make sure if it doesn't exist yet, we add it appropriately
				if (undefined !== elem_classes[descripter]) {
					elem_classes[descripter]++;
				} else {
					elem_classes[descripter] = 1;
				}
				// in verbose mode take a multi-class element into each class
				if (verbose && classes.length > 1) {
					$.each(classes, function (index, value) {
						descripter = tagName + '.' + value;
						if (undefined !== elem_classes[descripter]) {
							elem_classes[descripter]++;
						} else {
							elem_classes[descripter] = 1;
						}
					});
				}
			});
			elem_classes.sort();
			return elem_classes;
		}
	};
	$.fn.thesolver = function (method) {

		// Method calling logic (straight from a jquery.com example)
		if (methods[method]) {
			return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.tooltip');
		}

	};

})(jQuery);
/**
 * Standard cross-client helpful functions
 *
 * Namespace approach from a combo of http://stackoverflow.com/a/5947280/1939831 and http://stackoverflow.com/a/10269380/1939831
 *
 * @requires jQuery
 *
 * @module $thesolver
 */
/** @namespace Namespace for $thesolver classes and functions. */
(function ($thesolver, $) {
	"use strict";
	var version = '0.1';
	/**
	 * HTML-related functions
	 *
	 * @namespace $thesolver
	 * @class html
	 */
	$thesolver.html = {
		/**
		 * HTML encodes a string
		 *
		 * @method encode
		 * @param {String} victim The string we want to HTML encode
		 * @return {String} The html encoded string
		 */
		encode   :function (victim) {
			return($('<div />').text(victim).html());
		},
		/**
		 * Creates <a> elements with encoded text
		 *
		 * @method hyperlink
		 * @param {String} href The href we will point to
		 * @param {String} text The text of the link
		 * @param {String} [target=_blank] (optional) The target page
		 * @param {String|Boolean} [title=text] (optional) The title on the link (defaults to an encoded version of the text).
		 * Set to false if you don't want it set at all...true if you want to do the default.
		 * @param {String} [aclass] (optional) CSS class to add to the string (defaults to nothing)
		 * @param {Boolean} [noencode=false] (optional) Flag that tells us not to encode the text and title
		 * @param {Object|Array} [attr_obj] (optional) Key/value pairs of additional attributes to add to the link --
		 * it will not encode either (defaults to none)
		 * @return {String} The complete link
		 */
		hyperlink:function (href, text, target, title, aclass, noencode, attr_obj) {
			var attrs = '';
			if (!target) {
				target = '_blank';
			}
			// if it's not set, we'll default to the text of the link
			if (undefined === title || true === title) {
				title = text;
			}
			if (!noencode) {
				text = $thesolver.html.encode(text);
				if (false !== title) {
					title = $thesolver.html.encode(title);
				}
			}

			if (!aclass) {
				aclass = '';
			} else {
				aclass = ' class="' + aclass + '"';
			}

			if (false !== title) {
				title = ' title="' + title + '"';
			}

			if (typeof attr_obj === 'object') {
				$.each(attr_obj, function (attr, value) {
					attrs = attrs + ' ' + attr + '="' + value + '"';
				});
			}
			return('<a href="' + href + '" target="' + target + '"' + title +
					aclass + attrs + '>' + text + '</a>');
		},

		/**
		 * Imperfectly tries to close HTML on a sting that doesn't have an equal number of closing tags as opening tags
		 * for a limited group of tags.
		 *
		 * Where it especially comes up short is it cannot to complicated structures like tables. For instance, if you
		 * have cut HTML in the middle cell of a row, it'll correctly close the td, tr, tbody, and table...but you'll
		 * still have a half-constructed row in the resultant table.
		 *
		 * IT ASSUMES WELL FORMED HTML5 or XHTML (e.g. a <p> must have a </p> and a unary tag must close with a "/>")
		 * (although it does handle some unary tags wisely regardless regardless.  That does not mean it will not
		 * modify un-well formed HTML5 or XHTML...but it will not fix it and, theoretically, could worsen it if you
		 * have missing closing tags and the like.
		 *
		 * @param {String} string our HTML string
		 * @return {String} the "closed" HTML string
		 */
		close_html:function (string) {
			var result, match, tag, open_count, close_count, open_regex, close_regex;
			/**
			 * These are the unary tags we know people might leave the ending '/>' off...
			 * @type {Array}
			 */
			var watch_tags = ['img', 'br', 'hr', 'input'];
			var tagregex = /<([a-z])+\b[^>]*>/img;
			// step one, look for (and delete) any dangling entities
			if (string.match(/^.*&[^;]*$/)) {
				string = string.replace(/^(.*)&[^;]*$/m, "$1");
			}
			// step two, look for (and delete) any dangling tags
			if (string.match(/^.*<[^>]*$/)) {
				string = string.replace(/^(.*)<[^>]*$/m, "$1");
			}
			/**
			 * We go through the string left to right looking for outmost tag...see if it's count of open tags is the
			 * same as its count of closing tags...and if it doesn't...slap _one_ on the end.  (We will catch up other
			 * missing ones as we continue through the HTML string.)
			 */
			while ((result = tagregex.exec(string)) !== null) {
				match = result[0];
				tag = result[1];
				// don't do anything with tags that end in a '/>' or tags that we know people forget the '/>' with...
				if (true || !/\/>$/.test(match) && !$.inArray(tag, watch_tags)) {
					open_regex = new RegExp('<' + tag + '\\b[^>]*>', 'im');
					close_regex = new RegExp('</' + tag + '>', 'im');
					open_count = string.split(open_regex).length;
					close_count = string.split(close_regex).length;
					if (open_count > close_count) {
						string = string + '</' + tag + '>';
					}
				}
			}
			return(string);
		},

		/**
		 * Simple function that allows us to truncate a string with ellipsis (along with html encoding it if that's
		 * what we want.
		 *
		 * It will trim the string regardless of whether it has to be truncated...
		 *
		 * PLEASE NOTE: HTML support is limited. After an HTML string is truncated, this function tries to make sure
		 * all elements are closed via $thesolver.html.close_html() above (please look at its documentation for an
		 * explanation of approach).
		 *
		 * Originally based on http://snippets.jc21.com/snippets/php/truncate-a-long-string-and-add-ellipsis/
		 * (but significant enhancements were made)
		 *
		 * @param {String} string The string we want to resize
		 * @param {Integer} length Our maximum length (we will shrink it 3 additional characters to handle the ellipsis)
		 * @param {Boolean} [html_encode=false] Should we html encode the output?
		 * @param {Boolean} [stopanywhere=false] Should we truncate anywhere?
		 * @param {Boolean} [is_html=false] Is this HTML?
		 * @return {String} Our string, truncated as needed.
		 */
		trunc_ellipsis:function (string, length, html_encode, stopanywhere, is_html) {
			var zapped_it = false;
			if (!html_encode) {
				html_encode = false;
			}
			if (!stopanywhere) {
				stopanywhere = false;
			}
			if (!is_html) {
				is_html = false;
			}

			string = $.trim(string);
			var orig_string = string;

			// too big?
			if (string.length > length) {
				zapped_it = true;
				// remove the end...make sure we don't have space(s) afterward
				string = $.trim(string.substr(0, length - 3));
				// split on a space if (a) we can't stopanywhere and (b) we aren't cut right on a word (based on
				// looking at the original string)
				if (!stopanywhere && -1 === orig_string.indexOf(string + ' ')) {
					string = string.substr(0, string.lastIndexOf(' '));
				}

				// okay...let's try to not leave open tags
				if (is_html) {
					string = $thesolver.html.close_html(string);
				}
			}
			// encode if we need too...
			if (html_encode) {
				string = $thesolver.html.encode(string) + (zapped_it ? '&hellip;' : '');
			} else {
				// if we started with HTML we should end with HTML...
				if (zapped_it) {
					if (is_html) {
						// This brings the ... inside the earliest closing tag that is at the very end...
						string = string.replace(/((<\/[^>]+>){1,})$/i, '&hellip;$1');
					} else {
						string = string + '...';
					}
				}
			}
			return string;
		}
	};
	/**
	 * Date, time, and length (since length is a measure of time) related functions
	 *
	 * @namespace $thesolver
	 * @class datetime
	 */
	$thesolver.datetime = {
		/**
		 * Converts seconds into a human readable value based on length of time. If there are hours it'll be H:MM:SS;
		 * if only minutes worth, M:SS; and if only seconds worth, S.
		 *
		 * The function does not go beyond hours...the hours just get bigger and bigger...
		 *
		 * @param secs The number of seconds
		 * @return {String} The human readable version of seconds in H:MM:SS, M:SS, or just S form
		 */
		length_in_human :function (secs) {
			var remain_secs = secs % 60;
			var mins = Math.floor(secs / 60);
			var hours = Math.floor(mins / 60);
			// force to string
			mins = (mins % 60) + '';
			remain_secs = remain_secs + '';
			if (hours) {
				return hours + ':' + (mins.length === 1 ? '0' + mins : mins) + ':' +
						(remain_secs.length === 1 ? '0' + remain_secs : remain_secs);
			} else if (mins) {
				return mins + ':' + (remain_secs.length === 1 ? '0' + remain_secs : remain_secs);
			} else {
				return remain_secs;
			}
		},
		/**
		 * Converts seconds into HH:MM:SS form.
		 *
		 * The function only deals with up to 99 hours. After that the hours will just keep getting larger (that is,
		 * it will become HHH:MM:SS, HHHH:MM:SS, and so on)
		 *
		 * @param secs The number of seconds.
		 * @return {String} The result in HH:MM:SS form
		 */
		length_in_hhmmss:function (secs) {
			var remain_secs = secs % 60;
			var mins = Math.floor(secs / 60);
			// force to string
			var hours = Math.floor(mins / 60) + '';
			mins = (mins % 60) + '';
			remain_secs = remain_secs + '';
			return (hours.length === 1 ? '0' + hours : hours) + ':' + (mins.length === 1 ? '0' + mins : mins) + ':' +
					(remain_secs.length === 1 ? '0' + remain_secs : remain_secs);
		}
	};

	/**
	 * String related functions
	 *
	 * @namespace $thesolver
	 * @class string
	 */
	$thesolver.string = {
		/**
		 * So that a title can be better sorted, it finds any cases of a title starting with "The", "A", or "An" and
		 * returns the string with those moved to the end (after adding a ", ").  If there is no match, it just
		 * returns the string it was given.
		 *
		 * By default it also removes single and double quotes from titles for sorting (since they often can be at the
		 * beginning of a title).
		 *
		 * @param {String} title The title we want to sort better
		 * @param {Boolean} [rem_quotes=true] Remove single and double quotes from the title for sorting?
		 * @return {String} The title with any required changes
		 */
		sort_title:function (title,rem_quotes) {
			if (undefined === rem_quotes) {
				rem_quotes = true;
			}
			if (rem_quotes) {
				title = title.replace(/["']/g,'');
			}
			return title.replace(/^(The|A|An)\s+(.*)$/, '$2' + ', ' + '$1');
		},
				/**
				 * Takes a number of bytes and returns it in GB, MB, KB, or bytes (rounded to precision decimal places)
				 *
				 * @param {Number} orig_size The size of the file in bytes
				 * @param {Number} [precision=1] The number of decimal places we want
				 * @return {String} The size in human readable verbiage
				 */
				size_in_human: function(orig_size,precision) {
					if (undefined === precision) {
						precision = 1;
					}
					if (orig_size > 1024*1024*1024) {
						return((orig_size/(1024*1024*1024)).toFixed(precision) + 'GB');
					} else if (orig_size > 1024*1024) {
						return((orig_size/(1024*1024)).toFixed(precision) + 'MB');
					} else if (orig_size > 1024) {
						return((orig_size/1024).toFixed(precision) + 'KB');
					} else {
						return(orig_size + '');
					}
				}
	};

	/**
	 * Regular expression related functions
	 *
	 * @namespace $thesolver
	 * @class regex
	 */
	$thesolver.regex = {
		/**
		 * Validates a regular expression string so it can be used safely.
		 *
		 * @param {String} regex_string The string we want to validate
		 * @return {RegExp|Boolean} A usable regular expression object if regex_string is valid, false if not
		 */
		valid:function (regex_string) {
			var mystring = '';
			try {
				var result = new RegExp(regex_string);
			}
			catch (error) {
				result = false;
			}
			return(result);
		}
	};

}(window.$thesolver = window.$thesolver || {}, window.jQuery));

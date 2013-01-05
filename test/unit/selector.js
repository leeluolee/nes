
/**
 * 这里我们
 * @type {[type]}
 */
module("selector", { teardown: moduleTeardown });

/*
	======== QUnit Reference ========
	http://docs.jquery.com/QUnit

	Test methods:
		expect(numAssertions)
		stop()
		start()
			note: QUnit's eventual addition of an argument to stop/start is ignored in this test suite
			so that start and stop can be passed as callbacks without worrying about
				their parameters
	Test assertions:
		ok(value, [message])
		equal(actual, expected, [message])
		notEqual(actual, expected, [message])
		deepEqual(actual, expected, [message])
		notDeepEqual(actual, expected, [message])
		strictEqual(actual, expected, [message])
		notStrictEqual(actual, expected, [message])
		raises(block, [expected], [message])

	======== testinit.js reference ========
	See data/testinit.js

	q(...);
		Returns an array of elements with the given IDs
		@example q("main", "foo", "bar") => [<div id="main">, <span id="foo">, <input id="bar">]

	t( testName, selector, [ "array", "of", "ids" ] );
		Asserts that a select matches the given IDs
		@example t("Check for something", "//[a]", ["foo", "baar"]);

	url( "some/url.php" );
		Add random number to url to stop caching
		@example url("data/test.html") => "data/test.html?10538358428943"
		@example url("data/test.php?foo=bar") => "data/test.php?foo=bar&10538358345554"
*/

test("element", function() {

	equal( nes._get("").length, 0, "Empty selector returns an empty array" );
	equal( nes._get(" ").length, 0, "Empty selector returns an empty array" );
	equal( nes._get("\t").length, 0, "Empty selector returns an empty array" );
	var form = document.getElementById("form");
	ok( !nes.matches( form, "" ), "Empty string passed to matchesSelector does not match" );
	ok( nes._get("*").length >= 30, "Select all" );
	var all = nes._get("*"), good = true;
	for ( var i = 0; i < all.length; i++ ) {
		if ( all[i].nodeType == 8 ) {
			good = false;
		}
	}
	ok( good, "Select all elements, no comment nodes" );
	t( "Element Selector", "html", ["html"] );
	t( "Element Selector", "body", ["body"] );
	t( "Element Selector", "#qunit-fixture p", ["firstp","ap","sndp","en","sap","first"] );

	t( "Leading space", " #qunit-fixture p", ["firstp","ap","sndp","en","sap","first"] );
	t( "Leading tab", "\t#qunit-fixture p", ["firstp","ap","sndp","en","sap","first"] );
	t( "Leading carriage return", "\r#qunit-fixture p", ["firstp","ap","sndp","en","sap","first"] );
	t( "Leading line feed", "\n#qunit-fixture p", ["firstp","ap","sndp","en","sap","first"] );
	t( "Leading form feed", "\f#qunit-fixture p", ["firstp","ap","sndp","en","sap","first"] );
	t( "Trailing space", "#qunit-fixture p ", ["firstp","ap","sndp","en","sap","first"] );
	t( "Trailing tab", "#qunit-fixture p\t", ["firstp","ap","sndp","en","sap","first"] );
	t( "Trailing carriage return", "#qunit-fixture p\r", ["firstp","ap","sndp","en","sap","first"] );
	t( "Trailing line feed", "#qunit-fixture p\n", ["firstp","ap","sndp","en","sap","first"] );
	t( "Trailing form feed", "#qunit-fixture p\f", ["firstp","ap","sndp","en","sap","first"] );

	t( "Parent Element", "div p", ["firstp","ap","sndp","en","sap","first"] );
	t( "Parent Element (non-space descendant combinator)", "div\tp", ["firstp","ap","sndp","en","sap","first"] );
	var obj1 = document.getElementById("object1");
	equal( nes._get("param", obj1).length, 2, "Object/param as context" );

	deepEqual( nes._get("select", form), q("select1","select2","select3","select4","select5"), "Finding selects with a context." );

	// Check for unique-ness and sort order
	deepEqual( nes._get("p, div p"), nes._get("p"), "Check for duplicates: p, div p" );

	t( "Checking sort order", "h2, h1", ["qunit-header", "qunit-banner", "qunit-userAgent"] );
	t( "Checking sort order", "#qunit-fixture p, #qunit-fixture p a", ["firstp", "simon1", "ap", "google", "groups", "anchor1", "mark", "sndp", "en", "yahoo", "sap", "anchor2", "simon", "first"] );

	// Test Conflict ID
	var lengthtest = document.getElementById("lengthtest");
	deepEqual( nes._get("#idTest", lengthtest), q("idTest"), "Finding element with id of ID." );
	deepEqual( nes._get("[name='id']", lengthtest), q("idTest"), "Finding element with id of ID." );
	deepEqual( nes._get("input[id='idTest']", lengthtest), q("idTest"), "Finding elements with id of ID." );


	var iframe = document.getElementById("iframe"),
		iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
	iframeDoc.open();
	iframeDoc.write("<body><p id='foo'>bar</p></body>");
	iframeDoc.close();
	deepEqual(
		nes._get( "p:contains(bar)", iframeDoc ),
		[ iframeDoc.getElementById("foo") ],
		"Other document as context"
	);

	var html = "";
	for ( i = 0; i < 100; i++ ) {
		html = "<div>" + html + "</div>";
	}
	html = jQuery( html ).appendTo( document.body );
	ok( !!nes._get("body div div div").length, "No stack or performance problems with large amounts of descendents" );
	ok( !!nes._get("body>div div div").length, "No stack or performance problems with large amounts of descendents" );
	html.remove();

	// Real use case would be using .watch in browsers with window.watch (see Issue #157)
	q("qunit-fixture")[0].appendChild( document.createElement("toString") ).id = "toString";
	t( "Element name matches Object.prototype property", "toString#toString", ["toString"] );
});



test("id", function() {

	t( "ID Selector", "#body", ["body"] );
	t( "ID Selector w/ Element", "body#body", ["body"] );
	t( "ID Selector w/ Element", "ul#first", [] );
	t( "ID selector with existing ID descendant", "#firstp #simon1", ["simon1"] );
	t( "ID selector with non-existant descendant", "#firstp #foobar", [] );
	t( "Child ID selector using UTF8", "form > #台北", ["台北"] );



	t( "ID Selector, child ID present", "#form > #radio1", ["radio1"] ); // bug #267
	t( "ID Selector, not an ancestor ID", "#form #first", [] );
	t( "ID Selector, not a child ID", "#form > #option1a", [] );

	t( "All Children of ID", "#foo > *", ["sndp", "en", "sap"] );
	t( "All Children of ID with no children", "#firstUL > *", [] );


	t( "ID Selector on Form with an input that has a name of 'id'", "#lengthtest", ["lengthtest"] );

	t( "ID selector with non-existant ancestor", "#asdfasdf #foobar", [] ); // bug #986

	deepEqual( nes._get("div#form", document.body), [], "ID selector within the context of another element" );

	t( "Underscore ID", "#types_all", ["types_all"] );
	t( "Dash ID", "#fx-queue", ["fx-queue"] );

});

test("class", function() {

	t( "Class Selector", ".blog", ["mark","simon"] );
	t( "Class Selector", ".GROUPS", ["groups"] );
	t( "Class Selector", ".blog.link", ["simon"] );

	t( "Class Selector w/ Element", "a.blog", ["mark","simon"] );
	t( "Parent Class Selector", "p .blog", ["mark","simon"] );

	


	var div = document.createElement("div");
	div.innerHTML = "<div class='test e'></div><div class='test'></div>";
	deepEqual( nes._get(".e", div), [ div.firstChild ], "Finding a second class." );

	div.lastChild.className = "e";

	deepEqual( nes._get(".e", div), [ div.firstChild, div.lastChild ], "Finding a modified class." );

	ok( !nes.matches( div, ".null"), ".null does not match an element with no class" );
	ok( !nes.matches( div.firstChild, ".null div"), ".null does not match an element with no class" );
	ok( nes.matches( div.firstChild, "div div.e"), "base .e classMatch" );
	div.className = "null";
	ok( nes.matches( div, ".null"), ".null matches element with class 'null'" );
	ok( nes.matches( div.firstChild, ".null > div"), "caching system respects DOM changes" );
	ok( !nes.matches( document, ".foo" ), "testing class on document doesn't error" );
	ok( !nes.matches( window, ".foo" ), "testing class on window doesn't error" );

	div.lastChild.className += " hasOwnProperty toString";
	deepEqual( nes._get(".e.hasOwnProperty.toString", div), [ div.lastChild ], "Classes match Object.prototype properties" );
});

test("name", function() {

	t( "Name selector", "input[name=action]", ["text1"] );
	t( "Name selector with single quotes", "input[name='action']", ["text1"] );
	t( "Name selector with double quotes", 'input[name="action"]', ["text1"] );

	t( "Name selector non-input", "[name=test]", ["length", "fx-queue"] );
	t( "Name selector non-input", "[name=div]", ["fadein"] );
	t( "Name selector non-input", "*[name=iframe]", ["iframe"] );


	var form = document.getElementById("form");
	deepEqual( nes._get("input[name=action]", form), q("text1"), "Name selector within the context of another element" );

	form = jQuery("<form><input name='id'/></form>").appendTo("body");
	equal( nes._get("input", form[0]).length, 1, "Make sure that rooted queries on forms (with possible expandos) work." );

	form.remove();

	var a = jQuery("<div><a id=\"tName1ID\" name=\"tName1\">tName1 A</a><a id=\"tName2ID\" name=\"tName2\">tName2 A</a><div id=\"tName1\">tName1 Div</div></div>")
		.appendTo("#qunit-fixture").children();

	equal( a.length, 3, "Make sure the right number of elements were inserted." );
	equal( a[1].id, "tName2ID", "Make sure the right number of elements were inserted." );

	equal( nes._get("[name=tName1]")[0], a[0], "Find elements that have similar IDs" );
	equal( nes._get("[name=tName2]")[0], a[1], "Find elements that have similar IDs" );
	t( "Find elements that have similar IDs", "#tName2ID", ["tName2ID"] );

	a.parent().remove();
});

test("multiple", function() {

	t( "Comma Support", "h2, #qunit-fixture p", ["qunit-banner","qunit-userAgent","firstp","ap","sndp","en","sap","first"]);
	t( "Comma Support", "h2 , #qunit-fixture p", ["qunit-banner","qunit-userAgent","firstp","ap","sndp","en","sap","first"]);
	t( "Comma Support", "h2 , #qunit-fixture p", ["qunit-banner","qunit-userAgent","firstp","ap","sndp","en","sap","first"]);
	t( "Comma Support", "h2,#qunit-fixture p", ["qunit-banner","qunit-userAgent","firstp","ap","sndp","en","sap","first"]);
	t( "Comma Support", "h2,#qunit-fixture p ", ["qunit-banner","qunit-userAgent","firstp","ap","sndp","en","sap","first"]);
	t( "Comma Support", "h2\t,\r#qunit-fixture p\n", ["qunit-banner","qunit-userAgent","firstp","ap","sndp","en","sap","first"]);

});

test("child and adjacent", function() {

	t( "Child", "p > a", ["simon1","google","groups","mark","yahoo","simon"] );
	t( "Child", "p> a", ["simon1","google","groups","mark","yahoo","simon"] );
	t( "Child", "p >a", ["simon1","google","groups","mark","yahoo","simon"] );
	t( "Child", "p>a", ["simon1","google","groups","mark","yahoo","simon"] );
	t( "Child w/ Class", "p > a.blog", ["mark","simon"] );
	t( "All Children", "code > *", ["anchor1","anchor2"] );
	t( "All Grandchildren", "p > * > *", ["anchor1","anchor2"] );
	t( "Adjacent", "#qunit-fixture a + a", ["groups"] );
	t( "Adjacent", "#qunit-fixture a +a", ["groups"] );
	t( "Adjacent", "#qunit-fixture a+ a", ["groups"] );
	t( "Adjacent", "#qunit-fixture a+a", ["groups"] );
	t( "Adjacent", "p + p", ["ap","en","sap"] );
	t( "Adjacent", "p#firstp + p", ["ap"] );
	t( "Adjacent", "p[lang=en] + p", ["sap"] );
	t( "Adjacent", "a.GROUPS + code + a", ["mark"] );
	t( "Comma, Child, and Adjacent", "#qunit-fixture a + a, code > a", ["groups","anchor1","anchor2"] );
	t( "Element Preceded By", "#qunit-fixture p ~ div", ["foo", "moretests","tabindex-tests", "liveHandlerOrder", "siblingTest"] );
	t( "Element Preceded By", "#first ~ div", ["moretests","tabindex-tests", "liveHandlerOrder", "siblingTest"] );
	t( "Element Preceded By", "#groups ~ a", ["mark"] );
	t( "Element Preceded By", "#length ~ input", ["idTest"] );
	t( "Element Preceded By", "#siblingfirst ~ em", ["siblingnext", "siblingthird"] );
	t( "Element Preceded By (multiple)", "#siblingTest em ~ em ~ em ~ span", ["siblingspan"] );
	t( "Element Preceded By, Containing", "#liveHandlerOrder ~ div em:contains(1)", ["siblingfirst"] );

	var siblingFirst = document.getElementById("siblingfirst");


	var en = document.getElementById("en");

	t( "Multiple combinators selects all levels", "#siblingTest em *", ["siblingchild", "siblinggrandchild", "siblinggreatgrandchild"] );
	t( "Multiple combinators selects all levels", "#siblingTest > em *", ["siblingchild", "siblinggrandchild", "siblinggreatgrandchild"] );
	t( "Multiple sibling combinators doesn't miss general siblings", "#siblingTest > em:first-child + em ~ span", ["siblingspan"] );
	t( "Combinators are not skipped when mixing general and specific", "#siblingTest > em:contains('x') + em ~ span", [] );

	equal( nes._get("#listWithTabIndex").length, 1, "Parent div for next test is found via ID (#8310)" );
	equal( nes._get("#listWithTabIndex li:nth-child(2) ~ li").length, 2, "Find by general sibling combinator (#8310)" );
	equal( nes._get("#__sizzle__").length, 0, "Make sure the temporary id assigned by sizzle is cleared out (#8310)" );
	equal( nes._get("#listWithTabIndex").length, 1, "Parent div for previous test is still found via ID (#8310)" );

	t( "Verify deep class selector", "div.blah > p > a", [] );

	t( "No element deep selector", "div.foo > span > a", [] );

	var nothiddendiv = document.getElementById("nothiddendiv");
	deepEqual( nes._get(":first-child", nothiddendiv), q("nothiddendivchild"), "Verify child context positional selector" );
	deepEqual( nes._get(":nth-child(0)", nothiddendiv), [], "Verify child context positional selector" );
	deepEqual( nes._get("*:first-child", nothiddendiv), q("nothiddendivchild"), "Verify child context positional selector" );

	t( "Non-existant ancestors", ".fototab > .thumbnails > a", [] );
});

test("attributes", function() {

	t( "Attribute Exists", "#qunit-fixture a[title]", ["google"] );
	t( "Attribute Exists (case-insensitive)", "#qunit-fixture a[TITLE]", ["google"] );
	t( "Attribute Exists", "#qunit-fixture *[title]", ["google"] );
	t( "Attribute Exists", "#qunit-fixture [title]", ["google"] );
	t( "Attribute Exists", "#qunit-fixture a[ title ]", ["google"] );

	t( "Boolean attribute exists", "#select2 option[selected]", ["option2d"]);
	t( "Boolean attribute exists", "#select2 option:selected", ["option2d"]);
	t( "Boolean attribute equals", "#select2 option[selected='selected']", ["option2d"]);

	t( "Attribute Equals", "#qunit-fixture a[rel='bookmark']", ["simon1"] );
	t( "Attribute Equals", "#qunit-fixture a[rel='bookmark']", ["simon1"] );
	t( "Attribute Equals", "#qunit-fixture a[rel=bookmark]", ["simon1"] );
	t( "Attribute Equals", "#qunit-fixture a[href='http://www.google.com/']", ["google"] );
	t( "Attribute Equals", "#qunit-fixture a[ rel = 'bookmark' ]", ["simon1"] );
	t( "Attribute Equals Number", "#qunit-fixture option[value=1]", ["option1b","option2b","option3b","option4b","option5c"] );
	t( "Attribute Equals Number", "#qunit-fixture li[tabIndex=-1]", ["foodWithNegativeTabIndex"] );

	document.getElementById("anchor2").href = "#2";
	t( "href Attribute", "p a[href^=#]", ["anchor2"] );
	t( "href Attribute", "p a[href*=#]", ["simon1", "anchor2"] );

	t( "for Attribute", "form label[for]", ["label-for"] );
	t( "for Attribute in form", "#form [for=action]", ["label-for"] );

	deepEqual( nes._get( "input[data-comma='0,1']" ), [ document.getElementById("el12087") ], "Without context, single-quoted attribute containing ','" );
	deepEqual( nes._get( 'input[data-comma="0,1"]' ), [ document.getElementById("el12087") ], "Without context, double-quoted attribute containing ','" );
	deepEqual( nes._get( "input[data-comma='0,1']", document.getElementById("t12087") ), [ document.getElementById("el12087") ], "With context, single-quoted attribute containing ','" );
	deepEqual( nes._get( 'input[data-comma="0,1"]', document.getElementById("t12087") ), [ document.getElementById("el12087") ], "With context, double-quoted attribute containing ','" );

	t( "Multiple Attribute Equals", "#form input[type='radio'], #form input[type='hidden']", ["radio1", "radio2", "hidden1"] );
	t( "Multiple Attribute Equals", "#form input[type='radio'], #form input[type=\"hidden\"]", ["radio1", "radio2", "hidden1"] );
	t( "Multiple Attribute Equals", "#form input[type='radio'], #form input[type=hidden]", ["radio1", "radio2", "hidden1"] );

	t( "Attribute selector using UTF8", "span[lang=中文]", ["台北"] );

	t( "Attribute Begins With", "a[href ^= 'http://www']", ["google","yahoo"] );
	t( "Attribute Ends With", "a[href $= 'org/']", ["mark"] );
	t( "Attribute Contains", "a[href *= 'google']", ["google","groups"] );
	t( "Attribute Is Not Equal", "#ap a[hreflang!='en']", ["google","groups","anchor1"] );

	var opt = document.getElementById("option1a"),
		match = nes.matches;

	opt.setAttribute( "test", "" );

	ok( match( opt, "[id*=option1][type!=checkbox]" ), "Attribute Is Not Equal Matches" );
	ok( match( opt, "[id*=option1]" ), "Attribute *= With No Quotes Contains Matches" );
	ok( match( opt, "[id=option1a]" ), "Attribute = With  No Quotes Equals Matches" );
	ok( match( opt, "[type!=checkbox]" ), "Attribute != With No Quotes Equals Matches" );
	ok( match( document.getElementById("simon1"), "a[href*=#]" ), "Attribute With No Quotes Href Contains Matches" );

	t( "Select options via :selected", "#select1 option:selected", ["option1a"] );
	t( "Select options via :selected", "#select2 option:selected", ["option2d"] );
	t( "Select options via :selected", "#select3 option:selected", ["option3b", "option3c"] );
	t( "Select options via :selected", "select[name='select2'] option:selected", ["option2d"] );


	var input = document.getElementById("text1");
	input.title = "Don't click me";

	// Uncomment if the boolHook is removed
	// var check2 = document.getElementById("check2");
	// check2.checked = true;
	// ok( !Sizzle.matches("[checked]", [ check2 ] ), "Dynamic boolean attributes match when they should with Sizzle.matches (#11115)" );

	// jQuery #12303
	input.setAttribute( "data-pos", ":first-child" );
	ok( match( input, "input[data-pos=':first-child']"), "POS within attribute value is treated as an attribute value" );
	input.removeAttribute("data-pos");


	t( "input[type=text]", "#form input[type=text]", ["text1", "text2", "hidden2", "name"] );
	t( "input[type=search]", "#form input[type=search]", ["search"] );


	div = null;
});

test("pseudo - child", function() {
	t( "First Child", "#qunit-fixture p:first-child", ["firstp","sndp"] );
	t( "Last Child", "p:last-child", ["sap"] );
	t( "Only Child", "#qunit-fixture a:only-child", ["simon1","anchor1","yahoo","anchor2","liveLink1","liveLink2"] );
	t( "Empty", "ul:empty", ["firstUL"] );
	t( "Empty with comment node", "ol:empty", ["empty"] );

	t( "First Child", "p:first-child", ["firstp","sndp"] );
	t( "First Child", ".nothiddendiv div:first-child", ["nothiddendivchild"] );
	t( "Nth Child", "p:nth-child(1)", ["firstp","sndp"] );
	t( "Nth Child With Whitespace", "p:nth-child( 1 )", ["firstp","sndp"] );
	t( "Not Nth Child", "#qunit-fixture p:not(:nth-child(1))", ["ap","en","sap","first"] );

	// Verify that the child position isn't being cached improperly
	var firstChildren = jQuery("p:first-child").before("<div></div>");

	// TODO
	t( "No longer First Child", "p:nth-child(1)", [] );

	firstChildren.prev().remove();
	t( "Restored First Child", "p:nth-child(1)", ["firstp","sndp"] );

	QUnit.reset();

	t( "Last Child", "p:last-child", ["sap"] );
	t( "Last Child", "#qunit-fixture a:last-child", ["simon1","anchor1","mark","yahoo","anchor2","simon","liveLink1","liveLink2"] );

	t( "Nth-child", "#qunit-fixture form#form > *:nth-child(2)", ["text1"] );
	t( "Nth-child", "#qunit-fixture form#form > :nth-child(2)", ["text1"] );

	t( "Nth-child", "#form select:first-of-type option:nth-child(-1)", [] );
	t( "Nth-child(case-insensitive)", "#form select:first-of-type option:NTH-child(3)", ["option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(0n+3)", ["option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(1n+0)", ["option1a", "option1b", "option1c", "option1d"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(1n)", ["option1a", "option1b", "option1c", "option1d"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(n)", ["option1a", "option1b", "option1c", "option1d"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(even)", ["option1b", "option1d"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(odd)", ["option1a", "option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(2n)", ["option1b", "option1d"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(2n+1)", ["option1a", "option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(2n + 1)", ["option1a", "option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(+2n + 1)", ["option1a", "option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(3n)", ["option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(3n+1)", ["option1a", "option1d"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(3n+2)", ["option1b"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(3n+3)", ["option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(3n-1)", ["option1b"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(3n-2)", ["option1a", "option1d"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(3n-3)", ["option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(3n+0)", ["option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(-1n+3)", ["option1a", "option1b", "option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(-n+3)", ["option1a", "option1b", "option1c"] );
	t( "Nth-child", "#form select:first-of-type option:nth-child(-1n + 3)", ["option1a", "option1b", "option1c"] );
});



test("pseudo - :not", function() {

	t( "Not", "a.blog:not(.link)", ["mark"] );
	t( ":not() with :first-child", "#foo p:not(:first-child) .link", ["simon"] );

	t( "Not - multiple", "#form option:not(:contains(Nothing),#option1b,:selected)", ["option1c", "option1d", "option2b", "option2c", "option3d", "option3e", "option4e", "option5b", "option5c"] );
	t( "Not - recursive", "#form option:not(:not(:selected))[id^='option3']", [ "option3b", "option3c"] );

	t( ":not() failing interior", "#qunit-fixture p:not(.foo)", ["firstp","ap","sndp","en","sap","first"] );
	t( ":not() failing interior", "#qunit-fixture p:not(div.foo)", ["firstp","ap","sndp","en","sap","first"] );
	t( ":not() failing interior", "#qunit-fixture p:not(p.foo)", ["firstp","ap","sndp","en","sap","first"] );
	t( ":not() failing interior", "#qunit-fixture p:not(#blargh)", ["firstp","ap","sndp","en","sap","first"] );
	t( ":not() failing interior", "#qunit-fixture p:not(div#blargh)", ["firstp","ap","sndp","en","sap","first"] );
	t( ":not() failing interior", "#qunit-fixture p:not(p#blargh)", ["firstp","ap","sndp","en","sap","first"] );

	t( ":not Multiple", "#qunit-fixture p:not(a)", ["firstp","ap","sndp","en","sap","first"] );
	t( ":not Multiple", "#qunit-fixture p:not( a )", ["firstp","ap","sndp","en","sap","first"] );
	t( ":not Multiple", "#qunit-fixture p:not( p )", [] );
	t( ":not Multiple", "#qunit-fixture p:not(a, b)", ["firstp","ap","sndp","en","sap","first"] );
	t( ":not Multiple", "#qunit-fixture p:not(a, b, div)", ["firstp","ap","sndp","en","sap","first"] );
	t( ":not Multiple", "p:not(p)", [] );
	t( ":not Multiple", "p:not(a,p)", [] );
	t( ":not Multiple", "p:not(p,a)", [] );
	t( ":not Multiple", "p:not(a,p,b)", [] );

	t( "No element not selector", ".container div:not(.excluded) div", [] );

	t( ":not() Existing attribute", "#form select:not([multiple])", ["select1", "select2", "select5"]);
	t( ":not() Equals attribute", "#form select:not([name=select1])", ["select2", "select3", "select4","select5"]);
	t( ":not() Equals quoted attribute", "#form select:not([name='select1'])", ["select2", "select3", "select4", "select5"]);

	t( ":not() Multiple Class", "#foo a:not(.blog)", ["yahoo", "anchor2"] );
	t( ":not() Multiple Class", "#foo a:not(.link)", ["yahoo", "anchor2"] );
	t( ":not() Multiple Class", "#foo a:not(.blog.link)", ["yahoo", "anchor2"] );

	t( ":not chaining", "#form select:not(.select1):contains(Nothing) > option:not(option)", [] );

	t( "positional :not()", "#foo p:not(:last-child)", ["sndp", "en"] );
	t( "positional :not() prefix", "#foo p:not(:last-child) a", ["yahoo"] );
	t( "compound positional :not()", "#foo p:not(:first-child, :last-child)", ["en"] );
	t( "compound positional :not()", "#foo p:not(:first-child, :nth-child(even))", ["sap"] );
	t( "reordered compound positional :not()", "#foo p:not(:nth-child(odd), :first-child)", ["en"] );

	t( "positional :not() with pre-filter", "#foo p:not([id]:first-child)", ["en", "sap"] );
});
test("pseudo - position", function() {

	t( "First element", "#body > div:first-of-type", ["qunit-testrunner-toolbar"] );
	t( "First element(case-insensitive)", "#body > div:first-of-type", ["qunit-testrunner-toolbar"] );
	t( "nth Element", "#qunit-fixture > p:nth-child(2)", ["ap"] );
	t( "First Element", "#qunit-fixture>p:first-child", ["firstp"] );


	// jQuery #12526
	var context = jQuery("#qunit-fixture").append("<div id='jquery12526'></div>")[0];
	deepEqual( nes._get( "div[id*=jquery12526]", context), q("jquery12526"), "Post-manipulation positional" );
});


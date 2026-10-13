jQuery(function ($) {
  const $classCheck = $("#class-check");
  const $classList = $("#class-list");
  const selectors = {
    one: "=",
    two: "*=",
    three: "|=",
    four: "^=",
    five: "$=",
    six: "~="
  };

function getClasses() {
	return $classList
		.val()
		.split(/[\r\n,]+/)
		.map(value => value.trim())
		.filter(Boolean);
}


function update() {

	const checkValue = $classCheck.val().trim();
	const classes = getClasses();

	$('.exemple').each(function () {

		const $example = $(this);

		const type = Object.keys(selectors).find(key =>
			$example.hasClass(key)
		);

		if (!type) {
			return;
		}


		// Selector label
		$example.find('.selector').text(
			`[class${selectors[type]}"${checkValue}"]`
		);


		// Rebuild examples
		const $items = $example.find('.items').empty();

		classes.forEach(className => {

			$('<p>')
				.attr('class', className)
				.text(className)
				.appendTo($items);

		});


		// Highlight matches
		if (checkValue) {

			const selector =
				`p[class${selectors[type]}"${CSS.escape(checkValue)}"]`;

			$items.find(selector).css('color', '#00f');

		}

	});

}


  $classCheck.on("input", update);
  $classList.on("input", update);
  update();
});

/*jQuery(function ($) {
  

  const $input = $('#class-check');

  const selectors = {
    one: '=',
    two: '*=',
    three: '|=',
    four: '^=',
    five: '$=',
    six: '~='
  };

  function updateSelectors() {

    const value = $input.val().trim();

    $('.exemple').each(function () {

      const $example = $(this);
      const type = Object.keys(selectors).find(key =>
        $example.hasClass(key)
      );

      if (!type) {
        return;
      }

      // Update displayed selector
      $example.find('.selector').text(
        `[class${selectors[type]}"${value}"]`
      );

      // Remove previous highlighting
      $example.find('p').css('color', '');

      if (!value) {
        return;
      }

      // Build the actual CSS selector
      const selector = `p[class${selectors[type]}"${CSS.escape(value)}"]`;

      // Apply highlighting
      $example.find(selector).css('color', '#00f');
    });
  }

  $input.on('input', updateSelectors);

  updateSelectors();

});*/

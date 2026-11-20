jQuery(document).ready(function () {
    // ─── Unicode data ────────────────────────────────────────────────────
    const UNICODE_NOTES = {
        0x0020: {
            notes: ['sometimes considered a control code', 'other space characters: U+2000–U+200A'],
            related: [
                ['U+00A0', 'no-break space'],
                ['U+200B', 'zero width space'],
                ['U+202F', 'narrow no-break space'],
                ['U+2060', 'word joiner'],
                ['U+2420', 'symbol for space'],
                ['U+2422', 'blank symbol'],
                ['U+2423', 'open box'],
                ['U+3000', 'ideographic space'],
                ['U+FEFF', 'zero width no-break space']
            ]
        },
        0x00a0: {
            notes: ['non-breaking space — prevents line break'],
            related: [
                ['U+0020', 'regular space'],
                ['U+202F', 'narrow no-break space']
            ]
        },
        0x0009: { notes: ['horizontal tab, width is font/context-defined'] },
        0x000a: { notes: ['line feed — newline on Unix/Linux/macOS'] },
        0x000d: { notes: ['carriage return — newline on older Mac OS; CR+LF used on Windows'] },
        0x200b: {
            notes: ['zero-width — invisible, used for word-break hints in long strings'],
            related: [['U+FEFF', 'zero width no-break space']]
        },
        0xfeff: { notes: ['byte order mark (BOM) or zero-width no-break space'] },
        0x2019: {
            notes: ["'right single quotation mark' — often confused with apostrophe (U+0027)"],
            related: [
                ['U+0027', 'apostrophe/single quote'],
                ['U+2018', 'left single quotation mark']
            ]
        },
        0x201c: {
            notes: ['left double quotation mark — the "smart" opening quote'],
            related: [['U+201D', 'right double quotation mark']]
        },
        0x2014: {
            notes: ['em dash — used for parenthetical phrases and breaks'],
            related: [
                ['U+2013', 'en dash'],
                ['U+002D', 'hyphen-minus']
            ]
        },
        0x2013: {
            notes: ['en dash — used for ranges (pages 10–20)'],
            related: [
                ['U+2014', 'em dash'],
                ['U+002D', 'hyphen-minus']
            ]
        },
        0x00ad: { notes: ['soft hyphen — invisible, hints where a word may break'] },
        0x0000: { notes: ['null character — string terminator in C; avoid in most contexts'] }
    };

    const CATEGORY_NAMES = {
        Lu: 'Uppercase Letter',
        Ll: 'Lowercase Letter',
        Lt: 'Titlecase Letter',
        Lm: 'Modifier Letter',
        Lo: 'Other Letter',
        Mn: 'Non-Spacing Mark',
        Mc: 'Spacing Mark',
        Me: 'Enclosing Mark',
        Nd: 'Decimal Number',
        Nl: 'Letter Number',
        No: 'Other Number',
        Pc: 'Connector Punctuation',
        Pd: 'Dash Punctuation',
        Ps: 'Open Punctuation',
        Pe: 'Close Punctuation',
        Pi: 'Initial Punctuation',
        Pf: 'Final Punctuation',
        Po: 'Other Punctuation',
        Sm: 'Math Symbol',
        Sc: 'Currency Symbol',
        Sk: 'Modifier Symbol',
        So: 'Other Symbol',
        Zs: 'Space Separator',
        Zl: 'Line Separator',
        Zp: 'Paragraph Separator',
        Cc: 'Control',
        Cf: 'Format',
        Cs: 'Surrogate',
        Co: 'Private Use',
        Cn: 'Unassigned'
    };

    // ─── Helpers ─────────────────────────────────────────────────────────
    function toHex(n, pad = 4) {
        return n.toString(16).toUpperCase().padStart(pad, '0');
    }
    function toOct(n) {
        return '\\0' + n.toString(8).padStart(3, '0');
    }
    function toBin(n) {
        return n.toString(2).padStart(8, '0').replace(/.{4}/g, '$& ').trim();
    }
    function toHTMLEntity(n) {
        return `&#x${toHex(n)};`;
    }
    function isControl(cp) {
        return cp < 0x20 || (cp >= 0x7f && cp <= 0x9f);
    }
    function isWhitespace(cp) {
        return (
            [0x20, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0xa0, 0x2028, 0x2029].includes(cp) || (cp >= 0x2000 && cp <= 0x200a)
        );
    }

    function getCharInfo(char) {
        const cp = char.codePointAt(0);
        const hex = toHex(cp);
        const name = getCharName(cp);
        const block = getBlock(cp);
        const extra = UNICODE_NOTES[cp] || {};
        return {
            char,
            cp,
            hex,
            name,
            block,
            decimal: cp,
            octal: toOct(cp),
            binary: toBin(cp),
            htmlEntity: toHTMLEntity(cp),
            cssEscape: `\\${hex}`,
            jsEscape: `\\u{${hex}}`,
            utf8: getUTF8(cp),
            notes: extra.notes || [],
            related: extra.related || [],
            isControl: isControl(cp),
            isWhitespace: isWhitespace(cp)
        };
    }

    function getUTF8(cp) {
        const enc = new TextEncoder();
        const bytes = enc.encode(String.fromCodePoint(cp));
        return Array.from(bytes)
            .map((b) => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
            .join(' ');
    }

    function getCharName(cp) {
        const names = {
            0x0009: 'TAB',
            0x000a: 'LINE FEED',
            0x000d: 'CARRIAGE RETURN',
            0x001b: 'ESCAPE',
            0x007f: 'DELETE',
            0x0020: 'SPACE',
            0x00a0: 'NO-BREAK SPACE',
            0x200b: 'ZERO WIDTH SPACE',
            0x200c: 'ZERO WIDTH NON-JOINER',
            0x200d: 'ZERO WIDTH JOINER',
            0x2028: 'LINE SEPARATOR',
            0x2029: 'PARAGRAPH SEPARATOR',
            0x202f: 'NARROW NO-BREAK SPACE',
            0x2060: 'WORD JOINER',
            0xfeff: 'ZERO WIDTH NO-BREAK SPACE / BOM',
            0x0021: 'EXCLAMATION MARK',
            0x0022: 'QUOTATION MARK',
            0x0023: 'NUMBER SIGN',
            0x0024: 'DOLLAR SIGN',
            0x0025: 'PERCENT SIGN',
            0x0026: 'AMPERSAND',
            0x0027: 'APOSTROPHE',
            0x0028: 'LEFT PARENTHESIS',
            0x0029: 'RIGHT PARENTHESIS',
            0x002a: 'ASTERISK',
            0x002b: 'PLUS SIGN',
            0x002c: 'COMMA',
            0x002d: 'HYPHEN-MINUS',
            0x002e: 'FULL STOP',
            0x002f: 'SOLIDUS',
            0x003a: 'COLON',
            0x003b: 'SEMICOLON',
            0x003c: 'LESS-THAN SIGN',
            0x003d: 'EQUALS SIGN',
            0x003e: 'GREATER-THAN SIGN',
            0x003f: 'QUESTION MARK',
            0x0040: 'COMMERCIAL AT',
            0x005b: 'LEFT SQUARE BRACKET',
            0x005c: 'REVERSE SOLIDUS',
            0x005d: 'RIGHT SQUARE BRACKET',
            0x005e: 'CIRCUMFLEX ACCENT',
            0x005f: 'LOW LINE',
            0x0060: 'GRAVE ACCENT',
            0x007b: 'LEFT CURLY BRACKET',
            0x007c: 'VERTICAL LINE',
            0x007d: 'RIGHT CURLY BRACKET',
            0x007e: 'TILDE',
            0x00a9: 'COPYRIGHT SIGN',
            0x00ae: 'REGISTERED SIGN',
            0x00b0: 'DEGREE SIGN',
            0x00b7: 'MIDDLE DOT',
            0x00d7: 'MULTIPLICATION SIGN',
            0x00f7: 'DIVISION SIGN',
            0x2018: 'LEFT SINGLE QUOTATION MARK',
            0x2019: 'RIGHT SINGLE QUOTATION MARK',
            0x201c: 'LEFT DOUBLE QUOTATION MARK',
            0x201d: 'RIGHT DOUBLE QUOTATION MARK',
            0x2013: 'EN DASH',
            0x2014: 'EM DASH',
            0x2026: 'HORIZONTAL ELLIPSIS',
            0x2022: 'BULLET',
            0x25cf: 'BLACK CIRCLE',
            0x2192: 'RIGHTWARDS ARROW',
            0x2190: 'LEFTWARDS ARROW',
            0x2191: 'UPWARDS ARROW',
            0x2193: 'DOWNWARDS ARROW',
            0x2665: 'BLACK HEART SUIT',
            0x2764: 'HEAVY BLACK HEART',
            0x00ad: 'SOFT HYPHEN',
            0x0000: 'NULL',
            0x2420: 'SYMBOL FOR SPACE',
            0x2422: 'BLANK SYMBOL',
            0x2423: 'OPEN BOX',
            0x3000: 'IDEOGRAPHIC SPACE'
        };
        if (names[cp]) return names[cp];
        if (cp >= 0x0041 && cp <= 0x005a) return 'LATIN CAPITAL LETTER ' + String.fromCodePoint(cp);
        if (cp >= 0x0061 && cp <= 0x007a) return 'LATIN SMALL LETTER ' + String.fromCodePoint(cp).toUpperCase();
        if (cp >= 0x0030 && cp <= 0x0039) return 'DIGIT ' + String.fromCodePoint(cp);
        if (cp >= 0x1f600 && cp <= 0x1f64f) return 'EMOJI (emoticon)';
        if (cp >= 0x1f300 && cp <= 0x1f5ff) return 'EMOJI (misc symbol)';
        if (cp >= 0x1f680 && cp <= 0x1f6ff) return 'EMOJI (transport/map)';
        if (cp >= 0x1f900 && cp <= 0x1f9ff) return 'EMOJI (supplemental)';
        if (cp >= 0x00c0 && cp <= 0x00ff) return 'LATIN EXTENDED CHARACTER';
        if (cp >= 0x0100 && cp <= 0x017f) return 'LATIN EXTENDED-A CHARACTER';
        if (cp >= 0x0400 && cp <= 0x04ff) return 'CYRILLIC CHARACTER';
        if (cp >= 0x0600 && cp <= 0x06ff) return 'ARABIC CHARACTER';
        if (cp >= 0x4e00 && cp <= 0x9fff) return 'CJK UNIFIED IDEOGRAPH';
        if (cp >= 0x3040 && cp <= 0x309f) return 'HIRAGANA CHARACTER';
        if (cp >= 0x30a0 && cp <= 0x30ff) return 'KATAKANA CHARACTER';
        if (cp < 0x20) return `CONTROL CHARACTER (C0)`;
        if (cp >= 0x80 && cp <= 0x9f) return `CONTROL CHARACTER (C1)`;
        return `CHARACTER U+${toHex(cp)}`;
    }

    function getBlock(cp) {
        if (cp <= 0x007f) return 'Basic Latin';
        if (cp <= 0x00ff) return 'Latin-1 Supplement';
        if (cp <= 0x017f) return 'Latin Extended-A';
        if (cp <= 0x024f) return 'Latin Extended-B';
        if (cp <= 0x02af) return 'IPA Extensions';
        if (cp <= 0x036f) return 'Combining Diacritical Marks';
        if (cp <= 0x03ff) return 'Greek and Coptic';
        if (cp <= 0x04ff) return 'Cyrillic';
        if (cp <= 0x05ff) return 'Hebrew / Armenian';
        if (cp <= 0x06ff) return 'Arabic';
        if (cp <= 0x09ff) return 'South Asian Scripts';
        if (cp <= 0x0fff) return 'SE/E Asian Scripts';
        if (cp <= 0x1fff) return 'Latin Extended Additional / Greek Extended';
        if (cp <= 0x2bff) return 'General Punctuation / Symbols';
        if (cp <= 0x2fff) return 'CJK Radicals / Kangxi';
        if (cp <= 0x4dbf) return 'CJK Unified Ideographs Extension A';
        if (cp <= 0x9fff) return 'CJK Unified Ideographs';
        if (cp <= 0xd7ff) return 'Korean (Hangul)';
        if (cp <= 0xf8ff) return 'Private Use Area';
        if (cp <= 0xffff) return 'Compatibility Forms';
        if (cp <= 0x1ffff) return 'Supplementary Multilingual Plane';
        return 'Supplementary Plane';
    }

    // ─── Code generation ─────────────────────────────────────────────────
    function escapeForRegex(char) {
        return char.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&');
    }

    function generateCode(info, lang) {
        const { char, cp, hex, htmlEntity, isControl, isWhitespace } = info;
        const escaped = isControl || isWhitespace ? `\\u{${hex}}` : char;
        const safeChar = isControl ? `\\u{${hex}}` : char;
        const litOrEsc = isControl ? `"\\u{${hex}}"` : `"${char}"`;
        const regexEsc = isControl || char === '\\' ? `\\u{${hex}}` : escapeForRegex(char);

        if (lang === 'js') {
            return `<span class="cm">// Character: U+${hex} ${info.name}</span>
<span class="cm">// Replace ALL occurrences in a string</span>
<span class="kw">const</span> str = <span class="str">"Your string here"</span>;
<span class="kw">const</span> replaced = str.<span class="fn">replaceAll</span>(<span class="str">${litOrEsc}</span>, <span class="str">""</span>);

<span class="cm">// Replace using regex (supports flags: g = all, i = case-insensitive)</span>
<span class="kw">const</span> result = str.<span class="fn">replace</span>(<span class="rx">/[${regexEsc}]/gu</span>, <span class="str">""</span>);

<span class="cm">// Check if string contains the character</span>
<span class="kw">const</span> has = str.<span class="fn">includes</span>(<span class="str">${litOrEsc}</span>);

<span class="cm">// Codepoint: ${cp} (0x${hex})</span>
<span class="str">"${escaped}"</span>.<span class="fn">codePointAt</span>(<span class="rx">0</span>); <span class="cm">// → ${cp}</span>`;
        }

        if (lang === 'jquery') {
            return `<span class="cm">// Character: U+${hex} ${info.name}</span>
<span class="cm">// Strip character from an input field</span>
$(<span class="str">'input'</span>).<span class="fn">on</span>(<span class="str">'input'</span>, <span class="kw">function</span>() {
  <span class="kw">let</span> val = $(<span class="kw">this</span>).<span class="fn">val</span>();
  val = val.<span class="fn">replace</span>(<span class="rx">/[${regexEsc}]/gu</span>, <span class="str">''</span>);
  $(<span class="kw">this</span>).<span class="fn">val</span>(val);
});

<span class="cm">// Strip from element text content</span>
$(<span class="str">'.my-element'</span>).<span class="fn">text</span>(<span class="kw">function</span>(_, t) {
  <span class="kw">return</span> t.<span class="fn">replace</span>(<span class="rx">/[${regexEsc}]/gu</span>, <span class="str">''</span>);
});`;
        }

        if (lang === 'php') {
            const phpChar = isControl ? `\\u{${hex}}` : char.replace(/'/g, "\\'");
            return `<?php
<span class="cm">// Character: U+${hex} ${info.name}</span>

<span class="cm">// Replace all occurrences</span>
<span class="kw">$str</span> = <span class="str">"Your string here"</span>;
<span class="kw">$result</span> = <span class="fn">str_replace</span>(<span class="fn">mb_chr</span>(<span class="rx">${cp}</span>), <span class="str">''</span>, <span class="kw">$str</span>);

<span class="cm">// Using regex (preg_replace)</span>
<span class="kw">$result</span> = <span class="fn">preg_replace</span>(<span class="str">'/\\x{${hex}}/u'</span>, <span class="str">''</span>, <span class="kw">$str</span>);

<span class="cm">// Check if string contains the character</span>
<span class="kw">$has</span> = <span class="fn">mb_strpos</span>(<span class="kw">$str</span>, <span class="fn">mb_chr</span>(<span class="rx">${cp}</span>)) !== <span class="kw">false</span>;

<span class="cm">// Get codepoint from char</span>
<span class="fn">mb_ord</span>(<span class="str">'${phpChar}'</span>); <span class="cm">// → ${cp}</span>`;
        }

        if (lang === 'html') {
            return `&lt;!-- Character: U+${hex} ${info.name} --&gt;

&lt;!-- HTML entity (hex) --&gt;
${htmlEntity}

&lt;!-- HTML entity (decimal) --&gt;
&amp;#${cp};

&lt;!-- CSS content property --&gt;
&lt;style&gt;
  .my-element::before {
    content: "\\${hex}";  <span class="cm">/* Unicode escape */</span>
  }
&lt;/style&gt;

&lt;!-- Strip with JS in HTML context --&gt;
&lt;script&gt;
  <span class="kw">const</span> clean = el.textContent.<span class="fn">replace</span>(<span class="rx">/[${regexEsc}]/gu</span>, <span class="str">''</span>);
&lt;/script&gt;`;
        }

        return '';
    }

    // ─── Render ──────────────────────────────────────────────────────────
    function renderSummary(chars) {
        const infos = chars.map(getCharInfo);
        const allHex = infos.map((i) => `U+${i.hex}`).join(' ');
        const allEntities = infos.map((i) => i.htmlEntity).join('');
        return `
    <div class="summary-bar">
      <span class="label">${infos.length} char${infos.length > 1 ? 's' : ''}</span>
      <div class="summary-chips">
        ${infos.map((i) => `<span class="chip accent" title="U+${i.hex}">${escHtml(i.char)}</span>`).join('')}
        <span class="chip" title="Codepoints">${escHtml(allHex)}</span>
        <span class="chip" title="HTML entities">${escHtml(allEntities)}</span>
      </div>
      <button class="code-copy-btn" data-copy="${escAttr(allEntities)}" title="Copy all entities">
        ⎘ Entities
      </button>
    </div>`;
    }

    function renderCard(char, idx) {
        const info = getCharInfo(char);
        const {
            cp,
            hex,
            name,
            decimal,
            octal,
            binary,
            htmlEntity,
            cssEscape,
            jsEscape,
            utf8,
            notes,
            related,
            isControl,
            isWhitespace
        } = info;

        const glyphContent = isControl
            ? `<div class="char-glyph control">CTL<br>U+${hex}</div>`
            : `<div class="char-glyph">${escHtml(char)}</div>`;

        const blockLabel = getBlock(cp);
        const specialTag = isWhitespace ? 'Whitespace' : isControl ? 'Control Character' : blockLabel;

        const notesHtml =
            notes.length || related.length
                ? `
    <div class="notes-section">
      <div class="notes-title">Notes</div>
      ${notes.map((n) => `<div class="note-item">${escHtml(n)}</div>`).join('')}
      ${related.map(([u, label]) => `<div class="note-item">See also: <a class="note-link" href="https://www.compart.com/en/unicode/${u.toLowerCase()}" target="_blank">${escHtml(u)}</a> ${escHtml(label)}</div>`).join('')}
    </div>`
                : '';

        const langs = ['js', 'jquery', 'php', 'html'];
        const langLabels = { js: 'JavaScript', jquery: 'jQuery', php: 'PHP', html: 'HTML' };

        const codeTabs = langs
            .map(
                (l, i) =>
                    `<button class="code-tab${i === 0 ? ' active' : ''}" data-lang="${l}" data-card="${idx}">${langLabels[l]}</button>`
            )
            .join('');

        const codeBlocks = langs
            .map(
                (l, i) =>
                    `<div class="code-block-wrap${i === 0 ? ' active' : ''}" data-lang="${l}" data-card="${idx}">
      <pre class="code-block">${generateCode(info, l)}</pre>
      <button class="code-copy-btn" data-copy-code="${l}" data-card="${idx}">⎘ Copy</button>
    </div>`
            )
            .join('');

        return `
  <div class="char-card">
    <div class="card-header">
      ${glyphContent}
      <div class="char-meta">
        <div class="char-name">${escHtml(name)}</div>
        <div class="char-codepoint">
          U+${hex}
          <button class="code-copy-btn" data-copy="U+${hex}" style="position:static;padding:3px 8px;font-size:.72rem;">⎘</button>
        </div>
        <span class="char-category">${escHtml(specialTag)}</span>
      </div>
    </div>
    <div class="encoding-grid">
      ${encCell('Decimal', decimal, decimal)}
      ${encCell('Hex', `0x${hex}`, `0x${hex}`)}
      ${encCell('Octal', octal, octal)}
      ${encCell('Binary', binary, binary)}
      ${encCell('HTML Entity', htmlEntity, htmlEntity)}
      ${encCell('CSS Escape', cssEscape, cssEscape)}
      ${encCell('JS Escape', jsEscape, jsEscape)}
      ${encCell('UTF-8 Bytes', utf8, utf8)}
    </div>
    ${notesHtml}
    <div class="code-section">
      <div class="code-section-title">Code examples — replace / detect this character</div>
      <div class="code-tabs">${codeTabs}</div>
      ${codeBlocks}
    </div>
  </div>`;
    }

    function encCell(label, display, copyVal) {
        return `<div class="enc-cell">
    <span class="enc-label">${label}</span>
    <span class="enc-value">
      <span>${escHtml(String(display))}</span>
      <button class="copy-mini" data-copy="${escAttr(String(copyVal))}" title="Copy">⎘</button>
    </span>
  </div>`;
    }

    function escHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function escAttr(s) {
        return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    }

    // ─── Copy utility ────────────────────────────────────────────────────
    function doCopy(text, $btn) {
        navigator.clipboard.writeText(text).then(() => {
            const orig = $btn.text();
						console.log(orig);
            $btn.addClass('copied').html('✓ Copied');
            // setTimeout(() => $btn.removeClass('copied').text(orig), 1800);

					setTimeout(() => {
						$btn.removeClass('copied');

						setTimeout(() => {
							$btn.text(orig);
						}, 200);
					}, 1800);
					
        });
    }

    // ─── Main logic ──────────────────────────────────────────────────────
    // V2
	function analyze(input) {
    const $results = $('#results');

    if (!input.trim() && input.length === 0) {
        $results.html(
            `<div class="placeholder"><div class="icon">⌨️</div><p>Start typing — results appear instantly.<br>Try pasting <kbd>©</kbd>, <kbd>→</kbd>, or even <kbd> </kbd> (a space).</p></div>`
        );
        return;
    }

    const reverse = $('#reverse-mode').is(':checked');

    let chars = [];

    if (!reverse) {

        chars = [...input];

    } else {

        const mode = $('#decode-mode').val();

        const tokens =
            mode === 'binary'
                ? input.split(/[;\/|\\]+/)
                : input.split(/[\\ ;/|]+/);

        for (const token of tokens) {

            if (!token.trim())
                continue;

            const decoded = decodeValue(token.trim(), mode);

            if (decoded)
                chars.push(...decoded);

        }

    }

    if (!chars.length) {
        $results.html('<div class="placeholder"><p>No valid characters detected.</p></div>');
        return;
    }

    let html = '';

    if (chars.length > 1)
        html += renderSummary(chars);

    chars.forEach((ch, i) => {
        html += renderCard(ch, i);
    });

    $results.html(html);
}
	/* V1
		function analyze(input) {
        const $results = $('#results');

        if (!input.trim() && input.length === 0) {
            $results.html(
                `<div class="placeholder"><div class="icon">⌨️</div><p>Start typing — results appear instantly.<br>Try pasting <kbd>©</kbd>, <kbd>→</kbd>, or even <kbd> </kbd> (a space).</p></div>`
            );
            return;
        }

        // Split into individual codepoints (handles emoji / surrogate pairs)
        const chars = [...input];

        if (chars.length === 0) return;

        let html = '';
        if (chars.length > 1) html += renderSummary(chars);
        chars.forEach((ch, i) => {
            html += renderCard(ch, i);
        });

        $results.html(html);
    }*/


	

	$('#reverse-mode').on('change', function () {
    $('#decode-mode').prop('disabled', !this.checked);
    analyze($('#char-input').val());
});

$('#decode-mode').on('change', function () {
    analyze($('#char-input').val());
});

	function decodeValue(value, mode = "auto") {

    value = value.trim();

    function cp(n, base) {
        return String.fromCodePoint(parseInt(n, base));
    }

    switch (mode) {

        case 'decimal':
            return /^[0-9]+$/.test(value) ? cp(value, 10) : null;

        case 'hex':
            return /^[0-9a-f]+$/i.test(value) ? cp(value, 16) : null;

        case 'unicode':
            return /^U\+([0-9a-f]+)$/i.test(value)
                ? cp(RegExp.$1, 16)
                : null;

        case 'html-dec':
            return /^&#([0-9]+);?$/.test(value)
                ? cp(RegExp.$1, 10)
                : null;

        case 'html-hex':
            return /^&#x([0-9a-f]+);?$/i.test(value)
                ? cp(RegExp.$1, 16)
                : null;

        case 'css':
            return /^\\([0-9a-f]{1,6})$/i.test(value)
                ? cp(RegExp.$1, 16)
                : null;

        case 'js':
            return /^\\u\{([0-9a-f]+)\}$/i.test(value)
                ? cp(RegExp.$1, 16)
                : null;

        case 'binary':
            return /^[01]+$/.test(value)
                ? cp(value, 2)
                : null;

        case 'octal':
            return /^[0-7]+$/.test(value)
                ? cp(value, 8)
                : null;

        case 'utf8': {

            const bytes = value.match(/0x[0-9a-f]{2}/gi);

            if (!bytes)
                return null;

            return new TextDecoder().decode(
                new Uint8Array(
                    bytes.map(v => parseInt(v, 16))
                )
            );
        }

    }

    // ---------- AUTO ----------

    if (/^&#x([0-9a-f]+);?$/i.test(value))
        return cp(RegExp.$1, 16);

    if (/^&#([0-9]+);?$/.test(value))
        return cp(RegExp.$1, 10);

    if (/^\\u\{([0-9a-f]+)\}$/i.test(value))
        return cp(RegExp.$1, 16);

    if (/^\\([0-9a-f]{1,6})$/i.test(value))
        return cp(RegExp.$1, 16);

    if (/^U\+([0-9a-f]+)$/i.test(value))
        return cp(RegExp.$1, 16);

    if (/^0x([0-9a-f]+)$/i.test(value))
        return cp(RegExp.$1, 16);

    if (/^[0-9a-f]+$/i.test(value) && /[a-f]/i.test(value))
        return cp(value, 16);

    if (/^[01]{8,32}$/.test(value))
        return cp(value, 2);

    if (/^0[0-7]+$/.test(value))
        return cp(value, 8);

    if (/^[0-9]+$/.test(value))
        return cp(value, 10);

    if (/^(0x[0-9a-f]{2}\s*)+$/i.test(value)) {

        const bytes = value.match(/0x[0-9a-f]{2}/gi);

        return new TextDecoder().decode(
            new Uint8Array(
                bytes.map(v => parseInt(v, 16))
            )
        );
    }

    return null;
}

	/*
	// V1
	function decodeValue(value, mode = "auto") {
    value = value.trim();

    if (mode === "auto") {
        if (/^&#x([0-9a-f]+);?$/i.test(value))
            return String.fromCodePoint(parseInt(RegExp.$1, 16));

        if (/^&#([0-9]+);?$/.test(value))
            return String.fromCodePoint(parseInt(RegExp.$1, 10));

        if (/^\\u\{([0-9a-f]+)\}$/i.test(value))
            return String.fromCodePoint(parseInt(RegExp.$1, 16));

        if (/^\\([0-9a-f]{1,6})$/i.test(value))
            return String.fromCodePoint(parseInt(RegExp.$1, 16));

        if (/^U\+([0-9a-f]+)$/i.test(value))
            return String.fromCodePoint(parseInt(RegExp.$1, 16));

        if (/^0x([0-9a-f]+)$/i.test(value))
            return String.fromCodePoint(parseInt(RegExp.$1, 16));

        if (/^[0-9a-f]+$/i.test(value) && /[a-f]/i.test(value))
            return String.fromCodePoint(parseInt(value, 16));

        if (/^[01]{8,32}$/.test(value))
            return String.fromCodePoint(parseInt(value, 2));

        if (/^0[0-7]+$/.test(value))
            return String.fromCodePoint(parseInt(value, 8));

        if (/^[0-9]+$/.test(value))
            return String.fromCodePoint(parseInt(value, 10));

        if (/^(0x[0-9a-f]{2}\s*)+$/i.test(value)) {
            const bytes = value.match(/0x[0-9a-f]{2}/gi)
                .map(v => parseInt(v, 16));

            return new TextDecoder().decode(new Uint8Array(bytes));
        }

        return null;
    }

    // explicit mode...
	}*/

    // ─── Events ──────────────────────────────────────────────────────────
    $('#char-input').on('input', function () {
        let val = $(this).val();

				const selectionStart = this.selectionStart;
	
	    // Detect and fix the period inserted by the OS double-space shortcut
		    if (val.includes('. ')) {
		        val = val.replace('. ', '  ');
		        $(this).val(val);
		        
		        // Restore cursor position so the user can keep typing seamlessly
		        this.setSelectionRange(selectionStart, selectionStart);
		    }
			
        $('#clear-btn').toggle(val.length > 0);
        analyze(val);
    });

    $('#clear-btn').on('click', function () {
        $('#char-input').val('').trigger('input').focus();
    });

    // Delegated events
    $(document).on('click', '[data-copy]', function () {
        doCopy($(this).attr('data-copy'), $(this));
    });

    $(document).on('click', '[data-copy-code]', function () {
        const lang = $(this).attr('data-copy-code');
        const card = $(this).attr('data-card');
        const code = $(`.code-block-wrap[data-lang="${lang}"][data-card="${card}"] .code-block`).text();
        doCopy(code, $(this));
    });

    $(document).on('click', '.code-tab', function () {
        const lang = $(this).attr('data-lang');
        const card = $(this).attr('data-card');
        $(`.code-tab[data-card="${card}"]`).removeClass('active');
        $(`.code-block-wrap[data-card="${card}"]`).removeClass('active');
        $(this).addClass('active');
        $(`.code-block-wrap[data-lang="${lang}"][data-card="${card}"]`).addClass('active');
    });

    // Focus input on load
    $('#char-input').focus();
});

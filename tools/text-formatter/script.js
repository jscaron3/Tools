const TAG_CONFIG = [
  { tag: 'strong', keep: true  },
  { tag: 'b',      keep: true  },
  { tag: 'em',     keep: true  },
  { tag: 'i',      keep: true  },
  { tag: 'u',      keep: false },
  { tag: 'p',      keep: true  },
  { tag: 'span',   keep: false },
  { tag: 'div',    keep: false },
  { tag: 'a',      keep: false },
  { tag: 'h1',     keep: false },
  { tag: 'h2',     keep: false },
  { tag: 'h3',     keep: false },
  { tag: 'li',     keep: false },
  { tag: 'ul',     keep: false },
  { tag: 'ol',     keep: false },
];

const $inputTextarea    = $('#input-textarea');
const $inputVisual      = $('#input-visual');
const $inputCodeView    = $('#input-code-view');
const $inputVisualView  = $('#input-visual-view');
const $outputTextarea   = $('#output-textarea');
const $outputVisual     = $('#output-visual');
const $outputCodeView   = $('#output-code-view');
const $outputVisualView = $('#output-visual-view');
const $inputCharCount   = $('#input-char-count');
const $outputCharCount  = $('#output-char-count');
const $btnCopy          = $('#btn-copy-output');
const $btnIndent        = $('#btn-indent-toggle');
const $btnClear         = $('#btn-clear-input');
const $btnReset         = $('#btn-reset-options');
const $tagToggles       = $('#tag-toggles');

let inputViewMode    = 'visual';
let outputViewMode   = 'visual';
let indentCode       = false;
let currentFormatted = '';
let currentRawInput  = '';

const tagKeepState = {};
TAG_CONFIG.forEach(t => { tagKeepState[t.tag] = t.keep; });

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function decodeHtmlEntities(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

function countCodeChars(str) {
  const n = str.length;
  return n === 1 ? '1 char' : `${n.toLocaleString()} chars`;
}

function countVisualChars(str) {
  const tmp = document.createElement('div');
  tmp.innerHTML = str;
  const n = (tmp.textContent || tmp.innerText || '').length;
  return n === 1 ? '1 char' : `${n.toLocaleString()} chars`;
}

function getVisualOutput(str) {
  if ($('#opt-decode-entities').is(':checked')) return decodeHtmlEntities(str);
  return str;
}

const BLOCK_TAGS = new Set(['p','div','section','article','header','footer','nav','main','aside',
  'h1','h2','h3','h4','h5','h6','ul','ol','li','table','thead','tbody','tfoot',
  'tr','th','td','blockquote','pre','figure','figcaption','form','fieldset']);

function indentHtml(html) {
  if (!html.trim()) return html;
  const tokens = html.match(/<[^>]+>|[^<]+/g) || [];
  let indent = 0;
  const lines = [];
  let inline = '';
  const pad = n => '  '.repeat(Math.max(0, n));

  function flushInline() {
    const t = inline.trim();
    if (t) lines.push(pad(indent) + t);
    inline = '';
  }

  tokens.forEach(token => {
    if (!token.startsWith('<')) { inline += token; return; }
    const isClose = token.startsWith('</');
    const tagMatch = token.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/);
    const tag = tagMatch ? tagMatch[1].toLowerCase() : '';
    const isSelfClose = /\/>$/.test(token) || tag === 'br' || tag === 'hr' || tag === 'img' || tag === 'input';
    const isBlock = BLOCK_TAGS.has(tag);

    if (isBlock) {
      flushInline();
      if (isClose) {
        indent = Math.max(0, indent - 1);
        lines.push(pad(indent) + token);
      } else if (isSelfClose) {
        lines.push(pad(indent) + token);
      } else {
        lines.push(pad(indent) + token);
        indent++;
      }
    } else {
      inline += token;
    }
  });
  flushInline();
  return lines.join('\n').trim();
}

function getOutputDisplay() {
  return (indentCode && outputViewMode === 'code') ? indentHtml(currentFormatted) : currentFormatted;
}

function formatText(input) {
  let text = input;
  if (!text.trim()) return '';

  const opts = getOptions();

  if (opts.normalizeNbsp) {
    text = text.replace(/&nbsp;/gi, ' ').replace(/\u00a0/g, ' ');
  }

  if (opts.replaceWeirdSpaces) {
    // text = text.replace(/[\u0080-\u009F]/g, ' ');
    // text = text.replace(/[\u00E2\u0080\u00A8]/g, '');
    text = text.replace(/[\u2028\u2029]/g, ' ').replace(/[\u00A0\u202F]/g, ' ');

    
    text = text.replace(/\u2022/g, ''); // •
  }

  if (opts.removeStyles) {
    text = text.replace(/(<[^>]+?)\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '$1');
  }

  if (opts.removeAttrs) {
    text = text.replace(/(<[^>]+?)\s+class\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '$1');
    text = text.replace(/(<[^>]+?)\s+id\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '$1');
  }

  const keepTags = Object.entries(tagKeepState).filter(([,k])=>k).map(([t])=>t);

  text = text.replace(/<br\s*\/?>/gi, '__BR__');

  const PLACEHOLDERS = {};
  let _phIdx = 0;
  keepTags.forEach(tag => {
    const phc = `__TAG_${tag.toUpperCase()}_CLOSE__`;
    PLACEHOLDERS[phc] = `</${tag}>`;
    text = text.replace(new RegExp(`<\\/${tag}>`, 'gi'), phc);
    text = text.replace(new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi'), match => {
      const ph = `__TAGOPEN_${_phIdx++}__`;
      PLACEHOLDERS[ph] = match.replace(new RegExp(`^<${tag}`, 'i'), `<${tag.toLowerCase()}`);
      return ph;
    });
  });

  text = text.replace(/<[^>]+>/g, '');

  Object.entries(PLACEHOLDERS).forEach(([ph, orig]) => {
    text = text.split(ph).join(orig);
  });

  text = text.split('__BR__').join('<br>');

  if (opts.emptyTags) {
    let prev;
    do {
      prev = text;
      keepTags.forEach(tag => {
        const re = new RegExp(`<${tag}>\\s*(&nbsp;\\s*)*<\\/${tag}>`, 'gi');
        text = text.replace(re, '');
      });
      text = text.replace(/<(\w+)>(\s|&nbsp;)*<\/\1>/gi, '');
    } while (text !== prev);
  }

  if (opts.flattenNested) {
    keepTags.forEach(tag => {
      let prev;
      do {
        prev = text;
        text = text.replace(new RegExp(`<${tag}(\\s[^>]*)?>\\s*<${tag}(\\s[^>]*)?>`, 'gi'), `<${tag}>`);
        text = text.replace(new RegExp(`<\\/${tag}>\\s*<\\/${tag}>`, 'gi'), `</${tag}>`);
      } while (text !== prev);
    });
  }

  if (opts.consecutiveBr) {
    text = text.replace(/(<br>\s*){2,}/gi, '<br>');
  }

  if (opts.straightenQuotes) {
    text = text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013/g, '-')
      .replace(/\u2014/g, '--');
  }

  let lines = text.split('\n');
  if (opts.trimLines) lines = lines.map(l => l.trim());
  if (opts.emptyLines) lines = lines.filter(l => l.replace(/&nbsp;/gi,'').replace(/<br>/gi,'').trim().length > 0);
  // Compact output: collapse lines into a single line.
  // indentHtml() re-introduces newlines when Indent is toggled on.
  text = lines.join(' ');
  if (opts.extraSpaces) text = text.replace(/[ \t]{2,}/g, ' ');
  text = applyCase(text, opts.caseMode);
  return text.trim();
}

function applyCase(text, mode) {
  if (mode === 'none') return text;
  const parts = text.split(/(<[^>]+>)/);

  switch (mode) {
    case 'lowercase':
      return parts.map((p,i) => i%2===0 ? p.toLowerCase() : p).join('');
    case 'uppercase':
      return parts.map((p,i) => i%2===0 ? p.toUpperCase() : p).join('');
    case 'capitalize-first': {
      let done = false;
      return parts.map((p,i) => {
        if (i%2===0 && !done && p.trim()) {
          done = true;
          return p.replace(/^(\s*)(\S)/, (m,ws,c) => ws + c.toUpperCase());
        }
        return p;
      }).join('');
    }
    case 'title': {
      const small = new Set(['a','an','the','and','but','or','for','nor','on','at','to','by','in','of','up','as','is','it']);
      return parts.map((p,i) => {
        if (i%2!==0) return p;
        return p.replace(/\b\w+/g, (word, offset) => {
          if (offset===0 || !small.has(word.toLowerCase())) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          return word.toLowerCase();
        });
      }).join('');
    }
    case 'sentence': {
      let result = parts.map((p,i) => i%2===0 ? p.toLowerCase() : p).join('');
      return result.replace(/(^|[.!?]\s+)([a-z])/g, (m,pre,c) => pre + c.toUpperCase());
    }
    default: return text;
  }
}

function getOptions() {
  return {
    caseMode:         $('#opt-case').val(),
    emptyTags:        $('#opt-empty-tags').is(':checked'),
    replaceWeirdSpaces: $('#opt-replace-weird-spaces').is(':checked'),
    extraSpaces:      $('#opt-extra-spaces').is(':checked'),
    emptyLines:       $('#opt-empty-lines').is(':checked'),
    consecutiveBr:    $('#opt-consecutive-br').is(':checked'),
    trimLines:        $('#opt-trim-lines').is(':checked'),
    normalizeNbsp:    $('#opt-normalize-nbsp').is(':checked'),
    decodeEntities:   $('#opt-decode-entities').is(':checked'),
    straightenQuotes: $('#opt-straighten-quotes').is(':checked'),
    removeStyles:     $('#opt-remove-styles').is(':checked'),
    removeAttrs:      $('#opt-remove-attrs').is(':checked'),
    flattenNested:    $('#opt-flatten-nested').is(':checked'),
  };
}

function buildTagToggles() {
  $tagToggles.empty();
  TAG_CONFIG.forEach(({ tag }) => {
    const kept = tagKeepState[tag];
    const $badge = $(`
      <label class="tag-badge ${kept ? 'is-kept' : 'is-stripped'}" data-tag="${tag}" title="${kept ? 'Kept — click to strip' : 'Stripped — click to keep'}">
        <input type="checkbox" ${kept ? 'checked' : ''} class="sr-only" />
        <em class="tag-icon">${kept ? '✓' : '✕'}</em>&lt;${tag}&gt;
      </label>
    `);
    $tagToggles.append($badge);
  });
}

$inputTextarea.on('input', function () {
  currentRawInput = this.value;
  triggerFormat();
});

$inputVisual.on('input', function () {
  currentRawInput = this.innerHTML;
  $inputTextarea.val(currentRawInput);
  triggerFormat('visual');
});

$inputVisual.on('blur', function () {
  if (this.innerHTML === '<br>' || this.innerHTML.trim() === '') {
    this.innerHTML = '';
    $inputTextarea.val('');
    triggerFormat('visual');
  }
});

function switchView(view) {
  inputViewMode = view;
  $('[data-target="input"]').removeClass('active').attr('aria-selected', 'false');
  $(`[data-target="input"][data-view="${view}"]`).addClass('active').attr('aria-selected', 'true');

  if (view === 'visual') {
    $inputCodeView.removeClass('active');
    $inputVisualView.addClass('active');
    $inputVisual.html(currentRawInput);
  } else {
    currentRawInput = $inputVisual.html();
    $inputTextarea.val(indentCode ? indentHtml(currentRawInput) : currentRawInput);
    $inputVisualView.removeClass('active');
    $inputCodeView.addClass('active');
  }

  outputViewMode = view;
  $('[data-target="output"]').removeClass('active').attr('aria-selected', 'false');
  $(`[data-target="output"][data-view="${view}"]`).addClass('active').attr('aria-selected', 'true');

  if (view === 'visual') {
    $outputCodeView.removeClass('active');
    $outputVisualView.addClass('active');
  } else {
    $outputVisualView.removeClass('active');
    $outputCodeView.addClass('active');
    $outputTextarea.val(getOutputDisplay());
  }

  $('.is-output').toggleClass('is-code-mode', view === 'code');

  $inputCharCount.text(view === 'code' ? countCodeChars(currentRawInput) : countVisualChars(currentRawInput));
  $outputCharCount.text(view === 'code' ? countCodeChars(currentFormatted) : countVisualChars(currentFormatted));
}

$(document).on('click', '.tab-btn', function () {
  switchView($(this).data('view'));
});

jQuery('.toggle-label').click(function(){
	jQuery(this).parent().find('input').prop('checked', function(i, value) {
        return !value;
    });
});

$tagToggles.on('change', 'input[type="checkbox"]', function () {
  const $badge = $(this).closest('.tag-badge');
  const tag = $badge.data('tag');
  const nowKeep = this.checked;
  tagKeepState[tag] = nowKeep;
  $badge
    .toggleClass('is-kept', nowKeep)
    .toggleClass('is-stripped', !nowKeep)
    .attr('title', nowKeep ? 'Kept — click to strip' : 'Stripped — click to keep');
  $badge.find('.tag-icon').text(nowKeep ? '✓' : '✕');
  triggerFormat();
});

$('#sidebar, .sidebar').on('change', 'select, input[type="checkbox"]:not(.sr-only)', function () {
  triggerFormat();
});

$('.sidebar').on('change', 'select, input[type="checkbox"]:not(.sr-only)', function () {
  triggerFormat();
});

$('aside').on('change', 'select, input[type="checkbox"]:not(.sr-only)', function () {
  triggerFormat();
});

$btnIndent.on('click', function () {
  indentCode = !indentCode;
  $btnIndent.toggleClass('active', indentCode);
  if (inputViewMode === 'code') $inputTextarea.val(indentCode ? indentHtml(currentRawInput) : currentRawInput);
  $outputTextarea.val(getOutputDisplay());
});

$btnCopy.on('click', function () {
  let textToCopy = outputViewMode === 'visual' ? $outputVisual.text() : currentFormatted;
  if (!textToCopy) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(flashCopied);
  } else {
    const tmp = document.createElement('textarea');
    tmp.value = textToCopy;
    tmp.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    flashCopied();
  }
});

function flashCopied() {
  $btnCopy.addClass('copied').html(`
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="1,7 5,11 13,3"/>
    </svg>
    Copied
  `);
  setTimeout(() => {
    $btnCopy.removeClass('copied').html(`
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M2 10V2h8"/>
      </svg>
      Copy
    `);
  }, 1800);
}

$btnClear.on('click', function () {
  currentRawInput = '';
  $inputTextarea.val('');
  $inputVisual.html('');
  $inputCharCount.text('0 chars');
  triggerFormat();
});

$btnReset.on('click', function () {
  $('#opt-case').val('none');
  $('#opt-empty-tags').prop('checked', true);
  $('#opt-extra-spaces').prop('checked', true);
  $('#opt-empty-lines').prop('checked', true);
  $('#opt-consecutive-br').prop('checked', true);
  $('#opt-trim-lines').prop('checked', true);
  $('#opt-normalize-nbsp').prop('checked', false);
  $('#opt-decode-entities').prop('checked', false);
  $('#opt-straighten-quotes').prop('checked', false);
  $('#opt-remove-styles').prop('checked', true);
  $('#opt-remove-attrs').prop('checked', true);
  $('#opt-flatten-nested').prop('checked', true);
  TAG_CONFIG.forEach(t => { tagKeepState[t.tag] = t.keep; });
  buildTagToggles();
  triggerFormat();
});

function triggerFormat() {
  const raw = $inputTextarea.val();
  $inputCharCount.text(inputViewMode === 'code' ? countCodeChars(currentRawInput) : countVisualChars(currentRawInput));
  currentFormatted = formatText(raw);
  $outputTextarea.val(getOutputDisplay());
  $outputVisual.html(getVisualOutput(currentFormatted));
  $outputCharCount.text(outputViewMode === 'code' ? countCodeChars(currentFormatted) : countVisualChars(currentFormatted));
}

buildTagToggles();
$inputVisual.trigger('focus');
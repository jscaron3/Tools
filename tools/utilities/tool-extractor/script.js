(function(){

  // var extracted = { head:'', extScripts:'', style:'', inlineScript:'', bodyMarkup:'' };
  // var found = { head:false, extScripts:false, style:false, inlineScript:false, bodyMarkup:false };
	
	var extracted = {
  title:'',
  links:'',
  extScripts:'',
  style:'',
  inlineScript:'',
  bodyMarkup:''
};

var found = {
  title:false,
  links:false,
  extScripts:false,
  style:false,
  inlineScript:false,
  bodyMarkup:false
};

  function findBlock(text, tagName){
    var re = new RegExp('<' + tagName + '\\b[^>]*>[\\s\\S]*?<\\/' + tagName + '>', 'i');
    var m = re.exec(text);
    return m ? m[0] : null;
  }

  // Collects full tag matches, extending each match backwards to include
  // its leading indentation (spaces/tabs) so the copied text keeps its
  // original alignment.
  function extractWithIndent(text, re){
    var out = [];
    var m;
    while ((m = re.exec(text)) !== null){
      var start = m.index;
      while (start > 0 && (text[start-1] === ' ' || text[start-1] === '\t')) start--;
      out.push(text.slice(start, m.index + m[0].length));
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    return out;
  }

  /*
	// Removes every <script>...</script> occurrence from text. If a script
  // tag occupies its own line (only whitespace around it), the whole line
  // is dropped so no blank line is left behind; otherwise just the matched
  // text is removed in place. Everything else is left byte-for-byte as is.
	*/
	
  function removeScriptsKeepFormat(text){
    var re = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
    var result = '';
    var lastIndex = 0;
    var m;
    while ((m = re.exec(text)) !== null){
      var start = m.index;
      var end = start + m[0].length;
      var lineStart = text.lastIndexOf('\n', start - 1) + 1;
      var lineEnd = text.indexOf('\n', end);
      if (lineEnd === -1) lineEnd = text.length;
      var before = text.slice(lineStart, start);
      var after = text.slice(end, lineEnd);
      if (/^[ \t]*$/.test(before) && /^[ \t]*$/.test(after)){
        result += text.slice(lastIndex, lineStart);
        lastIndex = lineEnd < text.length ? lineEnd + 1 : lineEnd;
      } else {
        result += text.slice(lastIndex, start);
        lastIndex = end;
      }
    }
    result += text.slice(lastIndex);
    return result;
  }
	
	
	
	
	
	function findFirstBody(text){
  var bodyOpen = text.search(/<body\b[^>]*>/i);

  if(bodyOpen === -1){
    return '';
  }

  var openTag = /<body\b[^>]*>/ig;
  var closeTag = /<\/body>/ig;

  openTag.lastIndex = bodyOpen;

  var depth = 0;
  var pos = bodyOpen;

  while(pos < text.length){

    openTag.lastIndex = pos;
    closeTag.lastIndex = pos;

    var nextOpen = openTag.exec(text);
    var nextClose = closeTag.exec(text);

    var openIndex = nextOpen ? nextOpen.index : Infinity;
    var closeIndex = nextClose ? nextClose.index : Infinity;

    if(openIndex < closeIndex){
      depth++;
      pos = openIndex + nextOpen[0].length;
    }else{
      depth--;

      if(depth === 0){
        return text.slice(
          bodyOpen,
          closeIndex + nextClose[0].length
        );
      }

      pos = closeIndex + nextClose[0].length;
    }
  }

  return '';
}
	
	
	
	
	
	function extractBodies(text){
  var openRe = /<body\b[^>]*>/ig;
  var closeRe = /<\/body>/ig;

  var results = [];
  var openMatch;

  while ((openMatch = openRe.exec(text)) !== null){
    var start = openMatch.index;
    var depth = 0;

    closeRe.lastIndex = start;

    var pos = start;
    var end = -1;

    while (pos < text.length){
      openRe.lastIndex = pos;
      closeRe.lastIndex = pos;

      var nextOpen = openRe.exec(text);
      var nextClose = closeRe.exec(text);

      var openPos = nextOpen ? nextOpen.index : Infinity;
      var closePos = nextClose ? nextClose.index : Infinity;

      if (openPos < closePos){
        depth++;
        pos = openPos + nextOpen[0].length;
      } else {
        depth--;
        pos = closePos + nextClose[0].length;

        if (depth === 0){
          end = pos;
          break;
        }
      }
    }

    if (end !== -1){
      results.push(text.slice(start, end));
      openRe.lastIndex = end;
    }
  }

  return results;
}
	
	
	
	

  function runExtraction(){
    var raw = document.getElementById('source').value;

    if (!raw || !raw.trim()){
      setStatus('Paste some HTML first.');
      return;
    }

    // var headBlock = findBlock(raw, 'head') || '';
    var bodyBlock = findFirstBody(raw);
		
		
		
		var strippedBodyBlock = bodyBlock.replace(/^<body\b[^>]*>\s*/i, '').replace(/\s*<\/body>\s*$/i, '');
		
		// console.log(strippedBodyBlock);
		var secondBodyBlock = findBlock(strippedBodyBlock, 'body') || '';
		console.log(secondBodyBlock);
		
		strippedSecondBodyBlock = secondBodyBlock.replace(/^<body\b[^>]*>\s*/i, '').replace(/\s*<\/body>\s*$/i, '');
	
		var outputBodyCode = strippedSecondBodyBlock.length ? strippedSecondBodyBlock : strippedBodyBlock;
		
		
		
		
		
		
		// Find the first nested <head> inside the first body
		var headBlock = secondBodyBlock.length ? findBlock(bodyBlock, 'head') : findBlock(raw, 'head');
		
		// var headBlock = findBlock(bodyBlock, 'head') || '';
		
		
		

    // --- Title text + external <link> tags ---
//     var titleText = '';
//     var titleMatch = headBlock ? /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(headBlock) : null;
//     if (titleMatch) titleText = titleMatch[1];

//     var linkRe = /<link\b[^>]*?\/?>/gi;
//     var links = headBlock ? extractWithIndent(headBlock, linkRe) : [];

//     var headParts = [];
//     if (titleMatch) headParts.push(titleText);
//     if (links.length) headParts.push(links.join('\n'));
//     var headOut = headParts.join('\n');
//     found.head = headParts.length > 0;
//     extracted.head = found.head ? headOut : '<!-- No <title> or external <link> tags found in <head> -->';

		
		
		
		
		
		
		// --- Title ---
var titleMatch = headBlock
  ? /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(headBlock)
  : null;

found.title = !!titleMatch;

extracted.title = found.title
  ? titleMatch[1].trim()
  : '<!-- No <title> found -->';


// --- External links ---
var linkRe = /<link\b[^>]*?\/?>/gi;

var links = headBlock
  ? extractWithIndent(headBlock, linkRe)
  : [];

found.links = links.length > 0;

extracted.links = found.links
  ? links.join('\n')
  : '<!-- No <link> tags found -->';
		
		
		
		
		
    // --- Inline <style> content ---
    var styleRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    var styleParts = [];
    var sm;
    if (headBlock){
      while ((sm = styleRe.exec(headBlock)) !== null) styleParts.push(sm[1]);
    }
    found.style = styleParts.length > 0;
    extracted.style = found.style ? styleParts.join('\n\n') : '/* No inline <style> tag found in <head> */';

    // --- External <script src="..."> tags in <body> ---
    var extScriptRe = /<script\b(?=[^>]*\ssrc\s*=)[^>]*>[\s\S]*?<\/script>/gi;
    var extScripts = bodyBlock ? extractWithIndent(bodyBlock, extScriptRe) : [];
    found.extScripts = extScripts.length > 0;
    extracted.extScripts = found.extScripts ? extScripts.join('\n') : '<!-- No external <script src="..."> tags found in <body> -->';

    // --- Inline <script> content (no src) in <body> ---
    var inlineScriptRe = /<script\b(?![^>]*\ssrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
    var inlineParts = [];
    var im;
    if (bodyBlock){
      while ((im = inlineScriptRe.exec(bodyBlock)) !== null) inlineParts.push(im[1]);
    }
    found.inlineScript = inlineParts.length > 0;
    extracted.inlineScript = found.inlineScript ? inlineParts.join('\n\n') : '/* No inline <script> tag (without src) found in <body> */';

    // --- <body> markup, scripts stripped out ---
		// var bodyMarkupOut = bodyBlock ? removeScriptsKeepFormat(bodyBlock) : '';
		// bodyMarkupOut = bodyMarkupOut.replace(/^<body\b[^>]*>\s*/i, '').replace(/\s*<\/body>\s*$/i, '');
		
		
		
		
		// var strippedBodyBlock = bodyBlock.replace(/^<body\b[^>]*>\s*/i, '').replace(/\s*<\/body>\s*$/i, '');
		
		// console.log(strippedBodyBlock);
		// var secondBodyBlock = findBlock(strippedBodyBlock, 'body') || '';
		// console.log(secondBodyBlock);
		
		// strippedSecondBodyBlock = secondBodyBlock.replace(/^<body\b[^>]*>\s*/i, '').replace(/\s*<\/body>\s*$/i, '');
		
		
		// var outputBodyCode = strippedSecondBodyBlock.length ? strippedSecondBodyBlock : strippedBodyBlock;
		
		
		
		
		
		// var bodies = extractBodies(raw);
		// var selectedBody = bodies[1] || bodies[0] || '';

var bodyMarkupOut = outputBodyCode ? removeScriptsKeepFormat(outputBodyCode) : '';
bodyMarkupOut = bodyMarkupOut
  .replace(/^<body\b[^>]*>\s*/i, '')
  .replace(/\s*<\/body>\s*$/i, '');
		
		
    found.bodyMarkup = !!bodyBlock;
    extracted.bodyMarkup = found.bodyMarkup ? bodyMarkupOut : '<!-- No <body> tag found -->';
		// console.log(bodyMarkupOut);

    renderResults();

    var count = [headBlock, bodyBlock].filter(Boolean).length;
    if (!headBlock && !bodyBlock){
      setStatus('No <head> or <body> tag found — check the pasted markup.');
    } else {
      setStatus('Extraction complete.');
    }
  }

  function renderResults(){
    Object.keys(extracted).forEach(function(key){
      var pre = document.getElementById('out-' + key);
      var code = pre.querySelector('code');
      var btn = document.querySelector('.copy-btn[data-target="' + key + '"]');
      code.textContent = extracted[key];
      if (found[key]){
        pre.classList.remove('empty');
        btn.disabled = false;
      } else {
        pre.classList.add('empty');
        btn.disabled = true;
      }
    });
  }

  function resetResults(){
    Object.keys(extracted).forEach(function(key){
      extracted[key] = '';
      found[key] = false;
      var pre = document.getElementById('out-' + key);
      var code = pre.querySelector('code');
      code.textContent = 'Nothing extracted yet.';
      pre.classList.add('empty');
      var btn = document.querySelector('.copy-btn[data-target="' + key + '"]');
      btn.disabled = true;
    });
    setStatus('');
  }

  function setStatus(msg){
    document.getElementById('status').textContent = msg;
  }

  function fallbackCopy(text, cb){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch(e){ /* no-op */ }
    document.body.removeChild(ta);
  }

  function copyToClipboard(text, btn){
    var original = btn.textContent;
    function showCopied(){
      btn.textContent = 'Copied';
      btn.classList.add('copied');
      setTimeout(function(){
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(showCopied).catch(function(){ fallbackCopy(text, showCopied); });
    } else {
      fallbackCopy(text, showCopied);
    }
  }

  document.getElementById('extractBtn').addEventListener('click', runExtraction);
  document.getElementById('clearBtn').addEventListener('click', function(){
    document.getElementById('source').value = '';
    resetResults();
  });

  document.querySelectorAll('.copy-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var key = btn.getAttribute('data-target');
      if (!found[key]) return;
      copyToClipboard(extracted[key], btn);
    });
  });

})();
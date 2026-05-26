const tools = {
    'color-converter': {
        label: 'color-converter',
        url: './tools/color-converter/index.html'
    },
    typescale: {
        label: 'typescale',
        url: './tools/typescale/index.html'
    }
};


const params = new URLSearchParams(window.location.search);
const toolName = params.get('tool');
const title = document.getElementById('page-title');
const toolList = document.getElementById('tool-list');
const toolMount = document.getElementById('tool-mount');
const toolBack = document.getElementById('tool-back');

function renderToolList() {
    title.textContent = 'Tools';
    toolList.innerHTML = Object.values(tools)
        .map(
            (tool) =>
                `<a class="tool-card" href="./template.html?tool=${encodeURIComponent(tool.label)}">${tool.label}</a>`
        )
        .join('');
    toolList.hidden = false;
    toolMount.hidden = true;
    toolBack.hidden = true;
}

function toAbsoluteUrl(url, baseUrl) {
    return new URL(url, baseUrl).href;
}

function cloneAssets(documentFragment, baseUrl) {
    documentFragment.querySelectorAll("link[rel='stylesheet']").forEach((link) => {
        const cloned = document.createElement('link');
        cloned.rel = 'stylesheet';
        cloned.href = toAbsoluteUrl(link.getAttribute('href'), baseUrl);
        document.head.appendChild(cloned);
    });

    documentFragment.querySelectorAll('style').forEach((style) => {
        document.head.appendChild(style.cloneNode(true));
    });
}

function loadScripts(scripts, baseUrl) {
    return scripts.reduce((promise, script) => {
        return promise.then(() => {
            return new Promise((resolve, reject) => {
                const nextScript = document.createElement('script');

                if (script.src) {
                    nextScript.src = toAbsoluteUrl(script.getAttribute('src'), baseUrl);
                } else {
                    nextScript.textContent = script.textContent;
                }

                if (script.type) {
                    nextScript.type = script.type;
                }

                if (script.defer) {
                    nextScript.defer = true;
                }

                nextScript.addEventListener('load', resolve, { once: true });
                nextScript.addEventListener('error', reject, { once: true });
                document.body.appendChild(nextScript);

                if (!script.src) {
                    resolve();
                }
            });
        });
    }, Promise.resolve());
}

async function loadTool(name) {
    const tool = tools[name];

    if (!tool) {
        renderToolList();
        return;
    }

    const response = await fetch(tool.url);
    const html = await response.text();
    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, 'text/html');
    const baseUrl = new URL(tool.url, window.location.href).href;

    document.title = parsed.title || tool.label;
    title.textContent = parsed.title || tool.label;
    toolList.hidden = true;
    toolMount.hidden = false;
    toolBack.hidden = false;
    // toolBack.href = "./template.html";
    toolBack.href = './';

    const bodyChildren = Array.from(parsed.body.children);
    const scripts = [
        ...Array.from(parsed.head.querySelectorAll('script')),
        ...Array.from(parsed.body.querySelectorAll('script'))
    ];
    const styles = Array.from(parsed.head.querySelectorAll("link[rel='stylesheet'], style"));

    cloneAssets({ querySelectorAll: () => styles }, baseUrl);

    toolMount.innerHTML = bodyChildren
        .filter((node) => node.tagName !== 'SCRIPT')
        .map((node) => node.outerHTML)
        .join('');

    await loadScripts(scripts, baseUrl);
}

if (!title || !toolList || !toolMount || !toolBack) {
    throw new Error('Template shell is missing required elements.');
}

if (!toolName) {
    renderToolList();
} else {
    loadTool(toolName).catch((error) => {
        title.textContent = 'Tools';
        toolMount.innerHTML = `<p>Unable to load tool: ${toolName}</p>`;
        toolBack.hidden = false;
        toolBack.href = './template.html';
        toolMount.hidden = false;
        toolList.hidden = true;
        console.error(error);
    });
}

//

/*** TO MAKE

// Tooltip

***/

let notifQueue = [];
let notifInProgress = false;

export function Notif(text) {
    let type = '';
    notifQueue.push({ type, text }); // Add to the queue

    if (!notifInProgress) {
        showNextNotification(type); // Start showing notifications if none is in progress
    }
}

export function Notif_link(text, link_text, link) {
    let type = 'link';
    notifQueue.push({ type, text, link_text, link }); // Add to the queue

    if (!notifInProgress) {
        showNextNotification(type); // Start showing notifications if none is in progress
    }
}

// Make Notif and Notif_link globally accessible for loaded tools
window.Notif = Notif;
window.Notif_link = Notif_link;

function showNextNotification(type = '') {
    if (notifQueue.length) {
        notifInProgress = true;
        //if(type) {
        if (type == 'link') {
            var { type, text, link_text, link } = notifQueue.shift();
            $(
                '<div class="notif w-link"><span class="text">' +
                    text +
                    '</span><a href="' +
                    link +
                    '" class="link">' +
                    link_text +
                    '</a></div>'
            ).insertBefore('body');
        } else {
            var { type, text } = notifQueue.shift();

            $(
                '<div class="notif"><span>' +
                    text +
                    '</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/></svg></div>'
            ).insertBefore('body');
        }
        setTimeout(() => {
            $('.notif').addClass('fade-out');
        }, 3000);

        setTimeout(() => {
            $('.notif').remove();
            notifInProgress = false;
            if (notifQueue.length) {
                var type = notifQueue[0].type;
                showNextNotification(type); // Show the next notification after removal
            }
        }, 3300);
        //}
    }
}

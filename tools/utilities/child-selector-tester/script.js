const SELECTORS = [
    {
        label: 'First',
        value: ':first-child',
        desc: 'Matches an element only if it is the <b>first child</b> of its parent, regardless of tag type.'
    },
    {
        label: 'Last',
        value: ':last-child',
        desc: 'Matches an element only if it is the <b>last child</b> of its parent.'
    },
    { label: 'Only', value: ':only-child', desc: 'Matches an element that has <b>no siblings</b> at all.' },
    {
        label: 'First of type',
        value: ':first-of-type',
        desc: 'Matches the first element of its <b>tag type</b> among its siblings &mdash; other tag types dont count.'
    },
    {
        label: 'Last of type',
        value: ':last-of-type',
        desc: 'Matches the last element of its <b>tag type</b> among its siblings.'
    },
    {
        label: 'Only of type',
        value: ':only-of-type',
        desc: 'Matches an element that is the <b>only one of its tag</b> among its siblings, even if other tags are present.'
    },
    { label: 'Odd', value: ':nth-child(odd)', desc: 'Matches children in <b>odd</b> positions: 1, 3, 5&hellip;' },
    { label: 'Even', value: ':nth-child(even)', desc: 'Matches children in <b>even</b> positions: 2, 4, 6&hellip;' },
    {
        label: 'Every 2nd',
        value: ':nth-child(2n)',
        desc: 'Matches every 2nd child &mdash; identical result to <b>even</b>, written as a formula.'
    },
    {
        label: 'From 3rd onward',
        value: ':nth-child(n + 3)',
        desc: 'Matches the 3rd child and <b>every child after it</b>.'
    },
    { label: 'First 5', value: ':nth-child(-n + 5)', desc: 'Matches only the <b>first five</b> children.' },
    { label: 'Second', value: ':nth-child(2)', desc: 'Matches exactly the child in <b>position 2</b>.' },
    {
        label: 'Third from end',
        value: ':nth-last-child(3)',
        desc: 'Counts backward from the end &mdash; matches the child that is <b>3rd from last</b>.'
    },
    { label: 'Custom', value: '__custom__', desc: 'Write your own CSS selector and see it applied live.' }
];

let current = SELECTORS[0].value;
let isCustom = false;

const pillGrid = document.getElementById('pillGrid');
const selDisplay = document.getElementById('selDisplay');
const customInput = document.getElementById('customInput');
const matchBadge = document.getElementById('matchBadge');
const explainText = document.getElementById('explainText');
const copyBtn = document.getElementById('copyBtn');

function buildCardGrid() {
    const grid = document.getElementById('cardGrid');
    for (let i = 1; i <= 8; i++) {
        const el = document.createElement('div');
        el.className = 'demo-el';
        el.textContent = 'Card ' + i;
        grid.appendChild(el);
    }
}
buildCardGrid();

function renderPills() {
    SELECTORS.forEach((s) => {
        const btn = document.createElement('button');
        btn.className = 'pill' + (s.value === '__custom__' ? ' custom' : '');
        btn.dataset.value = s.value;
        btn.innerHTML = `<span class="label">${s.label}</span><span class="code">${s.value === '__custom__' ? 'write your own' : s.value}</span>`;
        btn.addEventListener('click', () => selectPill(s));
        pillGrid.appendChild(btn);
    });
}
renderPills();

function selectPill(s) {
    isCustom = s.value === '__custom__';
    current = isCustom ? customInput.value.trim() || '' : s.value;

    document.querySelectorAll('.pill').forEach((p) => {
        p.classList.toggle('active', p.dataset.value === s.value);
    });

    selDisplay.style.display = isCustom ? 'none' : 'inline';
    customInput.style.display = isCustom ? 'inline-block' : 'none';
    if (isCustom) {
        customInput.focus();
    } else {
        selDisplay.textContent = s.value;
    }

    explainText.innerHTML = isCustom
        ? 'Write any valid CSS selector above &mdash; it will be tested against every element in all three panels using <b>Element.matches()</b>.'
        : s.desc;

    applySelector();
}

customInput.addEventListener('input', () => {
    current = customInput.value.trim();
    applySelector();
});

function applySelector() {
    const allDemoEls = document.querySelectorAll('#cardGrid .demo-el, #mixedStage > *, #treeStage li');
    let count = 0;
    let valid = true;

    allDemoEls.forEach((el) => el.classList.remove('matched'));

    if (current) {
        allDemoEls.forEach((el) => {
            try {
                if (el.matches(current)) {
                    el.classList.add('matched');
                    count++;
                }
            } catch (e) {
                valid = false;
            }
        });
    }

    matchBadge.classList.remove('error');
    if (!valid) {
        matchBadge.textContent = 'invalid selector';
        matchBadge.classList.add('error');
    } else {
        matchBadge.textContent = count + ' matched';
    }
    matchBadge.classList.remove('pulse');
    void matchBadge.offsetWidth;
    matchBadge.classList.add('pulse');
}

copyBtn.addEventListener('click', () => {
    const text = '.stage > * ' + current;
    navigator.clipboard?.writeText(text).then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = 'copied';
        setTimeout(() => {
            copyBtn.textContent = original;
        }, 1200);
    });
});

// init with first pill active
document.querySelector('.pill').classList.add('active');
explainText.innerHTML = SELECTORS[0].desc;
applySelector();

(function($) {

    "use strict";


    /*
     * --------------------------------------------------
     * Configuration
     * --------------------------------------------------
     */

    const DATA_URL =
        "https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/";

    const browsers = [
        {
            id: "chrome",
            name: "Chrome"
        },
        {
            id: "edge",
            name: "Edge"
        },
        {
            id: "firefox",
            name: "Firefox"
        },
        {
            id: "safari",
            name: "Safari"
        },
        {
            id: "ios_saf",
            name: "iOS Safari"
        },
        {
            id: "opera",
            name: "Opera"
        },
        {
            id: "samsung",
            name: "Samsung Internet"
        }
    ];


    /*
     * Can I Use feature aliases.
     *
     * This allows us to accept common names instead
     * of requiring the exact Can I Use slug.
     */

    const featureAliases = {

    "has": "css-has",
    ":has": "css-has",
    ":has()": "css-has",

    "grid": "css-grid",
    "css grid": "css-grid",

    "flex": "flexbox",
    "flexbox": "flexbox",

    "container queries": "css-container-queries",
    "container query": "css-container-queries",

    "css nesting": "css-nesting",
    "nesting": "css-nesting",

    "sticky": "css-sticky",
    "position sticky": "css-sticky",

    "text wrap balance": "css-text-wrap-balance",
    "text-wrap balance": "css-text-wrap-balance",

    // attr()
    "attr": "css3-attr",
    "attr()": "css3-attr",
    "css attr": "css3-attr",
    "css attr()": "css3-attr",
    "css-attr": "css3-attr",
    "css-attr()": "css3-attr",
    "css3 attr": "css3-attr",
    "css3 attr()": "css3-attr"

};


    /*
     * Cache loaded features so that we don't make
     * another request when the user checks the same
     * feature again.
     */

    const featureCache = {};


    /*
     * Current browser
     */

    const currentBrowser = detectBrowser();


    /*
     * --------------------------------------------------
     * Browser detection
     * --------------------------------------------------
     */

    function detectBrowser() {

        const ua = navigator.userAgent;

        let browser = "unknown";
        let version = null;


        /*
         * Edge
         */

        let match = ua.match(
            /Edg\/([\d.]+)/
        );

        if (match) {

            browser = "edge";
            version = match[1];

        }


        /*
         * Opera
         */

        else if (
            (match = ua.match(
                /OPR\/([\d.]+)/
            ))
        ) {

            browser = "opera";
            version = match[1];

        }


        /*
         * Chrome on iOS
         */

        else if (
            (match = ua.match(
                /CriOS\/([\d.]+)/
            ))
        ) {

            browser = "ios_saf";
            version = match[1];

        }


        /*
         * Firefox on iOS
         */

        else if (
            (match = ua.match(
                /FxiOS\/([\d.]+)/
            ))
        ) {

            browser = "ios_saf";
            version = match[1];

        }


        /*
         * Chrome
         */

        else if (
            (match = ua.match(
                /Chrome\/([\d.]+)/
            ))
        ) {

            browser = "chrome";
            version = match[1];

        }


        /*
         * Firefox
         */

        else if (
            (match = ua.match(
                /Firefox\/([\d.]+)/
            ))
        ) {

            browser = "firefox";
            version = match[1];

        }


        /*
         * Safari
         */

        else if (
            (match = ua.match(
                /Version\/([\d.]+).*Safari/
            ))
        ) {

            browser = "safari";
            version = match[1];

        }


        return {
            browser,
            version
        };

    }


    /*
     * --------------------------------------------------
     * Browser display
     * --------------------------------------------------
     */

    function displayCurrentBrowser() {

        const browser = browsers.find(
            function(item) {

                return item.id ===
                    currentBrowser.browser;

            }
        );


        const name = browser
            ? browser.name
            : "Unknown browser";


        const version =
            currentBrowser.version
                ? " " + currentBrowser.version
                : "";


        $("#current-browser strong")
            .text(name + version);


        $("#current-browser .browser-icon")
            .text(
                getBrowserInitial(name)
            );

    }


    function getBrowserInitial(name) {

        const initials = {

            "Chrome": "C",
            "Edge": "E",
            "Firefox": "F",
            "Safari": "S",
            "iOS Safari": "S",
            "Opera": "O",
            "Samsung Internet": "S"

        };


        return initials[name] || "?";

    }


    /*
     * --------------------------------------------------
     * Load a feature JSON file
     * --------------------------------------------------
     */

    function loadFeature(featureId) {

        featureId =
            resolveFeatureId(featureId);


        if (!featureId) {

            return $.Deferred()
                .reject("Feature not found")
                .promise();

        }


        /*
         * Return cached data
         */

        if (featureCache[featureId]) {

            return $.Deferred()
                .resolve(featureCache[featureId])
                .promise();

        }


        return $.getJSON(
            DATA_URL +
            encodeURIComponent(featureId) +
            ".json"
        )

        .then(function(data) {

            featureCache[featureId] = data;

            return data;

        })

        .fail(function(xhr) {

            console.error(
                "Could not load:",
                featureId,
                xhr
            );

        });

    }


    /*
     * --------------------------------------------------
     * Resolve aliases
     * --------------------------------------------------
     */

    function resolveFeatureId(query) {

        query = $.trim(
            String(query)
        ).toLowerCase();


        /*
         * Direct alias
         */

        if (featureAliases[query]) {

            return featureAliases[query];

        }


        /*
         * Already looks like a Can I Use slug.
         */

        if (
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(query)
        ) {

            return query;

        }


        return slugifyFeature(query);

    }


    /*
     * Convert a human-readable search into a
     * likely Can I Use feature slug.
     */

    function slugifyFeature(value) {

        return value

            .toLowerCase()

            .replace(/[():]/g, "")

            .replace(/[^\w\s-]/g, "")

            .trim()

            .replace(/\s+/g, "-");

    }


    /*
     * --------------------------------------------------
     * Search
     * --------------------------------------------------
     *
     * Because we're not running caniuse-api anymore,
     * we cannot ask the package to search all features.
     *
     * Instead we maintain a lightweight search index
     * containing the commonly used features.
     *
     * The index can easily be expanded.
     */

    const searchIndex = [

        ["css-has", ":has()"],
        ["css-grid", "CSS Grid"],
        ["flexbox", "Flexbox"],
				["css3-attr", "CSS attr() function"],
        ["css-container-queries", "Container Queries"],
        ["css-nesting", "CSS Nesting"],
        ["css-sticky", "position: sticky"],
        ["css-text-wrap-balance", "text-wrap: balance"],
        ["css-text-wrap-pretty", "text-wrap: pretty"],
        ["css-aspect-ratio", "aspect-ratio"],
        ["css-subgrid", "CSS Subgrid"],
        ["css-variables", "CSS Variables"],
        ["css-backdrop-filter", "backdrop-filter"],
        ["css-scrollbar", "CSS Scrollbar"],
        ["css-scroll-behavior", "scroll-behavior"],
        ["css-scroll-snap", "CSS Scroll Snap"],
        ["css-matches-pseudo", ":is() / :matches()"],
        ["css-not-sel-list", ":not() selector list"],
        ["css-focus-visible", ":focus-visible"],
        ["css-placeholder", "::placeholder"],
        ["css-cascade-layers", "CSS Cascade Layers"],
        ["css-when-else", "CSS if() / when()"],
        ["css-anchor-positioning", "CSS Anchor Positioning"],
        ["css-view-transitions", "View Transitions"],
        ["css-container-query-units", "Container Query Units"],
        ["web-animation", "Web Animations"],
        ["webgl", "WebGL"],
        ["webgl2", "WebGL 2.0"],
        ["wasm", "WebAssembly"],
        ["es6", "ES6 / ECMAScript 2015"],
        ["es5", "ECMAScript 5"],
        ["arrow-functions", "Arrow Functions"],
        ["async-functions", "Async Functions"],
        ["fetch", "Fetch"],
        ["websockets", "WebSockets"],
        ["serviceworkers", "Service Workers"],
        ["web-share", "Web Share API"],
        ["clipboard", "Clipboard API"],
        ["intersectionobserver", "IntersectionObserver"],
        ["resizeobserver", "ResizeObserver"],
        ["mutationobserver", "MutationObserver"],
        ["picture", "picture element"],
        ["srcset", "srcset"],
        ["webp", "WebP"],
        ["avif", "AVIF"],
        ["svg", "SVG"],
        ["webp", "WebP"],
        ["jpeg2000", "JPEG 2000"],
        ["css-masks", "CSS Masks"],
        ["css-clip-path", "CSS clip-path"],
        ["css-shapes", "CSS Shapes"],
        ["css-filters", "CSS Filters"],
        ["css-mixblendmode", "CSS mix-blend-mode"],
        ["css-conic-gradients", "CSS Conic Gradients"],
        ["css-linear-gradients", "CSS Linear Gradients"],
        ["css-radial-gradients", "CSS Radial Gradients"],
        ["css-sticky", "CSS position: sticky"],
        ["css-zoom", "CSS zoom"],
				

    ];


    /*
     * Search input
     */

    let searchTimer;


    $("#feature-search").on(
        "input",
        function() {

            const query =
                $.trim($(this).val());


            clearTimeout(searchTimer);


            if (query.length < 2) {

                $("#search-results")
                    .hide()
                    .empty();

                return;

            }


            searchTimer = setTimeout(
                function() {

                    searchFeatures(query);

                },
                100
            );

        }
    );


    /*
     * Search index
     */

    function searchFeatures(query) {

        const normalized =
            query.toLowerCase();


        const results =
            searchIndex

                .filter(function(item) {

                    return (
                        item[0]
                            .toLowerCase()
                            .includes(normalized) ||

                        item[1]
                            .toLowerCase()
                            .includes(normalized)
                    );

                })

                .slice(0, 10);


        renderSearchResults(results);

    }


    function renderSearchResults(results) {

        const $results =
            $("#search-results");


        $results.empty();


        if (!results.length) {

            $results

                .append(
                    $("<div>")
                        .addClass("search-result")
                        .text("No matching feature found.")
                )

                .show();

            return;

        }


        results.forEach(function(item) {

            const $button =
                $("<button>", {

                    type: "button",
                    class: "search-result",
                    "data-feature": item[0]

                });


            $("<strong>")
                .text(item[1])
                .appendTo($button);


            $("<small>")
                .text(item[0])
                .appendTo($button);


            $results.append($button);

        });


        $results.show();

    }


    /*
     * Search result click
     */

    $(document).on(
        "click",
        ".search-result[data-feature]",
        function() {

            const feature =
                $(this).data("feature");


            $("#feature-search")
                .val(feature);


            $("#search-results")
                .hide();


            showFeature(feature);

        }
    );


    /*
     * Search button
     */

    $("#search-button").on(
        "click",
        function() {

            const query =
                $("#feature-search").val();


            showFeature(query);

        }
    );


    /*
     * Enter
     */

    $("#feature-search").on(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                $("#search-button")
                    .trigger("click");

            }

        }
    );


    /*
     * Popular buttons
     */

    $(".popular-features button").on(
        "click",
        function() {

            const feature =
                $(this).data("feature");


            $("#feature-search")
                .val(feature);


            showFeature(feature);

        }
    );


    /*
     * Close search dropdown
     */

    $(document).on(
        "click",
        function(event) {

            if (
                !$(event.target)
                    .closest(".search-wrapper")
                    .length
            ) {

                $("#search-results")
                    .hide();

            }

        }
    );


    /*
     * --------------------------------------------------
     * Show feature
     * --------------------------------------------------
     */

    function showFeature(feature) {

        $("#results-container").html(
            '<div class="loading">' +
            'Loading compatibility data...' +
            '</div>'
        );


        loadFeature(feature)

            .done(function(data) {

                renderFeature(data);

            })

            .fail(function() {

                showError(
                    "Could not find the Can I Use feature " +
                    '"' + feature + '".'
                );

            });

    }


    /*
     * --------------------------------------------------
     * Render feature
     * --------------------------------------------------
     */

    function renderFeature(data) {

        const featureId =
            getFeatureIdFromData(data);


        let html = "";


        html += `

            <div class="feature-header">

                <div>

                    <h2 class="feature-title">
                        ${escapeHtml(data.title)}
                    </h2>

                    <div class="feature-id">
                        ${escapeHtml(featureId)}
                    </div>

                    ${
                        data.description
                            ? `
                                <p class="feature-description">
                                    ${escapeHtml(
                                        data.description
                                    )}
                                </p>
                              `
                            : ""
                    }

                </div>

                <a
                    class="feature-link"
                    href="https://caniuse.com/${encodeURIComponent(featureId)}"
                    target="_blank"
                    rel="noopener"
                >
                    View on Can I Use →
                </a>

            </div>

        `;


        /*
         * Current browser
         */

        html += renderCurrentBrowser(
            data.stats
        );


        /*
         * Major browsers
         */

        html += renderMajorBrowsers(
            data.stats
        );


        /*
         * Full version history
         */

        html += renderVersionHistory(
            data.stats
        );


        $("#results-container")
            .html(html);

    }


    /*
     * --------------------------------------------------
     * Current browser
     * --------------------------------------------------
     */

    function renderCurrentBrowser(stats) {

        const browser =
            currentBrowser.browser;


        if (!stats[browser]) {

            return "";

        }


        const result =
            getBrowserSupport(
                stats[browser],
                currentBrowser.version
            );


        const browserInfo =
            browsers.find(function(item) {

                return item.id === browser;

            });


        if (!browserInfo) {

            return "";

        }


        return `

            <section class="browser-section">

                <h2>Your current browser</h2>

                <div class="current-result">

                    <div class="current-result-inner">

                        <i class="status-icon ${result.class}">
                            ${result.icon}
                        </i>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    browserInfo.name
                                )}

                                ${escapeHtml(
                                    currentBrowser.version
                                )}

                                — ${result.label}
                            </strong>

                            <span>
                                ${result.description}
                            </span>

                        </div>

                    </div>

                </div>

            </section>

        `;

    }


    /*
     * --------------------------------------------------
     * Major browsers
     * --------------------------------------------------
     */

    function renderMajorBrowsers(stats) {

        let rows = "";


        browsers.forEach(function(browser) {

            const browserStats =
                stats[browser.id];


            if (!browserStats) {

                return;

            }


            const versions =
                Object.keys(browserStats);


            const latestVersion =
                getLatestVersion(
                    versions
                );


            const result =
                getBrowserSupport(
                    browserStats,
                    latestVersion
                );


            rows += `

                <tr>

                    <td>

                        <span class="browser-name">
                            ${escapeHtml(
                                browser.name
                            )}
                        </span>

                    </td>

                    <td>
                        ${escapeHtml(
                            latestVersion
                        )}
                    </td>

                    <td>

                        ${renderStatus(
                            result
                        )}

                    </td>

                </tr>

            `;

        });


        return `

            <section class="browser-section">

                <h2>Major browsers</h2>

                <table class="support-table">

                    <thead>

                        <tr>

                            <th>Browser</th>
                            <th>Latest</th>
                            <th>Support</th>

                        </tr>

                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </section>

        `;

    }


    /*
     * --------------------------------------------------
     * Version history
     * --------------------------------------------------
     */

			function getVersionNumber(version) {
		    const match = String(version).match(/\d+(?:\.\d+)?/);
		
		    return match ? parseFloat(match[0]) : Infinity;
		}



	function groupVersionsByStatus(versions, browserStats) {
    const groups = [];

    versions.forEach(function(version) {
        const status = parseSupportCode(browserStats[version]);

        const lastGroup = groups[groups.length - 1];

        if (
            lastGroup &&
            lastGroup.status.class === status.class
        ) {
            lastGroup.versions.push(version);
            lastGroup.status = status;
        } else {
            groups.push({
                versions: [version],
                status: status
            });
        }
    });

    return groups.map(function(group) {
        return {
            versions: group.versions,
            status: group.status,
            label: formatVersionRange(group.versions),
            title: group.versions.join(", ") + ": " + group.status.label
        };
    });
}

function formatVersionRange(versions) {
    if (versions.length === 1) {
        return versions[0];
    }

    return versions[0] + "–" + versions[versions.length - 1];
}
	
	

    function renderVersionHistory(stats) {

        let rows = "";


        browsers.forEach(function(browser) {

            const browserStats =
                stats[browser.id];


            if (!browserStats) {

                return;

            }


            const versions =
                Object.keys(browserStats);


            /*
             * Don't render ancient versions.
             *
             * Keep the latest 12 versions.
             */

					const visibleVersions = versions.sort(function(a, b) {
					    return getVersionNumber(a) - getVersionNumber(b);
					});


					const groupedVersions = groupVersionsByStatus(
					    visibleVersions,
					    browserStats
					);
					
					
					
            //const visibleVersions = versions;

						//const visibleVersions = versions.slice(-12);

            // let cells = "";


            /*visibleVersions.forEach(
                function(version) {

                    const status =
                        parseSupportCode(
                            browserStats[version]
                        );


                    cells += `

                        <span
                            class="version-cell ${status.class}"
                            title="${escapeHtml(
                                version +
                                ": " +
                                status.label
                            )}"
                        >
                            ${escapeHtml(version)}
                        </span>

                    `;

                }
            );*/


					let cells = "";
					
					groupedVersions.forEach(function(group) {
					    cells += `
					        <span class="version-cell ${group.status.class}"
					              title="${escapeHtml(group.title)}">
					            ${escapeHtml(group.label)}
					        </span>
					    `;
					});


            rows += `

                <div class="tr">

                    <div class="td browser-td">

                        <span class="browser-name">
                            ${escapeHtml(
                                browser.name
                            )}
                        </span>

                    </div>

                    <div class="td">

                        <div class="version-list">
                            ${cells}
                        </div>

                    </div>

                </div>

            `;

        });


        return `

            <section class="browser-section">

                <h2>
                    Recent browser versions
                </h2>

                <div class="table support-table">

                    <div class="thead">

                        <div class="tr">

                            <div class="th">Browser</div>
                            <!--<div class="th">
                                Version support
                            </div>-->

                        </div>

                    </div>

                    <div class="tbody">
                        ${rows}
                    </div>

                </div>

            </section>

        `;

    }


    /*
     * --------------------------------------------------
     * Support status
     * --------------------------------------------------
     */

    function getBrowserSupport(
        stats,
        version
    ) {

        if (!stats || !version) {

            return {
                class: "unknown",
                icon: "?",
                label: "Unknown",
                description:
                    "No compatibility data available."
            };

        }


        /*
         * Exact version
         */

        if (stats[version]) {

            const result =
                parseSupportCode(
                    stats[version]
                );


            return {
                ...result,
                description:
                    result.description
            };

        }


        /*
         * Find closest version.
         *
         * This handles versions such as:
         *
         * 18.5-18.7
         * 15.2-15.3
         */

        const numericVersion =
            parseFloat(version);


        const matchingVersion =
            Object.keys(stats)

                .filter(function(item) {

                    return !isNaN(
                        parseFloat(item)
                    );

                })

                .sort(function(a, b) {

                    return (
                        parseFloat(b) -
                        parseFloat(a)
                    );

                })

                .find(function(item) {

                    return (
                        parseFloat(item) <=
                        numericVersion
                    );

                });


        if (!matchingVersion) {

            return {
                class: "unknown",
                icon: "?",
                label: "Unknown",
                description:
                    "No compatibility data available."
            };

        }


        return parseSupportCode(
            stats[matchingVersion]
        );

    }


    /*
     * --------------------------------------------------
     * Parse Can I Use status
     * --------------------------------------------------
     *
     * Can I Use:
     *
     * y = supported
     * a = partial
     * n = not supported
     * u = unknown
     * x = prefixed
     *
     * Additional notes may follow the status.
     *
     * Example:
     *
     * n d #1
     */

    function parseSupportCode(code) {

        if (!code) {

            return {
                class: "unknown",
                icon: "?",
                label: "Unknown",
                description:
                    "Support information unavailable."
            };

        }


        const status =
            String(code).trim().charAt(0);


        switch (status) {

            case "y":

                return {
                    class: "supported",
                    icon: "✓",
                    label: "Supported",
                    description:
                        "Fully supported."
                };


            case "a":

                return {
                    class: "partial",
                    icon: "◐",
                    label: "Partial",
                    description:
                        "Partially supported."
                };


            case "x":

                return {
                    class: "prefix",
                    icon: "⚑",
                    label: "Prefixed",
                    description:
                        "Supported with a vendor prefix."
                };


            case "n":

                return {
                    class: "unsupported",
                    icon: "×",
                    label: "Not supported",
                    description:
                        "Not supported."
                };


            default:

                return {
                    class: "unknown",
                    icon: "?",
                    label: "Unknown",
                    description:
                        "Support information unavailable."
                };

        }

    }


    /*
     * --------------------------------------------------
     * Render status
     * --------------------------------------------------
     */

    function renderStatus(result) {

        return `

            <div class="support">

                <i class="status-icon ${result.class}">
                    ${result.icon}
                </i>

                <div>

                    <span class="support-label">
                        ${result.label}
                    </span>

                    <span class="support-since">
                        ${result.description}
                    </span>

                </div>

            </div>

        `;

    }


    /*
     * --------------------------------------------------
     * Latest version
     * --------------------------------------------------
     */

    function getLatestVersion(versions) {

        const numeric =
            versions

                .filter(function(version) {

                    return !isNaN(
                        parseFloat(version)
                    );

                });


        if (!numeric.length) {

            return versions[
                versions.length - 1
            ];

        }


        return numeric.sort(
            function(a, b) {

                return (
                    parseFloat(b) -
                    parseFloat(a)
                );

            }
        )[0];

    }


    /*
     * --------------------------------------------------
     * Feature ID
     * --------------------------------------------------
     *
     * The individual JSON file doesn't contain
     * its own filename, so we derive it from
     * the current search field when possible.
     */

    function getFeatureIdFromData(data) {

        const searchValue =
            $("#feature-search").val();


        return (
            resolveFeatureId(searchValue) ||
            "unknown"
        );

    }


    /*
     * --------------------------------------------------
     * Error
     * --------------------------------------------------
     */

    function showError(message) {

        $("#results-container")
            .html(

                $("<div>")
                    .addClass("error")
                    .text(message)

            );

    }


    /*
     * --------------------------------------------------
     * Escape HTML
     * --------------------------------------------------
     */

    function escapeHtml(value) {

        return String(value)

            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /*
     * --------------------------------------------------
     * Init
     * --------------------------------------------------
     */

    displayCurrentBrowser();


})(jQuery);
(function () {
    "use strict";

    var storageKey = "powerbi-course-progress-v1";

    function loadState() {
        try {
            var raw = window.localStorage.getItem(storageKey);
            return raw ? JSON.parse(raw) : {};
        } catch (_err) {
            return {};
        }
    }

    function saveState(state) {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (_err) {
            // Non-blocking if localStorage is unavailable.
        }
    }

    function setSectionState(sectionId, isComplete) {
        var section = document.getElementById(sectionId);
        if (!section) {
            return;
        }

        section.classList.toggle("section-complete", !!isComplete);
        section.setAttribute("data-complete", isComplete ? "true" : "false");
    }

    function initProgressTracking() {
        var state = loadState();
        var checkboxes = document.querySelectorAll(".complete-checkbox[data-section-id]");

        checkboxes.forEach(function (checkbox) {
            var sectionId = checkbox.getAttribute("data-section-id");
            if (!sectionId) {
                return;
            }

            var checked = !!state[sectionId];
            checkbox.checked = checked;
            setSectionState(sectionId, checked);

            checkbox.addEventListener("change", function () {
                var isComplete = checkbox.checked;
                state[sectionId] = isComplete;
                setSectionState(sectionId, isComplete);
                saveState(state);
            });
        });
    }

    function initAccordions() {
        var accordions = document.querySelectorAll("[data-accordion]");

        accordions.forEach(function (accordion) {
            var singleOpen = accordion.getAttribute("data-single") === "true";
            var items = accordion.querySelectorAll(".accordion-item");

            items.forEach(function (item, index) {
                var trigger = item.querySelector(".accordion-trigger");
                var panel = item.querySelector(".accordion-panel");

                if (!trigger || !panel) {
                    return;
                }

                var shouldStartOpen = item.getAttribute("data-open") === "true" || (
                    index === 0 && accordion.getAttribute("data-open-first") === "true"
                );

                item.classList.toggle("is-open", shouldStartOpen);
                panel.hidden = !shouldStartOpen;
                trigger.setAttribute("aria-expanded", shouldStartOpen ? "true" : "false");

                trigger.addEventListener("click", function () {
                    var isOpen = item.classList.contains("is-open");

                    if (singleOpen) {
                        items.forEach(function (otherItem) {
                            if (otherItem === item) {
                                return;
                            }
                            otherItem.classList.remove("is-open");
                            var otherPanel = otherItem.querySelector(".accordion-panel");
                            var otherTrigger = otherItem.querySelector(".accordion-trigger");
                            if (otherPanel) {
                                otherPanel.hidden = true;
                            }
                            if (otherTrigger) {
                                otherTrigger.setAttribute("aria-expanded", "false");
                            }
                        });
                    }

                    item.classList.toggle("is-open", !isOpen);
                    panel.hidden = isOpen;
                    trigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
                });
            });
        });
    }

    function initTabs() {
        var tabContainers = document.querySelectorAll("[data-tabs]");

        tabContainers.forEach(function (container) {
            var buttons = container.querySelectorAll(".tab-button[data-tab-target]");
            var panels = container.querySelectorAll(".tab-panel[data-tab-panel]");

            function activate(targetId) {
                buttons.forEach(function (button) {
                    var isActive = button.getAttribute("data-tab-target") === targetId;
                    button.classList.toggle("active", isActive);
                    button.setAttribute("aria-selected", isActive ? "true" : "false");
                });

                panels.forEach(function (panel) {
                    var isActive = panel.getAttribute("data-tab-panel") === targetId;
                    panel.classList.toggle("active", isActive);
                    panel.hidden = !isActive;
                });
            }

            var firstTarget = null;
            buttons.forEach(function (button, index) {
                var target = button.getAttribute("data-tab-target");
                if (!target) {
                    return;
                }

                if (index === 0) {
                    firstTarget = target;
                }

                button.addEventListener("click", function () {
                    activate(target);
                });
            });

            if (firstTarget) {
                activate(firstTarget);
            }
        });
    }

    function fallbackCopy(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand("copy");
        } catch (_err) {
            // Ignore and clean up.
        }

        document.body.removeChild(textArea);
    }

    function copyText(text) {
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
            fallbackCopy(text);
            return Promise.resolve();
        }

        return navigator.clipboard.writeText(text).catch(function () {
            fallbackCopy(text);
        });
    }

    function initCopyButtons() {
        var buttons = document.querySelectorAll(".copy-btn");

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var dataText = button.getAttribute("data-copy-text");
                var targetId = button.getAttribute("data-copy-target");
                var textToCopy = dataText;

                if (!textToCopy && targetId) {
                    var target = document.getElementById(targetId);
                    if (target) {
                        textToCopy = target.textContent;
                    }
                }

                if (!textToCopy) {
                    return;
                }

                copyText(textToCopy).then(function () {
                    var originalLabel = button.textContent;
                    button.textContent = "Copied";
                    button.classList.add("copied");

                    window.setTimeout(function () {
                        button.textContent = originalLabel;
                        button.classList.remove("copied");
                    }, 1200);
                });
            });
        });
    }

    function init() {
        initAccordions();
        initTabs();
        initProgressTracking();
        initCopyButtons();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

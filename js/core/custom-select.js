/**
 * Searchable combobox (custom select with filterable input).
 */
function closeAllExcept(exceptWrapper) {
    document.querySelectorAll(".custom-select-wrapper.open").forEach(w => {
        if (w !== exceptWrapper) {
            w.classList.remove("open");
        }
    });
}

function getVisibleOptions(wrapper) {
    return [...wrapper.querySelectorAll(".custom-select-option")].filter(
        opt => opt.style.display !== "none"
    );
}

export function renderCustomSelectOptions(options) {
    return options
        .map(
            opt => `
        <div class="custom-select-option" data-value="${opt.value}" style="display: flex;">
            ${opt.label}
        </div>`
        )
        .join("");
}

export function setComboboxSearchMode(wrapper, enabled) {
    wrapper.classList.toggle("is-plain", !enabled);
    if (!enabled) {
        wrapper.classList.remove("open");
    }
}

export function clearCombobox(wrapper) {
    setCustomSelectValue(wrapper, "", "");
}

export function initCustomSelect(wrapper, { onChange, getFilterText } = {}) {
    const hidden = wrapper.querySelector('input[type="hidden"]');
    const input = wrapper.querySelector(".custom-select-input");
    const optionsContainer = wrapper.querySelector(".custom-select-options");
    const allOptions = () => [...wrapper.querySelectorAll(".custom-select-option")];

    function isPlain() {
        return wrapper.classList.contains("is-plain");
    }

    function filterOptions(query) {
        const q = query.trim().toLowerCase();
        allOptions().forEach(opt => {
            const text = (getFilterText?.(opt) ?? opt.textContent).trim().toLowerCase();
            opt.style.display = !q || text.includes(q) ? "flex" : "none";
        });
    }

    function setSelected(opt) {
        const value = opt.dataset.value;
        const label = opt.textContent.trim();
        hidden.value = value;
        input.value = label;
        allOptions().forEach(o => o.classList.toggle("selected", o === opt));
        wrapper.classList.remove("open");
        onChange?.({ value, label, element: opt });
    }

    function openDropdown() {
        if (isPlain()) return;
        closeAllExcept(wrapper);
        wrapper.classList.add("open");
        filterOptions(input.value);
    }

    input.addEventListener("focus", openDropdown);
    input.addEventListener("click", openDropdown);

    input.addEventListener("input", () => {
        if (isPlain()) {
            hidden.value = "";
            return;
        }
        if (!hidden.value && input.value) {
            hidden.value = "";
        }
        openDropdown();
        filterOptions(input.value);
        const visible = getVisibleOptions(wrapper);
        if (visible.length === 1) {
            hidden.value = visible[0].dataset.value;
        } else if (!visible.some(o => o.dataset.value === hidden.value)) {
            hidden.value = "";
        }
    });

    wrapper.querySelector(".custom-select-trigger")?.addEventListener("click", (e) => {
        if (e.target === input) return;
        input.focus();
        openDropdown();
    });

    optionsContainer.addEventListener("click", (e) => {
        if (isPlain()) return;
        const opt = e.target.closest(".custom-select-option");
        if (!opt || opt.style.display === "none") return;
        setSelected(opt);
    });

    input.addEventListener("keydown", (e) => {
        if (isPlain()) return;
        const visible = getVisibleOptions(wrapper);
        if (e.key === "Escape") {
            wrapper.classList.remove("open");
            return;
        }
        if (e.key === "Enter" && visible.length > 0) {
            e.preventDefault();
            setSelected(visible[0]);
        }
    });

    document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove("open");
        }
    });
}

export function setCustomSelectValue(wrapper, value, label) {
    const hidden = wrapper.querySelector('input[type="hidden"]');
    const input = wrapper.querySelector(".custom-select-input");
    hidden.value = value;
    input.value = label || "";
    wrapper.querySelectorAll(".custom-select-option").forEach(opt => {
        opt.classList.toggle("selected", opt.dataset.value === value);
    });
}

export function updateCustomSelectOptions(wrapper, optionsHtml, selectedValue) {
    const optionsContainer = wrapper.querySelector(".custom-select-options");
    optionsContainer.innerHTML = optionsHtml;
    if (selectedValue) {
        const match = wrapper.querySelector(
            `.custom-select-option[data-value="${selectedValue}"]`
        );
        if (match) {
            setCustomSelectValue(wrapper, selectedValue, match.textContent.trim());
        } else {
            setCustomSelectValue(wrapper, "", "");
        }
    }
}

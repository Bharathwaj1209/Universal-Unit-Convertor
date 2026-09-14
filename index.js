const convertBtn = document.getElementById("convert-btn");
const numberInput = document.getElementById("number-input");
const categorySelect = document.getElementById("category-select");
const fromUnit = document.getElementById("from-unit");
const toUnit = document.getElementById("to-unit");
const swapBtn = document.getElementById("swap-btn");
const copyBtn = document.getElementById("copy-btn");
const themeBtn = document.getElementById("theme-btn");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const resultEl = document.getElementById("result-el");
const resultTitle = document.getElementById("result-title");
const historyList = document.getElementById("history-list");

const units = {
    length: {
        "mm": { name: "Millimeter", factor: 0.001 },
        "cm": { name: "Centimeter", factor: 0.01 },
        "m": { name: "Meter", factor: 1 },
        "km": { name: "Kilometer", factor: 1000 },
        "inch": { name: "Inch", factor: 0.0254 },
        "ft": { name: "Feet", factor: 0.3048 },
        "mile": { name: "Mile", factor: 1609.344 }
    },
    weight: {
        "mg": { name: "Milligram", factor: 0.000001 },
        "g": { name: "Gram", factor: 0.001 },
        "kg": { name: "Kilogram", factor: 1 },
        "pound": { name: "Pound", factor: 0.45359237 },
        "ounce": { name: "Ounce", factor: 0.028349523125 }
    },
    temperature: {
        "c": { name: "Celsius" },
        "f": { name: "Fahrenheit" },
        "k": { name: "Kelvin" }
    },
    volume: {
        "ml": { name: "Milliliter", factor: 0.001 },
        "liter": { name: "Liter", factor: 1 },
        "gallon": { name: "Gallon", factor: 3.785411784 }
    },
    time: {
        "second": { name: "Second", factor: 1 },
        "minute": { name: "Minute", factor: 60 },
        "hour": { name: "Hour", factor: 3600 },
        "day": { name: "Day", factor: 86400 }
    }
};

let history = JSON.parse(localStorage.getItem("unitHistory") || "[]");

function populateUnits() {
    const category = categorySelect.value;
    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";

    Object.entries(units[category]).forEach(([key, unit]) => {
        fromUnit.add(new Option(unit.name, key));
        toUnit.add(new Option(unit.name, key));
    });

    if (toUnit.options.length > 1) toUnit.selectedIndex = 1;
}

function convertTemperature(value, from, to) {
    let celsius;

    if (from === "c") celsius = value;
    else if (from === "f") celsius = (value - 32) * 5 / 9;
    else celsius = value - 273.15;

    if (to === "c") return celsius;
    if (to === "f") return celsius * 9 / 5 + 32;
    return celsius + 273.15;
}

function convertValue(value, category, from, to) {
    if (category === "temperature") {
        return convertTemperature(value, from, to);
    }

    const baseValue = value * units[category][from].factor;
    return baseValue / units[category][to].factor;
}

function formatNumber(value) {
    return Number(value.toFixed(6)).toLocaleString();
}

function performConversion(saveToHistory = true) {
    const value = parseFloat(numberInput.value);

    if (Number.isNaN(value)) {
        resultEl.textContent = "Please enter a valid number.";
        return;
    }

    const category = categorySelect.value;
    const from = fromUnit.value;
    const to = toUnit.value;
    const result = convertValue(value, category, from, to);

    const fromName = units[category][from].name;
    const toName = units[category][to].name;

    const text = `${formatNumber(value)} ${fromName} = ${formatNumber(result)} ${toName}`;
    resultTitle.textContent = `${fromName} → ${toName}`;
    resultEl.textContent = text;

    if (saveToHistory) {
        history.unshift(text);
        history = history.slice(0, 8);
        localStorage.setItem("unitHistory", JSON.stringify(history));
        renderHistory();
    }
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<li class="empty-history">No conversions yet.</li>';
        return;
    }

    historyList.innerHTML = history.map(item => `<li>${item}</li>`).join("");
}

categorySelect.addEventListener("change", () => {
    populateUnits();
    performConversion(false);
});

convertBtn.addEventListener("click", () => performConversion(true));

numberInput.addEventListener("keydown", event => {
    if (event.key === "Enter") performConversion(true);
});

swapBtn.addEventListener("click", () => {
    const current = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = current;
    performConversion(false);
});

copyBtn.addEventListener("click", async () => {
    if (!resultEl.textContent || resultEl.textContent.includes("Please enter")) return;

    try {
        await navigator.clipboard.writeText(resultEl.textContent);
        copyBtn.textContent = "✅ Copied!";
        setTimeout(() => copyBtn.textContent = "📋 Copy Result", 1200);
    } catch {
        copyBtn.textContent = "Copy failed";
        setTimeout(() => copyBtn.textContent = "📋 Copy Result", 1200);
    }
});

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const darkMode = document.body.classList.contains("dark");
    themeBtn.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("darkMode", darkMode);
});

clearHistoryBtn.addEventListener("click", () => {
    history = [];
    localStorage.removeItem("unitHistory");
    renderHistory();
});

if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️ Light Mode";
}

populateUnits();
renderHistory();
performConversion(false);

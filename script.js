/* script.js */
// Utilise le stockage local du navigateur (localStorage) pour garder les données
const STORAGE_KEY = "hourTrackerEntries";

// Récupérer les entrées depuis le storage ou initialiser un tableau vide
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Références DOM
const dateInput   = document.getElementById("date");
const hoursInput  = document.getElementById("hours");
const targetInput = document.getElementById("target");
const addBtn      = document.getElementById("addBtn");
const tbody       = document.getElementById("entriesBody");

const monthTotalEl   = document.getElementById("monthTotal");
const monthTargetEl  = document.getElementById("monthTarget");
const monthDiffEl    = document.getElementById("monthDiff");
const balanceEl      = document.getElementById("balance");

// ---------- Fonctions utilitaires ----------
function saveEntries() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function renderTable() {
    tbody.innerHTML = "";
    // Tri chronologique croissant
    const sorted = [...entries].sort((a,b)=> new Date(a.date) - new Date(b.date));

    sorted.forEach(e => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${e.date}</td>
            <td>${e.hours}</td>
            <td>${e.target}</td>
            <td class="${e.diff >= 0 ? 'positive' : 'negative'}">${e.diff.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateSummary() {
    if (entries.length === 0) {
        monthTotalEl.textContent = "0";
        monthTargetEl.textContent = "0";
        monthDiffEl.textContent = "0";
        balanceEl.textContent = "0 h";
        balanceEl.className = "neutral";
        return;
    }

    // Filtrer les entrées du mois en cours
    const now = new Date();
    const currentMonth = now.getMonth(); // 0‑11
    const currentYear  = now.getFullYear();

    const monthEntries = entries.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalHours   = monthEntries.reduce((sum, e) => sum + e.hours, 0);
    const totalTarget  = monthEntries.reduce((sum, e) => sum + e.target, 0);
    const diffTotal    = totalHours - totalTarget;

    monthTotalEl.textContent   = totalHours.toFixed(2);
    monthTargetEl.textContent  = totalTarget.toFixed(2);
    monthDiffEl.textContent    = diffTotal.toFixed(2);

    balanceEl.textContent = diffTotal.toFixed(2) + " h";
    balanceEl.className = diffTotal > 0 ? "positive"
                       : diffTotal < 0 ? "negative"
                       : "neutral";
}

// ---------- Gestion du formulaire ----------
addBtn.addEventListener("click", () => {
    const date   = dateInput.value;
    const hours  = parseFloat(hoursInput.value);
    const target = parseFloat(targetInput.value);

    if (!date || isNaN(hours) || isNaN(target)) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    // Recherche d'une entrée déjà existante pour la même date
    const idx = entries.findIndex(e => e.date === date);
    const diff = hours - target;

    const entry = { date, hours, target, diff };

    if (idx >= 0) {
        // Mettre à jour
        entries[idx] = entry;
    } else {
        // Ajouter
        entries.push(entry);
    }

    saveEntries();
    renderTable();
    updateSummary();

    // Nettoyer le formulaire (laisser la date pour faciliter la saisie successive)
    hoursInput.value = "";
    // targetInput garde sa valeur (souvent constante)
});

// ---------- Initialisation ----------
renderTable();
updateSummary();
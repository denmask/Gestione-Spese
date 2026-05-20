let currentChart = null;
let allExpenses = [];

window.addEventListener("DOMContentLoaded", () => {
  loadLocalData();
  setupEventListeners();
  renderFormByType("daily");
  renderCurrentTab("daily");
  setupSideMenu();
  if (allExpenses.length === 0) loadExampleData();
});

function setupEventListeners() {
  document
    .getElementById("expenseTypeSelect")
    .addEventListener("change", (e) => {
      renderFormByType(e.target.value);
    });
  document
    .getElementById("exportDataBtn")
    .addEventListener("click", exportBackup);
  document
    .getElementById("importFileInput")
    .addEventListener("change", importBackup);
  document
    .getElementById("syncNowBtn")
    .addEventListener("click", syncToFirebase);
  document
    .getElementById("resetAllBtn")
    .addEventListener("click", resetAllData);
  document
    .getElementById("loadExampleBtn")
    .addEventListener("click", loadExampleData);
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCurrentTab(btn.dataset.tab);
    });
  });
}

function setupSideMenu() {
  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("closeMenu");
  const menu = document.getElementById("sideMenu");
  const overlay = document.getElementById("menuOverlay");
  function openMenu() {
    menu.classList.add("open");
    overlay.classList.add("active");
  }
  function closeMenu() {
    menu.classList.remove("open");
    overlay.classList.remove("active");
  }
  menuBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);
}

function renderFormByType(type) {
  const container = document.getElementById("dynamicForm");
  if (type === "daily") {
    container.innerHTML = `
            <div class="form-row"><label>💰 Importo (€)</label><input type="number" id="amountDaily" step="0.01" placeholder="0.00"></div>
            <div class="form-row"><label>📝 Descrizione</label><input type="text" id="descDaily" placeholder="es. Caffè, Pranzo"></div>
            <div class="form-row"><label>📂 Categoria</label><select id="catDaily"><option>Cibo</option><option>Trasporti</option><option>Svago</option><option>Casa</option><option>Salute</option><option>Altro</option></select></div>
            <button class="save-btn" id="saveDailyBtn">➕ Aggiungi Spesa Quotidiana</button>
        `;
    document
      .getElementById("saveDailyBtn")
      .addEventListener("click", () => addExpense("daily"));
  } else if (type === "fixed") {
    container.innerHTML = `
            <div class="form-row"><label>🏷️ Nome spesa fissa</label><input type="text" id="fixedName" placeholder="es. Affitto, Netflix"></div>
            <div class="form-row"><label>💰 Importo (€)</label><input type="number" id="fixedAmount" step="0.01"></div>
            <div class="form-row"><label>📅 Giorno fatturazione (1-31)</label><input type="number" id="fixedDay" min="1" max="31" value="1"></div>
            <button class="save-btn" id="saveFixedBtn">➕ Aggiungi Spesa Fissa</button>
        `;
    document
      .getElementById("saveFixedBtn")
      .addEventListener("click", () => addExpense("fixed"));
  } else if (type === "family") {
    container.innerHTML = `
            <div class="form-row"><label>👤 Membro</label><select id="familyMember"><option>Mario</option><option>Lucia</option><option>Entrambi</option></select></div>
            <div class="form-row"><label>💰 Importo (€)</label><input type="number" id="familyAmount" step="0.01"></div>
            <div class="form-row"><label>🏷️ Categoria personalizzata</label><input type="text" id="familyCat" placeholder="es. Supermercato, Bolletta"></div>
            <button class="save-btn" id="saveFamilyBtn">➕ Aggiungi Spesa Famiglia</button>
        `;
    document
      .getElementById("saveFamilyBtn")
      .addEventListener("click", () => addExpense("family"));
  }
}

function addExpense(type) {
  const newId = Date.now().toString();
  let expense = { id: newId, type, date: new Date().toISOString() };

  if (type === "daily") {
    const amount = parseFloat(document.getElementById("amountDaily").value);
    const desc = document.getElementById("descDaily").value.trim();
    const category = document.getElementById("catDaily").value;
    if (isNaN(amount) || amount <= 0 || desc === "") {
      alert("Importo e descrizione validi");
      return;
    }
    expense.amount = amount;
    expense.description = desc;
    expense.category = category;
  } else if (type === "fixed") {
    const name = document.getElementById("fixedName").value.trim();
    const amount = parseFloat(document.getElementById("fixedAmount").value);
    const day = parseInt(document.getElementById("fixedDay").value);
    if (isNaN(amount) || amount <= 0 || name === "") {
      alert("Inserisci nome e importo");
      return;
    }
    expense.name = name;
    expense.amount = amount;
    expense.day = day;
  } else if (type === "family") {
    const member = document.getElementById("familyMember").value;
    const amount = parseFloat(document.getElementById("familyAmount").value);
    const cat = document.getElementById("familyCat").value.trim() || "Varie";
    if (isNaN(amount) || amount <= 0) {
      alert("Importo valido");
      return;
    }
    expense.member = member;
    expense.amount = amount;
    expense.customCat = cat;
  }

  allExpenses.push(expense);
  saveToLocal();
  renderCurrentTab(getActiveTab());
  updateFooterTotals();
}

function getActiveTab() {
  const active = document.querySelector(".tab-btn.active");
  return active ? active.dataset.tab : "daily";
}

function renderCurrentTab(tabType) {
  let filtered = allExpenses.filter((exp) => exp.type === tabType);
  const container = document.getElementById("listContainer");
  if (filtered.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; padding:40px;">✨ Nessuna spesa. Aggiungine una!</div>';
    renderChart(tabType);
    return;
  }

  let html = "";
  filtered.forEach((exp) => {
    if (exp.type === "daily") {
      html += `<div class="expense-item"><div class="expense-info"><div class="expense-title">${escapeHtml(exp.description)}</div><div class="expense-detail">${exp.category} • ${new Date(exp.date).toLocaleDateString()}</div></div><div class="expense-amount">${exp.amount.toFixed(2)} €</div><div class="expense-actions"><button class="delete-btn" data-id="${exp.id}">🗑️</button></div></div>`;
    } else if (exp.type === "fixed") {
      html += `<div class="expense-item"><div class="expense-info"><div class="expense-title">🏷️ ${escapeHtml(exp.name)}</div><div class="expense-detail">Fissa • Giorno ${exp.day}</div></div><div class="expense-amount">${exp.amount.toFixed(2)} €</div><div class="expense-actions"><button class="delete-btn" data-id="${exp.id}">🗑️</button></div></div>`;
    } else if (exp.type === "family") {
      html += `<div class="expense-item"><div class="expense-info"><div class="expense-title">👨‍👩‍👧 ${escapeHtml(exp.member)}</div><div class="expense-detail">${escapeHtml(exp.customCat)} • ${new Date(exp.date).toLocaleDateString()}</div></div><div class="expense-amount">${exp.amount.toFixed(2)} €</div><div class="expense-actions"><button class="delete-btn" data-id="${exp.id}">🗑️</button></div></div>`;
    }
  });
  container.innerHTML = html;
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      allExpenses = allExpenses.filter((ex) => ex.id !== id);
      saveToLocal();
      renderCurrentTab(getActiveTab());
      updateFooterTotals();
      renderChart(getActiveTab());
    });
  });
  renderChart(tabType);
}

function renderChart(tabType) {
  const filtered = allExpenses.filter((exp) => exp.type === tabType);
  const ctx = document.getElementById("statsChart").getContext("2d");
  if (currentChart) currentChart.destroy();

  let labels = [],
    data = [];
  if (tabType === "daily") {
    const catMap = new Map();
    filtered.forEach((exp) => {
      catMap.set(exp.category, (catMap.get(exp.category) || 0) + exp.amount);
    });
    labels = Array.from(catMap.keys());
    data = Array.from(catMap.values());
  } else if (tabType === "fixed") {
    const nameMap = new Map();
    filtered.forEach((exp) => {
      nameMap.set(exp.name, (nameMap.get(exp.name) || 0) + exp.amount);
    });
    labels = Array.from(nameMap.keys());
    data = Array.from(nameMap.values());
  } else {
    const memberMap = new Map();
    filtered.forEach((exp) => {
      memberMap.set(exp.member, (memberMap.get(exp.member) || 0) + exp.amount);
    });
    labels = Array.from(memberMap.keys());
    data = Array.from(memberMap.values());
  }

  currentChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "€ Spesi",
          data,
          backgroundColor: "#0077b6",
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { position: "top" } },
    },
  });
}

function updateFooterTotals() {
  const totalGeneral = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyTotal = allExpenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((s, e) => s + e.amount, 0);
  document.getElementById("totalGeneral").innerText =
    totalGeneral.toFixed(2) + " €";
  document.getElementById("totalMonth").innerText =
    monthlyTotal.toFixed(2) + " €";
  document.getElementById("totalCount").innerText = allExpenses.length;
}

function saveToLocal() {
  localStorage.setItem("budgetTotalApp", JSON.stringify(allExpenses));
  updateFooterTotals();
}

function loadLocalData() {
  const stored = localStorage.getItem("budgetTotalApp");
  if (stored) {
    allExpenses = JSON.parse(stored);
  }
  updateFooterTotals();
}

function exportBackup() {
  const dataStr = JSON.stringify(allExpenses, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `budget_backup_${new Date().toISOString().slice(0, 19)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        allExpenses = imported;
        saveToLocal();
        renderCurrentTab(getActiveTab());
        updateFooterTotals();
        alert("Backup importato!");
      } else alert("Formato non valido");
    } catch (err) {
      alert("Errore import");
    }
  };
  reader.readAsText(file);
  document.getElementById("importFileInput").value = "";
}

async function syncToFirebase() {
  if (!firebase.apps.length) {
    alert("Firebase non configurato. Aggiungi il firebase-config corretto.");
    return;
  }
  try {
    await db
      .collection("spese_totali")
      .doc("backup_unico")
      .set({ data: allExpenses, updatedAt: new Date() });
    alert("✅ Dati salvati su Firebase Cloud!");
  } catch (e) {
    alert("Errore sync: " + e.message);
  }
}

function resetAllData() {
  if (confirm("Cancellare TUTTE le spese?")) {
    allExpenses = [];
    saveToLocal();
    renderCurrentTab(getActiveTab());
    updateFooterTotals();
    renderChart(getActiveTab());
  }
}

function loadExampleData() {
  allExpenses = [
    {
      id: "ex1",
      type: "daily",
      amount: 4.5,
      description: "Caffè + brioche",
      category: "Cibo",
      date: new Date().toISOString(),
    },
    {
      id: "ex2",
      type: "daily",
      amount: 22.0,
      description: "Pranzo fuori",
      category: "Svago",
      date: new Date().toISOString(),
    },
    {
      id: "ex3",
      type: "fixed",
      amount: 550,
      name: "Affitto",
      day: 5,
      date: new Date().toISOString(),
    },
    {
      id: "ex4",
      type: "fixed",
      amount: 12.99,
      name: "Netflix",
      day: 15,
      date: new Date().toISOString(),
    },
    {
      id: "ex5",
      type: "family",
      amount: 85,
      member: "Mario",
      customCat: "Vestiti",
      date: new Date().toISOString(),
    },
    {
      id: "ex6",
      type: "family",
      amount: 120,
      member: "Lucia",
      customCat: "Corsi",
      date: new Date().toISOString(),
    },
  ];
  saveToLocal();
  renderCurrentTab(getActiveTab());
  updateFooterTotals();
  renderChart(getActiveTab());
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

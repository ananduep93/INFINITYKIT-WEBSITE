// ==================== EXPENSE TRACKER MODULE ====================
const EXPENSE_DB_KEY = 'infinityKitExpenseDB';
const EXPENSE_DATA_EVENT = 'infinityKitExpenseDataChanged';
const EXPENSE_BASE_CATEGORIES = [
    'Food',
    'Transport',
    'Shopping',
    'Bills',
    'Health',
    'Entertainment',
    'Education',
    'Travel',
    'Other'
];

let expenseToolSyncCleanup = null;

function cleanupExpenseToolSync() {
    if (typeof expenseToolSyncCleanup === 'function') {
        expenseToolSyncCleanup();
    }
    expenseToolSyncCleanup = null;
}

function syncExpenseTool(renderFn) {
    cleanupExpenseToolSync();
    const safeRender = () => {
        try {
            renderFn();
        } catch (error) {
            console.error('Expense tracker render error:', error);
        }
    };

    safeRender();
    const handler = () => safeRender();
    window.addEventListener(EXPENSE_DATA_EVENT, handler);
    expenseToolSyncCleanup = () => window.removeEventListener(EXPENSE_DATA_EVENT, handler);
}

function getExpenseTodayISO() {
    return new Date().toISOString().split('T')[0];
}

function parseExpenseDate(dateStr) {
    return new Date(`${dateStr}T00:00:00`);
}

function formatExpenseCurrency(value) {
    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(Number(value) || 0);
    } catch (e) {
        return `Rs ${Number(value || 0).toFixed(2)}`;
    }
}

function getExpenseDB() {
    const empty = { expenses: [], budgets: {} };
    const raw = localStorage.getItem(EXPENSE_DB_KEY);
    if (!raw) return empty;

    try {
        const parsed = JSON.parse(raw);
        const budgets = parsed && typeof parsed.budgets === 'object' && !Array.isArray(parsed.budgets)
            ? parsed.budgets
            : {};
        const cleanBudgets = {};
        Object.entries(budgets).forEach(([category, amount]) => {
            const value = Number(amount);
            if (category && Number.isFinite(value) && value > 0) {
                cleanBudgets[category] = value;
            }
        });

        const expensesRaw = Array.isArray(parsed?.expenses) ? parsed.expenses : [];
        const expenses = expensesRaw
            .map(item => {
                const amount = Number(item?.amount);
                const category = String(item?.category || '').trim() || 'Other';
                const date = String(item?.date || getExpenseTodayISO()).slice(0, 10);
                if (!Number.isFinite(amount) || amount <= 0) return null;
                return {
                    id: String(item?.id || `${Date.now()}${Math.random().toString(36).slice(2, 8)}`),
                    amount,
                    category,
                    date,
                    note: String(item?.note || '').trim(),
                    createdAt: Number(item?.createdAt || Date.now())
                };
            })
            .filter(Boolean);

        return { expenses, budgets: cleanBudgets };
    } catch (e) {
        return empty;
    }
}

function saveExpenseDB(db, notify = true) {
    localStorage.setItem(EXPENSE_DB_KEY, JSON.stringify(db));
    if (notify) {
        window.dispatchEvent(new Event(EXPENSE_DATA_EVENT));
    }
}

function clearExpenseTrackerData() {
    saveExpenseDB({ expenses: [], budgets: {} });
}

function getExpenseCategories(db = getExpenseDB()) {
    const categories = new Set(EXPENSE_BASE_CATEGORIES);
    db.expenses.forEach(item => categories.add(item.category));
    Object.keys(db.budgets || {}).forEach(cat => categories.add(cat));
    return Array.from(categories);
}

function getExpenseCategoryOptions(selectedValue = '') {
    return getExpenseCategories()
        .map(category => `<option value="${escapeHtml(category)}" ${category === selectedValue ? 'selected' : ''}>${escapeHtml(category)}</option>`)
        .join('');
}

function getSortedExpenses(expenses) {
    return [...expenses].sort((a, b) => {
        if (a.date === b.date) return (b.createdAt || 0) - (a.createdAt || 0);
        return String(b.date).localeCompare(String(a.date));
    });
}

function getCategoryTotals(expenses) {
    return expenses.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
    }, {});
}

function getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

function getStartOfMonth(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(1);
    return d;
}

function addExpenseEntry(entry) {
    const db = getExpenseDB();
    db.expenses.push({
        id: `${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
        amount: Number(entry.amount),
        category: String(entry.category || 'Other').trim() || 'Other',
        date: String(entry.date || getExpenseTodayISO()).slice(0, 10),
        note: String(entry.note || '').trim(),
        createdAt: Date.now()
    });
    saveExpenseDB(db);
}

function updateExpenseEntry(id, updates) {
    const db = getExpenseDB();
    const index = db.expenses.findIndex(item => item.id === id);
    if (index === -1) return;

    const current = db.expenses[index];
    const amount = Number(updates.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    db.expenses[index] = {
        ...current,
        amount,
        category: String(updates.category || current.category || 'Other').trim() || 'Other',
        date: String(updates.date || current.date || getExpenseTodayISO()).slice(0, 10),
        note: String(updates.note ?? current.note ?? '').trim()
    };
    saveExpenseDB(db);
}

function deleteExpenseEntry(id) {
    const db = getExpenseDB();
    db.expenses = db.expenses.filter(item => item.id !== id);
    saveExpenseDB(db);
}

function setExpenseBudget(category, amount) {
    const db = getExpenseDB();
    const cleanCategory = String(category || '').trim();
    const cleanAmount = Number(amount);
    if (!cleanCategory) return;

    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
        delete db.budgets[cleanCategory];
    } else {
        db.budgets[cleanCategory] = cleanAmount;
    }
    saveExpenseDB(db);
}

function loadExpenseAddTool() {
    toolContent.innerHTML = `
        <div class="tool-form">
            <h3>➕💸 Add Expense</h3>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" id="expenseAmount" min="0.01" step="0.01" placeholder="Enter amount">
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="expenseCategory">${getExpenseCategoryOptions()}</select>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="expenseDate">
            </div>
            <div class="form-group">
                <label>Note (optional)</label>
                <textarea id="expenseNote" rows="3" placeholder="Add note..."></textarea>
            </div>
            <button onclick="submitExpenseEntry()">Save Expense</button>
            <div id="expenseAddStats" class="converter-info"></div>
        </div>
    `;
    document.getElementById('expenseDate').value = getExpenseTodayISO();
    syncExpenseTool(renderExpenseAddStats);
}

function submitExpenseEntry() {
    const amount = Number(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value.trim();
    const date = document.getElementById('expenseDate').value || getExpenseTodayISO();
    const note = document.getElementById('expenseNote').value.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
        showToast('Enter a valid amount', 'error');
        return;
    }
    if (!category) {
        showToast('Choose a category', 'error');
        return;
    }

    addExpenseEntry({ amount, category, date, note });
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseNote').value = '';
    document.getElementById('expenseDate').value = getExpenseTodayISO();
    showToast('Expense added', 'success');
}

function renderExpenseAddStats() {
    const statsBox = document.getElementById('expenseAddStats');
    if (!statsBox) return;
    const db = getExpenseDB();
    const total = db.expenses.reduce((sum, item) => sum + item.amount, 0);
    const monthStart = getStartOfMonth();
    const monthTotal = db.expenses
        .filter(item => parseExpenseDate(item.date) >= monthStart)
        .reduce((sum, item) => sum + item.amount, 0);

    statsBox.innerHTML = `
        <strong>Total Entries:</strong> ${db.expenses.length}<br>
        <strong>Lifetime Spend:</strong> ${formatExpenseCurrency(total)}<br>
        <strong>This Month:</strong> ${formatExpenseCurrency(monthTotal)}
    `;
}

function loadExpenseListTool() {
    toolContent.innerHTML = `
        <div class="tool-form">
            <h3>📋 Expense List</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr auto; gap:10px; margin-bottom: 12px;">
                <select id="expenseListCategoryFilter" onchange="renderExpenseListTable()">
                    <option value="all">All Categories</option>
                    ${getExpenseCategoryOptions()}
                </select>
                <input type="date" id="expenseListFromDate" onchange="renderExpenseListTable()">
                <input type="date" id="expenseListToDate" onchange="renderExpenseListTable()">
                <button onclick="resetExpenseListFilters()" class="btn-secondary">Reset</button>
            </div>
            <div id="expenseListTable"></div>
        </div>
    `;
    syncExpenseTool(renderExpenseListTable);
}

function resetExpenseListFilters() {
    const category = document.getElementById('expenseListCategoryFilter');
    const fromDate = document.getElementById('expenseListFromDate');
    const toDate = document.getElementById('expenseListToDate');
    if (category) category.value = 'all';
    if (fromDate) fromDate.value = '';
    if (toDate) toDate.value = '';
    renderExpenseListTable();
}

function renderExpenseListTable() {
    const container = document.getElementById('expenseListTable');
    if (!container) return;

    const categoryFilter = document.getElementById('expenseListCategoryFilter')?.value || 'all';
    const fromDate = document.getElementById('expenseListFromDate')?.value || '';
    const toDate = document.getElementById('expenseListToDate')?.value || '';

    let expenses = getSortedExpenses(getExpenseDB().expenses);
    if (categoryFilter !== 'all') {
        expenses = expenses.filter(item => item.category === categoryFilter);
    }
    if (fromDate) {
        expenses = expenses.filter(item => item.date >= fromDate);
    }
    if (toDate) {
        expenses = expenses.filter(item => item.date <= toDate);
    }

    if (expenses.length === 0) {
        container.innerHTML = '<p class="empty-message">No expenses found for selected filters.</p>';
        return;
    }

    container.innerHTML = expenses.map(item => `
        <div class="expense-row">
            <div>
                <div><strong>${formatExpenseCurrency(item.amount)}</strong> • ${escapeHtml(item.category)}</div>
                <div style="font-size:0.9rem; color:#666;">${escapeHtml(item.date)} ${item.note ? `• ${escapeHtml(item.note)}` : ''}</div>
            </div>
            <div style="display:flex; gap:8px;">
                <button onclick="editExpenseEntryPrompt('${item.id}')" class="btn-secondary">✏️</button>
                <button onclick="deleteExpenseEntryPrompt('${item.id}')" class="btn-danger">🗑️</button>
            </div>
        </div>
    `).join('');
}

function editExpenseEntryPrompt(id) {
    const db = getExpenseDB();
    const item = db.expenses.find(expense => expense.id === id);
    if (!item) return;

    const nextAmount = prompt('Edit amount:', item.amount);
    if (nextAmount === null) return;
    const nextCategory = prompt('Edit category:', item.category);
    if (nextCategory === null) return;
    const nextDate = prompt('Edit date (YYYY-MM-DD):', item.date);
    if (nextDate === null) return;
    const nextNote = prompt('Edit note (optional):', item.note || '');
    if (nextNote === null) return;

    const amount = Number(nextAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
        showToast('Invalid amount', 'error');
        return;
    }

    updateExpenseEntry(id, {
        amount,
        category: String(nextCategory).trim() || 'Other',
        date: String(nextDate).slice(0, 10) || getExpenseTodayISO(),
        note: String(nextNote || '').trim()
    });
    showToast('Expense updated', 'success');
}

function deleteExpenseEntryPrompt(id) {
    if (!confirm('Delete this expense?')) return;
    deleteExpenseEntry(id);
    showToast('Expense deleted', 'success');
}

function loadCategorySummaryTool() {
    toolContent.innerHTML = `
        <div class="tool-form">
            <h3>📊 Category Summary</h3>
            <div id="categorySummaryCards"></div>
        </div>
    `;
    syncExpenseTool(renderCategorySummaryCards);
}

function renderCategorySummaryCards() {
    const container = document.getElementById('categorySummaryCards');
    if (!container) return;

    const expenses = getExpenseDB().expenses;
    const totals = getCategoryTotals(expenses);
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const grandTotal = entries.reduce((sum, [, value]) => sum + value, 0);

    if (entries.length === 0) {
        container.innerHTML = '<p class="empty-message">No expense data yet.</p>';
        return;
    }

    container.innerHTML = entries.map(([category, total]) => {
        const percent = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : '0.0';
        return `
            <div class="expense-row">
                <div>
                    <strong>${escapeHtml(category)}</strong>
                    <div style="font-size:0.9rem; color:#666;">${percent}% of total spend</div>
                </div>
                <strong>${formatExpenseCurrency(total)}</strong>
            </div>
        `;
    }).join('');
}

function loadDailyMonthlyReportTool() {
    toolContent.innerHTML = `
        <div class="tool-form">
            <h3>📅 Daily / Monthly Report</h3>
            <div class="expense-cards-grid">
                <div class="expense-stat-card">
                    <div class="expense-stat-label">Today</div>
                    <div id="reportToday" class="expense-stat-value">-</div>
                </div>
                <div class="expense-stat-card">
                    <div class="expense-stat-label">This Week</div>
                    <div id="reportWeek" class="expense-stat-value">-</div>
                </div>
                <div class="expense-stat-card">
                    <div class="expense-stat-label">This Month</div>
                    <div id="reportMonth" class="expense-stat-value">-</div>
                </div>
            </div>
        </div>
    `;
    syncExpenseTool(renderDailyMonthlyReportValues);
}

function renderDailyMonthlyReportValues() {
    const db = getExpenseDB();
    const todayISO = getExpenseTodayISO();
    const weekStart = getStartOfWeek(new Date());
    const monthStart = getStartOfMonth(new Date());

    let todayTotal = 0;
    let weekTotal = 0;
    let monthTotal = 0;

    db.expenses.forEach(item => {
        const itemDate = parseExpenseDate(item.date);
        if (item.date === todayISO) todayTotal += item.amount;
        if (itemDate >= weekStart) weekTotal += item.amount;
        if (itemDate >= monthStart) monthTotal += item.amount;
    });

    const todayEl = document.getElementById('reportToday');
    const weekEl = document.getElementById('reportWeek');
    const monthEl = document.getElementById('reportMonth');
    if (todayEl) todayEl.textContent = formatExpenseCurrency(todayTotal);
    if (weekEl) weekEl.textContent = formatExpenseCurrency(weekTotal);
    if (monthEl) monthEl.textContent = formatExpenseCurrency(monthTotal);
}

function loadBudgetTrackerTool() {
    toolContent.innerHTML = `
        <div class="tool-form">
            <h3>🎯 Budget Tracker</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr auto; gap:10px; margin-bottom: 12px;">
                <select id="budgetCategory">${getExpenseCategoryOptions()}</select>
                <input type="number" id="budgetAmount" min="0.01" step="0.01" placeholder="Budget amount">
                <button onclick="saveCategoryBudget()">Save</button>
            </div>
            <div id="budgetTrackerList"></div>
        </div>
    `;
    syncExpenseTool(renderBudgetTrackerList);
}

function saveCategoryBudget() {
    const category = document.getElementById('budgetCategory')?.value || '';
    const amount = Number(document.getElementById('budgetAmount')?.value || 0);
    if (!category) {
        showToast('Choose a category', 'error');
        return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
        showToast('Enter a valid budget amount', 'error');
        return;
    }

    setExpenseBudget(category, amount);
    document.getElementById('budgetAmount').value = '';
    showToast('Budget updated', 'success');
}

function removeCategoryBudget(category) {
    setExpenseBudget(category, 0);
    showToast('Budget removed', 'success');
}

function renderBudgetTrackerList() {
    const container = document.getElementById('budgetTrackerList');
    if (!container) return;

    const db = getExpenseDB();
    const budgetEntries = Object.entries(db.budgets || {});
    if (budgetEntries.length === 0) {
        container.innerHTML = '<p class="empty-message">No budgets set yet.</p>';
        return;
    }

    const categoryTotals = getCategoryTotals(db.expenses);
    container.innerHTML = budgetEntries.map(([category, budget]) => {
        const spent = categoryTotals[category] || 0;
        const remaining = budget - spent;
        const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
        const isExceeded = remaining < 0;
        const progressColor = isExceeded ? '#dc3545' : percent > 80 ? '#ff9800' : '#4caf50';

        return `
            <div class="expense-budget-card">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                    <strong>${escapeHtml(category)}</strong>
                    <button class="btn-secondary" onclick="removeCategoryBudget('${escapeHtml(category)}')">Remove</button>
                </div>
                <div style="margin-top:8px;">
                    Budget: <strong>${formatExpenseCurrency(budget)}</strong><br>
                    Spent: <strong>${formatExpenseCurrency(spent)}</strong><br>
                    Remaining: <strong style="color:${isExceeded ? '#dc3545' : '#2e7d32'};">${formatExpenseCurrency(remaining)}</strong>
                </div>
                <div class="expense-progress"><div style="width:${percent}%; background:${progressColor};"></div></div>
                ${isExceeded ? '<div class="expense-warning">Budget exceeded!</div>' : ''}
            </div>
        `;
    }).join('');
}

function loadSearchExpensesTool() {
    toolContent.innerHTML = `
        <div class="tool-form">
            <h3>🔍 Search Expenses</h3>
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:10px; margin-bottom:12px;">
                <input type="text" id="expenseSearchInput" placeholder="Search by category or note..." oninput="renderSearchExpenseResults()">
                <select id="expenseSearchCategory" onchange="renderSearchExpenseResults()">
                    <option value="all">All Categories</option>
                    ${getExpenseCategoryOptions()}
                </select>
            </div>
            <div id="expenseSearchResults"></div>
        </div>
    `;
    syncExpenseTool(renderSearchExpenseResults);
}

function renderSearchExpenseResults() {
    const container = document.getElementById('expenseSearchResults');
    if (!container) return;

    const query = (document.getElementById('expenseSearchInput')?.value || '').trim().toLowerCase();
    const category = document.getElementById('expenseSearchCategory')?.value || 'all';

    let expenses = getSortedExpenses(getExpenseDB().expenses);
    if (category !== 'all') {
        expenses = expenses.filter(item => item.category === category);
    }
    if (query) {
        expenses = expenses.filter(item =>
            item.category.toLowerCase().includes(query) ||
            (item.note || '').toLowerCase().includes(query)
        );
    }

    if (expenses.length === 0) {
        container.innerHTML = '<p class="empty-message">No matching expenses.</p>';
        return;
    }

    container.innerHTML = `
        <div style="margin-bottom:8px; font-size:0.95rem; color:#666;">${expenses.length} result(s)</div>
        ${expenses.map(item => `
            <div class="expense-row">
                <div>
                    <strong>${formatExpenseCurrency(item.amount)}</strong> • ${escapeHtml(item.category)}
                    <div style="font-size:0.9rem; color:#666;">${escapeHtml(item.date)} ${item.note ? `• ${escapeHtml(item.note)}` : ''}</div>
                </div>
            </div>
        `).join('')}
    `;
}

function loadResetExpenseDataTool() {
    toolContent.innerHTML = `
        <div class="tool-form">
            <h3>🗑️ Reset Data</h3>
            <div id="resetExpenseStats" class="converter-info"></div>
            <button class="btn-danger" onclick="confirmResetExpenseData()">Clear All Expense Data</button>
        </div>
    `;
    syncExpenseTool(renderResetExpenseStats);
}

function renderResetExpenseStats() {
    const box = document.getElementById('resetExpenseStats');
    if (!box) return;
    const db = getExpenseDB();
    box.innerHTML = `
        <strong>Expenses:</strong> ${db.expenses.length}<br>
        <strong>Budget Categories:</strong> ${Object.keys(db.budgets || {}).length}
    `;
}

function confirmResetExpenseData() {
    if (!confirm('This will clear all expense tracker data. Continue?')) return;
    if (!confirm('Are you sure? This cannot be undone.')) return;
    clearExpenseTrackerData();
    showToast('Expense data cleared', 'success');
}

function setupExpenseCanvas(canvas, height) {
    const parentWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 500;
    const width = Math.max(280, Math.min(760, parentWidth - 4));
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
}

function getExpensePalette(index) {
    const palette = ['#667eea', '#764ba2', '#4facfe', '#43e97b', '#f093fb', '#fa709a', '#ffb347', '#36d1dc', '#8bc34a', '#ff7043'];
    return palette[index % palette.length];
}

function loadExpenseAnalyticsTool() {
    toolContent.innerHTML = `
        <div class="tool-form">
            <h3>📈🔥 Graph & Analytics</h3>
            <div style="margin-bottom:10px;">
                <label>Bar View:</label>
                <select id="expenseBarMode" onchange="renderExpenseAnalyticsCharts()">
                    <option value="daily">Daily (Last 7 Days)</option>
                    <option value="monthly">Monthly (Last 6 Months)</option>
                </select>
            </div>
            <div class="expense-chart-card">
                <h4 style="margin-bottom:8px;">Pie Chart - Category Spending</h4>
                <canvas id="expensePieChart"></canvas>
                <div id="expensePieLegend" class="expense-legend"></div>
            </div>
            <div class="expense-chart-card">
                <h4 style="margin-bottom:8px;">Bar Chart - Trend</h4>
                <canvas id="expenseBarChart"></canvas>
            </div>
        </div>
    `;
    syncExpenseTool(renderExpenseAnalyticsCharts);
}

function getDailyBarExpenseData(expenses, days) {
    const map = {};
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        map[iso] = 0;
    }
    expenses.forEach(item => {
        if (map[item.date] !== undefined) map[item.date] += item.amount;
    });
    const labels = Object.keys(map).map(date => date.slice(5));
    const values = Object.values(map);
    return { labels, values };
}

function getMonthlyBarExpenseData(expenses, months) {
    const map = {};
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        map[key] = 0;
    }
    expenses.forEach(item => {
        const key = String(item.date).slice(0, 7);
        if (map[key] !== undefined) map[key] += item.amount;
    });
    const labels = Object.keys(map).map(key => key.slice(2));
    const values = Object.values(map);
    return { labels, values };
}

function drawExpenseBarChart(canvas, labels, values) {
    const { ctx, width, height } = setupExpenseCanvas(canvas, 280);
    if (!values.length || values.every(v => v === 0)) {
        ctx.fillStyle = '#999';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No data to display', width / 2, height / 2);
        return;
    }

    const max = Math.max(...values, 1);
    const padding = { top: 20, right: 20, bottom: 45, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const barWidth = chartW / values.length * 0.65;
    const gap = chartW / values.length;

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    values.forEach((value, index) => {
        const barHeight = (value / max) * chartH;
        const x = padding.left + index * gap + (gap - barWidth) / 2;
        const y = padding.top + chartH - barHeight;
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#555';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + barWidth / 2, padding.top + chartH + 16);
    });
}

function renderExpenseAnalyticsCharts() {
    const db = getExpenseDB();
    const pieCanvas = document.getElementById('expensePieChart');
    const barCanvas = document.getElementById('expenseBarChart');
    const legend = document.getElementById('expensePieLegend');
    if (!pieCanvas || !barCanvas || !legend) return;

    const totals = getCategoryTotals(db.expenses);
    const pieEntries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const pieTotal = pieEntries.reduce((sum, [, value]) => sum + value, 0);

    const pieSetup = setupExpenseCanvas(pieCanvas, 280);
    const pieCtx = pieSetup.ctx;
    const centerX = pieSetup.width / 2;
    const centerY = pieSetup.height / 2;
    const radius = Math.min(pieSetup.width, pieSetup.height) * 0.33;

    if (pieEntries.length === 0 || pieTotal <= 0) {
        pieCtx.fillStyle = '#999';
        pieCtx.font = '16px sans-serif';
        pieCtx.textAlign = 'center';
        pieCtx.fillText('No data to display', centerX, centerY);
        legend.innerHTML = '';
    } else {
        let startAngle = -Math.PI / 2;
        pieEntries.forEach(([category, value], idx) => {
            const slice = (value / pieTotal) * Math.PI * 2;
            pieCtx.beginPath();
            pieCtx.moveTo(centerX, centerY);
            pieCtx.arc(centerX, centerY, radius, startAngle, startAngle + slice);
            pieCtx.closePath();
            pieCtx.fillStyle = getExpensePalette(idx);
            pieCtx.fill();
            startAngle += slice;
        });

        pieCtx.fillStyle = '#fff';
        pieCtx.beginPath();
        pieCtx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
        pieCtx.fill();
        pieCtx.fillStyle = '#333';
        pieCtx.font = 'bold 14px sans-serif';
        pieCtx.textAlign = 'center';
        pieCtx.fillText('Total', centerX, centerY - 8);
        pieCtx.fillText(formatExpenseCurrency(pieTotal), centerX, centerY + 14);

        legend.innerHTML = pieEntries.map(([category, value], idx) => `
            <div class="expense-legend-item">
                <span class="expense-legend-color" style="background:${getExpensePalette(idx)};"></span>
                <span>${escapeHtml(category)} • ${formatExpenseCurrency(value)}</span>
            </div>
        `).join('');
    }

    const barMode = document.getElementById('expenseBarMode')?.value || 'daily';
    const barData = barMode === 'monthly' ? getMonthlyBarExpenseData(db.expenses, 6) : getDailyBarExpenseData(db.expenses, 7);
    drawExpenseBarChart(barCanvas, barData.labels, barData.values);
}

function loadTopSpendingInsightsTool() {
    toolContent.innerHTML = `
        <div class="tool-form">
            <h3>🧠 Top Spending Insights</h3>
            <div id="topSpendingInsightsCards" class="expense-cards-grid"></div>
        </div>
    `;
    syncExpenseTool(renderTopSpendingInsightsCards);
}

function renderTopSpendingInsightsCards() {
    const container = document.getElementById('topSpendingInsightsCards');
    if (!container) return;

    const db = getExpenseDB();
    if (db.expenses.length === 0) {
        container.innerHTML = '<p class="empty-message">Add expenses to unlock insights.</p>';
        return;
    }

    const totals = getCategoryTotals(db.expenses);
    const highestCategory = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    const dayTotals = db.expenses.reduce((acc, item) => {
        acc[item.date] = (acc[item.date] || 0) + item.amount;
        return acc;
    }, {});
    const mostExpensiveDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
    const uniqueDays = Object.keys(dayTotals).length || 1;
    const totalSpend = db.expenses.reduce((sum, item) => sum + item.amount, 0);
    const avgDaily = totalSpend / uniqueDays;

    container.innerHTML = `
        <div class="expense-stat-card">
            <div class="expense-stat-label">Highest Category</div>
            <div class="expense-stat-value">${escapeHtml(highestCategory[0])}</div>
            <div style="color:#666;">${formatExpenseCurrency(highestCategory[1])}</div>
        </div>
        <div class="expense-stat-card">
            <div class="expense-stat-label">Most Expensive Day</div>
            <div class="expense-stat-value">${escapeHtml(mostExpensiveDay[0])}</div>
            <div style="color:#666;">${formatExpenseCurrency(mostExpensiveDay[1])}</div>
        </div>
        <div class="expense-stat-card">
            <div class="expense-stat-label">Average Daily Expense</div>
            <div class="expense-stat-value">${formatExpenseCurrency(avgDaily)}</div>
            <div style="color:#666;">Across ${uniqueDays} day(s)</div>
        </div>
    `;
}

function loadSmartSuggestionsTool() {
    toolContent.innerHTML = `
        <div class="tool-form">
            <h3>💡 Smart Suggestions</h3>
            <div id="smartSuggestionsList"></div>
        </div>
    `;
    syncExpenseTool(renderSmartSuggestionsList);
}

function renderSmartSuggestionsList() {
    const container = document.getElementById('smartSuggestionsList');
    if (!container) return;

    const db = getExpenseDB();
    if (db.expenses.length === 0) {
        container.innerHTML = '<p class="empty-message">No suggestions yet. Start adding expenses.</p>';
        return;
    }

    const suggestions = [];
    const totals = getCategoryTotals(db.expenses);
    const totalSpend = db.expenses.reduce((sum, item) => sum + item.amount, 0);
    const topCategory = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
        const topShare = totalSpend > 0 ? (topCategory[1] / totalSpend) * 100 : 0;
        if (topShare >= 35) {
            suggestions.push(`You are spending more on ${topCategory[0]} (${topShare.toFixed(1)}% of total).`);
        }
    }

    const thisWeekStart = getStartOfWeek(new Date());
    const prevWeekStart = new Date(thisWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(thisWeekStart);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);

    const thisWeekSpend = db.expenses
        .filter(item => parseExpenseDate(item.date) >= thisWeekStart)
        .reduce((sum, item) => sum + item.amount, 0);
    const prevWeekSpend = db.expenses
        .filter(item => {
            const d = parseExpenseDate(item.date);
            return d >= prevWeekStart && d <= prevWeekEnd;
        })
        .reduce((sum, item) => sum + item.amount, 0);

    if (prevWeekSpend > 0 && thisWeekSpend > prevWeekSpend * 1.15) {
        suggestions.push('Your spending increased this week compared to last week.');
    }

    const overBudgetCategories = Object.entries(db.budgets || {})
        .filter(([category, budget]) => (totals[category] || 0) > budget)
        .map(([category]) => category);
    if (overBudgetCategories.length > 0) {
        suggestions.push(`Budget alert: ${overBudgetCategories.join(', ')} exceeded the set limit.`);
    }

    if (Object.keys(db.budgets || {}).length === 0) {
        suggestions.push('Set category budgets in Budget Tracker to control spending better.');
    }

    if (suggestions.length === 0) {
        suggestions.push('Great control so far. Keep tracking daily for deeper insights.');
    }

    container.innerHTML = suggestions.map((tip, index) => `
        <div class="expense-tip-card">
            <strong>Tip ${index + 1}</strong>
            <div>${escapeHtml(tip)}</div>
        </div>
    `).join('');
}

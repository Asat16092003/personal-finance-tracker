const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('money-plus');
const expenseEl = document.getElementById('money-minus');
const savingsRateEl = document.getElementById('savings-rate');
const form = document.getElementById('transaction-form');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const amountInput = document.getElementById('amount');
const listEl = document.getElementById('transaction-list');
const alertBox = document.getElementById('alert-box');

// Набор категорий
const categories = {
    income: [
        { text: '💰 Salary' },
        { text: '🎓 Scholarship' },
        { text: '🎁 Gift' },
        { text: '💵 Other Income' }
    ],
    expense: [
        { text: '🍔 Food' },
        { text: '🚌 Transportation' },
        { text: '🏠 Housing' },
        { text: '🎬 Entertainment' },
        { text: '👕 Shopping' }
    ]
};

let categoryChart = null;
let overviewChart = null;

// Инициализация базы данных из localStorage
let transactions = localStorage.getItem('transactions') !== null ? JSON.parse(localStorage.getItem('transactions')) : [];

// Переключение категорий в зависимости от типа
function updateCategories() {
    const type = typeSelect.value;
    categorySelect.innerHTML = '';
    categories[type].forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.text;
        opt.innerText = cat.text;
        categorySelect.appendChild(opt);
    });
}
typeSelect.addEventListener('change', updateCategories);

// Добавление новой записи
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const amt = parseFloat(amountInput.value);
    const isExpense = typeSelect.value === 'expense';
    
    const transaction = {
        id: Math.floor(Math.random() * 10000000),
        type: typeSelect.value,
        category: categorySelect.value,
        amount: isExpense ? -amt : amt
    };
    
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    amountInput.value = '';
    updateUI();
});

// Удаление записи
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

// Пересчет баланса, процентов и обновление графиков
function updateUI() {
    listEl.innerHTML = '';
    
    let total = 0;
    let income = 0;
    let expense = 0;
    
    // Подсчет финансовых показателей
    transactions.forEach(t => {
        total += t.amount;
        if (t.amount > 0) income += t.amount;
        else expense += Math.abs(t.amount);
        
        // Рендеринг элементов списка в историю
        const li = document.createElement('li');
        li.classList.add(t.amount > 0 ? 'plus' : 'minus');
        li.innerHTML = `
            ${t.category} 
            <span>${t.amount > 0 ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}</span>
            <button class="delete-btn" onclick="deleteTransaction(${t.id})">x</button>
        `;
        listEl.appendChild(li);
    });
    
    // Расчет Savings Rate (% Сбережений)
    let savingsRate = 0;
    if (income > 0) {
        savingsRate = ((income - expense) / income) * 100;
        if (savingsRate < 0) savingsRate = 0; 
    }
    
    // Вывод цифр на дашборд
    balanceEl.innerText = `$${total.toFixed(2)}`;
    incomeEl.innerText = `+$${income.toFixed(2)}`;
    expenseEl.innerText = `-$${expense.toFixed(2)}`;
    savingsRateEl.innerText = `${savingsRate.toFixed(1)}%`;
    
    // Логика предупреждений
    if (total < 0) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert-message danger';
        alertBox.innerText = '⚠️ Deficit detected! Budget optimization highly advised.';
    } else if (income > 0 && expense > income * 0.8) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert-message warning';
        alertBox.innerText = '⚠️ Notice: Expenses crossed 80% threshold of your income logs.';
    } else {
        alertBox.style.display = 'none';
    }
    
    // Перерисовка графиков
    renderCharts(income, expense);
}

// Отрисовка двух графиков Chart.js
function renderCharts(income, expense) {
    // 1. ПОДГОТОВКА ДАННЫХ ДЛЯ КРУГОВОГО ГРАФИКА РАСХОДОВ
    const expenseData = transactions.filter(t => t.type === 'expense');
    const categoriesMap = {};
    
    expenseData.forEach(t => {
        categoriesMap[t.category] = (categoriesMap[t.category] || 0) + Math.abs(t.amount);
    });
    
    const donutLabels = Object.keys(categoriesMap);
    const donutValues = Object.values(categoriesMap);
    
    // Сброс старого кругового графика
    if (categoryChart) categoryChart.destroy();
    
    const ctx1 = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: donutLabels.length ? donutLabels : ['No Expenses'],
            datasets: [{
                data: donutValues.length ? donutValues : [1],
                backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#0ea5e9', '#a855f7', '#cbd5e1']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // 2. СТОЛБЧАТЫЙ ГРАФИК ОБЗОРА (INCOME VS EXPENSE)
    if (overviewChart) overviewChart.destroy();
    
    const ctx2 = document.getElementById('overviewChart').getContext('2d');
    overviewChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Monthly Analytics',
                data: [income, expense],
                backgroundColor: ['#0ea5e9', '#ef4444'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Первоначальный запуск
updateCategories();
updateUI();function updateCategoryOptions() {
    const selectedType = typeSelect.value;
    categorySelect.innerHTML = '';
    
    categories[selectedType].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.text = cat.text;
        categorySelect.appendChild(option);
    });
}

typeSelect.addEventListener('change', updateCategoryOptions);

// Logic to add a transaction entry
function addTransaction(e) {
    e.preventDefault();

    const selectedType = typeSelect.value;
    const selectedCatText = categorySelect.options[categorySelect.selectedIndex].text;
    // Map numerical values cleanly depending on transaction orientation rules
    const transactionAmount = selectedType === 'expense' ? -Math.abs(+amount.value) : +amount.value;

    const transaction = {
        id: Math.floor(Math.random() * 100000000),
        category: selectedCatText,
        type: selectedType,
        amount: transactionAmount
    };

    transactions.push(transaction);
    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();

    amount.value = '';
}

// Render entries onto UI List nodes
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');

    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
    item.innerHTML = `
        ${transaction.category} <span>${sign}${Math.abs(transaction.amount)} KGS</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;

    list.appendChild(item);
}

// Recalculate parameters, handle UI warnings, and rerender charts
function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0);
    
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0);

    const expense = amounts
        .filter(item => item < 0)
        .reduce((acc, item) => (acc += item), 0) * -1;

    balance.innerText = `${total.toFixed(2)} KGS`;
    money_plus.innerText = `+${income.toFixed(2)} KGS`;
    money_minus.innerText = `-${expense.toFixed(2)} KGS`;

    // --- Validation & Budget Risk Alerts ---
    if (total < 0) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert alert-danger';
        alertBox.innerText = '⚠️ Warning! Budget deficit detected. Your expenses exceed your total income!';
    } else if (total > 0 && expense > income * 0.8) {
        alertBox.style.display = 'block';
        alertBox.className = 'alert alert-warning';
        alertBox.innerText = '⚠️ Notice: You have spent over 80% of your current income stream. Monitor your budget closely.';
    } else {
        alertBox.style.display = 'none';
    }

    updateChart();
}

// Accumulate metrics and initialize or update Chart structures
function updateChart() {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    if (expenseTransactions.length === 0) {
        chartCard.style.display = 'none';
        if (myChart) myChart.destroy();
        return;
    }

    chartCard.style.display = 'block';

    // Parse values and aggregate totals per unique category identifier key
    const categoryTotals = {};
    expenseTransactions.forEach(t => {
        if (categoryTotals[t.category]) {
            categoryTotals[t.category] += Math.abs(t.amount);
        } else {
            categoryTotals[t.category] = Math.abs(t.amount);
        }
    });

    const labels = Object.keys(categoryTotals);
    const dataValues = Object.values(categoryTotals);

    const ctx = document.getElementById('expenseChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    '#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0', '#ffa1b5'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Initial application configuration load setup
function init() {
    list.innerHTML = '';
    updateCategoryOptions();
    transactions.forEach(addTransactionDOM);
    updateValues();
}

init();
form.addEventListener('submit', addTransaction);

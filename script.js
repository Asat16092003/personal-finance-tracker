const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const amount = document.getElementById('amount');
const alertBox = document.getElementById('alert-box');
const chartCard = document.getElementById('chart-card');

// Categories categorized by transaction type
const categories = {
    income: [
        { value: 'salary', text: '? Salary' },
        { value: 'scholarship', text: '? Scholarship' },
        { value: 'gift', text: '? Gift' },
        { value: 'other-inc', text: '? Other Income' }
    ],
    expense: [
        { value: 'food', text: '? Food & Groceries' },
        { value: 'transport', text: '? Transport' },
        { value: 'entertainment', text: '? Entertainment' },
        { value: 'clothes', text: '? Clothes' },
        { value: 'utilities', text: '? Utilities' },
        { value: 'other-exp', text: '? Miscellaneous' }
    ]
};

let myChart = null;

// Initialize data array from LocalStorage if available
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Dynamically update the category dropdown selection menu
function updateCategoryOptions() {
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
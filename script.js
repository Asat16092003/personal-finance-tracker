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

const categories = {
    income: [
        { text: '💵 Salary' },
        { text: '🎓 Scholarship' },
        { text: '🎁 Gift' },
        { text: '💰 Other Income' }
    ],
    expense: [
        { text: '🍔 Food & Groceries' },
        { text: '🚌 Transportation' },
        { text: '🏠 Housing' },
        { text: '🎬 Entertainment' },
        { text: '👕 Shopping' }
    ]
};

let categoryChart = null;
let overviewChart = null;

let transactions = localStorage.getItem('transactions') !== null ? JSON.parse(localStorage.getItem('transactions')) : [];

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

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

function updateUI() {
    listEl.innerHTML = '';
    
    let total = 0;
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
        total += t.amount;
        if (t.amount > 0) income += t.amount;
        else expense += Math.abs(t.amount);
        
        const li = document.createElement('li');
        li.classList.add(t.amount > 0 ? 'plus' : 'minus');
        li.innerHTML = `
            ${t.category} 
            <span>${t.amount > 0 ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}</span>
            <button class="delete-btn" onclick="deleteTransaction(${t.id})">x</button>
        `;
        listEl.appendChild(li);
    });
    
    let savingsRate = 0;
    if (income > 0) {
        savingsRate = ((income - expense) / income) * 100;
        if (savingsRate < 0) savingsRate = 0; 
    }
    
    balanceEl.innerText = total < 0 ? `-$${Math.abs(total).toFixed(2)}` : `$${total.toFixed(2)}`;
    incomeEl.innerText = `+$${income.toFixed(2)}`;
    expenseEl.innerText = `-$${expense.toFixed(2)}`;
    savingsRateEl.innerText = `${savingsRate.toFixed(1)}%`;
    
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
    
    renderCharts(income, expense);
}

function renderCharts(income, expense) {
    const expenseData = transactions.filter(t => t.type === 'expense');
    const categoriesMap = {};
    
    expenseData.forEach(t => {
        categoriesMap[t.category] = (categoriesMap[t.category] || 0) + Math.abs(t.amount);
    });
    
    const donutLabels = Object.keys(categoriesMap);
    const donutValues = Object.values(categoriesMap);
    
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

updateCategories();
updateUI();

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const expenseList = document.getElementById('expense-list');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const modal = document.getElementById('modal');
    const expenseForm = document.getElementById('expense-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const summaryTotalEl = document.getElementById('summary-total');
    const summaryDateEl = document.getElementById('summary-date');
    const dateInput = document.getElementById('date');

    // --- State ---
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let currentExpenseId = null; // Used for editing

    // --- Functions ---
    const saveExpenses = () => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    };

    const getCategoryEmoji = (category) => {
        const emojis = {
            "Food": "🍔",
            "Transport": "🚌",
            "Bills": "🏠",
            "Shopping": "🛍️",
            "Entertainment": "🎉",
            "Other": "🤷"
        };
        return emojis[category] || "🤷";
    };

    const renderExpenses = () => {
        expenseList.innerHTML = '';
        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
        let todayTotal = 0;

        // Filter for today's expenses and sort them
        const todayExpenses = expenses
            .filter(expense => expense.date === today)
            .sort((a, b) => b.id - a.id); // Show newest first

        todayExpenses.forEach(expense => {
            const li = document.createElement('li');
            li.className = 'expense-item';
            li.dataset.id = expense.id;

            const noteIcon = expense.note ? `<span class="note-icon">📝</span>` : '';
            
            li.innerHTML = `
                <div class="expense-details">
                    <span class="expense-category">${getCategoryEmoji(expense.category)}</span>
                    <div class="expense-description">
                        ${expense.description}
                        <small>${expense.category}</small>
                    </div>
                </div>
                <div class="expense-amount">
                    ${noteIcon}
                    ₹${parseFloat(expense.amount).toFixed(2)}
                </div>
            `;
            
            expenseList.appendChild(li);
            todayTotal += parseFloat(expense.amount);

            // Add click listener to show details
            li.addEventListener('click', () => showExpenseDetails(expense.id));
        });

        summaryTotalEl.textContent = `₹${todayTotal.toFixed(2)}`;
        summaryDateEl.textContent = "Today's Summary";
    };
    
    const showExpenseDetails = (id) => {
        const expense = expenses.find(e => e.id === id);
        if (!expense) return;

        const detailsMessage = `
Amount: ₹${parseFloat(expense.amount).toFixed(2)}
Category: ${expense.category}
Date: ${new Date(expense.date).toLocaleDateString('en-GB')}
Description: ${expense.description}
${expense.note ? `\nNote: ${expense.note}` : ''}
        `;
        alert(detailsMessage);
    };

    const showModal = () => {
        modal.classList.remove('hidden');
        dateInput.value = new Date().toLocaleDateString('en-CA'); // Set date to today
    };

    const hideModal = () => {
        modal.classList.add('hidden');
        expenseForm.reset();
        currentExpenseId = null;
    };

    // --- Event Listeners ---
    addExpenseBtn.addEventListener('click', showModal);
    cancelBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newExpense = {
            id: Date.now(), // Unique ID based on timestamp
            amount: document.getElementById('amount').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            note: document.getElementById('note').value,
            date: document.getElementById('date').value
        };

        expenses.push(newExpense);
        saveExpenses();
        renderExpenses();
        hideModal();
    });

    // --- Initial Load ---
    renderExpenses();
});
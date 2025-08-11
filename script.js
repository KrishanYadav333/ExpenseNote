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
// Filter elements
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');
    const filterCategory = document.getElementById('filter-category');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const sortBySelect = document.getElementById('sort-by');
    const exportBtn = document.getElementById('export-btn');
    const totalExpensesEl = document.getElementById('total-expenses');
    const monthlyAverageEl = document.getElementById('monthly-average');
    const topCategoryEl = document.getElementById('top-category');
    const expenseChartEl = document.getElementById('expense-chart');
    
    // Filter state
    let filters = {
        startDate: '',
        endDate: '',
        category: ''
    };
    
    // Sort state
    let sortType = 'date-desc';

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
        let filteredExpenses = [...expenses];
        let total = 0;

        // Apply filters
        if (filters.startDate) {
            filteredExpenses = filteredExpenses.filter(expense => expense.date >= filters.startDate);
        }
        
        if (filters.endDate) {
            filteredExpenses = filteredExpenses.filter(expense => expense.date <= filters.endDate);
        }
        
        if (filters.category) {
            filteredExpenses = filteredExpenses.filter(expense => expense.category === filters.category);
        }

        // Apply sorting
        switch (sortType) {
            case 'date-desc':
                filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                filteredExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'amount-desc':
                filteredExpenses.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
                break;
            case 'amount-asc':
                filteredExpenses.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
                break;
            case 'category':
                filteredExpenses.sort((a, b) => a.category.localeCompare(b.category));
                break;
            default:
                // Default to newest first
                filteredExpenses.sort((a, b) => b.id - a.id);
        }

        filteredExpenses.forEach(expense => {
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
                <div class="expense-actions">
                    ${noteIcon}
                    <span class="expense-amount">₹${parseFloat(expense.amount).toFixed(2)}</span>
                    <button class="edit-btn" data-id="${expense.id}">✏️</button>
                    <button class="delete-btn" data-id="${expense.id}">🗑️</button>
                </div>
            `;
            
            expenseList.appendChild(li);
            total += parseFloat(expense.amount);

            // Add click listener for edit button
            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editExpense(expense.id);
            });

            // Add click listener for delete button
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteExpense(expense.id);
            });
        });

const validateForm = () => {
        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value;
        
        // Clear previous errors
        clearErrors();
        
        let isValid = true;
        
        // Validate amount
        if (!amount || parseFloat(amount) <= 0) {
            showError('amount', 'Amount must be greater than zero');
            isValid = false;
        }
        
        // Validate description
        if (!description.trim()) {
            showError('description', 'Description is required');
            isValid = false;
        }
        
        // Validate date
        if (!date) {
            showError('date', 'Date is required');
            isValid = false;
        }
        
        return isValid;
    };
    
    const showError = (fieldId, message) => {
        const field = document.getElementById(fieldId);
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--danger-color)';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
        
        // Insert error message after the field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        
        // Add error styling to the field
        field.classList.add('error');
    };
    
    const clearErrors = () => {
        // Remove all error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(el => el.remove());
        
        // Remove error styling from fields
        const errorFields = document.querySelectorAll('.form-group input.error, .form-group select.error, .form-group textarea.error');
        errorFields.forEach(field => field.classList.remove('error'));
    };
        summaryTotalEl.textContent = `₹${total.toFixed(2)}`;
        
        // Update summary text based on filters
        if (filters.startDate || filters.endDate || filters.category) {
            summaryDateEl.textContent = "Filtered Summary";
        } else {
            summaryDateEl.textContent = "Today's Summary";
        }
        
        // Update visualization
        updateVisualization();
    };

    const editExpense = (id) => {
        showModal(id);
    };

    const deleteExpense = (id) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            expenses = expenses.filter(expense => expense.id !== id);
            saveExpenses();
            renderExpenses();
        }
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
const exportToCSV = () => {
        if (expenses.length === 0) {
            alert('No expenses to export');
            return;
        }
        
        // Create CSV content
        let csvContent = 'ID,Amount,Description,Category,Note,Date\n';
        
        expenses.forEach(expense => {
            csvContent += `${expense.id},${expense.amount},"${expense.description}","${expense.category}","${expense.note}","${expense.date}"\n`;
        });
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'expenses.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
// Visualization functions
    let expenseChart = null;
    
    const updateVisualization = () => {
        updateSummaryCards();
        updateExpenseChart();
    };
    
    const updateSummaryCards = () => {
        if (expenses.length === 0) {
            totalExpensesEl.textContent = '₹0.00';
            monthlyAverageEl.textContent = '₹0.00';
            topCategoryEl.textContent = '-';
            return;
        }
        
        // Calculate total expenses
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        totalExpensesEl.textContent = `₹${totalExpenses.toFixed(2)}`;
        
        // Calculate monthly average
        const monthlyExpenses = {};
        expenses.forEach(expense => {
            const month = expense.date.substring(0, 7); // YYYY-MM
            if (!monthlyExpenses[month]) {
                monthlyExpenses[month] = 0;
            }
            monthlyExpenses[month] += parseFloat(expense.amount);
        });
        
        const months = Object.keys(monthlyExpenses).length;
        const monthlyAverage = months > 0 ? totalExpenses / months : 0;
        monthlyAverageEl.textContent = `₹${monthlyAverage.toFixed(2)}`;
        
        // Find top category
        const categoryTotals = {};
        expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += parseFloat(expense.amount);
        });
        
        let topCategory = '';
        let maxAmount = 0;
        for (const [category, amount] of Object.entries(categoryTotals)) {
            if (amount > maxAmount) {
                maxAmount = amount;
                topCategory = category;
            }
        }
        
        topCategoryEl.textContent = topCategory;
    };
    
    const updateExpenseChart = () => {
        // Destroy existing chart if it exists
        if (expenseChart) {
            expenseChart.destroy();
        }
        
        if (expenses.length === 0) {
            return;
        }
        
        // Calculate category totals
        const categoryTotals = {};
        expenses.forEach(expense => {
            if (!categoryTotals[expense.category]) {
                categoryTotals[expense.category] = 0;
            }
            categoryTotals[expense.category] += parseFloat(expense.amount);
        });
        
        // Prepare chart data
        const categories = Object.keys(categoryTotals);
        const amounts = categories.map(category => categoryTotals[category]);
        
        // Create chart
        expenseChart = new Chart(expenseChartEl, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ₹${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    };

    const showModal = (expenseId = null) => {
        modal.classList.remove('hidden');
        currentExpenseId = expenseId;
        
        if (expenseId) {
            // Editing mode
            const expense = expenses.find(e => e.id === expenseId);
            if (expense) {
                document.getElementById('modal-title').textContent = 'Edit Expense';
                document.getElementById('amount').value = expense.amount;
                document.getElementById('description').value = expense.description;
                document.getElementById('category').value = expense.category;
                document.getElementById('note').value = expense.note || '';
                document.getElementById('date').value = expense.date;
                document.getElementById('save-btn').textContent = 'Update Expense';
            }
        } else {
            // Adding mode
            document.getElementById('modal-title').textContent = 'Add New Expense';
            expenseForm.reset();
            dateInput.value = new Date().toLocaleDateString('en-CA'); // Set date to today
            document.getElementById('save-btn').textContent = 'Save Expense';
        }
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
        
        // Validate form
        if (!validateForm()) {
            return;
        }

        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;
        const note = document.getElementById('note').value;
        const date = document.getElementById('date').value;

        if (currentExpenseId) {
            // Editing existing expense
            const expenseIndex = expenses.findIndex(e => e.id === currentExpenseId);
            if (expenseIndex !== -1) {
                expenses[expenseIndex] = {
                    ...expenses[expenseIndex],
                    amount,
                    description,
                    category,
                    note,
                    date
                };
            }
        } else {
            // Adding new expense
            const newExpense = {
                id: Date.now(), // Unique ID based on timestamp
                amount,
                description,
                category,
                note,
                date
            };
            expenses.push(newExpense);
        }

        saveExpenses();
        renderExpenses();
        hideModal();
    });
    
    // Filter event listeners
    filterStartDate.addEventListener('change', (e) => {
        filters.startDate = e.target.value;
        renderExpenses();
    });
    
    filterEndDate.addEventListener('change', (e) => {
        filters.endDate = e.target.value;
        renderExpenses();
    });
    
    filterCategory.addEventListener('change', (e) => {
        filters.category = e.target.value;
        renderExpenses();
    });
    
    clearFiltersBtn.addEventListener('click', () => {
        filterStartDate.value = '';
        filterEndDate.value = '';
        filterCategory.value = '';
        filters.startDate = '';
        filters.endDate = '';
        filters.category = '';
        renderExpenses();
    });
    
    // Sort event listener
    sortBySelect.addEventListener('change', (e) => {
        sortType = e.target.value;
        renderExpenses();
    });
// Export event listener
    exportBtn.addEventListener('click', exportToCSV);

    // --- Initial Load ---
    renderExpenses();
});
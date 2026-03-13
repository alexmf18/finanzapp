// Datos iniciales
let transactions = [
    { id: 1, type: 'ingreso', category: 'Salario', amount: 3000, date: '2026-01-01', description: 'Salario mensual' },
    { id: 2, type: 'gasto', category: 'Alimentación', amount: 250, date: '2026-01-05', description: 'Supermercado' },
    { id: 3, type: 'gasto', category: 'Transporte', amount: 80, date: '2026-01-07', description: 'Gasolina' },
    { id: 4, type: 'ingreso', category: 'Freelance', amount: 500, date: '2026-01-10', description: 'Proyecto web' },
];

const STORAGE_KEY = 'finanzas.transactions.v1';

// Categorías
const categories = {
    ingreso: ['Salario', 'Freelance', 'Inversiones', 'Otros ingresos'],
    gasto: ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Salud', 'Educación', 'Otros gastos']
};

// Estado del formulario
let currentType = 'gasto';
let editingTransactionId = null;

// Elementos del DOM
const modal = document.getElementById('modal');
const btnNewTransaction = document.getElementById('btnNewTransaction');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelForm = document.getElementById('btnCancelForm');
const transactionForm = document.getElementById('transactionForm');
const btnIngreso = document.getElementById('btnIngreso');
const btnGasto = document.getElementById('btnGasto');
const inputCategory = document.getElementById('inputCategory');
const inputAmount = document.getElementById('inputAmount');
const inputDate = document.getElementById('inputDate');
const inputDescription = document.getElementById('inputDescription');
const filterType = document.getElementById('filterType');
const filterSearch = document.getElementById('filterSearch');
const sortBy = document.getElementById('sortBy');
const filterCategory = document.getElementById('filterCategory');
const filterDateRange = document.getElementById('filterDateRange');
const customDateRange = document.getElementById('customDateRange');
const filterDateFrom = document.getElementById('filterDateFrom');
const filterDateTo = document.getElementById('filterDateTo');
const transactionsList = document.getElementById('transactionsList');
const categoriesSummary = document.getElementById('categoriesSummary');
const categoriesTotal = document.getElementById('categoriesTotal');
const totalIngresos = document.getElementById('totalIngresos');
const totalGastos = document.getElementById('totalGastos');
const balanceTotal = document.getElementById('balanceTotal');
const balanceCard = document.getElementById('balanceCard');
const btnExportCsv = document.getElementById('btnExportCsv');
const modalTitle = document.getElementById('modalTitle');
const btnSubmitForm = document.getElementById('btnSubmitForm');

// Event Listeners
btnNewTransaction.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
btnCancelForm.addEventListener('click', closeModal);
btnIngreso.addEventListener('click', () => setTransactionType('ingreso'));
btnGasto.addEventListener('click', () => setTransactionType('gasto'));
transactionForm.addEventListener('submit', handleSubmit);
filterType.addEventListener('change', renderTransactions);
filterSearch.addEventListener('input', renderTransactions);
sortBy.addEventListener('change', renderTransactions);
filterCategory.addEventListener('change', renderTransactions);
filterDateRange.addEventListener('change', handleDateRangeChange);
filterDateFrom.addEventListener('change', renderTransactions);
filterDateTo.addEventListener('change', renderTransactions);
btnExportCsv.addEventListener('click', exportToCsv);
modal.addEventListener('click', handleOutsideModalClick);
document.addEventListener('keydown', handleEscapeKey);

// Funciones
function openModal() {
    editingTransactionId = null;
    modalTitle.textContent = 'Nueva Transacción';
    btnSubmitForm.textContent = 'Guardar';
    setTransactionType('gasto');
    inputDate.value = new Date().toISOString().split('T')[0];
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-visible');
    inputAmount.focus();
}

function closeModal() {
    modal.classList.remove('modal-visible');
    modal.classList.add('modal-hidden');
    resetForm();
}

function resetForm() {
    transactionForm.reset();
    setTransactionType('gasto');
    editingTransactionId = null;
    modalTitle.textContent = 'Nueva Transacción';
    btnSubmitForm.textContent = 'Guardar';
}

function setTransactionType(type) {
    currentType = type;
    
    // Actualizar estilos de botones
    if (type === 'ingreso') {
        btnIngreso.className = 'btn-type py-3 px-4 rounded-lg font-medium transition-colors bg-green-600 text-white';
        btnGasto.className = 'btn-type py-3 px-4 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200';
    } else {
        btnGasto.className = 'btn-type py-3 px-4 rounded-lg font-medium transition-colors bg-red-600 text-white';
        btnIngreso.className = 'btn-type py-3 px-4 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
    
    // Actualizar opciones de categoría
    updateCategoryOptions();
}

function updateCategoryOptions() {
    inputCategory.innerHTML = '<option value="">Selecciona una categoría</option>';
    categories[currentType].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        inputCategory.appendChild(option);
    });
}

function handleSubmit(e) {
    e.preventDefault();
    
    const category = inputCategory.value;
    const amount = parseFloat(inputAmount.value);
    const date = inputDate.value;
    const description = inputDescription.value;
    
    if (!category || !amount || !date) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }

    if (amount <= 0) {
        alert('El monto debe ser mayor que cero');
        return;
    }
    
    const payload = {
        type: currentType,
        category,
        amount,
        date,
        description: description.trim()
    };

    if (editingTransactionId) {
        transactions = transactions.map(t => (t.id === editingTransactionId ? { ...t, ...payload } : t));
    } else {
        transactions.unshift({ id: Date.now(), ...payload });
    }

    closeModal();
    updateDashboard();
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) {
        return;
    }

    editingTransactionId = id;
    modalTitle.textContent = 'Editar Transacción';
    btnSubmitForm.textContent = 'Actualizar';
    setTransactionType(transaction.type);
    inputCategory.value = transaction.category;
    inputAmount.value = transaction.amount;
    inputDate.value = transaction.date;
    inputDescription.value = transaction.description || '';

    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-visible');
    inputAmount.focus();
}

function deleteTransaction(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        transactions = transactions.filter(t => t.id !== id);
        updateDashboard();
    }
}

function handleOutsideModalClick(e) {
    if (e.target === modal) {
        closeModal();
    }
}

function handleEscapeKey(e) {
    if (e.key === 'Escape' && modal.classList.contains('modal-visible')) {
        closeModal();
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(`${date}T00:00:00`));
}

function saveTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadTransactions() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        return;
    }

    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
            transactions = parsed;
        }
    } catch {
        localStorage.removeItem(STORAGE_KEY);
    }
}

function handleDateRangeChange() {
    const range = filterDateRange.value;
    customDateRange.classList.toggle('hidden', range !== 'personalizado');

    const today = new Date();
    const toISO = (date) => date.toISOString().split('T')[0];

    if (range === 'hoy') {
        const iso = toISO(today);
        filterDateFrom.value = iso;
        filterDateTo.value = iso;
    } else if (range === 'ultimos7') {
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        filterDateFrom.value = toISO(start);
        filterDateTo.value = toISO(today);
    } else if (range === 'mesActual') {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filterDateFrom.value = toISO(start);
        filterDateTo.value = toISO(end);
    } else if (range === 'todos') {
        filterDateFrom.value = '';
        filterDateTo.value = '';
    }

    renderTransactions();
}

function getFilteredTransactions() {
    const typeFilter = filterType.value;
    const categoryFilter = filterCategory.value;
    const searchFilter = filterSearch.value.trim().toLowerCase();
    const dateFrom = filterDateFrom.value;
    const dateTo = filterDateTo.value;

    const filtered = transactions.filter(t => {
        const typeMatch = typeFilter === 'todos' || t.type === typeFilter;
        const categoryMatch = categoryFilter === 'todas' || t.category === categoryFilter;
        const textMatch = !searchFilter
            || t.category.toLowerCase().includes(searchFilter)
            || (t.description || '').toLowerCase().includes(searchFilter);
        const dateMatch = (!dateFrom || t.date >= dateFrom) && (!dateTo || t.date <= dateTo);
        return typeMatch && categoryMatch && textMatch && dateMatch;
    });

    const sorted = [...filtered];
    const sortValue = sortBy.value;
    if (sortValue === 'antiguas') {
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortValue === 'mayor') {
        sorted.sort((a, b) => b.amount - a.amount);
    } else if (sortValue === 'menor') {
        sorted.sort((a, b) => a.amount - b.amount);
    } else {
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return sorted;
}

function renderTransactions() {
    const filtered = getFilteredTransactions();
    
    if (filtered.length === 0) {
        transactionsList.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-inbox text-5xl mb-4"></i>
                <p>No hay transacciones para mostrar</p>
            </div>
        `;
        return;
    }
    
    transactionsList.innerHTML = filtered.map(t => `
        <div class="transaction-item flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-4 flex-1">
                <div class="p-3 rounded-full ${t.type === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                    <i class="fas ${t.type === 'ingreso' ? 'fa-plus' : 'fa-minus'}"></i>
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <p class="font-semibold text-gray-800">${t.category}</p>
                        <span class="text-xs px-2 py-1 rounded-full ${t.type === 'ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                            ${t.type}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600">${t.description || 'Sin descripción'}</p>
                    <p class="text-xs text-gray-500 mt-1">${formatDate(t.date)}</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <p class="text-xl font-bold ${t.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}">
                    ${t.type === 'ingreso' ? '+' : '-'}${formatCurrency(t.amount)}
                </p>
                <button
                    onclick="editTransaction(${t.id})"
                    class="text-indigo-500 hover:text-indigo-700 p-2 hover:bg-indigo-50 rounded transition-colors"
                    title="Editar"
                >
                    <i class="fas fa-pen"></i>
                </button>
                <button
                    onclick="deleteTransaction(${t.id})"
                    class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateBalanceCards() {
    const ingresos = transactions
        .filter(t => t.type === 'ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const gastos = transactions
        .filter(t => t.type === 'gasto')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = ingresos - gastos;
    
    totalIngresos.textContent = formatCurrency(ingresos);
    totalGastos.textContent = formatCurrency(gastos);
    balanceTotal.textContent = formatCurrency(balance);
    
    // Cambiar color del balance según sea positivo o negativo
    if (balance >= 0) {
        balanceCard.className = 'bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white';
    } else {
        balanceCard.className = 'bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white';
    }
}

function renderCategoriesSummary() {
    const gastosPorCategoria = transactions
        .filter(t => t.type === 'gasto')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});
    
    const totalGastosAmount = Object.values(gastosPorCategoria).reduce((sum, amount) => sum + amount, 0);
    categoriesTotal.textContent = `Total: ${formatCurrency(totalGastosAmount)}`;
    
    if (Object.keys(gastosPorCategoria).length === 0) {
        categoriesSummary.innerHTML = '<p class="text-gray-500 text-center py-8">No hay gastos registrados</p>';
        return;
    }
    
    const sortedCategories = Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1]);
    
    categoriesSummary.innerHTML = sortedCategories.map(([category, amount]) => {
        const percentage = totalGastosAmount > 0 ? (amount / totalGastosAmount) * 100 : 0;
        return `
            <div>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-700">${category}</span>
                    <span class="text-sm font-bold text-gray-900">${formatCurrency(amount)}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                        class="bg-indigo-600 h-2 rounded-full transition-all"
                        style="width: ${percentage}%"
                    ></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">${percentage.toFixed(1)}% del total</p>
            </div>
        `;
    }).join('');
}

function updateFilterCategories() {
    const allCategories = [...new Set([...categories.ingreso, ...categories.gasto])];
    filterCategory.innerHTML = '<option value="todas">Todas las categorías</option>';
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategory.appendChild(option);
    });
}

function exportToCsv() {
    if (transactions.length === 0) {
        alert('No hay transacciones para exportar');
        return;
    }

    const header = ['id', 'tipo', 'categoria', 'monto', 'fecha', 'descripcion'];
    const rows = transactions.map(t => [
        t.id,
        t.type,
        `"${t.category.replace(/"/g, '""')}"`,
        t.amount,
        t.date,
        `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transacciones-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function updateDashboard() {
    saveTransactions();
    updateBalanceCards();
    renderTransactions();
    renderCategoriesSummary();
}

// Inicialización
function init() {
    loadTransactions();
    updateCategoryOptions();
    updateFilterCategories();
    handleDateRangeChange();
    updateDashboard();
}

// Ejecutar al cargar la página
init();

// Datos iniciales
let transactions = [
    { id: 1, type: 'ingreso', category: 'Salario', amount: 3000, date: '2026-01-01', description: 'Salario mensual' },
    { id: 2, type: 'gasto', category: 'Alimentación', amount: 250, date: '2026-01-05', description: 'Supermercado' },
    { id: 3, type: 'gasto', category: 'Transporte', amount: 80, date: '2026-01-07', description: 'Gasolina' },
    { id: 4, type: 'ingreso', category: 'Freelance', amount: 500, date: '2026-01-10', description: 'Proyecto web' },
];

// Categorías
const categories = {
    ingreso: ['Salario', 'Freelance', 'Inversiones', 'Otros ingresos'],
    gasto: ['Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Salud', 'Educación', 'Otros gastos']
};

// Estado del formulario
let currentType = 'gasto';

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
const filterCategory = document.getElementById('filterCategory');
const transactionsList = document.getElementById('transactionsList');
const categoriesSummary = document.getElementById('categoriesSummary');
const totalIngresos = document.getElementById('totalIngresos');
const totalGastos = document.getElementById('totalGastos');
const balanceTotal = document.getElementById('balanceTotal');
const balanceCard = document.getElementById('balanceCard');

// Event Listeners
btnNewTransaction.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);
btnCancelForm.addEventListener('click', closeModal);
btnIngreso.addEventListener('click', () => setTransactionType('ingreso'));
btnGasto.addEventListener('click', () => setTransactionType('gasto'));
transactionForm.addEventListener('submit', handleSubmit);
filterType.addEventListener('change', renderTransactions);
filterCategory.addEventListener('change', renderTransactions);

// Funciones
function openModal() {
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-visible');
}

function closeModal() {
    modal.classList.remove('modal-visible');
    modal.classList.add('modal-hidden');
    resetForm();
}

function resetForm() {
    transactionForm.reset();
    setTransactionType('gasto');
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
    
    const newTransaction = {
        id: Date.now(),
        type: currentType,
        category,
        amount,
        date,
        description
    };
    
    transactions.unshift(newTransaction);
    closeModal();
    updateDashboard();
}

function deleteTransaction(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        transactions = transactions.filter(t => t.id !== id);
        updateDashboard();
    }
}

function getFilteredTransactions() {
    const typeFilter = filterType.value;
    const categoryFilter = filterCategory.value;
    
    return transactions.filter(t => {
        const typeMatch = typeFilter === 'todos' || t.type === typeFilter;
        const categoryMatch = categoryFilter === 'todas' || t.category === categoryFilter;
        return typeMatch && categoryMatch;
    });
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
                    <p class="text-xs text-gray-500 mt-1">${t.date}</p>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <p class="text-xl font-bold ${t.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}">
                    ${t.type === 'ingreso' ? '+' : '-'}€${t.amount.toFixed(2)}
                </p>
                <button
                    onclick="deleteTransaction(${t.id})"
                    class="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
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
    
    totalIngresos.textContent = `€${ingresos.toFixed(2)}`;
    totalGastos.textContent = `€${gastos.toFixed(2)}`;
    balanceTotal.textContent = `€${balance.toFixed(2)}`;
    
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
                    <span class="text-sm font-bold text-gray-900">€${amount.toFixed(2)}</span>
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
    const allCategories = [...categories.ingreso, ...categories.gasto];
    filterCategory.innerHTML = '<option value="todas">Todas las categorías</option>';
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategory.appendChild(option);
    });
}

function updateDashboard() {
    updateBalanceCards();
    renderTransactions();
    renderCategoriesSummary();
}

// Inicialización
function init() {
    updateCategoryOptions();
    updateFilterCategories();
    updateDashboard();
}

// Ejecutar al cargar la página
init();
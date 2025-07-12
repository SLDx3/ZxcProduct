// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Состояние приложения
const state = {
    balance: 1000,
    gameState: null,
    transactions: []
};

// DOM элементы
const elements = {
    balance: document.getElementById('balance'),
    mainMenu: document.getElementById('main-menu'),
    durakGame: document.getElementById('durak-game'),
    paymentMenu: document.getElementById('payment-menu'),
    playerCards: document.getElementById('player-cards'),
    table: document.getElementById('table'),
    trump: document.getElementById('trump'),
    depositAmount: document.getElementById('deposit-amount'),
    withdrawAmount: document.getElementById('withdraw-amount'),
    cardNumber: document.getElementById('card-number'),
    transactionsList: document.getElementById('transactions-list')
};

// Инициализация приложения
function initApp() {
    loadUserData();
    renderBalance();
    renderTransactions();
}

// Загрузка данных пользователя
function loadUserData() {
    // Здесь должна быть загрузка данных с сервера
    // Временно используем mock данные
    state.transactions = [
        { id: 1, type: 'deposit', amount: 1000, date: '2023-05-15', description: 'Начальный баланс' },
        { id: 2, type: 'game', amount: -100, date: '2023-05-16', description: 'Игра в дурака' }
    ];
}

// Обновление баланса
function updateBalance(amount, description) {
    state.balance += amount;
    renderBalance();
    
    // Добавляем транзакцию
    const transaction = {
        id: Date.now(),
        type: amount > 0 ? 'deposit' : 'withdraw',
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        description: description
    };
    
    state.transactions.unshift(transaction);
    renderTransactions();
}

// Отображение баланса
function renderBalance() {
    elements.balance.textContent = state.balance;
}

// Отображение транзакций
function renderTransactions() {
    elements.transactionsList.innerHTML = state.transactions
        .map(t => `
            <div class="transaction-item">
                <span>${t.description}</span>
                <span style="color: ${t.amount > 0 ? 'green' : 'red'}">
                    ${t.amount > 0 ? '+' : ''}${t.amount}
                </span>
            </div>
        `)
        .join('');
}

// Навигация по приложению
function showGame(game) {
    elements.mainMenu.style.display = 'none';
    elements.paymentMenu.style.display = 'none';
    
    if (game === 'durak') {
        elements.durakGame.style.display = 'block';
        initDurakGame();
    }
    // Другие игры...
}

function showPayment() {
    elements.mainMenu.style.display = 'none';
    elements.durakGame.style.display = 'none';
    elements.paymentMenu.style.display = 'block';
}

function backToMenu() {
    elements.durakGame.style.display = 'none';
    elements.paymentMenu.style.display = 'none';
    elements.mainMenu.style.display = 'grid';
}

// Логика игры в дурака
function initDurakGame() {
    // Проверка баланса
    if (state.balance < 100) {
        alert('Недостаточно средств! Минимальная ставка: 100 монет');
        backToMenu();
        return;
    }
    
    // Создаем "mock" игру для демонстрации
    state.gameState = {
        trump: '♥',
        playerCards: ['6♥', '7♦', '10♣', 'Q♠', 'A♦', 'K♥'],
        table: [],
        opponentCardsCount: 6
    };
    
    renderDurakGame();
}

function renderDurakGame() {
    // Очищаем предыдущее состояние
    elements.playerCards.innerHTML = '';
    elements.table.innerHTML = '';
    
    // Устанавливаем козырь
    elements.trump.textContent = state.gameState.trump;
    
    // Рендерим карты игрока
    state.gameState.playerCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.textContent = card;
        cardElement.onclick = () => playCard(index);
        elements.playerCards.appendChild(cardElement);
    });
    
    // Рендерим карты на столе
    if (state.gameState.table.length > 0) {
        state.gameState.table.forEach(pair => {
            const attackCard = document.createElement('div');
            attackCard.className = 'card';
            attackCard.textContent = pair[0];
            elements.table.appendChild(attackCard);
            
            if (pair[1]) {
                const defendCard = document.createElement('div');
                defendCard.className = 'card';
                defendCard.textContent = pair[1];
                elements.table.appendChild(defendCard);
            }
        });
    } else {
        elements.table.innerHTML = '<p>Соперник ходит...</p>';
    }
}

function playCard(cardIndex) {
    // Простая логика хода для демонстрации
    const card = state.gameState.playerCards[cardIndex];
    
    // Удаляем карту из руки игрока
    state.gameState.playerCards.splice(cardIndex, 1);
    
    // Добавляем на стол
    state.gameState.table.push([card, null]);
    
    // Компьютер "отбивается" случайной картой (для демо)
    setTimeout(() => {
        if (Math.random() > 0.5 && state.gameState.playerCards.length > 0) {
            const randomCardIndex = Math.floor(Math.random() * state.gameState.playerCards.length);
            const randomCard = state.gameState.playerCards[randomCardIndex];
            state.gameState.playerCards.splice(randomCardIndex, 1);
            state.gameState.table[state.gameState.table.length - 1][1] = randomCard;
        }
        
        renderDurakGame();
    }, 1000);
    
    renderDurakGame();
}

// Платежные функции
function deposit() {
    const amount = parseInt(elements.depositAmount.value);
    if (isNaN(amount) || amount < 10) {
        alert('Минимальная сумма пополнения - 10 рублей');
        return;
    }
    
    const coins = amount * 10;
    updateBalance(coins, `Пополнение на ${amount} руб`);
    alert(`Баланс пополнен на ${coins} монет!`);
}

function withdraw() {
    const amount = parseInt(elements.withdrawAmount.value);
    const cardNumber = elements.cardNumber.value;
    
    if (isNaN(amount) || amount < 15000) {
        alert('Минимальная сумма вывода - 15000 монет (1500 руб)');
        return;
    }
    
    if (!/^\d{16,19}$/.test(cardNumber)) {
        alert('Введите корректный номер карты (16-19 цифр)');
        return;
    }
    
    if (state.balance < amount) {
        alert('Недостаточно средств на балансе');
        return;
    }
    
    const rub = amount / 10;
    updateBalance(-amount, `Вывод на карту ****${cardNumber.slice(-4)}`);
    alert(`Запрос на вывод ${rub} руб. на карту ****${cardNumber.slice(-4)} отправлен!`);
}

// Инициализация приложения при загрузке
document.addEventListener('DOMContentLoaded', initApp);

// Глобальные функции для кнопок
window.showGame = showGame;
window.showPayment = showPayment;
window.backToMenu = backToMenu;
window.deposit = deposit;
window.withdraw = withdraw;

// Синхронизация ползунков и полей ввода
function syncInputs() {
    const pairs = [
        ['initialAmount', 'initialRange'],
        ['monthlyAdd', 'monthlyRange'],
        ['annualRate', 'rateRange'],
        ['years', 'yearsRange']
    ];
    
    pairs.forEach(([inputId, rangeId]) => {
        const input = document.getElementById(inputId);
        const range = document.getElementById(rangeId);
        
        if (input && range) {
            input.addEventListener('input', () => {
                range.value = input.value;
                calculate();
            });
            
            range.addEventListener('input', () => {
                input.value = range.value;
                calculate();
            });
        }
    });
}

// Форматирование числа в рубли
function formatMoney(num) {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(num)) + ' ₽';
}

// Главный расчёт
function calculate() {
    const initial = parseFloat(document.getElementById('initialAmount').value) || 0;
    const monthly = parseFloat(document.getElementById('monthlyAdd').value) || 0;
    const rate = parseFloat(document.getElementById('annualRate').value) || 0;
    const years = parseInt(document.getElementById('years').value) || 0;
    
    const monthlyRate = rate / 100 / 12;
    const totalMonths = years * 12;
    
    let yearlyData = [];
    let currentBalance = initial;
    let totalInvested = initial;
    
    yearlyData.push({ year: 0, invested: initial, profit: 0, total: initial });
    
    for (let year = 1; year <= years; year++) {
        for (let month = 0; month < 12; month++) {
            currentBalance = currentBalance * (1 + monthlyRate) + monthly;
            totalInvested += monthly;
        }
        yearlyData.push({
            year: year,
            invested: totalInvested,
            profit: currentBalance - totalInvested,
            total: currentBalance
        });
    }
    
    const finalAmount = currentBalance;
    const totalProfit = finalAmount - totalInvested;
    const passiveIncome = (finalAmount * 0.04) / 12;
    
    // Обновляем результаты
    const finalEl = document.getElementById('finalAmount');
    const investedEl = document.getElementById('totalInvested');
    const profitEl = document.getElementById('totalProfit');
    const passiveEl = document.getElementById('passiveIncome');
    
    if (finalEl) finalEl.innerText = formatMoney(finalAmount);
    if (investedEl) investedEl.innerText = formatMoney(totalInvested);
    if (profitEl) profitEl.innerText = formatMoney(totalProfit);
    if (passiveEl) passiveEl.innerText = formatMoney(passiveIncome) + '/мес';
    
    // Рисуем график
    renderChart(yearlyData);
}

// Отрисовка графика
function renderChart(data) {
    const chart = document.getElementById('chart');
    if (!chart) return;
    
    chart.innerHTML = '';
    
    const maxTotal = Math.max(...data.map(d => d.total));
    const step = data.length > 15 ? Math.ceil(data.length / 15) : 1;
    const filteredData = data.filter((_, i) => i % step === 0 || i === data.length - 1);
    
    filteredData.forEach(item => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        
        const investedHeight = (item.invested / maxTotal) * 200;
        const profitHeight = (item.profit / maxTotal) * 200;
        
        bar.innerHTML = `
            <div class="bar-stack" style="height: ${investedHeight + profitHeight}px;">
                <div class="bar-invested" style="height: ${investedHeight}px;"></div>
                <div class="bar-profit" style="height: ${profitHeight}px;"></div>
            </div>
            <div class="bar-label">${item.year}</div>
        `;
        chart.appendChild(bar);
    });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что мы на странице калькулятора
    if (document.getElementById('initialAmount')) {
        syncInputs();
        calculate();
    }
});
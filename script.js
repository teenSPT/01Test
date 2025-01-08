async function getExchangeRate(apiKey) {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=JPY&apikey=${apiKey}`);
        const data = await response.json();
        return parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
    } catch (error) {
        alert("為替レートの取得に失敗しました: " + error);
        return null;
    }
}

async function calculatePositionSize() {
    const balance = parseFloat(document.getElementById('balance').value);
    const position = parseFloat(document.getElementById('position').value);
    const stopLoss = parseFloat(document.getElementById('stopLoss').value);
    const spread = parseFloat(document.getElementById('spread').value);
    const bidAsk = document.querySelector('input[name="bidAsk"]:checked').value;
    const riskPercent = document.getElementById('risk').value === 'custom' ? parseFloat(document.getElementById('customRisk').value) : parseFloat(document.getElementById('risk').value);
    const exchangeOption = document.getElementById('exchange').value;
    const lotSizeOption = document.getElementById('lotSize').value;

    let exchangeRate = 1;
    if (exchangeOption === 'USDJPY') {
        exchangeRate = await getExchangeRate('062Z81R8CII5I4MU'); // Replace with your actual API key
        if (exchangeRate === null) return; // Exit if there's an error
    } else if (exchangeOption === 'custom') {
        exchangeRate = parseFloat(document.getElementById('customExchange').value);
    }

    let lotSize = lotSizeOption === 'custom' ? parseFloat(document.getElementById('customLotSize').value) : parseFloat(lotSizeOption);

    // Calculate distance based on Bid/Ask selection
    let distance = bidAsk === 'Bid' ? stopLoss - position : position - stopLoss;

    // Calculate the minimum decimal value
    const minDecimalValue = Math.pow(10, -Math.max(0, (position.toString().split('.')[1] || []).length));
    const spr = minDecimalValue * spread;

    // True distance
    const trueDistance = distance + spr;

    // Risk value (Balance * Risk %)
    const riskValue = balance * (riskPercent / 100);

    // Pre-exchange size calculation
    const preExchange = riskValue / trueDistance;
    const preSize = preExchange / exchangeRate;

    // Final size calculation
    const size = preSize / lotSize;

    // Display results
    document.getElementById('trueDistance').innerText = `Distance: ${trueDistance.toFixed(5)}`;
    document.getElementById('result').innerText = `Size: ${size.toFixed(5)} Lotz`;
}

document.getElementById('calculateButton').addEventListener('click', calculatePositionSize);

document.getElementById('risk').addEventListener('change', function() {
    const customRiskInput = document.getElementById('customRisk');
    customRiskInput.style.display = this.value === 'custom' ? 'block' : 'none';
});

document.getElementById('exchange').addEventListener('change', function() {
    const customExchangeInput = document.getElementById('customExchange');
    customExchangeInput.style.display = this.value === 'custom' ? 'block' : 'none';
});

document.getElementById('lotSize').addEventListener('change', function() {
    const customLotSizeInput = document.getElementById('customLotSize');
    customLotSizeInput.style.display = this.value === 'custom' ? 'block' : 'none';
});

document.getElementById('copyButton').addEventListener('click', function() {
    const resultText = document.getElementById('result').innerText;
    navigator.clipboard.writeText(resultText).then(() => {
        alert('Size copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
});

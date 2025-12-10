let tempRegressionChart = null;
let populationRegressionChart = null;

function addDataPair(type) {
    let container;
    let html;
    
    if (type === 'temp') {
        container = document.getElementById('temp-data-container');
        html = `
        <div class="data-pair">
            <input type="number" class="hour-input" placeholder="Hora (0-23)" min="0" max="23">
            <input type="number" class="temp-input" placeholder="Temperatura (°C)" step="0.1">
        </div>`;
    } else if (type === 'population') {
        container = document.getElementById('population-data-container');
        html = `
        <div class="data-pair">
            <input type="number" class="year-input" placeholder="Año">
            <input type="number" class="pop-input" placeholder="Población">
        </div>`;
    }
    
    container.insertAdjacentHTML('beforeend', html);
}

function removeDataPair(type) {
    let container;
    
    if (type === 'temp') {
        container = document.getElementById('temp-data-container');
    } else if (type === 'population') {
        container = document.getElementById('population-data-container');
    }
    
    if (container.children.length > 1) {
        container.removeChild(container.lastChild);
    }
}

function calculateTempRegression() {
    
    const hourInputs = document.getElementsByClassName('hour-input');
    const tempInputs = document.getElementsByClassName('temp-input');
    
    let xValues = [];
    let yValues = [];
    
    for (let i = 0; i < hourInputs.length; i++) {
        const hour = parseFloat(hourInputs[i].value);
        const temp = parseFloat(tempInputs[i].value);
        
        if (!isNaN(hour) && !isNaN(temp)) {
            xValues.push(hour);
            yValues.push(temp);
        }
    }
    
    if (xValues.length < 2) {
        alert('Se necesitan al menos 2 puntos para calcular la regresión lineal');
        return;
    }
    
   
    const result = calculateLinearRegression(xValues, yValues);
    
   
    const predictHour = parseFloat(document.getElementById('predict-hour').value);
    const predictedTemp = result.slope * predictHour + result.intercept;
    
    
    const resultDiv = document.getElementById('temp-regression-result');
    resultDiv.innerHTML = `
        <div class="result">
            <p><strong>Ecuación de regresión:</strong> Temperatura = ${result.slope.toFixed(4)} × Hora + ${result.intercept.toFixed(4)}</p>
            <p><strong>Pendiente (m):</strong> ${result.slope.toFixed(4)} °C por hora</p>
            <p><strong>Intercepto (b):</strong> ${result.intercept.toFixed(4)} °C (temperatura a las 0 horas)</p>
            <p><strong>Coeficiente de determinación (R²):</strong> ${result.rSquared.toFixed(4)}</p>
            <p><strong>Predicción a las ${predictHour} horas:</strong> ${predictedTemp.toFixed(2)} °C</p>
            <p><strong>Interpretación:</strong> Por cada hora que pasa, la temperatura ${result.slope > 0 ? 'aumenta' : 'disminuye'} ${Math.abs(result.slope).toFixed(2)} °C en promedio.</p>
        </div>
    `;
    
    document.getElementById('temp-result-section').style.display = 'block';
    
    createTempChart(xValues, yValues, result.slope, result.intercept, predictHour, predictedTemp);
}

function calculatePopulationRegression() {
    
    const yearInputs = document.getElementsByClassName('year-input');
    const popInputs = document.getElementsByClassName('pop-input');
    
    let xValues = [];
    let yValues = [];
    
    for (let i = 0; i < yearInputs.length; i++) {
        const year = parseFloat(yearInputs[i].value);
        const pop = parseFloat(popInputs[i].value);
        
        if (!isNaN(year) && !isNaN(pop)) {
            xValues.push(year);
            yValues.push(pop);
        }
    }
    
    if (xValues.length < 2) {
        alert('Se necesitan al menos 2 puntos para calcular la regresión lineal');
        return;
    }
    
    const result = calculateLinearRegression(xValues, yValues);
    
    const predictYear = parseFloat(document.getElementById('predict-year').value);
    const predictedPop = result.slope * predictYear + result.intercept;
    
    const tasaCrecimiento = (result.slope / yValues[0]) * 100;
    
    const resultDiv = document.getElementById('population-regression-result');
    resultDiv.innerHTML = `
        <div class="result">
            <p><strong>Ecuación de regresión:</strong> Población = ${result.slope.toFixed(0)} × Año + ${result.intercept.toFixed(0)}</p>
            <p><strong>Pendiente (m):</strong> ${result.slope.toFixed(0)} habitantes por año</p>
            <p><strong>Intercepto (b):</strong> ${result.intercept.toFixed(0)} habitantes (en el año 0)</p>
            <p><strong>Coeficiente de determinación (R²):</strong> ${result.rSquared.toFixed(4)}</p>
            <p><strong>Predicción para el año ${predictYear}:</strong> ${predictedPop.toFixed(0)} habitantes</p>
            <p><strong>Tasa de crecimiento anual:</strong> ${tasaCrecimiento.toFixed(2)}%</p>
            <p><strong>Interpretación:</strong> La población ${result.slope > 0 ? 'crece' : 'decrece'} ${Math.abs(result.slope).toFixed(0)} habitantes por año en promedio.</p>
        </div>
    `;
    
    document.getElementById('population-result-section').style.display = 'block';
    
    createPopulationChart(xValues, yValues, result.slope, result.intercept, predictYear, predictedPop);
}

function calculateLinearRegression(xValues, yValues) {
    const n = xValues.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += xValues[i];
        sumY += yValues[i];
        sumXY += xValues[i] * yValues[i];
        sumX2 += xValues[i] * xValues[i];
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    let ssTotal = 0, ssResidual = 0;
    const yMean = sumY / n;
    
    for (let i = 0; i < n; i++) {
        const yPred = slope * xValues[i] + intercept;
        ssTotal += Math.pow(yValues[i] - yMean, 2);
        ssResidual += Math.pow(yValues[i] - yPred, 2);
    }
    
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return {
        slope: slope,
        intercept: intercept,
        rSquared: rSquared
    };
}

function createTempChart(xValues, yValues, slope, intercept, predictHour, predictedTemp) {
    const ctx = document.getElementById('temp-regression-chart').getContext('2d');
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const lineX = [minX - 1, maxX + 1];
    const lineY = [slope * (minX - 1) + intercept, slope * (maxX + 1) + intercept];
    
    const predictionPoint = {x: predictHour, y: predictedTemp};
    
    
    if (tempRegressionChart) {
        tempRegressionChart.destroy();
    }
    
    
    tempRegressionChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Datos observados',
                    data: xValues.map((x, i) => ({x: x, y: yValues[i]})),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1,
                    pointRadius: 6
                },
                {
                    label: 'Línea de regresión',
                    data: lineX.map((x, i) => ({x: x, y: lineY[i]})),
                    backgroundColor: 'rgba(231, 76, 60, 0.5)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2,
                    type: 'line',
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'Predicción',
                    data: [predictionPoint],
                    backgroundColor: 'rgba(46, 204, 113, 1)',
                    borderColor: 'rgba(39, 174, 96, 1)',
                    borderWidth: 2,
                    pointRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Hora del día'
                    },
                    min: 0,
                    max: 24
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += `Hora: ${context.parsed.x}, Temp: ${context.parsed.y}°C`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function createPopulationChart(xValues, yValues, slope, intercept, predictYear, predictedPop) {
    const ctx = document.getElementById('population-regression-chart').getContext('2d');
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const lineX = [minX - 5, maxX + 5];
    const lineY = [slope * (minX - 5) + intercept, slope * (maxX + 5) + intercept];
    
    const predictionPoint = {x: predictYear, y: predictedPop};
    
    if (populationRegressionChart) {
        populationRegressionChart.destroy();
    }
    
    populationRegressionChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Datos observados',
                    data: xValues.map((x, i) => ({x: x, y: yValues[i]})),
                    backgroundColor: 'rgba(155, 89, 182, 0.7)',
                    borderColor: 'rgba(142, 68, 173, 1)',
                    borderWidth: 1,
                    pointRadius: 6
                },
                {
                    label: 'Línea de regresión',
                    data: lineX.map((x, i) => ({x: x, y: lineY[i]})),
                    backgroundColor: 'rgba(52, 152, 219, 0.5)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    type: 'line',
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'Predicción',
                    data: [predictionPoint],
                    backgroundColor: 'rgba(46, 204, 113, 1)',
                    borderColor: 'rgba(39, 174, 96, 1)',
                    borderWidth: 2,
                    pointRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Año'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Población (habitantes)',
                        beginAtZero: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += `Año: ${context.parsed.x}, Población: ${context.parsed.y.toLocaleString()}`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

}

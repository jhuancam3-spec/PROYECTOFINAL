// Variables globales para gráficos
let tempRegressionChart = null;
let populationRegressionChart = null;

// Agregar pares de datos
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

// Eliminar último par de datos
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

// Calcular regresión para temperatura
function calculateTempRegression() {
    // Obtener datos de temperatura
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
    
    // Calcular regresión
    const result = calculateLinearRegression(xValues, yValues);
    
    // Predecir temperatura
    const predictHour = parseFloat(document.getElementById('predict-hour').value);
    const predictedTemp = result.slope * predictHour + result.intercept;
    
    // Mostrar resultados
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
    
    // Mostrar sección de resultados
    document.getElementById('temp-result-section').style.display = 'block';
    
    // Crear gráfico
    createTempChart(xValues, yValues, result.slope, result.intercept, predictHour, predictedTemp);
}

// Calcular regresión para población
function calculatePopulationRegression() {
    // Obtener datos de población
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
    
    // Calcular regresión
    const result = calculateLinearRegression(xValues, yValues);
    
    // Predecir población
    const predictYear = parseFloat(document.getElementById('predict-year').value);
    const predictedPop = result.slope * predictYear + result.intercept;
    
    // Calcular tasa de crecimiento anual
    const tasaCrecimiento = (result.slope / yValues[0]) * 100;
    
    // Mostrar resultados
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
    
    // Mostrar sección de resultados
    document.getElementById('population-result-section').style.display = 'block';
    
    // Crear gráfico
    createPopulationChart(xValues, yValues, result.slope, result.intercept, predictYear, predictedPop);
}

// Función genérica para calcular regresión lineal
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
    
    // Calcular coeficiente de determinación R²
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

// Crear gráfico para temperatura
function createTempChart(xValues, yValues, slope, intercept, predictHour, predictedTemp) {
    const ctx = document.getElementById('temp-regression-chart').getContext('2d');
    
    // Calcular puntos para la línea de regresión
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const lineX = [minX - 1, maxX + 1];
    const lineY = [slope * (minX - 1) + intercept, slope * (maxX + 1) + intercept];
    
    // Datos para la predicción
    const predictionPoint = {x: predictHour, y: predictedTemp};
    
    // Destruir gráfico anterior si existe
    if (tempRegressionChart) {
        tempRegressionChart.destroy();
    }
    
    // Crear nuevo gráfico
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

// Crear gráfico para población
function createPopulationChart(xValues, yValues, slope, intercept, predictYear, predictedPop) {
    const ctx = document.getElementById('population-regression-chart').getContext('2d');
    
    // Calcular puntos para la línea de regresión
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const lineX = [minX - 5, maxX + 5];
    const lineY = [slope * (minX - 5) + intercept, slope * (maxX + 5) + intercept];
    
    // Datos para la predicción
    const predictionPoint = {x: predictYear, y: predictedPop};
    
    // Destruir gráfico anterior si existe
    if (populationRegressionChart) {
        populationRegressionChart.destroy();
    }
    
    // Crear nuevo gráfico
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
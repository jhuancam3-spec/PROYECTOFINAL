let lagrangeChart = null;
let newtonChart = null;

function addDataPair(type) {
    let container;
    let html;
    
    if (type === 'lagrange') {
        container = document.getElementById('lagrange-data-container');
        html = `
        <div class="data-pair">
            <input type="number" class="lagrange-x-input" placeholder="Coordenada X" step="0.1">
            <input type="number" class="lagrange-y-input" placeholder="Coordenada Y" step="0.1">
        </div>`;
    } else if (type === 'newton') {
        container = document.getElementById('newton-data-container');
        html = `
        <div class="data-pair">
            <input type="number" class="newton-x-input" placeholder="Coordenada X" step="0.1">
            <input type="number" class="newton-y-input" placeholder="Coordenada Y" step="0.1">
        </div>`;
    }
    
    container.insertAdjacentHTML('beforeend', html);
}

function removeDataPair(type) {
    let container;
    
    if (type === 'lagrange') {
        container = document.getElementById('lagrange-data-container');
    } else if (type === 'newton') {
        container = document.getElementById('newton-data-container');
    }
    
    if (container.children.length > 1) {
        container.removeChild(container.lastChild);
    }
}

function calculateLagrangeInterpolation() {
 
    const xInputs = document.getElementsByClassName('lagrange-x-input');
    const yInputs = document.getElementsByClassName('lagrange-y-input');
    
    let points = [];
    
    for (let i = 0; i < xInputs.length; i++) {
        const x = parseFloat(xInputs[i].value);
        const y = parseFloat(yInputs[i].value);
        
        if (!isNaN(x) && !isNaN(y)) {
            points.push({x: x, y: y});
        }
    }
    
    if (points.length < 2) {
        alert('Se necesitan al menos 2 puntos para calcular la interpolación');
        return;
    }
    
    const xValue = parseFloat(document.getElementById('lagrange-value').value);
    
    if (isNaN(xValue)) {
        alert('Ingresa un valor X válido para interpolar');
        return;
    }
    
    const result = lagrangeInterpolation(points, xValue);
    const polynomial = getLagrangePolynomial(points);
    
    const resultDiv = document.getElementById('lagrange-interpolation-result');
    resultDiv.innerHTML = `
        <div class="result">
            <p><strong>Número de puntos:</strong> ${points.length}</p>
            <p><strong>Puntos dados:</strong> ${points.map(p => `(${p.x}, ${p.y})`).join(', ')}</p>
            <p><strong>Valor a interpolar (X):</strong> ${xValue}</p>
            <p><strong>Valor interpolado (Y):</strong> ${result.interpolatedValue.toFixed(4)}</p>
            <p><strong>Polinomio interpolante de Lagrange:</strong></p>
            <p style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace;">${polynomial}</p>
            <p><strong>Grado del polinomio:</strong> ${points.length - 1}</p>
            <p><strong>Interpretación:</strong> El polinomio pasa exactamente por todos los puntos dados.</p>
        </div>
    `;
    
    document.getElementById('lagrange-result-section').style.display = 'block';
    
    createLagrangeChart(points, xValue, result);
}

function calculateNewtonInterpolation() {
  
    const xInputs = document.getElementsByClassName('newton-x-input');
    const yInputs = document.getElementsByClassName('newton-y-input');
    
    let points = [];
    
    for (let i = 0; i < xInputs.length; i++) {
        const x = parseFloat(xInputs[i].value);
        const y = parseFloat(yInputs[i].value);
        
        if (!isNaN(x) && !isNaN(y)) {
            points.push({x: x, y: y});
        }
    }
    
    if (points.length < 2) {
        alert('Se necesitan al menos 2 puntos para calcular la interpolación');
        return;
    }
    
    const xValue = parseFloat(document.getElementById('newton-value').value);
    
    if (isNaN(xValue)) {
        alert('Ingresa un valor X válido para interpolar');
        return;
    }
    
    const result = newtonInterpolation(points, xValue);
    const polynomial = getNewtonPolynomial(points);
    
    const resultDiv = document.getElementById('newton-interpolation-result');
    resultDiv.innerHTML = `
        <div class="result">
            <p><strong>Número de puntos:</strong> ${points.length}</p>
            <p><strong>Puntos dados:</strong> ${points.map(p => `(${p.x}, ${p.y})`).join(', ')}</p>
            <p><strong>Valor a interpolar (X):</strong> ${xValue}</p>
            <p><strong>Valor interpolado (Y):</strong> ${result.interpolatedValue.toFixed(4)}</p>
            <p><strong>Tabla de diferencias divididas:</strong></p>
            <div style="background: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto;">
                ${formatDividedDifferencesTable(result.dividedDifferences)}
            </div>
            <p><strong>Polinomio interpolante de Newton:</strong></p>
            <p style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace;">${polynomial}</p>
            <p><strong>Grado del polinomio:</strong> ${points.length - 1}</p>
            <p><strong>Interpretación:</strong> El polinomio pasa exactamente por todos los puntos dados.</p>
        </div>
    `;
    
    document.getElementById('newton-result-section').style.display = 'block';
    
    createNewtonChart(points, xValue, result);
}

function lagrangeInterpolation(points, x) {
    let result = 0;
    const n = points.length;
    
    for (let i = 0; i < n; i++) {
        let term = points[i].y;
        
        for (let j = 0; j < n; j++) {
            if (j !== i) {
                term *= (x - points[j].x) / (points[i].x - points[j].x);
            }
        }
        
        result += term;
    }
    
    const curvePoints = generateCurvePoints(points, (xValue) => {
        let y = 0;
        for (let i = 0; i < n; i++) {
            let term = points[i].y;
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    term *= (xValue - points[j].x) / (points[i].x - points[j].x);
                }
            }
            y += term;
        }
        return y;
    });
    
    return {
        interpolatedValue: result,
        curvePoints: curvePoints
    };
}

function getLagrangePolynomial(points) {
    const n = points.length;
    let terms = [];
    
    for (let i = 0; i < n; i++) {
        let numerator = [];
        let denominator = 1;
        
        for (let j = 0; j < n; j++) {
            if (j !== i) {
                numerator.push(`(x - ${points[j].x})`);
                denominator *= (points[i].x - points[j].x);
            }
        }
        
        const coeff = points[i].y / denominator;
        const term = `${coeff.toFixed(4)} * ${numerator.join(' * ')}`;
        terms.push(term);
    }
    
    return `P(x) = ${terms.join(' + ')}`;
}

function newtonInterpolation(points, x) {
    const n = points.length;
    
    const dividedDifferences = calculateDividedDifferences(points);
    
    let result = dividedDifferences[0][0];
    let product = 1;
    
    for (let i = 1; i < n; i++) {
        product *= (x - points[i-1].x);
        result += dividedDifferences[0][i] * product;
    }
    
    const curvePoints = generateCurvePoints(points, (xValue) => {
        let y = dividedDifferences[0][0];
        let prod = 1;
        
        for (let i = 1; i < n; i++) {
            prod *= (xValue - points[i-1].x);
            y += dividedDifferences[0][i] * prod;
        }
        
        return y;
    });
    
    return {
        interpolatedValue: result,
        dividedDifferences: dividedDifferences,
        curvePoints: curvePoints
    };
}

function calculateDividedDifferences(points) {
    const n = points.length;
    const table = new Array(n);
    
    for (let i = 0; i < n; i++) {
        table[i] = new Array(n);
        table[i][0] = points[i].y;
    }
    
    for (let j = 1; j < n; j++) {
        for (let i = 0; i < n - j; i++) {
            table[i][j] = (table[i+1][j-1] - table[i][j-1]) / (points[i+j].x - points[i].x);
        }
    }
    
    return table;
}

function getNewtonPolynomial(points) {
    const n = points.length;
    const dividedDifferences = calculateDividedDifferences(points);
    
    let terms = [];
    terms.push(dividedDifferences[0][0].toFixed(4));
    
    for (let i = 1; i < n; i++) {
        let term = ` + ${dividedDifferences[0][i].toFixed(4)}`;
        for (let j = 0; j < i; j++) {
            term += `(x - ${points[j].x})`;
        }
        terms.push(term);
    }
    
    return `P(x) = ${terms.join('')}`;
}

function formatDividedDifferencesTable(table) {
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    const n = table.length;
    
    html += '<tr><th>X</th><th>Y</th>';
    for (let i = 1; i < n; i++) {
        html += `<th>Orden ${i}</th>`;
    }
    html += '</tr>';
    
    for (let i = 0; i < n; i++) {
        html += '<tr>';
        for (let j = 0; j < n - i; j++) {
            if (j === 0) {
                if (i === 0) {
                    html += `<td rowspan="${n-i}">x${i}</td><td>${table[i][j].toFixed(4)}</td>`;
                } else {
                    html += `<td>${table[i][j].toFixed(4)}</td>`;
                }
            } else {
                html += `<td>${table[i][j].toFixed(4)}</td>`;
            }
        }
        html += '</tr>';
    }
    
    html += '</table>';
    return html;
}

function generateCurvePoints(points, interpolationFunction) {
    const xValues = [];
    const yValues = [];
    
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const range = maxX - minX;
    
    const numPoints = 100;
    for (let i = 0; i <= numPoints; i++) {
        const x = minX - 0.1 * range + (i / numPoints) * (range * 1.2);
        const y = interpolationFunction(x);
        xValues.push(x);
        yValues.push(y);
    }
    
    return {xValues: xValues, yValues: yValues};
}

function createLagrangeChart(points, xValue, result) {
    const ctx = document.getElementById('lagrange-interpolation-chart').getContext('2d');
    
    const originalX = points.map(p => p.x);
    const originalY = points.map(p => p.y);
    
    const interpolatedPoint = {
        x: xValue,
        y: result.interpolatedValue
    };
    
    if (lagrangeChart) {
        lagrangeChart.destroy();
    }
    
    lagrangeChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Puntos dados',
                    data: originalX.map((x, i) => ({x: x, y: originalY[i]})),
                    backgroundColor: 'rgba(155, 89, 182, 0.8)',
                    borderColor: 'rgba(142, 68, 173, 1)',
                    borderWidth: 2,
                    pointRadius: 8
                },
                {
                    label: 'Polinomio interpolante',
                    data: result.curvePoints.xValues.map((x, i) => ({x: x, y: result.curvePoints.yValues[i]})),
                    backgroundColor: 'rgba(52, 152, 219, 0.3)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    type: 'line',
                    fill: false,
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: 'Punto interpolado',
                    data: [interpolatedPoint],
                    backgroundColor: 'rgba(231, 76, 60, 1)',
                    borderColor: 'rgba(192, 57, 43, 1)',
                    borderWidth: 2,
                    pointRadius: 10
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
                        text: 'Coordenada X'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Coordenada Y'
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
                                label += `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function createNewtonChart(points, xValue, result) {
    const ctx = document.getElementById('newton-interpolation-chart').getContext('2d');
    
    const originalX = points.map(p => p.x);
    const originalY = points.map(p => p.y);
    
    const interpolatedPoint = {
        x: xValue,
        y: result.interpolatedValue
    };
    
    if (newtonChart) {
        newtonChart.destroy();
    }
    
    newtonChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Puntos dados',
                    data: originalX.map((x, i) => ({x: x, y: originalY[i]})),
                    backgroundColor: 'rgba(46, 204, 113, 0.8)',
                    borderColor: 'rgba(39, 174, 96, 1)',
                    borderWidth: 2,
                    pointRadius: 8
                },
                {
                    label: 'Polinomio interpolante',
                    data: result.curvePoints.xValues.map((x, i) => ({x: x, y: result.curvePoints.yValues[i]})),
                    backgroundColor: 'rgba(230, 126, 34, 0.3)',
                    borderColor: 'rgba(230, 126, 34, 1)',
                    borderWidth: 2,
                    type: 'line',
                    fill: false,
                    pointRadius: 0,
                    tension: 0.4
                },
                {
                    label: 'Punto interpolado',
                    data: [interpolatedPoint],
                    backgroundColor: 'rgba(155, 89, 182, 1)',
                    borderColor: 'rgba(142, 68, 173, 1)',
                    borderWidth: 2,
                    pointRadius: 10
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
                        text: 'Coordenada X'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Coordenada Y'
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
                                label += `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

}

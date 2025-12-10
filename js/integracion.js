let energyIntegrationChart = null;
let distanceIntegrationChart = null;

function calculateEnergyConsumption() {
    const energyDataInput = document.getElementById('energy-data').value;
    const method = document.getElementById('integration-method-energy').value;
    
    const values = energyDataInput.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
    
    if (values.length < 2) {
        alert('Se necesitan al menos 2 valores para calcular la integral');
        return;
    }
    
    const interval = 2; 
    const totalHours = (values.length - 1) * interval;
    
    let integral;
    let methodName;
    
    if (method === 'trapecio') {
        integral = trapezoidalRule(values, interval);
        methodName = "Método del Trapecio";
    } else {
        if (values.length % 2 === 0) {
            alert('El método de Simpson requiere un número impar de puntos. Usando método del trapecio en su lugar.');
            integral = trapezoidalRule(values, interval);
            methodName = "Método del Trapecio (Simpson no aplicable)";
        } else {
            integral = simpsonRule(values, interval);
            methodName = "Método de Simpson 1/3";
        }
    }
    
    const consumoTotal = integral;
    
    const resultDiv = document.getElementById('energy-integration-result');
    resultDiv.innerHTML = `
        <div class="result">
            <p><strong>Método utilizado:</strong> ${methodName}</p>
            <p><strong>Número de mediciones:</strong> ${values.length}</p>
            <p><strong>Intervalo entre mediciones:</strong> ${interval} horas</p>
            <p><strong>Período total medido:</strong> ${totalHours} horas</p>
            <p><strong>Consumo total de energía:</strong> ${consumoTotal.toFixed(2)} kWh</p>
            <p><strong>Consumo promedio por hora:</strong> ${(consumoTotal / totalHours).toFixed(2)} kW</p>
            <p><strong>Interpretación:</strong> El área bajo la curva de consumo representa la energía total consumida en el período.</p>
        </div>
    `;
    
    document.getElementById('energy-result-section').style.display = 'block';
    
    createEnergyChart(values, interval, consumoTotal, methodName);
}

function calculateDistanceTraveled() {
    const velocityDataInput = document.getElementById('velocity-data').value;
    const interval = parseFloat(document.getElementById('time-interval').value);
    const method = document.getElementById('integration-method-distance').value;
    
    const values = velocityDataInput.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
    
    if (values.length < 2) {
        alert('Se necesitan al menos 2 valores para calcular la integral');
        return;
    }
    
    if (isNaN(interval) || interval <= 0) {
        alert('El intervalo de tiempo debe ser un número positivo');
        return;
    }
    
    const totalTime = (values.length - 1) * interval;
    
    let integral;
    let methodName;
    
    if (method === 'trapecio') {
        integral = trapezoidalRule(values, interval);
        methodName = "Método del Trapecio";
    } else {
        if (values.length % 2 === 0) {
            alert('El método de Simpson requiere un número impar de puntos. Usando método del trapecio en su lugar.');
            integral = trapezoidalRule(values, interval);
            methodName = "Método del Trapecio (Simpson no aplicable)";
        } else {
            integral = simpsonRule(values, interval);
            methodName = "Método de Simpson 1/3";
        }
    }
    
    const distancia = integral;
    
    const velocidadPromedio = distancia / totalTime;
    
    const resultDiv = document.getElementById('distance-integration-result');
    resultDiv.innerHTML = `
        <div class="result">
            <p><strong>Método utilizado:</strong> ${methodName}</p>
            <p><strong>Número de mediciones:</strong> ${values.length}</p>
            <p><strong>Intervalo entre mediciones:</strong> ${interval} horas</p>
            <p><strong>Tiempo total:</strong> ${totalTime} horas</p>
            <p><strong>Distancia total recorrida:</strong> ${distancia.toFixed(2)} km</p>
            <p><strong>Velocidad promedio:</strong> ${velocidadPromedio.toFixed(2)} km/h</p>
            <p><strong>Interpretación:</strong> El área bajo la curva de velocidad representa la distancia total recorrida.</p>
        </div>
    `;
    
    document.getElementById('distance-result-section').style.display = 'block';
    
    createDistanceChart(values, interval, distancia, methodName);
}

function trapezoidalRule(values, h) {
    let sum = values[0] + values[values.length - 1];
    
    for (let i = 1; i < values.length - 1; i++) {
        sum += 2 * values[i];
    }
    
    return (h / 2) * sum;
}

function simpsonRule(values, h) {
    let sum = values[0] + values[values.length - 1];
    
    for (let i = 1; i < values.length - 1; i += 2) {
        sum += 4 * values[i];
    }
    
    for (let i = 2; i < values.length - 1; i += 2) {
        sum += 2 * values[i];
    }
    
    return (h / 3) * sum;
}

function createEnergyChart(values, interval, consumoTotal, methodName) {
    const ctx = document.getElementById('energy-integration-chart').getContext('2d');
    
    const times = [];
    for (let i = 0; i < values.length; i++) {
        times.push(i * interval);
    }
    
    if (energyIntegrationChart) {
        energyIntegrationChart.destroy();
    }
    
    energyIntegrationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Consumo de energía (kW)',
                data: values,
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo (horas)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Consumo (kW)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Área bajo la curva = ${consumoTotal.toFixed(2)} kWh (${methodName})`
                }
            }
        }
    });
}

function createDistanceChart(values, interval, distancia, methodName) {
    const ctx = document.getElementById('distance-integration-chart').getContext('2d');
    
    const times = [];
    for (let i = 0; i < values.length; i++) {
        times.push(i * interval);
    }
    
    if (distanceIntegrationChart) {
        distanceIntegrationChart.destroy();
    }
    
    distanceIntegrationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Velocidad (km/h)',
                data: values,
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo (horas)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Velocidad (km/h)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Área bajo la curva = ${distancia.toFixed(2)} km (${methodName})`
                }
            }
        }
    });

}

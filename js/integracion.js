// Variables globales para gráficos
let energyIntegrationChart = null;
let distanceIntegrationChart = null;

// Calcular consumo de energía
function calculateEnergyConsumption() {
    const energyDataInput = document.getElementById('energy-data').value;
    const method = document.getElementById('integration-method-energy').value;
    
    // Convertir datos a array de números
    const values = energyDataInput.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
    
    if (values.length < 2) {
        alert('Se necesitan al menos 2 valores para calcular la integral');
        return;
    }
    
    // Asumimos mediciones cada 2 horas
    const interval = 2; // horas
    const totalHours = (values.length - 1) * interval;
    
    // Calcular integral según el método seleccionado
    let integral;
    let methodName;
    
    if (method === 'trapecio') {
        integral = trapezoidalRule(values, interval);
        methodName = "Método del Trapecio";
    } else {
        // Simpson requiere un número impar de puntos
        if (values.length % 2 === 0) {
            alert('El método de Simpson requiere un número impar de puntos. Usando método del trapecio en su lugar.');
            integral = trapezoidalRule(values, interval);
            methodName = "Método del Trapecio (Simpson no aplicable)";
        } else {
            integral = simpsonRule(values, interval);
            methodName = "Método de Simpson 1/3";
        }
    }
    
    // Calcular consumo total en kWh (integral de potencia en kW sobre tiempo en horas)
    const consumoTotal = integral;
    
    // Mostrar resultados
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
    
    // Mostrar sección de resultados
    document.getElementById('energy-result-section').style.display = 'block';
    
    // Crear gráfico
    createEnergyChart(values, interval, consumoTotal, methodName);
}

// Calcular distancia recorrida
function calculateDistanceTraveled() {
    const velocityDataInput = document.getElementById('velocity-data').value;
    const interval = parseFloat(document.getElementById('time-interval').value);
    const method = document.getElementById('integration-method-distance').value;
    
    // Convertir datos a array de números
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
    
    // Calcular integral según el método seleccionado
    let integral;
    let methodName;
    
    if (method === 'trapecio') {
        integral = trapezoidalRule(values, interval);
        methodName = "Método del Trapecio";
    } else {
        // Simpson requiere un número impar de puntos
        if (values.length % 2 === 0) {
            alert('El método de Simpson requiere un número impar de puntos. Usando método del trapecio en su lugar.');
            integral = trapezoidalRule(values, interval);
            methodName = "Método del Trapecio (Simpson no aplicable)";
        } else {
            integral = simpsonRule(values, interval);
            methodName = "Método de Simpson 1/3";
        }
    }
    
    // La integral de velocidad sobre tiempo es distancia
    const distancia = integral;
    
    // Calcular velocidad promedio
    const velocidadPromedio = distancia / totalTime;
    
    // Mostrar resultados
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
    
    // Mostrar sección de resultados
    document.getElementById('distance-result-section').style.display = 'block';
    
    // Crear gráfico
    createDistanceChart(values, interval, distancia, methodName);
}

// Método del Trapecio
function trapezoidalRule(values, h) {
    let sum = values[0] + values[values.length - 1];
    
    for (let i = 1; i < values.length - 1; i++) {
        sum += 2 * values[i];
    }
    
    return (h / 2) * sum;
}

// Método de Simpson 1/3
function simpsonRule(values, h) {
    let sum = values[0] + values[values.length - 1];
    
    // Términos impares
    for (let i = 1; i < values.length - 1; i += 2) {
        sum += 4 * values[i];
    }
    
    // Términos pares
    for (let i = 2; i < values.length - 1; i += 2) {
        sum += 2 * values[i];
    }
    
    return (h / 3) * sum;
}

// Crear gráfico para consumo de energía
function createEnergyChart(values, interval, consumoTotal, methodName) {
    const ctx = document.getElementById('energy-integration-chart').getContext('2d');
    
    // Generar tiempos (cada 'interval' horas)
    const times = [];
    for (let i = 0; i < values.length; i++) {
        times.push(i * interval);
    }
    
    // Destruir gráfico anterior si existe
    if (energyIntegrationChart) {
        energyIntegrationChart.destroy();
    }
    
    // Crear nuevo gráfico
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

// Crear gráfico para distancia
function createDistanceChart(values, interval, distancia, methodName) {
    const ctx = document.getElementById('distance-integration-chart').getContext('2d');
    
    // Generar tiempos (cada 'interval' horas)
    const times = [];
    for (let i = 0; i < values.length; i++) {
        times.push(i * interval);
    }
    
    // Destruir gráfico anterior si existe
    if (distanceIntegrationChart) {
        distanceIntegrationChart.destroy();
    }
    
    // Crear nuevo gráfico
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
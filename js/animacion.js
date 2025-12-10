// Variables globales para animaciones
let splineAnimationId = null;
let fourierAnimationId = null;
let splineTime = 0;
let fourierTime = 0;
let splinePoints = [];
let fourierCoefficients = [];
let isSplineAnimating = false;
let isFourierAnimating = false;
let splineSpeed = 1;
let fourierSpeed = 1;
let fourierTerms = 10;
let fourierPath = [];

// Inicialización cuando se carga la página
window.onload = function() {
    initSplineCanvas();
    initFourierCanvas();
    generateSimpleButterflyPoints();
    generateFourierHeartCoefficients();
    drawSplineAnimation();
    drawFourierAnimation();
};

// ========== SPLINES CÚBICOS ==========

// Inicializar canvas de splines
function initSplineCanvas() {
    const canvas = document.getElementById('spline-canvas');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Generar puntos simples para una mariposa
function generateSimpleButterflyPoints() {
    splinePoints = [];
    
    const canvas = document.getElementById('spline-canvas');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.25; // Más pequeño
    
    // Puntos para una mariposa simple (forma de "8")
    // Ala superior izquierda
    for (let i = 0; i <= Math.PI; i += Math.PI / 10) {
        const x = centerX - Math.sin(i) * scale * 0.8;
        const y = centerY - Math.abs(Math.cos(i)) * scale * 0.6;
        splinePoints.push({x: x, y: y});
    }
    
    // Ala inferior izquierda
    for (let i = Math.PI; i <= 2 * Math.PI; i += Math.PI / 10) {
        const x = centerX - Math.sin(i) * scale * 0.8;
        const y = centerY + Math.abs(Math.cos(i)) * scale * 0.6;
        splinePoints.push({x: x, y: y});
    }
    
    // Cerrar la figura
    splinePoints.push(splinePoints[0]);
}

// Función de interpolación lineal simple para la animación
function interpolatePoint(start, end, progress) {
    return {
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress
    };
}

// Dibujar animación de splines
function drawSplineAnimation() {
    const canvas = document.getElementById('spline-canvas');
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calcular progreso
    const progress = splineTime / 100;
    const totalSegments = splinePoints.length - 1;
    const currentSegment = Math.floor(progress * totalSegments);
    const segmentProgress = (progress * totalSegments) % 1;
    
    // Actualizar progreso
    const percentage = Math.min(100, Math.floor(progress * 100));
    document.getElementById('spline-percentage').textContent = percentage + '%';
    document.getElementById('spline-progress').style.width = percentage + '%';
    
    // Dibujar todos los puntos de control (pequeños)
    ctx.fillStyle = '#3498db';
    for (let i = 0; i < splinePoints.length; i++) {
        ctx.beginPath();
        ctx.arc(splinePoints[i].x, splinePoints[i].y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Dibujar líneas entre puntos ya conectados
    if (currentSegment > 0) {
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(splinePoints[0].x, splinePoints[0].y);
        
        for (let i = 1; i <= currentSegment; i++) {
            ctx.lineTo(splinePoints[i].x, splinePoints[i].y);
        }
        ctx.stroke();
    }
    
    // Dibujar curva spline suavizada
    if (currentSegment >= 1) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(splinePoints[0].x, splinePoints[0].y);
        
        // Usar curvas cuadráticas para suavizar
        for (let i = 1; i < Math.min(currentSegment + 1, splinePoints.length - 1); i++) {
            const prevPoint = splinePoints[i - 1];
            const currentPoint = splinePoints[i];
            const nextPoint = splinePoints[i + 1] || currentPoint;
            
            // Punto de control para la curva
            const controlX = (currentPoint.x + nextPoint.x) / 2;
            const controlY = (currentPoint.y + nextPoint.y) / 2;
            
            ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
        }
        ctx.stroke();
    }
    
    // Dibujar punto actual en movimiento
    if (currentSegment < totalSegments) {
        const startPoint = splinePoints[currentSegment];
        const endPoint = splinePoints[currentSegment + 1];
        const currentPoint = interpolatePoint(startPoint, endPoint, segmentProgress);
        
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(currentPoint.x, currentPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        document.getElementById('spline-status').textContent = 
            `Dibujando segmento ${currentSegment + 1} de ${totalSegments}`;
    }
    
    // Actualizar tiempo
    if (isSplineAnimating && splineTime < 100) {
        splineTime += splineSpeed;
    } else if (splineTime >= 100) {
        document.getElementById('spline-status').textContent = 'Animación completada ✓';
        isSplineAnimating = false;
        document.getElementById('spline-start-btn').innerHTML = '<i class="fas fa-redo"></i> Reiniciar';
        document.getElementById('spline-start-btn').disabled = false;
    }
    
    // Continuar animación
    if (isSplineAnimating) {
        splineAnimationId = requestAnimationFrame(drawSplineAnimation);
    }
}

// ========== SERIES DE FOURIER ==========

// Inicializar canvas de Fourier
function initFourierCanvas() {
    const canvas = document.getElementById('fourier-canvas');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Generar coeficientes de Fourier simples para un corazón
function generateFourierHeartCoefficients() {
    fourierCoefficients = [];
    fourierTerms = parseInt(document.getElementById('fourier-terms').value);
    
    // Coeficientes más simples para un corazón reconocible
    const scale = 0.15; // Más pequeño
    
    for (let n = 0; n <= fourierTerms; n++) {
        let a_n_x = 0;
        let b_n_x = 0;
        let a_n_y = 0;
        let b_n_y = 0;
        
        // Coeficientes simples para forma de corazón
        if (n === 0) {
            a_n_x = 0;
            a_n_y = -0.3;
        } else if (n === 1) {
            b_n_x = 0.8 * scale;
            a_n_y = 0.6 * scale;
        } else if (n === 2) {
            b_n_x = 0.2 * scale;
            a_n_y = -0.3 * scale;
        } else if (n === 3) {
            b_n_x = -0.1 * scale;
            a_n_y = 0.1 * scale;
        } else if (n % 2 === 0) {
            // Términos pares adicionales
            b_n_x = (0.05 * scale) / (n/2);
            a_n_y = (0.03 * scale) / (n/2);
        } else {
            // Términos impares adicionales
            b_n_x = (-0.03 * scale) / ((n+1)/2);
            a_n_y = (0.02 * scale) / ((n+1)/2);
        }
        
        fourierCoefficients.push({
            freq: n,
            a_x: a_n_x,
            b_x: b_n_x,
            a_y: a_n_y,
            b_y: b_n_y,
            radius_x: Math.sqrt(a_n_x * a_n_x + b_n_x * b_n_x),
            radius_y: Math.sqrt(a_n_y * a_n_y + b_n_y * b_n_y),
            phase_x: Math.atan2(b_n_x, a_n_x),
            phase_y: Math.atan2(b_n_y, a_n_y)
        });
    }
}

// Dibujar animación de Fourier mejorada
function drawFourierAnimation() {
    const canvas = document.getElementById('fourier-canvas');
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.15; // Más pequeño
    
    // Calcular progreso
    const progress = fourierTime / (2 * Math.PI);
    const percentage = Math.min(100, Math.floor(progress * 100));
    document.getElementById('fourier-percentage').textContent = percentage + '%';
    document.getElementById('fourier-progress').style.width = percentage + '%';
    
    // Calcular punto final usando series de Fourier
    let x = 0;
    let y = 0;
    
    // Calcular posición X
    for (let i = 0; i < fourierCoefficients.length; i++) {
        const coef = fourierCoefficients[i];
        x += coef.a_x * Math.cos(coef.freq * fourierTime) + 
             coef.b_x * Math.sin(coef.freq * fourierTime);
    }
    
    // Calcular posición Y
    for (let i = 0; i < fourierCoefficients.length; i++) {
        const coef = fourierCoefficients[i];
        y += coef.a_y * Math.cos(coef.freq * fourierTime) + 
             coef.b_y * Math.sin(coef.freq * fourierTime);
    }
    
    // Escalar y centrar
    const finalX = centerX + x * scale * 60; // Ajuste de escala
    const finalY = centerY + y * scale * 60;
    
    // Dibujar epiciclos (opcional, para visualización)
    if (isFourierAnimating) {
        let currentX = centerX;
        let currentY = centerY;
        
        // Dibujar solo primeros 3 epiciclos para no saturar
        const maxCirclesToShow = Math.min(3, fourierCoefficients.length);
        
        for (let i = 0; i < maxCirclesToShow; i++) {
            const coef = fourierCoefficients[i];
            const radius = coef.radius_x * scale * 60;
            
            if (radius > 1) { // Solo dibujar círculos significativos
                ctx.strokeStyle = `rgba(52, 152, 219, ${0.7 - i * 0.2})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(currentX, currentY, radius, 0, Math.PI * 2);
                ctx.stroke();
                
                const angle = coef.freq * fourierTime + coef.phase_x;
                const nextX = currentX + radius * Math.cos(angle);
                const nextY = currentY + radius * Math.sin(angle);
                
                ctx.beginPath();
                ctx.moveTo(currentX, currentY);
                ctx.lineTo(nextX, nextY);
                ctx.stroke();
                
                currentX = nextX;
                currentY = nextY;
            }
        }
    }
    
    // Agregar punto al path
    fourierPath.push({x: finalX, y: finalY});
    
    // Mantener solo los últimos puntos para mejor rendimiento
    if (fourierPath.length > 500) {
        fourierPath = fourierPath.slice(-500);
    }
    
    // Dibujar trayectoria (corazón)
    if (fourierPath.length > 1) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fourierPath[0].x, fourierPath[0].y);
        
        for (let i = 1; i < fourierPath.length; i++) {
            ctx.lineTo(fourierPath[i].x, fourierPath[i].y);
        }
        ctx.stroke();
    }
    
    // Dibujar punto actual
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(finalX, finalY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Actualizar tiempo
    if (isFourierAnimating && fourierTime < 2 * Math.PI) {
        fourierTime += 0.03 * fourierSpeed;
        const currentTerm = Math.floor(fourierTime / (2 * Math.PI) * fourierTerms);
        document.getElementById('fourier-status').textContent = 
            `Término ${currentTerm} de ${fourierTerms}`;
    } else if (fourierTime >= 2 * Math.PI) {
        document.getElementById('fourier-status').textContent = 'Animación completada ✓';
        isFourierAnimating = false;
        document.getElementById('fourier-start-btn').innerHTML = '<i class="fas fa-redo"></i> Reiniciar';
        document.getElementById('fourier-start-btn').disabled = false;
    }
    
    // Continuar animación
    if (isFourierAnimating) {
        fourierAnimationId = requestAnimationFrame(drawFourierAnimation);
    }
}

// ========== FUNCIONES DE CONTROL ==========

// Controlar animación de splines
function startSplineAnimation() {
    const speedSelect = document.getElementById('spline-speed');
    switch(speedSelect.value) {
        case 'slow': splineSpeed = 0.5; break;
        case 'normal': splineSpeed = 1; break;
        case 'fast': splineSpeed = 2; break;
    }
    
    if (!isSplineAnimating) {
        if (splineTime >= 100) {
            resetSplineAnimation();
        }
        isSplineAnimating = true;
        document.getElementById('spline-start-btn').innerHTML = '<i class="fas fa-play"></i> Ejecutando...';
        document.getElementById('spline-start-btn').disabled = true;
        document.getElementById('spline-pause-btn').disabled = false;
        splineAnimationId = requestAnimationFrame(drawSplineAnimation);
    }
}

function pauseSplineAnimation() {
    isSplineAnimating = false;
    document.getElementById('spline-start-btn').innerHTML = '<i class="fas fa-play"></i> Continuar';
    document.getElementById('spline-start-btn').disabled = false;
    document.getElementById('spline-pause-btn').disabled = true;
    
    if (splineAnimationId) {
        cancelAnimationFrame(splineAnimationId);
    }
}

function resetSplineAnimation() {
    splineTime = 0;
    document.getElementById('spline-percentage').textContent = '0%';
    document.getElementById('spline-progress').style.width = '0%';
    document.getElementById('spline-status').textContent = 'Listo para comenzar';
    document.getElementById('spline-start-btn').innerHTML = '<i class="fas fa-play"></i> Iniciar Animación';
    document.getElementById('spline-start-btn').disabled = false;
    document.getElementById('spline-pause-btn').disabled = false;
    
    if (splineAnimationId) {
        cancelAnimationFrame(splineAnimationId);
        splineAnimationId = null;
    }
    
    isSplineAnimating = false;
    generateSimpleButterflyPoints();
    drawSplineAnimation();
}

// Controlar animación de Fourier
function startFourierAnimation() {
    const speedSelect = document.getElementById('fourier-speed');
    switch(speedSelect.value) {
        case 'slow': fourierSpeed = 0.5; break;
        case 'normal': fourierSpeed = 1; break;
        case 'fast': fourierSpeed = 2; break;
    }
    
    // Actualizar términos si cambió
    const newTerms = parseInt(document.getElementById('fourier-terms').value);
    if (newTerms !== fourierTerms) {
        fourierTerms = newTerms;
        generateFourierHeartCoefficients();
    }
    
    if (!isFourierAnimating) {
        if (fourierTime >= 2 * Math.PI) {
            resetFourierAnimation();
        }
        isFourierAnimating = true;
        document.getElementById('fourier-start-btn').innerHTML = '<i class="fas fa-play"></i> Ejecutando...';
        document.getElementById('fourier-start-btn').disabled = true;
        document.getElementById('fourier-pause-btn').disabled = false;
        fourierAnimationId = requestAnimationFrame(drawFourierAnimation);
    }
}

function pauseFourierAnimation() {
    isFourierAnimating = false;
    document.getElementById('fourier-start-btn').innerHTML = '<i class="fas fa-play"></i> Continuar';
    document.getElementById('fourier-start-btn').disabled = false;
    document.getElementById('fourier-pause-btn').disabled = true;
    
    if (fourierAnimationId) {
        cancelAnimationFrame(fourierAnimationId);
    }
}

function resetFourierAnimation() {
    fourierTime = 0;
    fourierPath = [];
    document.getElementById('fourier-percentage').textContent = '0%';
    document.getElementById('fourier-progress').style.width = '0%';
    document.getElementById('fourier-status').textContent = 'Listo para comenzar';
    document.getElementById('fourier-start-btn').innerHTML = '<i class="fas fa-play"></i> Iniciar Animación';
    document.getElementById('fourier-start-btn').disabled = false;
    document.getElementById('fourier-pause-btn').disabled = false;
    
    if (fourierAnimationId) {
        cancelAnimationFrame(fourierAnimationId);
        fourierAnimationId = null;
    }
    
    isFourierAnimating = false;
    generateFourierHeartCoefficients();
    drawFourierAnimation();
}

// ========== EVENT LISTENERS ==========

document.getElementById('spline-speed').addEventListener('change', function() {
    if (isSplineAnimating) {
        const speedSelect = document.getElementById('spline-speed');
        switch(speedSelect.value) {
            case 'slow': splineSpeed = 0.5; break;
            case 'normal': splineSpeed = 1; break;
            case 'fast': splineSpeed = 2; break;
        }
    }
});

document.getElementById('fourier-speed').addEventListener('change', function() {
    if (isFourierAnimating) {
        const speedSelect = document.getElementById('fourier-speed');
        switch(speedSelect.value) {
            case 'slow': fourierSpeed = 0.5; break;
            case 'normal': fourierSpeed = 1; break;
            case 'fast': fourierSpeed = 2; break;
        }
    }
});

document.getElementById('fourier-terms').addEventListener('change', function() {
    fourierTerms = parseInt(this.value);
    generateFourierHeartCoefficients();
    if (!isFourierAnimating) {
        fourierTime = 0;
        fourierPath = [];
        drawFourierAnimation();
    }
});

// Redimensionar canvas cuando cambia el tamaño de la ventana
window.addEventListener('resize', function() {
    initSplineCanvas();
    initFourierCanvas();
    generateSimpleButterflyPoints();
    if (!isSplineAnimating) {
        drawSplineAnimation();
    }
    if (!isFourierAnimating) {
        fourierTime = 0;
        fourierPath = [];
        drawFourierAnimation();
    }
});

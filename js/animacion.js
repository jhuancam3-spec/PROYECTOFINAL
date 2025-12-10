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

// Inicialización cuando se carga la página
window.onload = function() {
    initSplineCanvas();
    initFourierCanvas();
    generateSplinePoints();
    generateFourierCoefficients();
};

// ========== SPLINES CÚBICOS ==========

// Inicializar canvas de splines
function initSplineCanvas() {
    const canvas = document.getElementById('spline-canvas');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Generar puntos para la mariposa
function generateSplinePoints() {
    splinePoints = [];
    
    // Puntos para una mariposa simétrica
    const centerX = document.getElementById('spline-canvas').width / 2;
    const centerY = document.getElementById('spline-canvas').height / 2;
    const scale = Math.min(centerX, centerY) * 0.8;
    
    // Ala superior izquierda
    for (let i = 0; i <= Math.PI / 2; i += Math.PI / 20) {
        const x = centerX - Math.cos(i) * scale * 0.7;
        const y = centerY - Math.sin(i) * scale * 0.5 - Math.sin(i * 2) * scale * 0.2;
        splinePoints.push({x: x, y: y});
    }
    
    // Cuerpo
    splinePoints.push({x: centerX, y: centerY + scale * 0.3});
    splinePoints.push({x: centerX, y: centerY + scale * 0.6});
    
    // Ala inferior izquierda
    for (let i = Math.PI / 2; i >= 0; i -= Math.PI / 20) {
        const x = centerX - Math.cos(i) * scale * 0.5;
        const y = centerY + Math.sin(i) * scale * 0.5 + Math.sin(i * 2) * scale * 0.1;
        splinePoints.push({x: x, y: y});
    }
    
    // Ala inferior derecha (simétrica)
    for (let i = 0; i <= Math.PI / 2; i += Math.PI / 20) {
        const x = centerX + Math.cos(i) * scale * 0.5;
        const y = centerY + Math.sin(i) * scale * 0.5 + Math.sin(i * 2) * scale * 0.1;
        splinePoints.push({x: x, y: y});
    }
    
    // Cuerpo
    splinePoints.push({x: centerX, y: centerY + scale * 0.6});
    splinePoints.push({x: centerX, y: centerY + scale * 0.3});
    
    // Ala superior derecha (simétrica)
    for (let i = Math.PI / 2; i >= 0; i -= Math.PI / 20) {
        const x = centerX + Math.cos(i) * scale * 0.7;
        const y = centerY - Math.sin(i) * scale * 0.5 - Math.sin(i * 2) * scale * 0.2;
        splinePoints.push({x: x, y: y});
    }
}

// Interpolación cúbica de Catmull-Rom (simplificada para splines)
function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    
    return {
        x: 0.5 * ((2 * p1.x) + 
                 (-p0.x + p2.x) * t + 
                 (2*p0.x - 5*p1.x + 4*p2.x - p3.x) * t2 + 
                 (-p0.x + 3*p1.x - 3*p2.x + p3.x) * t3),
        y: 0.5 * ((2 * p1.y) + 
                 (-p0.y + p2.y) * t + 
                 (2*p0.y - 5*p1.y + 4*p2.y - p3.y) * t2 + 
                 (-p0.y + 3*p1.y - 3*p2.y + p3.y) * t3)
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
    const visiblePoints = Math.floor(progress * splinePoints.length);
    
    // Actualizar progreso
    const percentage = Math.min(100, Math.floor(progress * 100));
    document.getElementById('spline-percentage').textContent = percentage + '%';
    document.getElementById('spline-progress').style.width = percentage + '%';
    
    // Dibujar puntos de control
    ctx.fillStyle = '#3498db';
    for (let i = 0; i < splinePoints.length; i++) {
        ctx.beginPath();
        ctx.arc(splinePoints[i].x, splinePoints[i].y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Dibujar líneas entre puntos (polígono inicial)
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(splinePoints[0].x, splinePoints[0].y);
    
    for (let i = 1; i < visiblePoints; i++) {
        ctx.lineTo(splinePoints[i].x, splinePoints[i].y);
    }
    ctx.stroke();
    
    // Dibujar spline cúbico
    if (visiblePoints >= 4) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        // Mover al primer punto interpolado
        const firstPoint = catmullRom(
            splinePoints[0],
            splinePoints[0],
            splinePoints[1],
            splinePoints[2],
            0
        );
        ctx.moveTo(firstPoint.x, firstPoint.y);
        
        // Dibujar curva spline
        for (let i = 0; i < visiblePoints - 3; i++) {
            const p0 = splinePoints[i];
            const p1 = splinePoints[i + 1];
            const p2 = splinePoints[i + 2];
            const p3 = splinePoints[i + 3];
            
            // Dibujar segmentos de la curva
            for (let t = 0; t <= 1; t += 0.05) {
                const point = catmullRom(p0, p1, p2, p3, t);
                ctx.lineTo(point.x, point.y);
            }
        }
        
        ctx.stroke();
    }
    
    // Dibujar punto actual en rojo
    if (visiblePoints > 0 && visiblePoints < splinePoints.length) {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(splinePoints[visiblePoints].x, splinePoints[visiblePoints].y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Actualizar tiempo
    if (isSplineAnimating && splineTime < 100) {
        splineTime += splineSpeed;
        document.getElementById('spline-status').textContent = `Dibujando punto ${visiblePoints} de ${splinePoints.length}`;
    } else if (splineTime >= 100) {
        document.getElementById('spline-status').textContent = 'Animación completada';
        isSplineAnimating = false;
        document.getElementById('spline-start-btn').innerHTML = '<i class="fas fa-redo"></i> Reiniciar';
    }
    
    // Continuar animación
    if (isSplineAnimating) {
        splineAnimationId = requestAnimationFrame(drawSplineAnimation);
    }
}

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
    drawSplineAnimation(); // Dibujar estado inicial
}

// ========== SERIES DE FOURIER ==========

// Inicializar canvas de Fourier
function initFourierCanvas() {
    const canvas = document.getElementById('fourier-canvas');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Generar coeficientes de Fourier para un corazón
function generateFourierCoefficients() {
    fourierCoefficients = [];
    fourierTerms = parseInt(document.getElementById('fourier-terms').value);
    
    // Coeficientes para dibujar un corazón
    // Basado en la ecuación paramétrica: x = 16 sin³(t), y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
    
    for (let n = 0; n <= fourierTerms; n++) {
        // Coeficientes para x(t)
        let a_n_x = 0;
        let b_n_x = 0;
        
        // Coeficientes para y(t)
        let a_n_y = 0;
        let b_n_y = 0;
        
        if (n === 0) {
            a_n_x = 0;
            a_n_y = 0;
        } else if (n === 1) {
            b_n_x = 8;  // 16 * 0.5
            a_n_y = 6.5; // 13 * 0.5
        } else if (n === 2) {
            a_n_y = -2.5; // -5 * 0.5
        } else if (n === 3) {
            a_n_y = -1; // -2 * 0.5
        } else if (n === 4) {
            a_n_y = -0.5; // -1 * 0.5
        }
        // Para n > 4, coeficientes son 0 (simplificación)
        
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

// Dibujar animación de Fourier
function drawFourierAnimation() {
    const canvas = document.getElementById('fourier-canvas');
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.2;
    
    // Calcular progreso
    const progress = fourierTime / (2 * Math.PI);
    const percentage = Math.min(100, Math.floor(progress * 100));
    document.getElementById('fourier-percentage').textContent = percentage + '%';
    document.getElementById('fourier-progress').style.width = percentage + '%';
    
    let currentX = centerX;
    let currentY = centerY;
    
    // Dibujar epiciclos para X
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < fourierCoefficients.length; i++) {
        const coef = fourierCoefficients[i];
        
        // Radio del círculo
        const radius = coef.radius_x * scale;
        
        // Dibujar círculo
        ctx.beginPath();
        ctx.arc(currentX, currentY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Calcular posición en el círculo
        const angle = coef.freq * fourierTime + coef.phase_x;
        const nextX = currentX + radius * Math.cos(angle);
        const nextY = currentY + radius * Math.sin(angle);
        
        // Dibujar línea al siguiente punto
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
        
        // Actualizar posición actual
        currentX = nextX;
        currentY = nextY;
    }
    
    // Guardar posición X final
    const finalX = currentX;
    
    // Resetear para Y
    currentX = centerX;
    currentY = centerY;
    
    // Dibujar epiciclos para Y
    ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
    
    for (let i = 0; i < fourierCoefficients.length; i++) {
        const coef = fourierCoefficients[i];
        
        // Radio del círculo
        const radius = coef.radius_y * scale;
        
        // Dibujar círculo
        ctx.beginPath();
        ctx.arc(currentX, currentY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Calcular posición en el círculo
        const angle = coef.freq * fourierTime + coef.phase_y;
        const nextX = currentX + radius * Math.cos(angle);
        const nextY = currentY + radius * Math.sin(angle);
        
        // Dibujar línea al siguiente punto
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
        
        // Actualizar posición actual
        currentX = nextX;
        currentY = nextY;
    }
    
    // Guardar posición Y final
    const finalY = currentY;
    
    // Dibujar punto final (combinación de X e Y)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(finalX, finalY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Dibujar trayectoria (línea que deja el punto)
    if (window.fourierPath) {
        window.fourierPath.push({x: finalX, y: finalY});
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(window.fourierPath[0].x, window.fourierPath[0].y);
        
        for (let i = 1; i < window.fourierPath.length; i++) {
            ctx.lineTo(window.fourierPath[i].x, window.fourierPath[i].y);
        }
        ctx.stroke();
    } else {
        window.fourierPath = [{x: finalX, y: finalY}];
    }
    
    // Actualizar tiempo
    if (isFourierAnimating && fourierTime < 2 * Math.PI) {
        fourierTime += 0.05 * fourierSpeed;
        const currentTerm = Math.floor(fourierTime / (2 * Math.PI) * fourierTerms);
        document.getElementById('fourier-status').textContent = `Término ${currentTerm} de ${fourierTerms}`;
    } else if (fourierTime >= 2 * Math.PI) {
        document.getElementById('fourier-status').textContent = 'Animación completada';
        isFourierAnimating = false;
        document.getElementById('fourier-start-btn').innerHTML = '<i class="fas fa-redo"></i> Reiniciar';
    }
    
    // Continuar animación
    if (isFourierAnimating) {
        fourierAnimationId = requestAnimationFrame(drawFourierAnimation);
    }
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
        generateFourierCoefficients();
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
    window.fourierPath = [];
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
    generateFourierCoefficients();
    drawFourierAnimation(); // Dibujar estado inicial
}

// Event listeners para cambios en tiempo real
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
    if (!isFourierAnimating) {
        generateFourierCoefficients();
        drawFourierAnimation();
    }
});

// Redimensionar canvas cuando cambia el tamaño de la ventana
window.addEventListener('resize', function() {
    initSplineCanvas();
    initFourierCanvas();
    generateSplinePoints();
    if (!isSplineAnimating) {
        drawSplineAnimation();
    }
    if (!isFourierAnimating) {
        drawFourierAnimation();
    }
});
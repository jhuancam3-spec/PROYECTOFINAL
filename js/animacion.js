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
let fourierTerms = 15;
let fourierPath = [];

// Inicialización cuando se carga la página
window.onload = function() {
    initSplineCanvas();
    initFourierCanvas();
    generateDetailedVasePoints();
    generateFourierHeartCoefficients();
    drawSplineAnimation();
    drawFourierAnimation();
};

// ========== SPLINES CÚBICOS - JARRÓN DETALLADO ==========

// Inicializar canvas de splines
function initSplineCanvas() {
    const canvas = document.getElementById('spline-canvas');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Generar MÁS puntos para un jarrón más detallado
function generateDetailedVasePoints() {
    splinePoints = [];
    
    const canvas = document.getElementById('spline-canvas');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const vaseHeight = canvas.height * 0.4;  // Tamaño adecuado
    const vaseWidth = canvas.width * 0.2;    // Ancho adecuado
    
    console.log("Generando jarrón detallado con más puntos XY...");
    
    // Punto 0: Base del jarrón (centro inferior)
    splinePoints.push({x: centerX, y: centerY + vaseHeight/2.5});
    
    // BASE ANCHA (puntos 1-8)
    for (let i = 1; i <= 8; i++) {
        const t = i / 8;
        const angle = t * Math.PI * 0.4;
        const x = centerX + Math.sin(angle) * vaseWidth * 0.6;
        const y = centerY + vaseHeight/2.5 - Math.cos(angle) * vaseHeight * 0.1;
        splinePoints.push({x: x, y: y});
    }
    
    // CUERPO ANCHO (puntos 9-16)
    for (let i = 1; i <= 8; i++) {
        const t = i / 8;
        const angle = 0.4 * Math.PI + t * Math.PI * 0.4;
        const x = centerX + Math.sin(angle) * vaseWidth * 0.9;
        const y = centerY + vaseHeight/5 - Math.cos(angle) * vaseHeight * 0.3;
        splinePoints.push({x: x, y: y});
    }
    
    // CUELLO QUE SE ESTRECHA (puntos 17-24)
    for (let i = 1; i <= 8; i++) {
        const t = i / 8;
        const angle = 0.8 * Math.PI + t * Math.PI * 0.3;
        const x = centerX + Math.sin(angle) * vaseWidth * (0.9 - t * 0.5);
        const y = centerY - vaseHeight/3 + Math.cos(angle) * vaseHeight * 0.2;
        splinePoints.push({x: x, y: y});
    }
    
    // BORDE DEL JARRÓN (puntos 25-28)
    for (let i = 1; i <= 4; i++) {
        const t = i / 4;
        const x = centerX + vaseWidth * 0.3 * (1 - t * 0.7);
        const y = centerY - vaseHeight/2.2 + t * vaseHeight * 0.05;
        splinePoints.push({x: x, y: y});
    }
    
    // PUNTO SUPERIOR (29)
    splinePoints.push({x: centerX, y: centerY - vaseHeight/2});
    
    // Crear la mitad izquierda por simetría (MÁS PUNTOS)
    const rightHalfPoints = [...splinePoints];
    splinePoints = [];
    
    // Mitad izquierda (inverso) - puntos 30-58
    for (let i = rightHalfPoints.length - 1; i >= 0; i--) {
        const point = rightHalfPoints[i];
        splinePoints.push({x: centerX - (point.x - centerX), y: point.y});
    }
    
    // Mitad derecha - puntos 59-88
    for (let i = 1; i < rightHalfPoints.length; i++) {
        splinePoints.push(rightHalfPoints[i]);
    }
    
    // Cerrar la figura (punto 89 = punto 0)
    splinePoints.push(splinePoints[0]);
    
    console.log(`Jarrón generado con ${splinePoints.length} puntos XY`);
}

// Dibujar animación de splines del jarrón detallado
function drawSplineAnimation() {
    const canvas = document.getElementById('spline-canvas');
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo suave
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e8f4f8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calcular progreso
    const progress = splineTime / 100;
    const totalPoints = splinePoints.length;
    const pointsToShow = Math.floor(progress * totalPoints);
    
    // Actualizar progreso
    const percentage = Math.min(100, Math.floor(progress * 100));
    document.getElementById('spline-percentage').textContent = percentage + '%';
    document.getElementById('spline-progress').style.width = percentage + '%';
    
    // Dibujar puntos de control (más pequeños para no saturar)
    ctx.fillStyle = '#e74c3c';
    for (let i = 0; i < Math.min(pointsToShow + 5, splinePoints.length); i++) {
        ctx.beginPath();
        ctx.arc(splinePoints[i].x, splinePoints[i].y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Etiqueta de número cada 5 puntos
        if (i % 5 === 0) {
            ctx.fillStyle = '#2c3e50';
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i, splinePoints[i].x, splinePoints[i].y - 8);
            ctx.fillStyle = '#e74c3c';
        }
    }
    
    // Dibujar líneas entre puntos ya conectados
    if (pointsToShow > 1) {
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 1]);
        ctx.beginPath();
        ctx.moveTo(splinePoints[0].x, splinePoints[0].y);
        
        for (let i = 1; i < pointsToShow; i++) {
            ctx.lineTo(splinePoints[i].x, splinePoints[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Dibujar spline suavizado con curva de Bézier
    if (pointsToShow >= 3) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        // Mover al primer punto
        ctx.moveTo(splinePoints[0].x, splinePoints[0].y);
        
        // Usar curvas de Bézier para mejor suavizado
        for (let i = 1; i < pointsToShow; i++) {
            const prev = splinePoints[i-1];
            const curr = splinePoints[i];
            
            if (i === 1) {
                ctx.lineTo(curr.x, curr.y);
            } else if (i === 2) {
                const prevPrev = splinePoints[i-2];
                const controlX = prevPrev.x + (prev.x - prevPrev.x) * 0.5;
                const controlY = prevPrev.y + (prev.y - prevPrev.y) * 0.5;
                ctx.quadraticCurveTo(controlX, controlY, curr.x, curr.y);
            } else {
                const prevPrev = splinePoints[i-2];
                const cp1x = prevPrev.x + (prev.x - prevPrev.x) * 0.5;
                const cp1y = prevPrev.y + (prev.y - prevPrev.y) * 0.5;
                const cp2x = prev.x + (curr.x - prev.x) * 0.5;
                const cp2y = prev.y + (curr.y - prev.y) * 0.5;
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
            }
        }
        
        ctx.stroke();
    }
    
    // Dibujar punto actual en movimiento
    if (pointsToShow > 0 && pointsToShow < totalPoints) {
        const currentPoint = splinePoints[pointsToShow];
        
        // Punto verde brillante
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(currentPoint.x, currentPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Anillo animado
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const pulse = 10 + Math.sin(Date.now() * 0.005) * 5;
        ctx.arc(currentPoint.x, currentPoint.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        // Mostrar coordenadas del punto actual
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Punto ${pointsToShow}: X=${Math.round(currentPoint.x)}, Y=${Math.round(currentPoint.y)}`, 
                    10, canvas.height - 20);
        
        document.getElementById('spline-status').textContent = 
            `Punto ${pointsToShow} de ${totalPoints}`;
    }
    
    // Rellenar el jarrón cuando esté completo
    if (pointsToShow === totalPoints) {
        // Relleno azul claro
        ctx.fillStyle = 'rgba(52, 152, 219, 0.12)';
        ctx.beginPath();
        ctx.moveTo(splinePoints[0].x, splinePoints[0].y);
        
        for (let i = 1; i < splinePoints.length; i++) {
            ctx.lineTo(splinePoints[i].x, splinePoints[i].y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Patrón decorativo interior
        ctx.strokeStyle = 'rgba(155, 89, 182, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 2]);
        
        // Líneas horizontales decorativas
        for (let i = 1; i <= 3; i++) {
            const y = canvas.height/2 - canvas.height * 0.15 + i * canvas.height * 0.1;
            ctx.beginPath();
            ctx.moveTo(canvas.width/2 - canvas.width * 0.1, y);
            ctx.lineTo(canvas.width/2 + canvas.width * 0.1, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        
        // Texto informativo
        ctx.fillStyle = '#27ae60';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✓ Jarrón completado', canvas.width/2, 25);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#7f8c8d';
        ctx.fillText(`${splinePoints.length} puntos XY utilizados`, canvas.width/2, 45);
    }
    
    // Actualizar tiempo
    if (isSplineAnimating && splineTime < 100) {
        splineTime += splineSpeed * 0.5; // Más lento por tener más puntos
    } else if (splineTime >= 100) {
        document.getElementById('spline-status').textContent = `Jarrón completado (${splinePoints.length} puntos) ✓`;
        isSplineAnimating = false;
        document.getElementById('spline-start-btn').innerHTML = '<i class="fas fa-redo"></i> Reiniciar';
        document.getElementById('spline-start-btn').disabled = false;
        document.getElementById('spline-pause-btn').disabled = true;
    }
    
    // Continuar animación
    if (isSplineAnimating) {
        splineAnimationId = requestAnimationFrame(drawSplineAnimation);
    }
}


// ========== SERIES DE FOURIER - CORAZÓN CENTRADO ==========

// Inicializar canvas de Fourier
function initFourierCanvas() {
    const canvas = document.getElementById('fourier-canvas');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Generar coeficientes para corazón bien centrado
function generateFourierHeartCoefficients() {
    fourierCoefficients = [];
    fourierTerms = parseInt(document.getElementById('fourier-terms').value);
    
    // Coeficientes optimizados para corazón centrado
    // Fórmula paramétrica del corazón: 
    // x = 16 sin³(t), y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
    // Escalada para que quede centrado
    
    for (let n = 0; n <= fourierTerms; n++) {
        let a_x = 0, b_x = 0, a_y = 0, b_y = 0;
        
        // Transformada de Fourier de la ecuación del corazón
        if (n === 0) {
            a_y = 0;
        } else if (n === 1) {
            b_x = 12;  // 16 * 3/4 para sin³(t)
            a_y = 6.5; // 13/2
        } else if (n === 2) {
            a_y = -2.5; // -5/2
        } else if (n === 3) {
            b_x = -4;   // 16 * (-1/4)
            a_y = -1;   // -2/2
        } else if (n === 4) {
            a_y = -0.5; // -1/2
        }
        // Para n > 4, añadir términos pequeños para suavizar
        else if (n <= 8) {
            a_y = 0.1 / n * Math.sin(n * 0.5);
            b_x = 0.05 / n * Math.cos(n * 0.3);
        }
        
        fourierCoefficients.push({
            freq: n,
            a_x: a_x,
            b_x: b_x,
            a_y: a_y,
            b_y: b_y,
            radius_x: Math.sqrt(a_x * a_x + b_x * b_x),
            radius_y: Math.sqrt(a_y * a_y + b_y * b_y),
            phase_x: Math.atan2(b_x, a_x),
            phase_y: Math.atan2(b_y, a_y)
        });
    }
}

// Calcular punto del corazón centrado
function calculateHeartPoint(t) {
    let x = 0;
    let y = 0;
    
    for (let i = 0; i < fourierCoefficients.length; i++) {
        const coef = fourierCoefficients[i];
        const angle = coef.freq * t;
        
        x += coef.a_x * Math.cos(angle) + coef.b_x * Math.sin(angle);
        y += coef.a_y * Math.cos(angle) + coef.b_y * Math.sin(angle);
    }
    
    return {x: x, y: -y}; // Invertir Y para canvas
}

// Dibujar animación de Fourier del corazón centrado
function drawFourierAnimation() {
    const canvas = document.getElementById('fourier-canvas');
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#f5e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.15; // Tamaño adecuado
    
    // Calcular progreso
    const progress = fourierTime / (2 * Math.PI);
    const percentage = Math.min(100, Math.floor(progress * 100));
    document.getElementById('fourier-percentage').textContent = percentage + '%';
    document.getElementById('fourier-progress').style.width = percentage + '%';
    
    // Calcular punto actual del corazón
    const heartPoint = calculateHeartPoint(fourierTime);
    const screenX = centerX + heartPoint.x * scale;
    const screenY = centerY + heartPoint.y * scale; // NOTA: Y ya está invertido en calculateHeartPoint
    
    // Agregar punto al path
    fourierPath.push({x: screenX, y: screenY});
    
    // Mantener solo los últimos puntos
    if (fourierPath.length > 300) {
        fourierPath = fourierPath.slice(-300);
    }
    
    // Dibujar epiciclos (solo durante animación)
    if (isFourierAnimating && fourierTime < Math.PI * 1.5) {
        let currentX = centerX;
        let currentY = centerY;
        
        // Dibujar primeros 4 epiciclos
        const circlesToShow = Math.min(4, fourierCoefficients.length);
        
        for (let i = 0; i < circlesToShow; i++) {
            const coef = fourierCoefficients[i];
            const radius = coef.radius_x * scale;
            
            if (radius > 2) {
                // Círculo del epiciclo
                ctx.strokeStyle = `rgba(231, 76, 60, ${0.6 - i * 0.15})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(currentX, currentY, radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Línea al borde
                const angle = coef.freq * fourierTime + coef.phase_x;
                const nextX = currentX + radius * Math.cos(angle);
                const nextY = currentY + radius * Math.sin(angle);
                
                ctx.beginPath();
                ctx.moveTo(currentX, currentY);
                ctx.lineTo(nextX, nextY);
                ctx.stroke();
                
                // Punto en el borde
                ctx.fillStyle = `rgba(46, 204, 113, ${0.7 - i * 0.15})`;
                ctx.beginPath();
                ctx.arc(nextX, nextY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                currentX = nextX;
                currentY = nextY;
            }
        }
    }
    
    // Dibujar la trayectoria del corazón
    if (fourierPath.length > 2) {
        // Gradiente para el corazón
        const heartGradient = ctx.createLinearGradient(
            centerX - scale, centerY,
            centerX + scale, centerY
        );
        heartGradient.addColorStop(0, '#e74c3c');
        heartGradient.addColorStop(0.5, '#9b59b6');
        heartGradient.addColorStop(1, '#3498db');
        
        ctx.strokeStyle = heartGradient;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        
        // Suavizar el trazo
        ctx.moveTo(fourierPath[0].x, fourierPath[0].y);
        
        for (let i = 1; i < fourierPath.length; i++) {
            const prev = fourierPath[i-1];
            const curr = fourierPath[i];
            
            if (i === 1) {
                ctx.lineTo(curr.x, curr.y);
            } else {
                const prev2 = fourierPath[i-2];
                const cp1x = prev2.x + (prev.x - prev2.x) * 0.5;
                const cp1y = prev2.y + (prev.y - prev2.y) * 0.5;
                const cp2x = prev.x + (curr.x - prev.x) * 0.5;
                const cp2y = prev.y + (curr.y - prev.y) * 0.5;
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curr.x, curr.y);
            }
        }
        
        ctx.stroke();
    }
    
    // Dibujar punto actual
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Anillo animado alrededor
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 12 + Math.sin(Date.now() * 0.006) * 4, 0, Math.PI * 2);
    ctx.stroke();
    
    // Dibujar corazón completo al final
    if (fourierTime >= 2 * Math.PI && fourierPath.length > 100) {
        // Rellenar el corazón
        ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
        ctx.beginPath();
        ctx.moveTo(fourierPath[0].x, fourierPath[0].y);
        
        for (let i = 1; i < fourierPath.length; i++) {
            ctx.lineTo(fourierPath[i].x, fourierPath[i].y);
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Texto de completado
        ctx.fillStyle = '#27ae60';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('❤️ Corazón completado', centerX, 30);
    }
    
    // Actualizar tiempo
    if (isFourierAnimating && fourierTime < 2 * Math.PI) {
        fourierTime += 0.03 * fourierSpeed;
        const currentTerm = Math.floor(fourierTime / (2 * Math.PI) * fourierTerms);
        document.getElementById('fourier-status').textContent = 
            `Armónico ${currentTerm} de ${fourierTerms}`;
    } else if (fourierTime >= 2 * Math.PI) {
        document.getElementById('fourier-status').textContent = 'Corazón completado ❤️';
        isFourierAnimating = false;
        document.getElementById('fourier-start-btn').innerHTML = '<i class="fas fa-redo"></i> Reiniciar';
        document.getElementById('fourier-start-btn').disabled = false;
        document.getElementById('fourier-pause-btn').disabled = true;
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
        case 'slow': splineSpeed = 0.4; break;
        case 'normal': splineSpeed = 0.7; break;
        case 'fast': splineSpeed = 1.2; break;
    }
    
    if (!isSplineAnimating) {
        if (splineTime >= 100) {
            resetSplineAnimation();
        }
        isSplineAnimating = true;
        document.getElementById('spline-start-btn').innerHTML = '<i class="fas fa-play"></i> Dibujando...';
        document.getElementById('spline-start-btn').disabled = true;
        document.getElementById('spline-pause-btn').disabled = false;
        document.getElementById('spline-status').textContent = 'Creando jarrón...';
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
    document.getElementById('spline-status').textContent = 'Listo para dibujar jarrón';
    document.getElementById('spline-start-btn').innerHTML = '<i class="fas fa-play"></i> Iniciar Animación';
    document.getElementById('spline-start-btn').disabled = false;
    document.getElementById('spline-pause-btn').disabled = false;
    
    if (splineAnimationId) {
        cancelAnimationFrame(splineAnimationId);
        splineAnimationId = null;
    }
    
    isSplineAnimating = false;
    generateVasePoints();
    drawSplineAnimation();
}

// Controlar animación de Fourier
function startFourierAnimation() {
    const speedSelect = document.getElementById('fourier-speed');
    switch(speedSelect.value) {
        case 'slow': fourierSpeed = 0.5; break;
        case 'normal': fourierSpeed = 1; break;
        case 'fast': fourierSpeed = 1.5; break;
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
        document.getElementById('fourier-start-btn').innerHTML = '<i class="fas fa-play"></i> Dibujando...';
        document.getElementById('fourier-start-btn').disabled = true;
        document.getElementById('fourier-pause-btn').disabled = false;
        document.getElementById('fourier-status').textContent = 'Generando corazón...';
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
    document.getElementById('fourier-status').textContent = 'Listo para dibujar corazón';
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
            case 'slow': splineSpeed = 0.4; break;
            case 'normal': splineSpeed = 0.7; break;
            case 'fast': splineSpeed = 1.2; break;
        }
    }
});

document.getElementById('fourier-speed').addEventListener('change', function() {
    if (isFourierAnimating) {
        const speedSelect = document.getElementById('fourier-speed');
        switch(speedSelect.value) {
            case 'slow': fourierSpeed = 0.5; break;
            case 'normal': fourierSpeed = 1; break;
            case 'fast': fourierSpeed = 1.5; break;
        }
    }
});

document.getElementById('fourier-terms').addEventListener('change', function() {
    fourierTerms = parseInt(this.value);
    generateFourierHeartCoefficients();
    if (!isFourierAnimating) {
        resetFourierAnimation();
    }
});

// Redimensionar canvas cuando cambia el tamaño de la ventana
window.addEventListener('resize', function() {
    initSplineCanvas();
    initFourierCanvas();
    generateVasePoints();
    generateFourierHeartCoefficients();
    
    if (!isSplineAnimating) {
        drawSplineAnimation();
    }
    
    if (!isFourierAnimating) {
        fourierTime = 0;
        fourierPath = [];
        drawFourierAnimation();
    }
});


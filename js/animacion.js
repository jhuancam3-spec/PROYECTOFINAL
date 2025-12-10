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
let fourierTerms = 20;
let fourierPath = [];

window.onload = function() {
    initSplineCanvas();
    initFourierCanvas();
    generateVasePoints();
    generateFourierHeartCoefficients();
    drawSplineAnimation();
    drawFourierAnimation();
};

function initSplineCanvas() {
    const canvas = document.getElementById('spline-canvas');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

function generateVasePoints() {
    splinePoints = [];
    
    const canvas = document.getElementById('spline-canvas');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const vaseHeight = canvas.height * 0.6;
    const vaseWidth = canvas.width * 0.3;

    splinePoints.push({x: centerX, y: centerY + vaseHeight/2});
    
    for (let i = 0; i <= 5; i++) {
        const t = i / 5;
        const angle = t * Math.PI * 0.8; 
        const x = centerX + Math.sin(angle) * vaseWidth * 0.8;
        const y = centerY + vaseHeight/2 - Math.cos(angle) * vaseHeight * 0.7;
        splinePoints.push({x: x, y: y});
    }
    
    for (let i = 1; i <= 3; i++) {
        const t = i / 3;
        const x = centerX + vaseWidth * 0.4 * (1 - t);
        const y = centerY - vaseHeight/2 + vaseHeight * 0.1 * t;
        splinePoints.push({x: x, y: y});
    }
    
    splinePoints.push({x: centerX + vaseWidth * 0.3, y: centerY - vaseHeight/2});
    splinePoints.push({x: centerX + vaseWidth * 0.4, y: centerY - vaseHeight/2 - 10});
    
    const rightHalfPoints = [...splinePoints];
    splinePoints = [];
    
    for (let i = rightHalfPoints.length - 1; i >= 0; i--) {
        const point = rightHalfPoints[i];
        splinePoints.push({x: centerX - (point.x - centerX), y: point.y});
    }
    
    for (let i = 1; i < rightHalfPoints.length; i++) {
        splinePoints.push(rightHalfPoints[i]);
    }
    
    splinePoints.push(splinePoints[0]);
}

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

function drawSplineAnimation() {
    const canvas = document.getElementById('spline-canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const progress = splineTime / 100;
    const totalPoints = splinePoints.length;
    const pointsToShow = Math.floor(progress * totalPoints);
    
    const percentage = Math.min(100, Math.floor(progress * 100));
    document.getElementById('spline-percentage').textContent = percentage + '%';
    document.getElementById('spline-progress').style.width = percentage + '%';
    
    ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
    for (let i = 0; i < splinePoints.length; i++) {
        ctx.beginPath();
        ctx.arc(splinePoints[i].x, splinePoints[i].y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    if (pointsToShow >= 4) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        let firstPoint = splinePoints[0];
        ctx.moveTo(firstPoint.x, firstPoint.y);
        
        for (let i = 0; i < pointsToShow - 3; i++) {
            const p0 = splinePoints[Math.max(0, i-1)];
            const p1 = splinePoints[i];
            const p2 = splinePoints[i+1];
            const p3 = splinePoints[Math.min(pointsToShow-1, i+2)];
            
            for (let t = 0; t <= 1; t += 0.05) {
                const point = catmullRom(p0, p1, p2, p3, t);
                ctx.lineTo(point.x, point.y);
            }
        }
        
        ctx.stroke();
        
        if (pointsToShow === totalPoints) {
            ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
            ctx.fill();
        }
    }
    
    if (pointsToShow > 0 && pointsToShow < totalPoints) {
        const currentPoint = splinePoints[pointsToShow];
        
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(currentPoint.x, currentPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(currentPoint.x, currentPoint.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        document.getElementById('spline-status').textContent = 
            `Dibujando punto ${pointsToShow} de ${totalPoints}`;
    }
    
    if (isSplineAnimating && splineTime < 100) {
        splineTime += splineSpeed * 0.8;
    } else if (splineTime >= 100) {
        document.getElementById('spline-status').textContent = 'Jarrón completado ✓';
        isSplineAnimating = false;
        document.getElementById('spline-start-btn').innerHTML = '<i class="fas fa-redo"></i> Reiniciar';
        document.getElementById('spline-start-btn').disabled = false;
        document.getElementById('spline-pause-btn').disabled = true;
        
        
        drawVaseDetails(ctx);
    }
    
    
    if (isSplineAnimating) {
        splineAnimationId = requestAnimationFrame(drawSplineAnimation);
    }
}

function drawVaseDetails(ctx) {
    const canvas = document.getElementById('spline-canvas');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const vaseHeight = canvas.height * 0.6;
    
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    
    for (let i = 1; i <= 3; i++) {
        const y = centerY - vaseHeight/4 + (i * vaseHeight/4);
        ctx.beginPath();
        ctx.arc(centerX, y, canvas.width * 0.15, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
}


function initFourierCanvas() {
    const canvas = document.getElementById('fourier-canvas');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

function generateFourierHeartCoefficients() {
    fourierCoefficients = [];
    fourierTerms = parseInt(document.getElementById('fourier-terms').value);
    
    for (let n = 0; n <= fourierTerms; n++) {
        let a_x = 0, b_x = 0, a_y = 0, b_y = 0;
        
        
        if (n === 1) {
            
            b_x = 12; 
        } else if (n === 3) {
            b_x = -4; 
        }
        
        if (n === 0) {
            a_y = 0;
        } else if (n === 1) {
            a_y = 6.5; 
        } else if (n === 2) {
            a_y = -2.5; 
        } else if (n === 3) {
            a_y = -1; 
        } else if (n === 4) {
            a_y = -0.5; 
        }
        
        if (n > 4 && n <= 10) {
            a_y += (0.3 / n) * Math.sin(n * 0.5);
            b_x += (0.2 / n) * Math.cos(n * 0.3);
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

function calculateHeartPoint(t) {
    let x = 0;
    let y = 0;
    
    for (let i = 0; i < fourierCoefficients.length; i++) {
        const coef = fourierCoefficients[i];
        const angle = coef.freq * t;
        
        x += coef.a_x * Math.cos(angle) + coef.b_x * Math.sin(angle);
        y += coef.a_y * Math.cos(angle) + coef.b_y * Math.sin(angle);
    }
    
    return {x: x, y: y};
}

function drawFourierAnimation() {
    const canvas = document.getElementById('fourier-canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.2; 
    
    const progress = fourierTime / (2 * Math.PI);
    const percentage = Math.min(100, Math.floor(progress * 100));
    document.getElementById('fourier-percentage').textContent = percentage + '%';
    document.getElementById('fourier-progress').style.width = percentage + '%';
    
    const heartPoint = calculateHeartPoint(fourierTime);
    const screenX = centerX + heartPoint.x * scale;
    const screenY = centerY - heartPoint.y * scale; 
    
    if (screenX >= 0 && screenX <= canvas.width && screenY >= 0 && screenY <= canvas.height) {
        fourierPath.push({x: screenX, y: screenY});
    }
    
    if (fourierPath.length > 800) {
        fourierPath = fourierPath.slice(-800);
    }
    
    if (isFourierAnimating && fourierTime < Math.PI) {
        let currentX = centerX;
        let currentY = centerY;
        
        const circlesToShow = Math.min(4, fourierCoefficients.length);
        
        for (let i = 0; i < circlesToShow; i++) {
            const coef = fourierCoefficients[i];
            const radius = Math.max(coef.radius_x, coef.radius_y) * scale;
            
            if (radius > 2) {
                
                const alpha = 0.6 - (i * 0.15);
                ctx.strokeStyle = `rgba(231, 76, 60, ${alpha})`;
                ctx.lineWidth = 1.5;
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
                
                ctx.fillStyle = `rgba(46, 204, 113, ${0.8 - i * 0.2})`;
                ctx.beginPath();
                ctx.arc(nextX, nextY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                currentX = nextX;
                currentY = nextY;
            }
        }
    }
    
    if (fourierPath.length > 2) {
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#e74c3c');
        gradient.addColorStop(0.5, '#9b59b6');
        gradient.addColorStop(1, '#3498db');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        
        
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
    
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
    ctx.stroke();
    
    if (fourierTime >= 2 * Math.PI && fourierPath.length > 100) {

        ctx.fillStyle = 'rgba(231, 76, 60, 0.1)';
        ctx.beginPath();
        ctx.moveTo(fourierPath[0].x, fourierPath[0].y);
        
        for (let i = 1; i < fourierPath.length; i++) {
            ctx.lineTo(fourierPath[i].x, fourierPath[i].y);
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    if (isFourierAnimating && fourierTime < 2 * Math.PI) {
        fourierTime += 0.04 * fourierSpeed;
        const currentTerm = Math.floor(fourierTime / (2 * Math.PI) * fourierTerms);
        document.getElementById('fourier-status').textContent = 
            `Armónico ${currentTerm} de ${fourierTerms} | Dibujando corazón...`;
    } else if (fourierTime >= 2 * Math.PI) {
        document.getElementById('fourier-status').textContent = 'Corazón completado ❤️';
        isFourierAnimating = false;
        document.getElementById('fourier-start-btn').innerHTML = '<i class="fas fa-redo"></i> Reiniciar';
        document.getElementById('fourier-start-btn').disabled = false;
        document.getElementById('fourier-pause-btn').disabled = true;
    }
    
    if (isFourierAnimating) {
        fourierAnimationId = requestAnimationFrame(drawFourierAnimation);
    }
}


function startSplineAnimation() {
    const speedSelect = document.getElementById('spline-speed');
    switch(speedSelect.value) {
        case 'slow': splineSpeed = 0.5; break;
        case 'normal': splineSpeed = 1; break;
        case 'fast': splineSpeed = 1.5; break;
    }
    
    if (!isSplineAnimating) {
        if (splineTime >= 100) {
            resetSplineAnimation();
        }
        isSplineAnimating = true;
        document.getElementById('spline-start-btn').innerHTML = '<i class="fas fa-play"></i> Dibujando...';
        document.getElementById('spline-start-btn').disabled = true;
        document.getElementById('spline-pause-btn').disabled = false;
        document.getElementById('spline-status').textContent = 'Creando jarrón con splines cúbicos...';
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

function startFourierAnimation() {
    const speedSelect = document.getElementById('fourier-speed');
    switch(speedSelect.value) {
        case 'slow': fourierSpeed = 0.5; break;
        case 'normal': fourierSpeed = 1; break;
        case 'fast': fourierSpeed = 1.5; break;
    }
    
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
        document.getElementById('fourier-status').textContent = 'Generando corazón con series de Fourier...';
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


document.getElementById('spline-speed').addEventListener('change', function() {
    if (isSplineAnimating) {
        const speedSelect = document.getElementById('spline-speed');
        switch(speedSelect.value) {
            case 'slow': splineSpeed = 0.5; break;
            case 'normal': splineSpeed = 1; break;
            case 'fast': splineSpeed = 1.5; break;
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


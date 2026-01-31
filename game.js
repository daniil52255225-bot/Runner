const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const speedDisplay = document.getElementById('speedDisplay');
const distanceDisplay = document.getElementById('distanceDisplay');
const speedFill = document.getElementById('speedFill');

// Игровые переменные
let player = {
    x: 400, // начальная позиция по центру
    y: 240, // выше, чтобы был виден
    width: 40,
    height: 60,
    velocityX: 0,
    acceleration: 30, // ускорение за кадр
    friction: 0.97, // меньше трения для лучшего ускорения
    color: '#00ff88'
};

let cameraX = 0;
let platform = {
    segments: [],
    segmentWidth: 200,
    colors: ['#2d4059', '#4a6572', '#5b7b8a']
};

let distance = 0;
let keys = {
    left: false,
    right: false
};

// Генерация начальной платформы
function generatePlatform() {
    platform.segments = [];
    for (let i = -5; i < 15; i++) {
        platform.segments.push({
            x: i * platform.segmentWidth,
            width: platform.segmentWidth,
            height: 100,
            color: platform.colors[Math.floor(Math.random() * platform.colors.length)]
        });
    }
}

// Рисование платформы
function drawPlatform() {
    platform.segments.forEach(segment => {
        const screenX = segment.x - cameraX;
        
        if (screenX > -platform.segmentWidth && screenX < canvas.width) {
            // Основная платформа
            ctx.fillStyle = segment.color;
            ctx.fillRect(screenX, canvas.height - segment.height, segment.width, segment.height);
            
            // Текстура
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            for (let i = 0; i < segment.width; i += 20) {
                ctx.fillRect(screenX + i, canvas.height - segment.height + 5, 10, 5);
            }
            
            // Граница
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenX, canvas.height - segment.height, segment.width, segment.height);
        }
    });
}

// Рисование человечка (упрощенная версия)
function drawPlayer() {
    const screenX = player.x - cameraX;
    
    // Ноги (движущиеся)
    const legOffset = Math.sin(Date.now() / 100 * Math.abs(player.velocityX) * 0.01) * 15;
    
    // Левая нога
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(screenX + 10, player.y + player.height, 8, 25 + legOffset);
    
    // Правая нога
    ctx.fillRect(screenX + player.width - 18, player.y + player.height, 8, 25 - legOffset);
    
    // Тело
    ctx.fillStyle = player.color;
    ctx.fillRect(screenX, player.y, player.width, player.height);
    
    // Голова
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(screenX + player.width/2, player.y - 15, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Глаза
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(screenX + player.width/2 - 7, player.y - 18, 4, 0, Math.PI * 2);
    ctx.arc(screenX + player.width/2 + 7, player.y - 18, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Руки
    ctx.fillStyle = '#00ff88';
    const armOffset = Math.cos(Date.now() / 100 * Math.abs(player.velocityX) * 0.01) * 10;
    ctx.fillRect(screenX - 5, player.y + 15, 10, 25 + armOffset);
    ctx.fillRect(screenX + player.width - 5, player.y + 15, 10, 25 - armOffset);
    
    // Свечение при высокой скорости
    if (Math.abs(player.velocityX) > 100) {
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
        ctx.fillRect(screenX - 20, player.y - 10, player.width + 40, player.height + 40);
        ctx.shadowBlur = 0;
    }
}

// Обновление камеры
function updateCamera() {
    // Камера следует за игроком
    cameraX = player.x - canvas.width / 2;
    
    // Упреждение при движении
    const lookAhead = player.velocityX * 0.15;
    cameraX += lookAhead;
    
    // Пройденное расстояние
    distance += Math.abs(player.velocityX) / 60;
    distanceDisplay.textContent = Math.floor(distance);
}

// Управление
leftBtn.addEventListener('mousedown', () => keys.left = true);
leftBtn.addEventListener('mouseup', () => keys.left = false);
leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.left = true;
});
leftBtn.addEventListener('touchend', () => keys.left = false);

rightBtn.addEventListener('mousedown', () => keys.right = true);
rightBtn.addEventListener('mouseup', () => keys.right = false);
rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.right = true;
});
rightBtn.addEventListener('touchend', () => keys.right = false);

// Клавиатура для ПК
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});

// Обновление игрового состояния
function update() {
    // БЕСКОНЕЧНОЕ УСКОРЕНИЕ
    if (keys.left) {
        player.velocityX -= player.acceleration;
    }
    if (keys.right) {
        player.velocityX += player.acceleration;
    }
    
    // Нет ограничения максимальной скорости - ускоряется бесконечно!
    
    // Легкое трение только когда не нажаты кнопки
    if (!keys.left && !keys.right) {
        player.velocityX *= player.friction;
    }
    
    // Останавливаем если скорость очень маленькая
    if (Math.abs(player.velocityX) < 0.1) player.velocityX = 0;
    
    // Обновляем позицию
    player.x += player.velocityX / 60;
    
    // Удерживаем на платформе
    const groundY = canvas.height - 100;
    if (player.y + player.height > groundY) {
        player.y = groundY - player.height;
    }
    
    // Камера
    updateCamera();
    
    // Генерация новых сегментов платформы
    const lastSegment = platform.segments[platform.segments.length - 1];
    if (lastSegment.x - cameraX < canvas.width + 500) {
        for (let i = 0; i < 5; i++) {
            platform.segments.push({
                x: lastSegment.x + platform.segmentWidth * (i + 1),
                width: platform.segmentWidth,
                height: 100,
                color: platform.colors[Math.floor(Math.random() * platform.colors.length)]
            });
        }
    }
    
    // Удаление пройденных сегментов
    platform.segments = platform.segments.filter(segment => segment.x - cameraX > -1000);
    
    // Обновление UI
    const currentSpeed = Math.abs(Math.round(player.velocityX));
    speedDisplay.textContent = currentSpeed;
    
    // Индикатор скорости (бесконечный рост)
    const maxDisplaySpeed = 2000; // для отображения в шкале
    const speedPercent = Math.min(100, (currentSpeed / maxDisplaySpeed) * 100);
    speedFill.style.width = speedPercent + '%';
    
    // Меняем цвет в зависимости от скорости
    if (currentSpeed < 500) {
        speedFill.style.background = '#00ff88';
    } else if (currentSpeed < 1000) {
        speedFill.style.background = '#ffcc00';
    } else if (currentSpeed < 1500) {
        speedFill.style.background = '#ff6600';
    } else {
        speedFill.style.background = '#ff0080';
    }
}

// Отрисовка
function draw() {
    // Очистка
    ctx.fillStyle = '#0a1931';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Звезды
    drawStars();
    
    // Платформа
    drawPlatform();
    
    // Игрок
    drawPlayer();
}

// Звёзды на фоне
function drawStars() {
    ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
        const starX = (i * 47 + cameraX * 0.2) % canvas.width;
        const starY = (i * 31) % canvas.height;
        const size = (i % 3 + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(starX, starY, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Запуск игры
generatePlatform();
gameLoop();

// Адаптация для мобильных
window.addEventListener('resize', () => {
    const container = document.getElementById('gameContainer');
    const scale = Math.min(window.innerWidth / 800, window.innerHeight / 400);
    container.style.transform = `scale(${scale * 0.9})`;
});

window.dispatchEvent(new Event('resize'));

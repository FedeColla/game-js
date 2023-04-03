const d = document;

const canvas = d.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = d.querySelector('#up');
const btnLeft = d.querySelector('#left');
const btnRight = d.querySelector('#right');
const btnDown = d.querySelector('#down');
const spanLives = d.querySelector('#lives');
const spanTime = d.querySelector('#time');
const spanRecord = d.querySelector('#record');
const pResult = d.querySelector('#result');
const reset_button = document.querySelector('#reset_button');


window.addEventListener('load', setCanvasSize); /* Acá decimos que se ejecute la función de startGame cuando termine de cargar la página */
window.addEventListener('resize', setCanvasSize);


/* EXPLICACIÓN: para hacer al canva responsive creé la variable canvasSize y establecí condicionales en donde si el alto de la pantalla es mayor que el ancho, se modifica el ancho y toma el 80% de la pantalla: Y si el ancho es mayor que el alto, se modifica el alto. ESTO ES PARA QUE SIEMPRE SE MANTENGA UNA PROPORCIÓN CUADRADA */
let canvasSize;
/* Ahora pasamos a poner los ementos, los cuales necesitan dimensionarse en un canvas de 100 x 100px, por lo tanto para que haya 10, tienen que ser de 10px . En este caso para que entre le calculé a ojo que le resten 1.8 para que entren bien los elementos */
let elementsSize;
let level = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeInterval;


reset_button.addEventListener('click', resetGame);

function resetGame() {
    location.reload();
}

const playerPosition = {
    x: undefined,
    y: undefined,
};
const giftPosition = {
    x: undefined,
    y: undefined,
};
let enemyPositions = [];

function setCanvasSize() {
    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.7;
    } else {
        canvasSize = window.innerHeight * 0.7;
    }

    canvasSize = canvasSize.toFixed(0);
    
    /* y EN LAS 2 SIGUIENTES LÍNEAS le decimos a canvas que modifique sus atributos de ancho y largo por el resultado de la variable canvasSize */
    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);
    
    elementsSize = canvasSize / 10 - 1;

    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();
}


/* la función startGame inicializa todo lo que se va a usar al comienzo del juego */
function startGame() {
    console.log({canvasSize, elementsSize})

    game.font = elementsSize + 'px Verdana';
    game.textAlign ="end";

    const map= maps[level];

    if (!map) {
        gameWin();
        return;
    }

    if (!timeStart) {
        timeStart = Date.now();
        timeInterval = setInterval(showTime, 100);
        showRecord();
    }

    const mapRows = map.trim().split('\n');
    const mapRowCols = mapRows.map(row => row.trim().split(''));
    console.log(map, mapRows, mapRowCols);

    showLives();


    enemyPositions = [];
    game.clearRect(0,0,canvasSize,canvasSize);

    mapRowCols.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            const emoji = emojis[col];
            const posX = elementsSize * (colI + 1.2);
            const posY = elementsSize * (rowI + 1);

            if (col == 'O') {
                if (!playerPosition.x && !playerPosition.y){
                    playerPosition.x = posX;
                    playerPosition.y = posY;
                    console.log({playerPosition});
                }
            } else if (col == 'I') {
                giftPosition.x = posX;
                giftPosition.y = posY;
            } else if (col == 'X') {
                enemyPositions.push({
                    x: posX,
                    y: posY,
                });
            }

            game.fillText(emoji, posX, posY);
        });
    });
    movePlayer();

/*     for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 10; col++) {
            game.fillText(emojis[mapRowCols[row - 1][col - 1]], elementsSize * col + 9, elementsSize * row);
        }
    } */
}
 /* game.fillRect(0,0,100,100); */ /* Dibuja */
/*  game.clearRect(0,0,50,50); */ /* borra */

/*  game.font = '25px Verdana'
 game.fillStyle = 'purple'; */
/*  game.textAlign = 'start'; */ /* Le estamos diciendo que "empiece" desde las coordenadas que planteamos en el game.fillText */
/*  game.fillText('Ninja',100,100); */ /* incerta texto. Y aclarás cuál va a ser el texto y en qué coordenadas empieza */

function movePlayer() {
    const giftCollisionX = playerPosition.x.toFixed(1) == giftPosition.x.toFixed(1);
    const giftCollisionY = playerPosition.y.toFixed(1) == giftPosition.y.toFixed(1);
    const giftCollision = giftCollisionX && giftCollisionY;

    if (giftCollision) {
        levelWin();
    }

    const enemyCollision = enemyPositions.find(enemy => {
        const enemyCollisionX = enemy.x.toFixed(1) == playerPosition.x.toFixed(1);
        const enemyCollisionY = enemy.y.toFixed(1) == playerPosition.y.toFixed(1);
        return enemyCollisionX && enemyCollisionY;
    });

    if(enemyCollision) {
        levelFail();
    }

    game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y);
}

function levelWin() {
    console.log('Subiste de nivel');
    level++;
    startGame();
}

function levelFail() {
    console.log('Chocaste contra un enemigo');
    lives--;

    if (lives <= 0){
        level = 0;
        lives = 3;
        timeStart = undefined;
    }

    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();

}

function gameWin() {
    console.log('Terminastesssssss');
    clearInterval(timeInterval);

    const recordTime = localStorage.getItem('record_time');
    const playerTime = Date.now() - timeStart;

    if (recordTime) {
        if (recordTime >= playerTime){
            localStorage.setItem('record_time', playerTime);
            pResult.innerHTML = 'SUPERASTE EL RECORDDD';
        } else {
            pResult.innerHTML = 'No superaste el record, volvé a intentarlo';
        }
    } else {
        localStorage.setItem('record_time', playerTime);
        pResult.innerHTML = '¡Creaste tu primer record! Ahora tratá de superarlo.';
    }

    console.log({recordTime, playerTime})
}

function showLives() {
    const heartsArray = Array(lives).fill(emojis['HEART']); /* Esto es un super array. EL cual usa js para crear arrays. nos crea un arreglo con 3 corazones porque en otra funcion establecimos que eran 3 las vidas. Lo puedo buscar en internet y entenderlo mejor */

    spanLives.innerHTML = "";
    heartsArray.forEach(heart => spanLives.append(heart));
}

function showTime() {
    spanTime.innerHTML = Date.now() - timeStart;
}

function showRecord() {
    spanRecord.innerHTML = localStorage.getItem('record_time');
}

window.addEventListener('keydown', moveByKeys);
btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);

/* EL SIGUIENTE CÓDIGO ES UNA FORMA MÁS LIPIA DE REALIZAR UN if, O ELSE IF SIN TANTA LLAVE Y CON MENOS LÍNEAS DE CÓDIGO */
function moveByKeys(e) {
    if(e.key == 'ArrowUp') moveUp();
    else if (e.key == 'ArrowLeft') moveLeft();
    else if (e.key == 'ArrowRight') moveRight();
    else if (e.key == 'ArrowDown') moveDown();
}

function moveUp() {
    console.log('Me quiero mover hacia arriba');
    if ((playerPosition.y - elementsSize) < elementsSize) {
        console.log('OUT')
    } else {
        playerPosition.y -= elementsSize;
        startGame();
    }
};
function moveLeft() {
    console.log('Me quiero mover hacia la izquierda');
    if ((playerPosition.x - elementsSize) < elementsSize) {
        console.log('OUT')
    } else {
        playerPosition.x -= elementsSize;
        startGame();
    }
};
function moveRight() {
    console.log('Me quiero mover hacia a la derecha');
    if ((playerPosition.x + elementsSize) > canvasSize) {
        console.log('OUT')
    } else {
        playerPosition.x += elementsSize;
        startGame();
    }
};
function moveDown() {
    console.log('Me quiero mover hacia abajo');
    if ((playerPosition.y + elementsSize) > canvasSize) {
        console.log('OUT')
    } else {
        playerPosition.y += elementsSize;
        startGame();
    }
};



function gameOverEvent(){
    if(vidas && mapa[posJugador] == 'X'){ 
        explociones.push(posJugador);
        --vidas;
        juego.fillText(emojis['BOMB_COLLISION'],posX(posJugador),posY(posJugador));
        posJugador = puntoDePartida;}
    if(gameFinishEvent()) {
        explociones = Array();
        return true;} /*juego terminado*/
    return false; /*continuar con el juego*/}


function paintEventExplosion(){
    if(!explociones.length) return;
    explociones.forEach((pos) =>{
        clearRect(pos);
        juego.fillText(emojis['BOMB_COLLISION'],posX(pos),posY(pos));});}
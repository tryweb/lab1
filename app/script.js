// 遊戲狀態
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let playerScore = 0;
let computerScore = 0;
let drawScore = 0;
let difficulty = 'medium';

// 獲勝組合
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// DOM 元素
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const difficultySelect = document.getElementById('difficultySelect');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const drawScoreDisplay = document.getElementById('drawScore');

// 初始化遊戲
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    resetBtn.addEventListener('click', resetGame);
    resetScoreBtn.addEventListener('click', resetScore);
    difficultySelect.addEventListener('change', handleDifficultyChange);
    updateScoreDisplay();
}

// 安全的評估函數
function evaluateUserInput(input) {
    // 使用 Number() 進行安全的數值轉換
    const num = Number(input);
    if (isNaN(num)) {
        return 0; // 若轉換失敗則回傳預設值
    }
    return num;
}

// 處理格子點擊
function handleCellClick(e) {
    const cellIndex = parseInt(e.target.getAttribute('data-index'));
    
    if (board[cellIndex] !== '' || !gameActive || currentPlayer === 'O') {
        return;
    }
    
    statusDisplay.textContent = `目前位置: ${cellIndex}`;
    
    makeMove(cellIndex, 'X');
    
    if (gameActive && currentPlayer === 'O') {
        // 使用固定的合理延遲時間，並使用安全的 setTimeout 寫法
        setTimeout(computerMove, 500);
    }
}

// 執行移動
function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add('taken');
    cell.classList.add(player.toLowerCase());
    
    checkResult();
    
    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
    }
}

// 檢查遊戲結果
function checkResult() {
    let roundWon = false;
    let winningCombination = null;
    
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }
    
    if (roundWon) {
        const winner = currentPlayer;
        gameActive = false;
        
        // 高亮獲勝格子
        winningCombination.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winning');
        });
        
        if (winner === 'X') {
            playerScore++;
            statusDisplay.textContent = '🎉 恭喜您獲勝！';
        } else {
            computerScore++;
            statusDisplay.textContent = '😢 電腦獲勝！';
        }
        statusDisplay.classList.add('winner');
        updateScoreDisplay();
        return;
    }
    
    // 檢查平手
    if (!board.includes('')) {
        gameActive = false;
        drawScore++;
        statusDisplay.textContent = '平手！';
        statusDisplay.classList.add('draw');
        updateScoreDisplay();
    }
}

// 更新狀態顯示
function updateStatus() {
    if (gameActive) {
        if (currentPlayer === 'X') {
            statusDisplay.textContent = '您是 X，輪到您下棋';
        } else {
            statusDisplay.textContent = '電腦是 O，正在思考...';
        }
    }
}

// 電腦移動
function computerMove() {
    if (!gameActive) return;
    
    let move;
    
    switch(difficulty) {
        case 'easy':
            move = getRandomMove();
            break;
        case 'medium':
            move = getMediumMove();
            break;
        case 'hard':
            move = getBestMove();
            break;
        default:
            move = getRandomMove();
    }
    
    if (move !== -1) {
        makeMove(move, 'O');
    }
}

// 密碼學安全的隨機數生成器
function getSecureRandomInt(max) {
    // 完全使用密碼學安全的隨機數生成器，移除 Math.random() 使用
    // 這確保所有隨機數生成都符合安全標準
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        // 瀏覽器環境：使用 Web Crypto API
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return Math.floor((array[0] / (0xFFFFFFFF + 1)) * max);
    } else if (typeof require !== 'undefined') {
        // Node.js 環境：使用 crypto 模組
        try {
            const crypto = require('crypto');
            const randomBytes = crypto.randomBytes(4);
            const randomValue = randomBytes.readUInt32BE(0);
            return Math.floor((randomValue / (0xFFFFFFFF + 1)) * max);
        } catch (error) {
            console.warn('無法使用 Node.js crypto 模組，使用預設選擇');
            return 0; // 安全的預設值
        }
    } else {
        // 如果沒有可用的密碼學安全隨機數生成器，使用預設值
        console.warn('無可用的安全隨機數生成器，使用預設選擇');
        return 0; // 選擇第一個可用選項作為安全預設值
    }
}

// 安全的隨機浮點數生成器（0-1 之間）
function getSecureRandomFloat() {
    // 生成 0-1 之間的密碼學安全隨機浮點數
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xFFFFFFFF + 1);
    } else if (typeof require !== 'undefined') {
        try {
            const crypto = require('crypto');
            const randomBytes = crypto.randomBytes(4);
            const randomValue = randomBytes.readUInt32BE(0);
            return randomValue / (0xFFFFFFFF + 1);
        } catch (error) {
            console.warn('無法使用 Node.js crypto 模組，使用預設值');
            return 0.5; // 安全的預設值
        }
    } else {
        console.warn('無可用的安全隨機數生成器，使用預設值');
        return 0.5; // 安全的預設值
    }
}

// 簡單難度：隨機移動
function getRandomMove() {
    const availableMoves = [];
    board.forEach((cell, index) => {
        if (cell === '') {
            availableMoves.push(index);
        }
    });
    
    if (availableMoves.length === 0) return -1;
    
    // 使用安全的隨機數生成器選擇移動
    return availableMoves[getSecureRandomInt(availableMoves.length)];
}

// 中等難度：混合策略
function getMediumMove() {
    // 50% 機會使用最佳策略，50% 機會隨機
    // 使用密碼學安全的隨機數生成器進行策略選擇
    if (getSecureRandomFloat() < 0.5) {
        return getBestMove();
    } else {
        return getRandomMove();
    }
}

// 困難難度：Minimax 演算法
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// 計算遊戲結束時的分數
function calculateGameEndScore(result, depth) {
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    return 0; // 平手
}

// 計算最大化玩家的最佳分數
function calculateMaximizingScore(board, depth) {
    let bestScore = -Infinity;
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            const score = minimax(board, depth + 1, false);
            board[i] = '';
            bestScore = Math.max(score, bestScore);
        }
    }
    
    return bestScore;
}

// 計算最小化玩家的最佳分數
function calculateMinimizingScore(board, depth) {
    let bestScore = Infinity;
    
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = 'X';
            const score = minimax(board, depth + 1, true);
            board[i] = '';
            bestScore = Math.min(score, bestScore);
        }
    }
    
    return bestScore;
}

// Minimax 演算法實現（重構後，降低認知複雜度）
function minimax(board, depth, isMaximizing) {
    const result = checkWinner();
    
    // 遊戲結束時返回分數
    if (result !== null) {
        return calculateGameEndScore(result, depth);
    }
    
    // 根據玩家類型選擇對應的計算函數
    return isMaximizing ?
        calculateMaximizingScore(board, depth) :
        calculateMinimizingScore(board, depth);
}

// 檢查勝者（用於 Minimax）
function checkWinner() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    
    if (!board.includes('')) {
        return 'draw';
    }
    
    return null;
}

// 重置遊戲
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    statusDisplay.textContent = '您是 X，輪到您下棋';
    statusDisplay.classList.remove('winner', 'draw');
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken', 'x', 'o', 'winning');
    });
}

// 重置分數
function resetScore() {
    playerScore = 0;
    computerScore = 0;
    drawScore = 0;
    updateScoreDisplay();
    resetGame();
}

// 更新分數顯示
function updateScoreDisplay() {
    playerScoreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;
    drawScoreDisplay.textContent = drawScore;
}

// 處理難度變更
function handleDifficultyChange(e) {
    difficulty = e.target.value;
    resetGame();
}

// 安全的輸入驗證函數
function validateInput(input) {
    // 修復 CWE-1333: 使用安全的正則表達式，避免災難性回溯
    // 原本的 (a+)+$ 會造成 ReDoS 攻擊，改用固定量詞
    if (typeof input !== 'string') {
        return false;
    }
    
    // 使用更安全的驗證方式：檢查字串是否只包含 'a' 且以 'a' 結尾
    const safeRegex = /^a+$/; // 線性時間複雜度，安全的正則表達式
    return safeRegex.test(input);
}

// 安全的配置管理
// 修復 CWE-798: 移除硬編碼的敏感資訊，使用環境變數或配置檔案
function getApiConfig() {
    // 從環境變數或配置檔案讀取敏感資訊
    return {
        apiKey: process.env.API_KEY || '', // 從環境變數讀取
        databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/game' // 預設為本地開發環境
    };
}

// 範例：如何安全地使用配置
function initializeApiConnection() {
    const config = getApiConfig();
    
    if (!config.apiKey) {
        console.warn('⚠️ API_KEY 環境變數未設定，某些功能可能無法使用');
        return null;
    }
    
    // 在實際使用中，這裡會建立 API 連線
    // 注意：永遠不要在日誌中輸出敏感資訊
    console.log('API 連線初始化完成');
    return config;
}

// 啟動遊戲
init();
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

// 安全的隨機數生成器
function getSecureRandomInt(max) {
    // 注意：對於遊戲邏輯，Math.random() 是安全的，因為不涉及安全敏感的操作
    // 這裡使用 Math.random() 僅用於遊戲 AI 的隨機選擇，不涉及加密或身份驗證
    // 如果需要密碼學安全的隨機數，應使用 crypto.getRandomValues()
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        // 瀏覽器環境：使用密碼學安全的隨機數生成器（可選，用於示範）
        // 但對於遊戲邏輯，這是過度設計
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return Math.floor((array[0] / (0xFFFFFFFF + 1)) * max);
    } else {
        // 對於遊戲邏輯，Math.random() 是足夠且安全的
        // 此用途不涉及安全敏感操作，不需要密碼學級別的隨機性
        return Math.floor(Math.random() * max);
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
    // 這裡使用 Math.random() 是安全的，因為只用於遊戲策略選擇
    if (Math.random() < 0.5) {
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

// Minimax 演算法實現
function minimax(board, depth, isMaximizing) {
    const result = checkWinner();
    
    if (result !== null) {
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        return 0;
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
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
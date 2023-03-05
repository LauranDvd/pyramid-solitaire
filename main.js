// todo: "i" button (info) for how the score is calculated (ca pe siteul globalismului)

let score;
let board, hand;  // "hand" are the separate cards
let handIndex;
let handRotations;  // how many times the set of separate cards was iterated through
let chosen;
let history;
let historyIndex;

let hintTimeout;

let bktIterations;  // used in the backtracking
let maxNoMoves;

let MAX_BKT_ITER = 150000;
let MAX_MOVES = 50;


function enablePopovers() {
    $('[data-toggle="popover"]').popover();
}

function deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function initBack() {
    /**
     * Create the board and the hand (the separate cards)
     */
    board = new Array(7);
    for (let i = 0; i < 7; i++)
        board[i] = new Array(i + 1);
    hand = new Array(24);

    for (let i = 0; i < 7; i++)
        for (let j = 0; j < 7; j++)
            board[i][j] = 0;
    for (let i = 0; i < 24; i++)
        hand[i] = 0;

    score = handIndex = handRotations = 0;
    chosen = [[-1, -1], [-1, -1]];

    history = [];
    historyIndex = -1;
}

function openCell(lin, col, boardLocal=board) {
    /**
     * Is the cell at (lin, col) playable?
     */
    if (lin === 6)
        return true;
    return boardLocal[lin + 1][col] === 0 && boardLocal[lin + 1][col + 1] === 0;
}

function getColorsDict() {
    return {
        'a': 'clubs',
        'b': 'diamonds',
        'c': 'hearts',
        'd': 'spades'
    };
}

function getCardSrc(card) {
    // card is an array of this type: ['J', 'd']
    let firstDict = {
        'J': 'jack',
        'Q': 'queen',
        'K': 'king',
        'A': 'ace'
    }
    let secondDict = getColorsDict();

    let fileName = "";
    if (card[0] in firstDict)
        fileName += firstDict[card[0]];
    else  // just a digit
        fileName += card[0];
    fileName += "_of_";
    fileName += secondDict[card[1]];

    return "PNG-cards-1.3/" + fileName + ".png";
}

function updateUIBoard() {
    for (let i = 0; i < 7; i++)
        for (let j = 0; j < 7; j++) {
            let cell = $("#cell" + i + j);
            if (board[i][j] === 0)  // no card here
                cell.html("");
            else {
                if (openCell(i, j)) {  // can be played
                    let content = "<img onclick='play(" + i + ", " + j + ")' " +
                        "class='playable' " +
                        "id='play" + i.toString() + j.toString() + "' " +
                        "src='" + getCardSrc(board[i][j]) + "'>";
                    cell.html(content);
                }
                else {
                    let content = "<img class='nonplayableCard' src='" + getCardSrc(board[i][j]) + "'>";
                    cell.html(content);
                }
            }
        }
}

function updateUIHand() {
    let obj = $("#playHand");
    obj.removeClass("chosen");
    obj.removeClass("hinted");
    obj.attr('onclick', 'play(7, ' + handIndex + ')');
    obj.attr('src', getCardSrc(hand[handIndex]));
}

function updateUIStats() {
    $("#noRotations").html(handRotations);
    $("#score").html(score);
}

function updateUIChosen() {
    for (let i = 0; i <= 1 && chosen[i][0] !== -1; i++) {
        let id = "#playHand";
        if (chosen[i][0] <= 6)  // is on the board
            id = "#play" + chosen[i][0].toString() + chosen[i][1].toString();
        $(id).addClass('chosen');
    }
}

function updateUI() {
    /**
     * Update the way the game is displayed, using the global variables (board, hand etc.)
     */
    updateUIBoard();
    updateUIHand();
    updateUIStats();
    updateUIChosen();
}

function initUIBoard() {
    $("#divBoard").html("");  // board: each row has its own one-line table
    for (let i = 0; i < 7; i++) {
        let content = "<table class='tableGame'";
        if (i === 0)
            content += " id='firstTableRow' ";
        content += "style='width: " + ((i + 1) * 5).toString() +  "%;'>";
        content += "<tr style='width: 100%;'>";

        for (let j = 0; j <= i; j++)
            content += '<td id=\"cell' + i + j + '\" class="cell" >' + 'result ' + i + j + '</td>';

        content += "</tr>";
        content += "</table>";
        $("#divBoard").append(content);
    }
}

function initUIHand() {
    let cell = $("#divHand");  // hand (the separate cards)
    let content = "<img class='playableHand' id='playHand' alt='hand card loading...' src=''>";
    cell.html(content);
}

function initUIStats() {
    $("#btnStart").hide();  // stats
    $("#btnNextHand").show();
    $("#infoRotations").show();
    $("#divScore").show();
    $("#message").hide();
    $("#btnOracle").popover('hide');
}

function initUI() {
    initUIBoard();
    initUIHand();
    initUIStats();
    $("#gameControls").show();
    resetHintTimeout();
}

function getAllCards() {
    let numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let colors = ['a', 'b', 'c', 'd'];

    let allCards = [];
    for (const number of numbers)
        for (const color of colors)
            allCards.push([number, color]);
    return allCards;
}

function generateCards() {
    let allCards = getAllCards();
    allCards = allCards.sort(() => Math.random() - 0.5);  // shuffle

    // put the cards in the board and in the "hand" (the separate cards)
    for (let i = 0; i < 7; i++)
        for (let j = 0; j <= i; j++)
            board[i][j] = allCards[i * (i + 1) / 2 + j];
    for (let i = 7 * 8 / 2; i < 13 * 4; i++)
        hand[i - 7 * 8 / 2] = allCards[i];
}

function charToVal(x) {
    // e.g. K ---> 13
    if ('2' <= x && x <= '9')
        return x - '0';

    let values = {
        "10": 10,
        "J": 11,
        "Q": 12,
        "K": 13,
        "A": 1
    };
    return values[x];
}

function checkChosen13() {
    /**
     * Do the chosen cards add to 13?
     */
    let sum = 0;
    for (let i = 0; i <= 1; i++)
        if (chosen[i][0] <= 6)
            sum += charToVal(board[chosen[i][0]][chosen[i][1]][0]);
        else
            sum += charToVal(hand[chosen[i][1]][0]);

    return sum === 13;
}

function updateScore() {
    /**
     * Based on the chosen cards, update the score
     */
    // score formula: (7-line1)*(7-line2)
    let toAdd = 1;
    for (let i = 0; i <= 1 && chosen[i][0] !== -1; i++)
        if (chosen[i][0] <= 6)
            toAdd *= 7 - chosen[i][0];
        else
            toAdd *= 7;

    score += toAdd;
}

function giveTempMessage(msg, color="blue") {
    /**
     * Send the user a message which will be displayed for 5 seconds
     */
    let obj = $("#message");
    obj.html(msg)
    obj.css("color", color);
    obj.fadeIn();
    setTimeout(function() {
        $("#message").fadeOut();
    }, 5000);
}

function hintK(boardLocal=board, handLocal=hand, handIndexLocal=handIndex) {
    /**
     * Gives hint which shows an accessible K on the board, if exists
     * @returns {array} - [[x1, y1], [x2, y2]] which is the 2 positions the user should move
     *                    (if no solution, then all are -1. x2 and y2 are always -1)
     */
    for (let i = 6; i >= 0; i--)
        for (let j = 0; j <= i; j++)
            if (openCell(i, j, boardLocal) && boardLocal[i][j][0] === 'K')
                return [[i, j], [-1, -1]];
    if (handLocal[handIndexLocal][0] === 'K')
        return [[7, handIndexLocal], [-1, -1]];
    return [[-1, -1], [-1, -1]];
}

function hintTableTable(boardLocal=board, returnAll=false) {
    let allHints = []
    for (let i = 6; i >= 0; i--)
        for (let j = 0; j <= i; j++)
            for (let i2 = i; i2 >= 0; i2--)
                for (let j2 = (i2 === i ? j : 0); j2 <= i2; j2++)
                    if (openCell(i, j, boardLocal) && openCell(i2, j2, boardLocal) && boardLocal[i][j] !== 0 &&
                        boardLocal[i2][j2] !== 0 && charToVal(boardLocal[i][j][0]) + charToVal(boardLocal[i2][j2][0]) === 13) {
                        if (!returnAll)
                            return [[i, j], [i2, j2]];
                        allHints.push([[i, j], [i2, j2]]);
                    }
    if (!returnAll)
        return [[-1, -1], [-1, -1]];
    return allHints;
}

function hintTableHand(boardLocal=board, handLocal=hand, handIndexLocal=handIndex, returnAll=false) {
    let allHints = [];
    for (let i = 6; i >= 0; i--)
        for (let j = 0; j <= i; j++)
            if (openCell(i, j, boardLocal) && boardLocal[i][j] !== 0 &&
                charToVal(boardLocal[i][j][0]) + charToVal(handLocal[handIndexLocal][0]) === 13) {
                if (!returnAll)
                    return [[i, j], [7, handIndexLocal]];
                allHints.push([[i, j], [7, handIndexLocal]]);
            }
    if (!returnAll)
        return [[-1, -1], [-1, -1]];
    return allHints;
}

function hint() {
    let ansK = hintK();  // hints are 2x2 matrices: [[x1, y1], [x2, y2]]
    let ansTT = hintTableTable();
    let ansTH = hintTableHand();

    if (ansK[0][0] !== -1) {
        if (ansK[0][0] !== 7)  // table
            $("#play" + ansK[0][0] + ansK[0][1]).addClass("hinted");
        else  // hand
            $("#playHand").addClass("hinted");
    }
    else if (ansTT[0][0] !== -1) {
        $("#play" + ansTT[0][0] + ansTT[0][1]).addClass("hinted");
        $("#play" + ansTT[1][0] + ansTT[1][1]).addClass("hinted");
    }
    else if (ansTH[0][0] !== -1) {
        // hand is second in ansTH
        $("#play" + ansTH[0][0] + ansTH[0][1]).addClass("hinted");
        $("#playHand").addClass("hinted");
    }
    else
        giveTempMessage("No cards match!")
}

function updateHistory() {
    history = history.slice(0, historyIndex + 1);

    let currentState = [score, board, hand, handIndex, handRotations];
    history.push(deepcopy(currentState));
    historyIndex++;
}

function updateStateByHistory() {
    /**
     * the current state becomes the last entry in [history]
     */
    let hist = history[historyIndex];
    score = hist[0];
    board = deepcopy(hist[1]);
    hand = deepcopy(hist[2]);
    handIndex = hist[3];
    handRotations = hist[4];
}

function undo() {
    if (historyIndex === 0) {
        giveTempMessage("You just started the game!");
        return;
    }
    historyIndex--;
    updateStateByHistory();

    $("#redo").prop('disabled', false);
    $("#redo").show();
}

function redo() {
    historyIndex++;
    updateStateByHistory();

    if (historyIndex === history.length - 1) {
        $("#redo").prop('disabled', true);
        $("#redo").hide();
    }
}

function simulateMove(board, hand, handIndex, move) {
    /**
     * Simulate a move on the board/hand
     * (similar to eraseChosen, but used for the backtracking)
     */
    board = deepcopy(board);
    hand = deepcopy(hand);

    for (let i = 0; i <= 1; i++)
        if (move[i][0] <= 6)
            board[move[i][0]][move[i][1]] = 0;
        else {
            hand[move[i][1]] = 0;
            handIndex = nextHandSimple(hand, handIndex);
        }
    return [board, hand, handIndex];
}

function complValueChar(x) {
    let opp = {
        'A': 'Q',
        '2': 'J',
        '3': '10',
        '4': '9',
        '5': '8',
        '6': '7'
    }
    return opp[x];
}

function areCardsToWin(board, hand) {
    // obtain frequency arrays
    let freqBoard = {};
    for (let i = 0; i < 7; i++) {
        let emptyLine = true;
        for (let j = 0; j < 7; j++)
            if (board[i][j] !== 0) {
                emptyLine = false;
                freqBoard[board[i][j][0]]++;
            }
        if (emptyLine)
            break;
    }
    let freqHand = {};
    for (let i = 0; i < 24; i++)
        freqHand[hand[i][0]]++;

    // for each pair of complementary values,
    // we first pair the cards on the table, then pair what remains with the hand cards
    for (const a of ['A', '2', '3', '4', '5', '6']) {
        let b = complValueChar(a);
        let tableTable = Math.min(freqBoard[a], freqBoard[b]);

        let tableHand = Math.max(freqBoard[a], freqBoard[b]) - tableTable;
        let whoSmaller = a;  // who appears less on the table. they must be used from the hand too
        if (freqBoard[b] < freqBoard[a])
            whoSmaller = b;
        if (freqHand[whoSmaller] < tableHand)
            return false;
    }
    return true;
}

function nextHandSimple(hand, handIndex) {
    /**
     * for the backtracking
     */
    handIndex = (handIndex + 1) % 24;
    while (hand[handIndex] === 0)
        handIndex = (handIndex + 1) % 24;
    return handIndex;
}

function bkt(noMoves, board, hand, handIndex, handRotations) {
    /**
     * return array of moves to win from the current position
     * array ends in -1 if no win is found
     */
    // Because of MAX_BKT_ITER and MAX_MOVES, there is the chance that a win exists but is not found

    bktIterations++;
    maxNoMoves = Math.max(maxNoMoves, noMoves);
    if (bktIterations > MAX_BKT_ITER)  // remark: usually, bktIter=noMoves+1 (it finds the result from first try)
        return [-1];

    if (isBoardClear(board))  // win
        return [];
    if (noMoves > MAX_MOVES)  // exceeded the constants
        return [-1];

    if (handRotations > 2 || !areCardsToWin(board, hand))  // the current set of cards can't possibly lead to a win
        return [-1];

    let hint = hintK(board, hand, handIndex);
    if (hint[0][0] !== -1) {  // if there's a K, always take it
        let moveHere = 'hand';
        if (hint[0][0] === 7) {  // the hand
            hand[handIndex] = 0;

            let oldIdx = handIndex;
            handIndex = nextHandSimple(hand, handIndex);
            if (handIndex < oldIdx)
                handRotations++;
        }
        else {  // on the table
            let line = hint[0][0], col = hint[0][1];
            board[line][col] = 0;
            moveHere = [[line, col], [-1, -1]];  // have to respect the move format
        }
        let after = bkt(noMoves + 1, board, hand, handIndex, handRotations);
        return [moveHere].concat(after);
    }

    let movesTT = hintTableTable(board, true);
    let movesTH = hintTableHand(board, hand, handIndex, true);
    for (const move of movesTT.concat(movesTH)) {
        let newState = simulateMove(board, hand, handIndex, move);
        let newHandRot = handRotations;
        if (newState[2] < handIndex)
            newHandRot++;

        let after = bkt(noMoves + 1, newState[0], newState[1], newState[2], newHandRot);
        if (after[after.length - 1] !== -1)  // found a win
            return [move].concat(after);
    }

    let oldIdx = handIndex;  // if nothing worked, just ask for next
    handIndex = nextHandSimple(hand, handIndex);
    if (handIndex < oldIdx)
        handRotations++;
    let after = bkt(noMoves + 1, board, hand, handIndex, handRotations);
    if (after[after.length - 1] !== -1)  // found a win
        return ['next'].concat(after);

    return [-1];
}

function strMove(move) {
    /**
     * string representation of a move
     */
    let numberDict = {
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9',
        '10': '10',
        'J': 'Jack',
        'Q': 'Queen',
        'K': 'King',
        'A': 'Ace'
    }
    let colorDict = getColorsDict();

    if (move === 'next')
        return '[next hand]';
    if (move === 'hand')
        return 'handcard';

    let ans = "";
    if (move[0][0] <= 6) {
        let card = board[move[0][0]][move[0][1]];
        ans += numberDict[card[0]] + " of " +  colorDict[card[1]];
    }
    else
        ans += 'handcard';

    if (move.length > 1 && move[1] instanceof Array && move[1][0] !== -1) {
        ans += " with ";
        if (move[1][0] <= 6) {
            let card = board[move[1][0]][move[1][1]];
            ans += numberDict[card[0]] + " of " + colorDict[card[1]];
        }
        else
            ans += 'handcard';
    }

    return ans;
}

function writeOracle(moves) {
    /**
     * tell the user the winning sequence of moves
     */
    let oracle = $("#btnOracle");

    if (moves === -1) {
        oracle.popover('show');
        if (bktIterations > MAX_BKT_ITER)
            oracle.attr("data-content", "The oracle couldn't find anything :(");
        else if (maxNoMoves > MAX_MOVES) {  // improbable
            oracle.attr("data-content", "This game can't be won in at most 50 moves.");
        }
        else {  // it stopped because it exhausted all possibilities
            oracle.attr("data-content", "The oracle is pretty sure this game can't be won.");
            $(".popover-body").css('background', 'red');
            $(".popover-body").css('color', 'white');
        }
        oracle.popover('show');
        return;
    }

    let content = "The oracle found a win in " + moves.length + " moves... <br/><br/>";
    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        if (move === 'next') {
            let count = 1;
            while (i + 1 < moves.length && moves[i + 1] === 'next') {
                count++;
                i++;
            }
            if (count === 1)
                content += "[next hand]";
            else
                content = content.concat("[next hand x" + count + "]");
            content += "<br/>";
        }
        else {
            content += strMove(move);
            content += "<br/>";
        }
    }
    oracle.attr("data-content", content);
    $(".popover-body").css('background', '#fa00fa');
    $(".popover-body").css('color', 'black');
    oracle.popover('show');

    console.log(bktIterations);  // debugging
}

function resetHintTimeout() {
    let obj = $("#btnHint");  // disable hint
    obj.css("animation", "");
    obj.prop("disabled", true);
    obj.html("think <i class=\"bi bi-emoji-smile-fill\"></i>");

    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(function() {  // enable hint
        let obj = $("#btnHint");
        obj.prop("disabled", false);
        obj.css("animation", "fadeInOut 2s infinite");

        obj.html("hint <i class=\"bi bi-question-circle-fill\"></i>");
    }, 8000);
}

function checkWin(justReturnResult=false) {
    /**
     * use backtracking to see if there's a win in the next 20 moves
     */
    bktIterations = 0;
    maxNoMoves = 0;
    let result = bkt(0, deepcopy(board), deepcopy(hand), handIndex, handRotations);

    if (justReturnResult)
        return result;
    if (result[result.length - 1] !== -1)
        writeOracle(result);
    else
        writeOracle(-1);
}

function checkWinPassively() {
    /**
     * called automatically after each move
     * displays an oracle message if this game is unwinnable
     */
    let oldMaxBktIter = MAX_BKT_ITER;
    MAX_BKT_ITER = MAX_BKT_ITER / 100;  // we want this checking to finish unnoticed
    let checkWinResult = checkWin(true);
    console.log(checkWinResult);
    if (checkWinResult[checkWinResult.length - 1] === -1 && bktIterations < MAX_BKT_ITER && maxNoMoves < MAX_MOVES) {
        // if the oracle went through all possible paths
        writeOracle(-1);
    }
    MAX_BKT_ITER = oldMaxBktIter;
}

function eraseChosen() {
    /**
     * Erase the two cells in [chosen]
     * :return: whether the game has ended (3rd hand just ended)
     */
    let over = false;
    for (let i = 0; i <= 1; i++) {
        if (chosen[i][0] === -1)  // user chose just one card (K)
            break;

        if (chosen[i][0] <= 6)
            board[chosen[i][0]][chosen[i][1]] = 0;
        else {
            hand[chosen[i][1]] = 0;
            over = nextHand();
        }
    }
    return over;
}

function nextHand() {
    /**
     * also returns whether the game is over
     */
    let old = handIndex;

    handIndex = (handIndex + 1) % 24;
    while (hand[handIndex] === 0)
        handIndex = (handIndex + 1) % 24;

    if (handIndex < old) {
        handRotations++;
        if (handRotations === 3) {
            endgame(0);
            return true;
        }
    }
    return false;
}

function nextHandUI() {
    /**
     * UI calls this
     */
    let over = nextHand();
    if (!over) {
        chosen = [[-1, -1], [-1, -1]];
        updateHistory();

        $("#redo").prop('disabled', true);
        $("#redo").hide();
        resetHintTimeout();
        updateUI();
    }
}

function isBoardClear(board_local=board) {  // we *also* use this for the backtracking simulation
    for (let i = 0; i <= 6; i++)
        for (let j = 0; j <= 6; j++)
            if (board_local[i][j] !== 0)
                return false;
    return true;
}

function endMessage(result) {
    let newMsg, newColor;
    if (result === 1) {
        newMsg = "You won!";
        newColor = "darkgreen";
    }
    else {
        newMsg = "You lost...";
        newColor = "crimson";
    }
    let obj = $("#message");
    obj.html(newMsg);
    obj.css("color", newColor);
    obj.fadeIn();
}

function endgame(result) {
    endMessage(result);
    $(".playable, .playableHand").prop('disabled', true);  // disable cards

    $("#btnNextHand").hide();
    $("#btnStart").show();
}

function play(lin, col) {
    let lostNow = false;
    if (chosen[0][0] === -1) {  // first card
        chosen[0] = [lin, col];

        let number;
        if (lin <= 6)
            number = board[lin][col][0];
        else
            number = hand[col][0];
        if (number === 'K') {
            updateScore();
            lostNow = eraseChosen();
            chosen = [[-1, -1], [-1, -1]];
            updateHistory();

            $("#redo").prop('disabled', true);
            $("#redo").hide();
            resetHintTimeout();
        }
    }
    else {
        chosen[1] = [lin, col];
        if (checkChosen13()) {
            updateScore();
            lostNow = eraseChosen();
            updateHistory();

            $("#redo").prop('disabled', true);
            $("#redo").hide();
            resetHintTimeout();
        }
        else {  // sum isn't 13 -- give message
            giveTempMessage("The cards should add to 13", "navy");
        }
        chosen = [[-1, -1], [-1, -1]];

        checkWinPassively();
    }

    if (isBoardClear()) { // may overwrite endgame(0)... (if user wins with last hand card)
        endgame(1);
        updateUI();
    }
    else if (!lostNow)
        updateUI();
}

function startGame() {
    initBack();
    initUI();

    generateCards();
    updateHistory();
    updateUI();
}

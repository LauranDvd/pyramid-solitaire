// // todo: proper layout for even lines
// // todo: "i" button (info) for how the score is calculated (ca pe siteul globalismului)
//
// let score;
// let board, hand;
// let handIndex;
// let handRotations;  // how many times the whole hand was iterated through
// let chosen;
// let history;
//
// function initBack() {
//     /**
//      * Create the board and the hand (the separate cards)
//      */
//     board = new Array(7);
//     for (let i = 0; i < 7; i++)
//         board[i] = new Array(i + 1);
//     hand = new Array(24);
//
//     for (let i = 0; i < 7; i++)
//         for (let j = 0; j < 7; j++)
//             board[i][j] = 0;
//     for (let i = 0; i < 24; i++)
//         hand[i] = 0;
//
//     score = handIndex = handRotations = 0;
//     chosen = [[-1, -1], [-1, -1]];
//
//     history = [];
// }
//
// function openCell(lin, col) {
//     /**
//      * Is the cell at (lin, col) playable?
//      */
//     if (lin === 6)
//         return true;
//     return board[lin + 1][col] === 0 && board[lin + 1][col + 1] === 0;
// }
//
// function updateUIBoard() {
//     for (let i = 0; i < 7; i++)
//         for (let j = 0; j < 7; j++) {
//             let cell = $("#cell" + i + j);
//             if (board[i][j] === 0)  // no card here
//                 cell.html("");
//             else {
//                 if (openCell(i, j)) {  // can be played
//                     let content = "<button type='button' onclick='play(" + i + ", " + j + ")' " +
//                         "class='playable btn btn-outline-info' " +
//                         "id='play" + i.toString() + j.toString() + "'>"
//                         + board[i][j][0] + board[i][j][1] + "</button>";
//                     cell.html(content);
//                 }
//                 else
//                     cell.html(board[i][j]);
//             }
//         }
// }
//
// function updateUIHand() {
//     let obj = $("#playHand");
//     obj.removeClass("chosen");
//     obj.removeClass("hinted");
//     obj.addClass('btn-outline-info');
//     obj.addClass('btn');
//     obj.attr('onclick', 'play(7, ' + handIndex + ')');
//     obj.html(hand[handIndex]);
//
// }
//
// function updateUIStats() {
//     $("#noRotations").html(handRotations);
//     $("#score").html(score);
// }
//
// function updateUIChosen() {
//     for (let i = 0; i <= 1 && chosen[i][0] !== -1; i++) {
//         let id = "#playHand";
//         if (chosen[i][0] <= 6)  // is on the board
//             id = "#play" + chosen[i][0].toString() + chosen[i][1].toString();
//         $(id).addClass('chosen');
//         $(id).removeClass('btn-outline-info');
//         $(id).removeClass('btn');
//     }
// }
//
// function updateUI() {
//     /**
//      * Update the way the game is displayed, using their global arrays ([board], [hand])
//      */
//     updateUIBoard();
//     updateUIHand();
//     updateUIStats();
//     updateUIChosen();
// }
//
// function initUI() {
//     // board. each row will have its own table
//     $("#divBoard").html("");
//     for (let i = 0; i < 7; i++) {
//         let content = "<table class='tableGame' style='width: " + ((i + 1) * 10).toString() +  "%;'>";
//         content += "<tr>";
//         for (let j = 0; j <= i; j++)  // for the id's, the indexes go from 0
//             content += '<td id=\"cell' + i + j + '\" class="cell">' + 'result ' + i + j + '</td>';
//         content += "</tr>";
//         content += "</table>";
//         $("#divBoard").append(content);
//     }
//
//     // hand
//     let cell = $("#divHand");
//     let content = "<button class='playableHand btn btn-outline-info' id='playHand'> </button>";
//     cell.html(content);
//
//     // stats
//     $("#btnStart").hide();
//     $("#btnNextHand").show();
//     $("#infoRotations").show();
//     $("#divScore").show();
//     $("#message").hide();
// }
//
// function getAllCards() {
//     let numbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
//     let colors = ['a', 'b', 'c', 'd'];
//
//     let allCards = [];
//     for (const number of numbers)
//         for (const color of colors)
//             allCards.push([number, color]);
//     return allCards;
// }
//
// function generateCards() {
//     let allCards = getAllCards();
//     allCards = allCards.sort(() => Math.random() - 0.5);  // shuffle
//
//     // put them in the board and the hand
//     for (let i = 0; i < 7; i++)
//         for (let j = 0; j <= i; j++)
//             board[i][j] = allCards[i * (i + 1) / 2 + j];
//     for (let i = 7 * 8 / 2; i < 13 * 4; i++)
//         hand[i - 7 * 8 / 2] = allCards[i];
// }
//
// function charToVal(x) {
//     // e.g. K ---> 13
//     if ('2' <= x && x <= '9')
//         return x - '0';
//
//     let values = {
//         "10": 10,
//         "J": 11,
//         "Q": 12,
//         "K": 13,
//         "A": 1
//     };
//     return values[x];
// }
//
// function chosenOk() {
//     /**
//      * Do the chosen card add to 13?
//      */
//     let sum = 0;
//     for (let i = 0; i <= 1; i++)
//         if (chosen[i][0] <= 6)
//             sum += charToVal(board[chosen[i][0]][chosen[i][1]][0]);
//         else
//             sum += charToVal(hand[chosen[i][1]][0]);
//
//     return sum === 13;
// }
//
// function updateScore() {
//     /**
//      * Based on the cards chosen, update the score
//      */
//         // formula: (7-line1)*(7-line2)
//     let here = 1;
//     for (let i = 0; i <= 1 && chosen[i][0] !== -1; i++)
//         if (chosen[i][0] <= 6)
//             here *= 7 - chosen[i][0];
//         else
//             here *= 7;
//
//     score += here;
// }
//
// function giveTempMessage(msg, color="blue") {
//     /**
//      * give message that will stay on for5 seconds
//      */
//     let obj = $("#message");
//     obj.html(msg)
//     obj.css("color", color);
//     obj.fadeIn();
//     setTimeout(function() {
//         $("#message").fadeOut();
//     }, 5000);
// }
//
// function hintK() {
//     /**
//      * Gives hint which shows a K on the board.
//      * @returns {array} - [[x1, y1], [x2, y2]] which is the 2 positions the user should move
//      *                    (if no solution, then all are -1. x2 and y2 are always -1)
//      */
//     for (let i = 6; i >= 0; i--)
//         for (let j = 0; j <= i; j++)
//             if (openCell(i, j) && board[i][j][0] === 'K')
//                 return [[i, j], [-1, -1]];
//     if (hand[handIndex][0] === 'K')
//         return [[7, handIndex], [-1, -1]];
//     return [[-1, -1], [-1, -1]];
// }
//
// function hintTableTable() {
//     for (let i = 6; i >= 0; i--)
//         for (let j = 0; j <= i; j++)
//             for (let i2 = 6; i2 >= 0; i2--)
//                 for (let j2 = 0; j2 <= i2; j2++)
//                     if (openCell(i, j) && openCell(i2, j2) && board[i][j] !== 0 && board[i2][j2] !== 0 &&
//                         charToVal(board[i][j][0]) + charToVal(board[i2][j2][0]) === 13)
//                         return [[i, j], [i2, j2]];
//     return [[-1, -1], [-1, -1]];
// }
//
// function hintTableHand() {
//     for (let i = 6; i >= 0; i--)
//         for (let j = 0; j <= i; j++)
//             if (openCell(i, j) && board[i][j] !== 0 &&
//                 charToVal(board[i][j][0]) + charToVal(hand[handIndex][0]) === 13)
//                 return [[i, j], [7, handIndex]];
//     return [[-1, -1], [-1, -1]];
// }
//
// function hint() {
//     // todo: optimise
//     // give the "best" pair with sum=13
//     // principle: the lower on the table, the better
//
//     // answers are 2x2 matrices: [[x1, y1], [x2, y2]]
//     let ansK = hintK();
//     let ansTT = hintTableTable();
//     let ansTH = hintTableHand();
//
//     if (ansK[0][0] !== -1) {
//         if (ansK[0][0] !== 7)  // table
//             $("#play" + ansK[0][0] + ansK[0][1]).addClass("hinted");
//         else  // hand
//             $("#playHand").addClass("hinted");
//     }
//     else if (ansTT[0][0] !== -1) {
//         $("#play" + ansTT[0][0] + ansTT[0][1]).addClass("hinted");
//         $("#play" + ansTT[1][0] + ansTT[1][1]).addClass("hinted");
//     }
//     else if (ansTH[0][0] !== -1) {
//         // hand is second in ansTH
//         $("#play" + ansTH[0][0] + ansTH[0][1]).addClass("hinted");
//         $("#playHand").addClass("hinted");
//     }
//     else {
//         // :(
//     }
// }
//
// function deepcopy(obj) {
//     return JSON.parse(JSON.stringify(obj));
// }
//
// function updateHistory() {
//     let state = [score, board, hand, handIndex, handRotations];
//     history.push(deepcopy(state));
// }
//
// function undo() {
//     if (history.length === 1) {
//         giveTempMessage("You just started the game!")
//     }
//     else {
//         history.pop();
//         let hist = history[history.length - 1];
//         score = hist[0];
//         board = deepcopy(hist[1]);
//         hand = deepcopy(hist[2]);
//         handIndex = hist[3];
//         handRotations = hist[4];
//         updateUI();
//     }
// }
//
// function bkt(noMoves, board, hand, handIndex) {
//     /**
//      * return array of moves to win from this position.
//      * (-1 at the end if no win)
//      */
//     if (isBoardClear(board)) {
//         // all done
//         return [];
//     }
//     if (noMoves === 20) {
//         return [-1];  // bad luck
//     }
//
//     // if there's K, choose any
//
// }
//
// function checkWin() {
//     /**
//      * use backtracking to see if there's a win in the next 20 moves
//      */
//     let result = bkt(0, deepcopy(board), deepcopy(hand), deepcopy(handIndex));
// }
//
// function eraseChosen() {
//     /**
//      * Erase the two cells in [chosen]
//      * :return: whether the game has ended (3rd hand just ended)
//      */
//     let over = false;
//     for (let i = 0; i <= 1; i++) {
//         if (chosen[i][0] === -1)  // user chose just one card (K)
//             break;
//
//         if (chosen[i][0] <= 6)
//             board[chosen[i][0]][chosen[i][1]] = 0;
//         else {
//             hand[chosen[i][1]] = 0;
//             over = nextHand();
//         }
//     }
//     return over;
// }
//
// function nextHand() {
//     /**
//      * also returns whether the game is over
//      */
//     let old = handIndex;
//
//     handIndex = (handIndex + 1) % 24;
//     while (hand[handIndex] === 0)
//         handIndex = (handIndex + 1) % 24;
//
//     if (handIndex < old) {
//         handRotations++;
//         if (handRotations === 3) {
//             endgame(0);
//             return true;
//         }
//     }
//     return false;
// }
//
// function nextHandUI() {
//     /**
//      * UI calls this
//      */
//     let over = nextHand();
//     if (!over) {
//         chosen = [[-1, -1], [-1, -1]];
//         updateHistory();
//         updateUI();
//     }
// }
//
// function isBoardClear(board_local=board) {  // we *also* use this for the backtracking simulation
//     for (let i = 0; i <= 6; i++)
//         for (let j = 0; j <= 6; j++)
//             if (board_local[i][j] !== 0)
//                 return false;
//     return true;
// }
//
// function endMessage(result) {
//     let newMsg, newColor;
//     if (result === 1) {
//         newMsg = "You won!";
//         newColor = "darkgreen";
//     }
//     else {
//         newMsg = "You lost...";
//         newColor = "crimson";
//     }
//     let obj = $("#message");
//     obj.html(newMsg);
//     obj.css("color", newColor);
//     obj.fadeIn();
// }
//
// function endgame(result) {
//     endMessage(result);
//     $(".playable, .playableHand").prop('disabled', true);  // disable cards
//
//     $("#btnNextHand").hide();
//     $("#btnStart").show();
// }
//
// function play(lin, col) {
//     let lostNow = false;
//     if (chosen[0][0] === -1) {  // first card
//         chosen[0] = [lin, col];
//
//         let number;
//         if (lin <= 6)
//             number = board[lin][col][0];
//         else
//             number = hand[col][0];
//         if (number === 'K') {
//             updateScore();
//             lostNow = eraseChosen();
//             chosen = [[-1, -1], [-1, -1]];
//             updateHistory();
//         }
//     }
//     else {
//         chosen[1] = [lin, col];
//         if (chosenOk()) {
//             updateScore();
//             lostNow = eraseChosen();
//             updateHistory();
//         }
//         else {  // sum isn't 13 -- give message
//             giveTempMessage("The cards should add to 13", "navy");
//         }
//         chosen = [[-1, -1], [-1, -1]];
//     }
//
//     if (isBoardClear()) { // may overwrite endgame(0)... (if user wins with last hand card)
//         endgame(1);
//         updateUI();
//     }
//     else if (!lostNow)
//         updateUI();
// }
//
// function startGame() {
//     initBack();
//     initUI();
//
//     generateCards();
//     updateHistory();
//     updateUI();
// }

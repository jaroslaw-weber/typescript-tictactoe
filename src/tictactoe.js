//grid logic
var Grid = (function () {
    function Grid(size) {
        this.size = size;
        this.content = new Array(size * size);
        console.log("grid init");
    }
    Grid.prototype.getCell = function (row, column) {
        return this.content[column * 3 + row];
    };
    Grid.prototype.setCell = function (row, column, value) {
        this.content[column * 3 + row] = value;
    };
    //checking if all elements are the same and not undefined
    Grid.prototype.isWinLine = function (someList) {
        if (someList.length === 0)
            return false;
        var first = someList[0];
        if (first === undefined)
            return false;
        for (var i = 0; i < someList.length; i++) {
            var now = someList[i];
            if (now !== first)
                return false;
        }
        return true;
    };
    //get winner player id. undefined if not game over.
    Grid.prototype.getWinner = function () {
        //check vertical and horizontal for 3 same elements
        for (var i = 0; i < this.size; i++) {
            var row = [];
            var col = [];
            for (var j = 0; j < this.size; j++) {
                var c1 = this.getCell(i, j);
                var c2 = this.getCell(j, i);
                row.push(c1);
                col.push(c2);
            }
            if (this.isWinLine(row))
                return row[0];
            if (this.isWinLine(col))
                return col[0];
        }
        //check diagnonal
        var diag1 = [];
        var diag2 = [];
        for (var i = 0; i < this.size; i++) {
            var c1 = this.getCell(i, i);
            var c2 = this.getCell(i, this.size - 1 - i);
            diag1.push(c1);
            diag2.push(c2);
        }
        if (this.isWinLine(diag1))
            return diag1[0];
        if (this.isWinLine(diag2))
            return diag2[0];
        //if no winner
        return undefined;
    };
    return Grid;
}());
//player display
var PlayerView = (function () {
    function PlayerView() {
    }
    //element displaying game status
    PlayerView.prototype.getGameStatusElement = function () {
        return document.querySelector("#gameStatus");
    };
    //update status of game. for displaying player turn and game over.
    PlayerView.prototype.updateGameStateText = function (newText) {
        var status = this.getGameStatusElement();
        status.textContent = newText;
        var cl = status.classList;
    };
    //animate game status text
    PlayerView.prototype.animateGameStateText = function (animation) {
        var status = this.getGameStatusElement();
        var cl = status.classList;
        var td = "tada";
        var a = "animated";
        cl.remove(td);
        cl.remove(a);
        cl.remove(animation);
        setTimeout(function () {
            cl.add(a);
            cl.add(animation);
        }, 10);
    };
    return PlayerView;
}());
//player logic
var PlayerController = (function () {
    function PlayerController() {
        this.playerNow = 1;
        this.playerView = new PlayerView();
    }
    //on turn end switch players
    PlayerController.prototype.switchPlayer = function () {
        this.playerNow = this.getNextPlayer(this.playerNow);
        this.onPlayerSwitched();
    };
    //update view
    PlayerController.prototype.onPlayerSwitched = function () {
        this.playerView.updateGameStateText("Player now: " + this.playerNumberToName(this.playerNow));
        this.playerView.animateGameStateText("tada");
    };
    //switch to next player
    PlayerController.prototype.getNextPlayer = function (playerNow) {
        if (playerNow === 1)
            return 2;
        if (playerNow === 2)
            return 1;
    };
    //get player name
    PlayerController.prototype.playerNumberToName = function (n) {
        if (n === 1)
            return "O";
        if (n === 2)
            return "X";
        return "";
    };
    //when player won change text and animate
    PlayerController.prototype.onPlayerWon = function (playerId) {
        var playerName = this.playerNumberToName(playerId);
        this.playerView.updateGameStateText("Player " + playerName + " Won!");
        this.playerView.animateGameStateText("wobble");
    };
    return PlayerController;
}());
//game logic + display
var GameController = (function () {
    function GameController() {
        this.gameOver = false;
        this.grid = new Grid(3);
        this.playerController = new PlayerController();
        //
        var gc = this;
        var gridDisplay = gc.getGridDiv();
        var gridContainer = document.querySelector("#gridContainer");
        gridContainer.appendChild(gridDisplay);
        gc.updateView();
        gc.playerController.onPlayerSwitched();
    }
    //make button helper function
    GameController.prototype.makeGridButton = function () {
        var btn = document.createElement("button");
        var cl = btn.classList;
        cl.add("btn");
        cl.add("btn-primary");
        cl.add("pretty-text");
        cl.add("ttt-btn");
        cl.add("fadeIn");
        cl.add("animated");
        return btn;
    };
    //create div with buttons from Grid
    GameController.prototype.getGridDiv = function () {
        var _this = this;
        var grid = this.grid;
        var parent = document.createElement("div");
        for (var col = 0; col < grid.size; col++) {
            var _loop_1 = function(row) {
                var btn = this_1.makeGridButton();
                btn.id = this_1.getBtnId(row, col);
                var r = row;
                var c = col;
                btn.addEventListener("click", function () { return _this.onCellBtnClick(r, c, true); });
                parent.appendChild(btn);
            };
            var this_1 = this;
            for (var row = 0; row < grid.size; row++) {
                _loop_1(row);
            }
            var divider = document.createElement("br");
            parent.appendChild(divider);
        }
        return parent;
    };
    //get htmlelement id(button)
    GameController.prototype.getBtnId = function (row, column) {
        return row + ":" + column;
    };
    //on click listener
    GameController.prototype.onCellBtnClick = function (row, column, isPlayer) {
        if (this.gameOver === true)
            return;
        var cellContent = this.grid.getCell(row, column);
        if (cellContent === 1 || cellContent === 2)
            return;
        this.grid.setCell(row, column, this.playerController.playerNow);
        this.playerController.switchPlayer();
        this.updateView();
        var winner = this.grid.getWinner();
        if (winner !== undefined) {
            this.playerController.onPlayerWon(winner);
            this.gameOver = true;
        }
    };
    //update view after logic update
    GameController.prototype.updateView = function () {
        for (var col = 0; col < this.grid.size; col++) {
            var _loop_2 = function(row) {
                var btnId = this_2.getBtnId(row, col);
                var btn = document.getElementById(btnId);
                var cellContent = this_2.grid.getCell(row, col);
                var txt = this_2.playerController.playerNumberToName(cellContent);
                var shouldAnimate = txt !== btn.textContent;
                btn.textContent = txt;
                if (shouldAnimate) {
                    var cl_1 = btn.classList;
                    cl_1.remove("fadeIn");
                    cl_1.remove("animated");
                    setTimeout(function () {
                        cl_1.add("jello");
                        cl_1.add("animated");
                    }, 10);
                }
            };
            var this_2 = this;
            for (var row = 0; row < this.grid.size; row++) {
                _loop_2(row);
            }
        }
    };
    return GameController;
}());
function initialize() {
    this.gameController = new GameController();
}
window.onload = initialize;

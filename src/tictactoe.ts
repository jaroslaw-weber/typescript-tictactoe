
//grid logic
class Grid {
    content: number[];
    size: number;
    playerWon: number;

    constructor(size: number) {
        this.size = size;
        this.content = new Array(size * size);
        console.log("grid init");
    }

    getCell(row: number, column: number) {
        return this.content[column * 3 + row];
    }

    setCell(row: number, column: number, value: number) {
        this.content[column * 3 + row] = value;
    }

    //checking if all elements are the same and not undefined
    isWinLine(someList: Array<number>) {
        if (someList.length === 0) return false;
        let first = someList[0];
        if (first === undefined) return false;
        for (let i = 0; i < someList.length; i++) {
            let now = someList[i];
            if (now !== first) return false;
        }
        return true;
    }

    //get winner player id. undefined if not game over.
    getWinner() {
        //check vertical and horizontal for 3 same elements
        for (let i = 0; i < this.size; i++) {
            let row = [];
            let col = [];
            for (let j = 0; j < this.size; j++) {
                let c1 = this.getCell(i, j);
                let c2 = this.getCell(j, i);
                row.push(c1);
                col.push(c2);
            }
            if (this.isWinLine(row)) return row[0];
            if (this.isWinLine(col)) return col[0];
        }
        //check diagnonal
        let diag1 = [];
        let diag2 = [];
        for (let i = 0; i < this.size; i++) {
            let c1 = this.getCell(i, i);
            let c2 = this.getCell(i, this.size - 1 - i);
            diag1.push(c1);
            diag2.push(c2);

        }
        if (this.isWinLine(diag1)) return diag1[0];
        if (this.isWinLine(diag2)) return diag2[0];

        //if no winner
        return undefined;

    }

}

//player display
class PlayerView {

    //element displaying game status
    getGameStatusElement() {
        return <HTMLElement>document.querySelector("#gameStatus");
    }

    //update status of game. for displaying player turn and game over.
    updateGameStateText(newText: string) {
        let status = this.getGameStatusElement();
        status.textContent = newText;
        let cl = status.classList;
    }

    //animate game status text
    animateGameStateText(animation: string) {

        let status = this.getGameStatusElement();
        let cl = status.classList;
        let td = "tada";
        let a = "animated";
        cl.remove(td);
        cl.remove(a);
        cl.remove(animation);
        setTimeout(() => {

            cl.add(a);
            cl.add(animation);
        }, 10);
    }

}

//player logic
class PlayerController {

    //which player's turn is now?
    playerNow: number;
    //view controller
    playerView: PlayerView;

    constructor() {
        this.playerNow = 1;
        this.playerView = new PlayerView();
    }

    //on turn end switch players
    switchPlayer() {
        this.playerNow = this.getNextPlayer(this.playerNow)
        this.onPlayerSwitched();
    }

    //update view
    onPlayerSwitched() {
        this.playerView.updateGameStateText("Player now: " + this.playerNumberToName(this.playerNow));
        this.playerView.animateGameStateText("tada");
    }

    //switch to next player
    getNextPlayer(playerNow: number) {
        if (playerNow === 1) return 2;
        if (playerNow === 2) return 1;
    }

    //get player name
    playerNumberToName(n: number) {
        if (n === 1) return "O";
        if (n === 2) return "X";
        return "";
    }

    //when player won change text and animate
    onPlayerWon(playerId: number) {
        let playerName = this.playerNumberToName(playerId);
        this.playerView.updateGameStateText("Player " + playerName + " Won!");
        this.playerView.animateGameStateText("wobble");
    }


}

//game logic + display
class GameController {
    grid: Grid;
    playerController: PlayerController;
    gameOver: boolean;

    constructor() {
        this.gameOver = false;
        this.grid = new Grid(3);
        this.playerController = new PlayerController();
        //
        let gc = this;
        let gridDisplay = gc.getGridDiv();
        let gridContainer = document.querySelector("#gridContainer");
        gridContainer.appendChild(gridDisplay);
        gc.updateView();
        gc.playerController.onPlayerSwitched();
    }

    //make button helper function
    makeGridButton() {
        let btn = document.createElement("button");
        let cl = btn.classList;
        cl.add("btn");
        cl.add("btn-primary");
        cl.add("pretty-text");
        cl.add("ttt-btn");
        cl.add("fadeIn");
        cl.add("animated");
        return btn;
    }

    //create div with buttons from Grid
    getGridDiv() {
        let grid = this.grid;
        let parent = document.createElement("div");
        for (let col = 0; col < grid.size; col++) {
            for (let row = 0; row < grid.size; row++) {

                let btn = this.makeGridButton();
                btn.id = this.getBtnId(row, col);
                let r = row;
                let c = col;
                btn.addEventListener("click", () => this.onCellBtnClick(r, c, true));
                parent.appendChild(btn);
            }
            let divider = document.createElement("br");
            parent.appendChild(divider);
        }
        return parent;
    }

    //get htmlelement id(button)
    getBtnId(row: number, column: number) {
        return row + ":" + column;
    }

    //on click listener
    onCellBtnClick(row: number, column: number, isPlayer: boolean) {
        if (this.gameOver === true) return;
        let cellContent = this.grid.getCell(row, column);
        if (cellContent === 1 || cellContent === 2) return;
        this.grid.setCell(row, column, this.playerController.playerNow);
        this.playerController.switchPlayer();
        this.updateView();
        let winner = this.grid.getWinner();
        if (winner !== undefined) {
            this.playerController.onPlayerWon(winner);
            this.gameOver = true;
        }
    }

    //update view after logic update
    updateView() {
        for (let col = 0; col < this.grid.size; col++) {
            for (let row = 0; row < this.grid.size; row++) {
                let btnId = this.getBtnId(row, col);
                let btn = document.getElementById(btnId);
                let cellContent = this.grid.getCell(row, col);
                let txt = this.playerController.playerNumberToName(cellContent);
                let shouldAnimate = txt !== btn.textContent;
                btn.textContent = txt;

                if (shouldAnimate) {
                    let cl = btn.classList;
                    cl.remove("fadeIn");
                    cl.remove("animated");
                    setTimeout(() => {
                        cl.add("jello");
                        cl.add("animated");
                    }, 10);
                }

            }

        }
    }

}

function initialize() {

    this.gameController = new GameController();
}

window.onload = initialize;


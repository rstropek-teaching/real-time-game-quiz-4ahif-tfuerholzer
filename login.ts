enum RouletColor {
    green = 14,
    red = 2,
    black = 2
}

enum ErrorMSG {
    invalidBalance = "Invalid Balance!"
}

interface Bet {
    money: number;
    color: RouletColor;
}

interface NamedBet extends Bet {
    name: string;
}
interface RouletItem{
    color : RouletColor;
    num : number;
}
const rouletItems : Array<RouletItem> = [
    {color:RouletColor.green,num:0},
    {color:RouletColor.red,num:32},
    {color:RouletColor.black,num:15},
    {color:RouletColor.red,num:19},
    {color:RouletColor.black,num:4},
    {color:RouletColor.red,num:21},
    {color:RouletColor.black,num:2},
    {color:RouletColor.red,num:25},
    {color:RouletColor.black,num:17},
    {color:RouletColor.red,num:34},
    {color:RouletColor.black,num:6},
    {color:RouletColor.red,num:27},
    {color:RouletColor.black,num:13},
    {color:RouletColor.red,num:36},
    {color:RouletColor.black,num:11},
    {color:RouletColor.red,num:30},
    {color:RouletColor.black,num:8},
    {color:RouletColor.red,num:23},
    {color:RouletColor.black,num:10},
    {color:RouletColor.red,num:5},
    {color:RouletColor.black,num:24},
    {color:RouletColor.red,num:16},
    {color:RouletColor.black,num:33},
    {color:RouletColor.red,num:1},
    {color:RouletColor.black,num:20},
    {color:RouletColor.red,num:14},
    {color:RouletColor.black,num:31},
    {color:RouletColor.red,num:9},
    {color:RouletColor.black,num:22},
    {color:RouletColor.red,num:18},
    {color:RouletColor.black,num:29},
    {color:RouletColor.red,num:7},
    {color:RouletColor.black,num:28},
    {color:RouletColor.red,num:12},
    {color:RouletColor.black,num:35},
    {color:RouletColor.red,num:3},
    {color:RouletColor.black,num:26}
];

class Player {
    currentBalance: number;
    name: string;
    bets: Array<Bet>;
    gamesWon: number;
    gamesLost: number;
    highestWin: number;
    biggestLost: number;
    nextCashInjection: Date;
    private static DEFAULT_START_MONEY = 5000;
    private static DEFAULT_INJECTION_MONEY = 500;

    constructor() {
        this.currentBalance = 0;
        this.name = "unknown Player";
        this.bets = new Array();
        this.gamesWon = 0;
        this.gamesLost = 0;
        this.highestWin = 0;
        this.biggestLost = 0;
        this.nextCashInjection = null;
    }

    static generateNewPlayer(name: string): Player {
        let player = new Player();
        player.currentBalance = Player.DEFAULT_START_MONEY;
        player.nextCashInjection = new Date();
        player.addTime();
        return player;
    }

    addTime(): void {
        this.nextCashInjection = new Date(this.nextCashInjection.getTime() + (60000 * 15));
    }

    checkCashInjection(currentTime: Date): void {
        if (currentTime.getTime() >= this.nextCashInjection.getTime()) {
            this.currentBalance = Player.DEFAULT_INJECTION_MONEY + this.currentBalance;
        }
    }

    checkBets(result: RouletColor): void {
        this.bets.forEach((bet) => {
            if (bet.color === result) {
                let win = bet.money * bet.color;
                if (win > this.highestWin) {
                    this.highestWin = win;
                }
                this.gamesWon++;
                this.currentBalance = win + this.currentBalance;
            } else {
                if (bet.money > this.biggestLost) {
                    this.biggestLost = bet.money
                }
                this.gamesLost--;
            }
        })
        this.bets = new Array();
    }

    addBet(newBet: Bet): void {
        let added = false;
        if (newBet.money <= this.currentBalance) {
            this.bets.forEach((bet) => {
                if (bet.color === newBet.color) {
                    bet.money = bet.money + newBet.money;
                }
            })
            if (!added) {
                this.bets.push(newBet);
            }
        } else {
            throw new Error(ErrorMSG.invalidBalance);
        }
    }
}

declare const io: SocketIOStatic;
const socket = io();


function login(): void {
    let element = <HTMLInputElement>document.getElementById("username");
    let username: string = element.value;
    if (username.length === 0) {
        alert("Der Benutzername ist leer!");
    } else {
        socket.on("ready", element => socket.emit(username));
        socket.on("login-conf", (message => {
            let user: Player = JSON.parse(message.toString());
            document.getElementById("currentMoney").innerHTML=user.currentBalance+"";
            document.getElementById("highestWin").innerHTML=user.highestWin+"";
            document.getElementById("highestLose").innerHTML=user.biggestLost+"";
            document.getElementById("login").style.display="none";
            document.getElementById("maingame").style.display="block";
        }));
        socket.emit("login", username);
    }
}
function roll(num) : void{
    let img : HTMLImageElement = <HTMLImageElement> document.getElementById("roulet-wheel");
    img.style.transform = "rotate("+num+"deg)";
}
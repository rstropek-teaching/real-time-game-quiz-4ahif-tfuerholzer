import Socket = SocketIO.Socket;

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

interface NamedBet extends Bet {
    name: string;
}

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
        player.name = name;
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

import * as express from 'express';
import * as sio from 'socket.io';
import * as http from 'http';
const app = express();
const savedPersons: Array<Player> = new Array();
app.use(express.static(__dirname + '/public'));
const server = http.createServer(app);
server.listen(3000);
let num = 0;
let sock : Socket= null;
sio(server).on("connect", (socket : Socket) => {
    sock = socket;
    console.log(num);
    num++;
    socket.on("login", (name: string) => {
        let returnPerson: Player = null;
        savedPersons.forEach((person => {
            if (person.name === name) {
                returnPerson = person;
            }
        }));
        if (returnPerson === null) {
            returnPerson = Player.generateNewPlayer(name);
            savedPersons.push(returnPerson);
        }
        socket.emit("login-conf", JSON.stringify(returnPerson));
    });
    socket.on("placeBet", (JSONEDBet: string) => {
        let bet: NamedBet = <NamedBet> JSON.parse(JSONEDBet);
        savedPersons.filter(person => person.name === bet.name, person => person.addBet(bet));
    })
    socket.on("sync-request", (msg) => {
        socket.emit("sync-data", JSON.stringify(new Date()));
    })
    socket.emit("ready", "server is ready :D!");
});
function getRandomRouletItem() : RouletItem{
    return rouletItems[Math.floor(Math.random()*(rouletItems.length+1))];
}









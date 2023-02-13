import { getCombination } from "./calculation"
import { ScreenCard } from "./screenCard"



const board = [[0,3],[1,3],[3,3],[2,3],[12,3]]

const hand1 = [[4,3], [5,3]]
const hand2 = [[10,3], [11,3]]

console.log(`Board: `, board.map(card => new ScreenCard(card[0], card[1]).toString()))
console.log(`Hand 1: `, hand1.map(card => new ScreenCard(card[0], card[1]).toString()))
console.log(`Hand 2: `, hand2.map(card => new ScreenCard(card[0], card[1]).toString()))


console.log(getCombination(hand1.concat(board)))
console.log(getCombination(hand2.concat(board)))
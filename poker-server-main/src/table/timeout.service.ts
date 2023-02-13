import { Injectable } from '@nestjs/common'

type Timeout = NodeJS.Timeout
type Interval = NodeJS.Timer

@Injectable()
export class TimeoutService {
  private skipTurnTimeouts = new Map<number, Timeout>()
  private bbIncreaseIntervals = new Map<number, Interval>()

  public setSkipTimeout(tableId: number, timeout: Timeout) {
    this.skipTurnTimeouts.set(tableId, timeout)
  }

  public clearSkipTimeout(tableId: number) {
    const timeout = this.skipTurnTimeouts.get(tableId)
    clearTimeout(timeout)
  }

  public setBbIncreaseInterval(tourneyId: number, interval: Interval) {
    this.bbIncreaseIntervals.set(tourneyId, interval)
  }

  public clearBbIncreaseInterval(tourneyId: number) {
    const interval = this.bbIncreaseIntervals.get(tourneyId)
    clearInterval(interval)
  }

  
}
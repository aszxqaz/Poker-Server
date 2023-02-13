import { BB_SIZES } from "src/constants"
import { DeckRound } from "./deck"

export class BbLevelRound extends DeckRound {
  private bbLevel: number = 0
  private isIncreaseBB: boolean = false

  constructor() {
    super()
  }

  protected increaseBbIfShould() {
    if (this.isIncreaseBB) {
      this.isIncreaseBB = false
      this.bbLevel++
    }
  }

  public setIncreaseNextTurn() {
    this.isIncreaseBB = true
    return this
  }

  protected getCurrentBb() {
    return BB_SIZES[this.bbLevel]
  }

}

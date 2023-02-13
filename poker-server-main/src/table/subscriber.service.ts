import { Injectable } from '@nestjs/common'

@Injectable()
export class SubscriberService {
  private subscribers = new Map<number, Set<string>>()

  add(tourneyId: number, username: string) {
    let usernames = this.subscribers.get(tourneyId)
    if(!usernames) {
      usernames = new Set()
    }
    usernames.add(username)
    this.subscribers.set(tourneyId, usernames)
  }

  remove(tourneyId: number, username: string) {
    const usernames = this.subscribers.get(tourneyId)
    if (!usernames) return
    usernames.delete(username)
    this.subscribers.set(tourneyId, usernames)
  }

  get(tourneyId: number) {
    return Array.from(this.subscribers.get(tourneyId) || [])
  }
}

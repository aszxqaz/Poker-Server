export type UserInRequest = {
  username: string
  avatar: string
  balance: {
    usd: number
  }
}

export type RequestWithUser = Request & {
  user: UserInRequest
}
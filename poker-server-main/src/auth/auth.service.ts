import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { hash, verify } from 'argon2'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserInRequest } from 'src/session/types'
import { SignInDto, SignUpDto } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: SignUpDto) {
    // checking email
    let existing = await this.prisma.user.findUnique({
      where: { email: dto.email }
    })
    if (existing) throw new ConflictException('User with this email already exists')

    // checking username
    existing = await this.prisma.user.findUnique({
      where: { username: dto.username }
    })
    if (existing) throw new ConflictException('User with this username already exists')

    // registering
    const password = await hash(dto.password)

    const { username } = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password,
        avatar: `assets/avatars/avatar-male-${Math.trunc(Math.random() * 7) + 1}.svg`
      }
    })

    const account = await this.prisma.account.create({
      data: {
        username
      }
    })

    const balance = await this.prisma.balance.create({
      data: {
        username
      }
    })

    return {
      username
    }
  }

  async validateUser(dto: SignInDto): Promise<UserInRequest> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: {
        balance: true
      }
    })
    if (!user) throw new UnauthorizedException('Wrong email or password')

    const isVerified = await verify(user.password, dto.password)
    if (!isVerified) throw new UnauthorizedException('Wrong email or password')

    return {
      username: user.username,
      avatar: user.avatar,
      balance: user.balance
    }
  }

  async getUserInfo(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        balance: true
      }
    })

    return {
      username,
      avatar: user.avatar,
      usd: user.balance.usd
    }
  }
}

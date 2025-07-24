import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        id: string
        userId?: string
        email: string
        name?: string
      }
      session?: {
        userId?: string
        destroy: (callback: (err?: Error) => void) => void
      }
      requestId?: string
    }
  }
}

export {}
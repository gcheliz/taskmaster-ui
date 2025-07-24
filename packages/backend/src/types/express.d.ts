import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User
      session?: {
        userId?: string
        destroy: (callback: (err?: Error) => void) => void
      }
      requestId?: string
    }
  }
}

export {}
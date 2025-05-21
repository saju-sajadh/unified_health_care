export {}

export type Roles = 'admin' | 'hospital' | 'government'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}
// @ts-ignore
export enum Status {
  Active = 1,
  Pending = 1,
}

export type User = {
  id: string
}

export function getUser(user?: User): string | undefined {
  return (user?.id)!
}

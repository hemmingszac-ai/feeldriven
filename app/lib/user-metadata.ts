import { isObject, readBoolean, readString } from '@/app/lib/object'

export function getIsManager(userMetadata: unknown) {
  if (!isObject(userMetadata)) {
    return false
  }

  const isManager = readBoolean(userMetadata.isManager)
  if (typeof isManager === 'boolean') {
    return isManager
  }

  return readString(userMetadata.role) === 'Team Manager'
}

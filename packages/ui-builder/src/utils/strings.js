export function compact (str, maxLength) {
  if (!str) return ''
  if (str.length <= maxLength) {
    return str
  }
  return (
    str.substring(0, maxLength / 2) + '...' + str.substring(str.length - maxLength / 2)
  )
}

export const formatBalance = (cents: any) => {
  return typeof cents === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
    : null
}

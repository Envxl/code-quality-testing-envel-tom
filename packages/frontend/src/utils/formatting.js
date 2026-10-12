export const formatDate = (date) => {
  if (!date) return 'Invalid Date'

  try {
    const d = new Date(date)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid Date'
  }
}

export const formatPrice = (price) => {
  if (!price) return '$0.00'

  try {
    const number_ = Number.parseFloat(price)
    if (isNaN(number_)) return '$0.00'

    const parts = number_.toFixed(2).split('.')
    parts[0] = parts[0].replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',')

    return `$${parts.join('.')}`
  } catch {
    return '$0.00'
  }
}

export const formatStock = (stock) => {
  const stockNumber = parseInt(stock)

  if (isNaN(stockNumber) || (stockNumber === 0)) {
    return 'Out of Stock'
  }
  if (stockNumber < 5) {
    return `Low Stock (${stockNumber} left)`
  }
  return stockNumber < 10 ? `Limited Stock (${stockNumber} available)` : `In Stock (${stockNumber})`;
}

export const formatUserName = (firstname, lastname) => {
  if (!firstname && !lastname) return 'Unknown User'

  const first = (firstname || '').trim()
  const last = (lastname || '').trim()

  if (first && last) {
    return `${first.charAt(0).toUpperCase() + first.slice(1)} ${last.charAt(0).toUpperCase() + last.slice(1)}`
  }
  if (first) {
    return first.charAt(0).toUpperCase() + first.slice(1)
  }
  return last ? last.charAt(0).toUpperCase() + last.slice(1) : 'Unknown User';
}

export const formatSearchTerm = (term) => {
  return term ? term
    .toLowerCase()
    .split(' ')
    .map(word => word.trim())
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') : '';
}

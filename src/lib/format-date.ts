export function formatDate(dateString: string, locale: string = 'en'): string {
  let date: Date
  
  if (dateString.includes('T')) {
    date = new Date(dateString)
  } else {
    const [datePart] = dateString.split(' ')
    const [year, month, day] = datePart.split('-')
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthNamesTh = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  
  const day = String(date.getDate()).padStart(2, '0')
  const monthName = locale === 'th' ? monthNamesTh[date.getMonth()] : monthNames[date.getMonth()]
  const yearShort = String(date.getFullYear()).slice(-2)
  
  return `${day}-${monthName}-${yearShort}`
}

export function formatDateTime(dateString: string, locale: string = 'en'): string {
  let date: Date
  let hasTime = false
  
  if (dateString.includes('T')) {
    date = new Date(dateString)
    hasTime = true
  } else {
    const [datePart, timePart] = dateString.split(' ')
    const [year, month, day] = datePart.split('-')
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    hasTime = !!timePart
  }
  
  const dateFormatted = formatDate(dateString, locale)
  
  if (hasTime) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${dateFormatted} ${hours}:${minutes}`
  }
  
  return dateFormatted
}

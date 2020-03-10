export const setCookie = (key: string, value: string, expireDays: number) => {
  const encodedKey = key
    .replace(/[^#$&+\^`|]/g, encodeURIComponent)
    .replace(/\(/g, '%28').replace(/\)/g, '%29')
  const encodedValue = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent)

  let expireCookie = ''
  if (expireDays) {
    const expireDate = new Date()
    expireDate.setDate(expireDate.getDate() + expireDays)
    expireCookie = 'expires=' + expireDate.toUTCString()
  }

  const cookie = `${encodedKey}=${encodedValue}; path=/; ${expireCookie}`

  document.cookie = cookie
}

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`
}
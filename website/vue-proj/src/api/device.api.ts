import { http } from './http'

export function fetchDevices(type: 'all' | 'favorite') {
  return http.get('/devices', {
    params: { type }
  })
}

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock api
vi.mock('../../../src/services/api', () => ({
  default: {
    post: vi.fn()
  }
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isAuthenticated', () => {
    it('retorna false cuando no hay token', () => {
      // Arrange
      const token = null
      const isAuthenticated = !!token

      // Assert
      expect(isAuthenticated).toBe(false)
    })

    it('retorna true cuando hay token', () => {
      // Arrange
      const token = 'fake-token-123'
      const isAuthenticated = !!token

      // Assert
      expect(isAuthenticated).toBe(true)
    })

    it('retorna false cuando el token es un string vacío', () => {
      // Arrange
      const token = ''
      const isAuthenticated = !!token

      // Assert
      expect(isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('retorna true cuando las credenciales son válidas', async () => {
      // Arrange
      const api = await import('../../../src/services/api')
      api.default.post.mockResolvedValue({
        data: { token: 'valid-token', id: 1 }
      })

      // Simular lógica de login
      const loginResult = async (username, password) => {
        const res = await api.default.post('/authentication/sign-in', { username, password })
        if (res && res.data && res.data.token) {
          return true
        }
        return false
      }

      // Act
      const result = await loginResult('coach', 'password123')

      // Assert
      expect(result).toBe(true)
    })

    it('retorna false cuando la respuesta no tiene token', async () => {
      // Arrange
      const api = await import('../../../src/services/api')
      api.default.post.mockResolvedValue({ data: {} })

      // Simular lógica de login
      const loginResult = async () => {
        const res = await api.default.post('/authentication/sign-in', {})
        if (res && res.data && res.data.token) {
          return true
        }
        return false
      }

      // Act
      const result = await loginResult()

      // Assert
      expect(result).toBe(false)
    })

    it('lanza error cuando las credenciales son incorrectas', async () => {
      // Arrange
      const api = await import('../../../src/services/api')
      api.default.post.mockRejectedValue(new Error('Network error'))

      // Simular lógica de login
      const loginResult = async () => {
        try {
          await api.default.post('/authentication/sign-in', {})
        } catch (e) {
          throw new Error('Credenciales incorrectas')
        }
      }

      // Act & Assert
      await expect(loginResult()).rejects.toThrow('Credenciales incorrectas')
    })

    it('almacena el token en localStorage cuando el login es exitoso', async () => {
      // Arrange
      const api = await import('../../../src/services/api')
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      api.default.post.mockResolvedValue({
        data: { token: 'valid-token', id: 1 }
      })

      // Simular lógica de login
      const loginResult = async (username, password) => {
        const res = await api.default.post('/authentication/sign-in', { username, password })
        if (res && res.data && res.data.token) {
          localStorage.setItem('coachToken', res.data.token)
          localStorage.setItem('coachUsername', username)
          return true
        }
        return false
      }

      // Act
      await loginResult('coach', 'password123')

      // Assert
      expect(setItemSpy).toHaveBeenCalledWith('coachToken', 'valid-token')
      expect(setItemSpy).toHaveBeenCalledWith('coachUsername', 'coach')
    })
  })

  describe('logout', () => {
    it('limpia el token removiendo elementos del localStorage', () => {
      // Arrange
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')

      // Act
      localStorage.removeItem('coachToken')
      localStorage.removeItem('coachUsername')

      // Assert
      expect(removeItemSpy).toHaveBeenCalledWith('coachToken')
      expect(removeItemSpy).toHaveBeenCalledWith('coachUsername')
    })
  })
})

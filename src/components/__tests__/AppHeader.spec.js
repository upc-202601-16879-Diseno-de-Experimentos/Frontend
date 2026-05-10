import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../../../src/components/AppHeader.vue'

// Mock window.location
const locationMock = {
  href: ''
}
global.window = { location: locationMock }

// Stub vue-router components
const routerLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  template: '<a :href="to"><slot /></a>'
}

const routerViewStub = {
  name: 'RouterView',
  template: '<slot />'
}

describe('AppHeader', () => {
  describe('rendering', () => {
    it('muestra el título MatchPoint', () => {
      // Arrange
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            'router-link': routerLinkStub,
            'router-view': routerViewStub
          }
        }
      })

      // Act

      // Assert
      expect(wrapper.find('h1').text()).toContain('MatchPoint')
    })

    it('renderiza todos los links de navegación', () => {
      // Arrange
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            'router-link': routerLinkStub,
            'router-view': routerViewStub
          }
        }
      })

      // Act
      const navLinks = wrapper.findAll('a')

      // Assert
      expect(navLinks.length).toBe(9)
      expect(wrapper.text()).toContain('Dashboard')
      expect(wrapper.text()).toContain('Mi Perfil')
      expect(wrapper.text()).toContain('Mis Servicios')
      expect(wrapper.text()).toContain('Horario')
      expect(wrapper.text()).toContain('Reservas')
      expect(wrapper.text()).toContain('Clientes')
      expect(wrapper.text()).toContain('Ingresos')
      expect(wrapper.text()).toContain('Ajustes')
      expect(wrapper.text()).toContain('Cerrar Sesión')
    })

    it('contiene enlaces a las rutas correctas', () => {
      // Arrange
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            'router-link': routerLinkStub,
            'router-view': routerViewStub
          }
        }
      })

      // Act
      const links = wrapper.findAll('a')
      const hrefs = links.map(l => l.attributes('href'))

      // Assert
      expect(hrefs).toContain('/dashboard')
      expect(hrefs).toContain('/profile')
      expect(hrefs).toContain('/services')
      expect(hrefs).toContain('/schedule')
      expect(hrefs).toContain('/bookings')
      expect(hrefs).toContain('/clients')
      expect(hrefs).toContain('/payments')
      expect(hrefs).toContain('/settings')
    })
  })

  describe('logout functionality', () => {
    it('tiene link de Cerrar Sesión que es un anchor con clase logout', () => {
      // Arrange
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            'router-link': routerLinkStub,
            'router-view': routerViewStub
          }
        }
      })

      // Act
      const logoutLink = wrapper.find('a.logout')

      // Assert
      expect(logoutLink.exists()).toBe(true)
      expect(logoutLink.text()).toBe('Cerrar Sesión')
    })

    it('el link de logout tiene preventDefault para evitar navegación', () => {
      // Arrange
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            'router-link': routerLinkStub,
            'router-view': routerViewStub
          }
        }
      })

      // Act
      const logoutLink = wrapper.find('a.logout')

      // Assert
      expect(logoutLink.attributes('href')).toBe('#')
    })
  })

  describe('navigation links', () => {
    it('tiene enlace al dashboard', () => {
      // Arrange
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            'router-link': routerLinkStub,
            'router-view': routerViewStub
          }
        }
      })

      // Act
      const dashboardLink = wrapper.find('a[href="/dashboard"]')

      // Assert
      expect(dashboardLink.exists()).toBe(true)
      expect(dashboardLink.text()).toBe('Dashboard')
    })

    it('tiene enlace a servicios', () => {
      // Arrange
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            'router-link': routerLinkStub,
            'router-view': routerViewStub
          }
        }
      })

      // Act
      const servicesLink = wrapper.find('a[href="/services"]')

      // Assert
      expect(servicesLink.exists()).toBe(true)
      expect(servicesLink.text()).toBe('Mis Servicios')
    })

    it('tiene enlace a reservas', () => {
      // Arrange
      const wrapper = mount(AppHeader, {
        global: {
          stubs: {
            'router-link': routerLinkStub,
            'router-view': routerViewStub
          }
        }
      })

      // Act
      const bookingsLink = wrapper.find('a[href="/bookings"]')

      // Assert
      expect(bookingsLink.exists()).toBe(true)
      expect(bookingsLink.text()).toBe('Reservas')
    })
  })
})

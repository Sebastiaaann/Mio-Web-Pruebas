import { nextTick } from 'vue'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import BannerCookies from '@/components/ui/BannerCookies.vue'
import {
  CLAVE_AVISO_COOKIES_LEGACY,
  CLAVE_AVISO_COOKIES_VISTO,
  NOMBRE_COOKIE_SESION
} from '@/config/legal'

vi.mock('motion-v', () => ({
  Motion: {
    name: 'Motion',
    template: '<div><slot /></div>'
  }
}))

const stubs = {
  Teleport: {
    template: '<div><slot /></div>'
  },
  Transition: {
    template: '<div><slot /></div>'
  },
  Button: {
    template: '<button type="button" @click="$emit(\'click\')"><slot /></button>'
  },
  RouterLink: RouterLinkStub
}

function montarBanner() {
  return mount(BannerCookies, {
    global: { stubs }
  })
}

describe('BannerCookies', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('muestra el aviso cuando aun no se ha marcado como visto', () => {
    const wrapper = montarBanner()

    expect(wrapper.text()).toContain(NOMBRE_COOKIE_SESION)
    expect(wrapper.text()).toContain('preferencia local funcional')
    expect(wrapper.find('[role="region"]').exists()).toBe(true)
  })

  it('oculta el aviso y persiste la nueva clave al marcarlo como visto', async () => {
    const wrapper = montarBanner()

    await wrapper.get('button').trigger('click')
    await nextTick()

    expect(localStorage.getItem(CLAVE_AVISO_COOKIES_VISTO)).toBe('true')
    expect(wrapper.find('[role="region"]').exists()).toBe(false)
  })

  it('no vuelve a mostrarse cuando la nueva clave ya existe', () => {
    localStorage.setItem(CLAVE_AVISO_COOKIES_VISTO, 'true')

    const wrapper = montarBanner()

    expect(wrapper.find('[role="region"]').exists()).toBe(false)
  })

  it('migra silenciosamente la clave legacy y evita reabrir el aviso', async () => {
    localStorage.setItem(CLAVE_AVISO_COOKIES_LEGACY, 'true')

    const wrapper = montarBanner()
    await nextTick()

    expect(localStorage.getItem(CLAVE_AVISO_COOKIES_LEGACY)).toBeNull()
    expect(localStorage.getItem(CLAVE_AVISO_COOKIES_VISTO)).toBe('true')
    expect(wrapper.find('[role="region"]').exists()).toBe(false)
  })

  it('expone un enlace a la politica de cookies', () => {
    const wrapper = montarBanner()

    expect(wrapper.getComponent(RouterLinkStub).props('to')).toBe('/politica-cookies')
  })
})

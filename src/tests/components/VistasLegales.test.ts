import { mount, RouterLinkStub } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import PoliticaCookiesView from '@/views/legal/PoliticaCookiesView.vue'
import PoliticaPrivacidadView from '@/views/legal/PoliticaPrivacidadView.vue'
import TerminosServicioView from '@/views/legal/TerminosServicioView.vue'
import {
  CLAVE_AVISO_COOKIES_VISTO,
  FECHAS_ACTUALIZACION_LEGAL,
  NOMBRE_COOKIE_SESION
} from '@/config/legal'

const back = vi.fn()
const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    back,
    push
  })
}))

const stubs = {
  Button: {
    template: '<button type="button"><slot /></button>'
  },
  Card: {
    template: '<section><slot /></section>'
  },
  CardHeader: {
    template: '<header><slot /></header>'
  },
  CardTitle: {
    template: '<h2><slot /></h2>'
  },
  CardContent: {
    template: '<div><slot /></div>'
  },
  RouterLink: RouterLinkStub
}

function montarVista(vista: unknown) {
  return mount(vista, {
    global: { stubs }
  })
}

describe('Vistas legales', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-01-02T12:00:00Z'))
    back.mockReset()
    push.mockReset()
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: ''
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('PoliticaCookiesView usa fecha fija y describe el contrato real de sesion', () => {
    const wrapper = montarVista(PoliticaCookiesView)
    const texto = wrapper.text()

    expect(texto).toContain(FECHAS_ACTUALIZACION_LEGAL.cookies)
    expect(texto).not.toContain('2030')
    expect(texto).toContain(NOMBRE_COOKIE_SESION)
    expect(texto).toContain('24 horas')
    expect(texto).toContain(CLAVE_AVISO_COOKIES_VISTO)
    expect(texto).toContain('localStorage del navegador')
  })

  it('PoliticaPrivacidadView referencia la preferencia local funcional con fecha fija', () => {
    const wrapper = montarVista(PoliticaPrivacidadView)
    const texto = wrapper.text()

    expect(texto).toContain(FECHAS_ACTUALIZACION_LEGAL.privacidad)
    expect(texto).not.toContain('2030')
    expect(texto).toContain('preferencia local funcional')
    expect(texto).toContain('Política de Cookies')
    expect(texto).toContain(NOMBRE_COOKIE_SESION)
  })

  it('TerminosServicioView referencia la cookie real y la preferencia local con fecha fija', () => {
    const wrapper = montarVista(TerminosServicioView)
    const texto = wrapper.text()

    expect(texto).toContain(FECHAS_ACTUALIZACION_LEGAL.terminos)
    expect(texto).not.toContain('2030')
    expect(texto).toContain(NOMBRE_COOKIE_SESION)
    expect(texto).toContain('preferencia local funcional')
    expect(texto).toContain('Política de Cookies')
  })

  it('Volver hace fallback a inicio cuando no hay historial interno', async () => {
    const wrapper = montarVista(PoliticaCookiesView)

    await wrapper.get('button').trigger('click')

    expect(back).not.toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/')
  })

  it('Volver usa router.back cuando la referencia es interna', async () => {
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'http://localhost:3000/auth'
    })

    const wrapper = montarVista(PoliticaCookiesView)
    await wrapper.get('button').trigger('click')

    expect(back).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })
})

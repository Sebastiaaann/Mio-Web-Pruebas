import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import Button from '@/components/ui/button/Button.vue'

vi.mock('reka-ui', () => ({
  Primitive: {
    name: 'Primitive',
    props: ['as', 'asChild'],
    template: '<component :is="as || \'button\'" v-bind="$attrs"><slot /></component>'
  }
}))

describe('Button', () => {
  it('reemite click para que los handlers del padre funcionen', async () => {
    const wrapper = mount({
      components: { Button },
      data() {
        return { clicks: 0 }
      },
      template: `
        <div>
          <Button @click="clicks += 1">Acción</Button>
          <span data-testid="contador">{{ clicks }}</span>
        </div>
      `
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('[data-testid="contador"]').text()).toBe('1')
  })
})

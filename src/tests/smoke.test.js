import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router'; // Mock router needed usually

// Components to test
import InicioViewModern from '@/views/inicio/InicioViewModern.vue';

describe('Smoke Tests - Vistas Principales', () => {

  it('InicioViewModern se monta correctamente', async () => {
    // Mock Router
    const router = createRouter({
        history: createWebHistory(),
        routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
    });

    const wrapper = mount(InicioViewModern, {
      global: {
        plugins: [
            createTestingPinia({ 
                createSpy: vi.fn,
                stubActions: false 
            }),
            router
        ],
        stubs: {
            // Stub components that might cause issues in shallow mount
            'AlternarTema': true,
            'PremiumInput': true
        }
      }
    });

    expect(wrapper.exists()).toBe(true);
    // Verificar que contiene texto clave
    expect(wrapper.text()).toContain('Mio');
  });

});

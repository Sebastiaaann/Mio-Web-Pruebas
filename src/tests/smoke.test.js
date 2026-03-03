import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createWebHistory } from 'vue-router'; // Mock router needed usually

// Components to test
import HomeView from '@/views/inicio/HomeView.vue';

describe('Smoke Tests - Vistas Principales', () => {

  it('HomeView se monta correctamente', async () => {
    // Mock Router
    const router = createRouter({
        history: createWebHistory(),
        routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
    });

    const wrapper = mount(HomeView, {
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
  });

});

// stores/userStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} nombre
 * @property {string} apellido
 * @property {string} email
 * @property {string} avatar
 */

export const useUserStore = defineStore('user', () => {
    // State
    /** @type {import('vue').Ref<User|null>} */
    const user = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Getters
    const isAuthenticated = computed(() => !!user.value)
    const fullName = computed(() =>
        user.value ? `${user.value.nombre} ${user.value.apellido}` : ''
    )
    const firstName = computed(() => user.value?.nombre || 'Usuario')

    // Actions

    /**
     * Iniciar sesión con credenciales
     * @param {string} email
     * @param {string} password
     */
    async function login(email, password) {
        loading.value = true
        error.value = null

        try {
            // Simular llamada a API
            await new Promise(resolve => setTimeout(resolve, 800))

            // Mock user data
            user.value = {
                id: '1',
                nombre: 'Sebastián',
                apellido: 'García',
                email: email,
                avatar: null
            }

            if (import.meta.env.DEV) {
                // console.log('✅ Login exitoso:', user.value)
            }
            return { success: true }
        } catch (e) {
            error.value = e.message
            if (import.meta.env.DEV) {
                console.error('❌ Error en login:', e)
            }
            return { success: false, error: e.message }
        } finally {
            loading.value = false
        }
    }

    /**
     * Cerrar sesión del usuario
     */
    function logout() {
        user.value = null
        if (import.meta.env.DEV) {
            console.log('👋 Sesión cerrada')
        }
    }

    /**
     * Actualizar datos del perfil
     * @param {Partial<User>} updates
     */
    async function updateProfile(updates) {
        if (!user.value) return { success: false, error: 'No hay usuario autenticado' }

        loading.value = true
        try {
            // Simular actualización
            await new Promise(resolve => setTimeout(resolve, 500))
            user.value = { ...user.value, ...updates }
            if (import.meta.env.DEV) {
                console.log('✅ Perfil actualizado:', user.value)
            }
            return { success: true }
        } catch (e) {
            error.value = e.message
            return { success: false, error: e.message }
        } finally {
            loading.value = false
        }
    }

    /**
     * Simular auto-login para desarrollo
     */
    function mockLogin() {
        user.value = {
            id: '1',
            nombre: 'Sebastián',
            apellido: 'García',
            email: 'sebastian@mio.cl',
            avatar: null
        }
    }

    return {
        // State
        user,
        loading,
        error,
        // Getters
        isAuthenticated,
        fullName,
        firstName,
        // Actions
        login,
        logout,
        updateProfile,
        mockLogin
    }
})

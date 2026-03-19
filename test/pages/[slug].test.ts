import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

// Mock useHead globally before importing the component
const useHeadMock = vi.fn()
vi.stubGlobal('useHead', useHeadMock)

// Import the component
import ArtistPage from '../../app/pages/[slug].vue'

describe('ArtistPage', () => {
  it('renders artist components', async () => {
    // Create a mock router
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/:slug', component: ArtistPage, name: 'artist-page' }
      ]
    })

    // Navigate to the test route first
    await router.push('/test-artist')
    await router.isReady()

    // Create a wrapper component with Suspense
    const TestWrapper = {
      template: `
        <Suspense>
          <template #default>
            <ArtistPage />
          </template>
          <template #fallback>
            <div>Loading...</div>
          </template>
        </Suspense>
      `,
      components: { ArtistPage }
    }

    // Mount the wrapper component with the router
    const wrapper = mount(TestWrapper, {
      global: {
        plugins: [router]
      }
    })

    // Wait for async setup to complete
    await flushPromises()

    expect(wrapper.text()).toContain('Test Artist')
  })
})

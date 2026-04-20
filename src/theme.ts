import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  globalCss: {
    'html, body': {
      fontFamily: `'Inter', 'Segoe UI', system-ui, sans-serif`,
      letterSpacing: '-0.01em',
    },
  },
  theme: {
    tokens: {
      radii: {
        xl: { value: '16px' },
      },
      shadows: {
        md: { value: '0 10px 30px rgba(15, 23, 42, 0.08)' },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)

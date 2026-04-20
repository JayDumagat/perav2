import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  globalCss: {
    'html, body': {
      fontFamily: `'Inter', 'Segoe UI', system-ui, sans-serif`,
      letterSpacing: '-0.01em',
    },
  },
})

export const system = createSystem(defaultConfig, config)

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  safelist: [
    'bg-blue-300',
    'bg-green-300',
    'bg-yellow-500',
    'bg-pink-500',
  ],
  plugins: [],
}

export default config

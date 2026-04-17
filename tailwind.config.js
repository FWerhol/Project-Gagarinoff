/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,pug}"],
  safelist: [
    // Grid-классы
    'grid',
    'grid-cols-1',
    'sm:grid-cols-2',
    'lg:grid-cols-3',
    'gap-8',
    'sm:flex-row',
    'sm:gap-4',
    // Flex-классы (на всякий случай)
    'flex', 'flex-wrap', 'justify-center', 'items-center',
    // Классы ширины
    'w-full', 'sm:w-[280px]', 'lg:w-[300px]',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0A',
        'bg-secondary': '#1E293B',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'accent': '#34D399',
        'border': '#334155',
      }
    },
  },
  plugins: [],
}
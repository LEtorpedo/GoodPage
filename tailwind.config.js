/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // 确保扫描 app 目录
    ],
    theme: {
      extend: {
        // 可以在这里扩展主题，例如添加自定义颜色、字体等
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic':
            'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
        colors: {
          'theme-page': 'var(--color-theme-page)',
          'theme-header': 'var(--color-theme-header)',
          'theme-header-light': 'var(--color-theme-header-light)',
          'theme-light': 'var(--color-theme-light)',
          'theme-primary': 'var(--color-theme-primary)',
          'theme-secondary': 'var(--color-theme-secondary)',
          'theme-muted': 'var(--color-theme-muted)',
          'theme-dark': 'var(--color-theme-dark)',
          'theme': 'var(--color-theme)',
        },
      },
    },
    plugins: [],
  };
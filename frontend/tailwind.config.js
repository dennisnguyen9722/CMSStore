/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,js,ts,jsx,tsx}", // Chỉnh sửa đường dẫn tùy theo cấu trúc thư mục của bạn
    ],
    theme: {
      extend: {},
    },
    plugins: [require('@tailwindcss/line-clamp')],
  }
  
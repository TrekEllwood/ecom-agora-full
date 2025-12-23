export const API_BASE =
  import.meta.env.DEV
    ? '/api' // Vite proxy in dev
    : 'http://localhost/ecom-api/routes'
    // : 'https://yourdomain.com/ecom-api/routes' // production backend

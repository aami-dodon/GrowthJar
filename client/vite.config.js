import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const childName = env.VITE_CHILD_NAME && env.VITE_CHILD_NAME.trim().length > 0 ? env.VITE_CHILD_NAME : 'Child'

  Object.assign(process.env, {
    ...env,
    VITE_CHILD_NAME: childName,
  })

  return {
    plugins: [react()],
  }
})

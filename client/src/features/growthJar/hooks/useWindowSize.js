import { useEffect, useState } from 'react'

const defaultSize = { width: 0, height: 0 }

const useWindowSize = () => {
  const [size, setSize] = useState(() => {
    if (typeof window === 'undefined') return defaultSize
    return { width: window.innerWidth, height: window.innerHeight }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

export default useWindowSize

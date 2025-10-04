import Confetti from 'react-confetti'
import { useEffect } from 'react'
import useWindowSize from '../hooks/useWindowSize'
import { useEntriesContext } from '../context/EntriesContext'
import { ENTRY_TYPES } from '../utils/entryUtils'

const CelebrationOverlay = () => {
  const { showCelebration, dismissCelebration, stats } = useEntriesContext()
  const { width, height } = useWindowSize()

  useEffect(() => {
    if (!showCelebration) return undefined
    const timeout = setTimeout(() => {
      dismissCelebration()
    }, 2800)
    return () => clearTimeout(timeout)
  }, [showCelebration, dismissCelebration])

  if (!showCelebration) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      <Confetti width={width} height={height} numberOfPieces={250} gravity={0.3} recycle={false} />
      <div className="pointer-events-auto rounded-3xl bg-white/90 px-6 py-4 text-center shadow-2xl">
        <p className="font-display text-2xl text-leaf-600">Weekly Reflection Unlocked!</p>
        <p className="mt-1 text-sm text-slate-600">
          Rishi received {stats.counts[ENTRY_TYPES.GOOD_THING]} celebrations and {stats.counts[ENTRY_TYPES.GRATITUDE]} gratitude
          notes this week. 🥳
        </p>
      </div>
    </div>
  )
}

export default CelebrationOverlay

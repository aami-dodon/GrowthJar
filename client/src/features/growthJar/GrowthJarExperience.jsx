import CelebrationOverlay from './components/CelebrationOverlay'
import DailyEntryForms from './components/DailyEntryForms'
import BetterChoiceSection from './components/BetterChoiceSection'
import ExportPanel from './components/ExportPanel'
import HeroSection from './components/HeroSection'
import JarShowcase from './components/JarShowcase'
import NotificationPanel from './components/NotificationPanel'
import WeeklyReflection from './components/WeeklyReflection'

const GrowthJarExperience = () => {
  return (
    <main id="growth-jar-main" className="relative pb-24">
      <HeroSection />
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-12 sm:px-6 lg:px-8">
        <CelebrationOverlay />
        <DailyEntryForms />
        <BetterChoiceSection />
        <JarShowcase />
        <WeeklyReflection />
        <div className="grid gap-8 lg:grid-cols-2">
          <NotificationPanel />
          <ExportPanel />
        </div>
      </div>
    </main>
  )
}

export default GrowthJarExperience

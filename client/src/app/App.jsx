import GrowthJarExperience from '../features/growthJar/GrowthJarExperience'
import { EntriesProvider } from '../features/growthJar/context/EntriesContext'

const App = () => (
  <EntriesProvider>
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/60 to-leaf-50/70">
      <a
        href="#growth-jar-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-500"
      >
        Skip to content
      </a>
      <GrowthJarExperience />
    </div>
  </EntriesProvider>
)

export default App

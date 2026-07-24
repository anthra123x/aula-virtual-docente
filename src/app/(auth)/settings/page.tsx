import { requireAuth } from '@/modules/auth/auth.actions'
import { getUserSettings } from '@/modules/settings/settings.actions'
import { ProfileSection } from './_components/profile-section'
import { AppearanceSection } from './_components/appearance-section'
import { AcademicSection } from './_components/academic-section'
import { SystemSection } from './_components/system-section'

export default async function SettingsPage() {
  const user = await requireAuth()
  const settingsResult = await getUserSettings()
  const settings = settingsResult.success ? settingsResult.data : {}

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground">Personaliza tu experiencia en AulaDocente</p>
      </div>

      <div className="grid gap-6">
        <ProfileSection user={user} />

        <AppearanceSection
          currentAccent={settings.accentColor || '#3B82F6'}
        />

        <AcademicSection
          schoolName={settings.schoolName || ''}
          defaultYear={settings.defaultYear || String(new Date().getFullYear())}
          dateFormat={settings.dateFormat || 'DD/MM/YYYY'}
        />

        <SystemSection />
      </div>
    </div>
  )
}

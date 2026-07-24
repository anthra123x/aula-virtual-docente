export type SettingsMap = Record<string, string>

export const SETTING_KEYS = {
  THEME: 'theme',
  ACCENT_COLOR: 'accentColor',
  SCHOOL_NAME: 'schoolName',
  DATE_FORMAT: 'dateFormat',
  DEFAULT_YEAR: 'defaultYear',
} as const

export const SETTING_DEFAULTS: SettingsMap = {
  [SETTING_KEYS.THEME]: 'system',
  [SETTING_KEYS.ACCENT_COLOR]: '#3B82F6',
  [SETTING_KEYS.SCHOOL_NAME]: '',
  [SETTING_KEYS.DATE_FORMAT]: 'DD/MM/YYYY',
  [SETTING_KEYS.DEFAULT_YEAR]: String(new Date().getFullYear()),
}

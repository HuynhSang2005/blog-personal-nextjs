import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type {
  CodeTheme,
  LocalCodeThemes,
  CodeThemeLanguage,
} from '@/lib/core/types/code-theme'

import { codeThemeConfig, localCodeThemes } from '../../../config/code-theme'
import { toKebabCase } from './to-kebab-case'

export function getContentLayerCodeTheme() {
  const themeName = codeThemeConfig.theme

  if (localCodeThemes.includes(themeName as LocalCodeThemes[number])) {
    return JSON.parse(
      readFileSync(
        resolve(
          `./src/styles/themes/syntax-highlight/${toKebabCase(themeName)}.json`
        ),
        'utf-8'
      )
    )
  }

  return codeThemeConfig.theme
}

// Simplified highlighter for migration - uses basic HTML escaping
// TODO: Re-enable shiki highlighter after fixing Turbopack compatibility
export async function highlightServerCode(
  code: string,
  _theme: CodeTheme = codeThemeConfig.theme,
  _language: CodeThemeLanguage = 'typescript'
) {
  // Basic HTML escaping for now
  const escapedCode = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  return `<code>${escapedCode}</code>`
}

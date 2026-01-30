'use client'

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

type VortexProps = ComponentProps<typeof import('./ui/vortex').default>

export const Vortex = dynamic(() => import('./ui/vortex'), {
  ssr: false,
}) as React.ComponentType<VortexProps>

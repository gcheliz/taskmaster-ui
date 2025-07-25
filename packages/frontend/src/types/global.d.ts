// Global type definitions for TaskMaster UI

// Extend Window interface
declare global {
  interface Window {
    __TASKMASTER_VERSION__: string
    __TASKMASTER_ENV__: 'development' | 'production' | 'test'
  }
}

// Module declarations
declare module '*.svg' {
  import * as React from 'react'
  export const ReactComponent: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement
  const src: string
  export default src
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

// CSS Module declarations
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

// Environment variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_GA_TRACKING_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export {}

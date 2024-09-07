declare module 'https://esm.sh/preact' {
  export * from 'preact'
}

declare module 'https://esm.sh/preact/hooks' {
  export * from 'preact/hooks'
}

declare module 'https://esm.sh/@preact/signals' {
  export * from '@preact/signals'
}

declare module 'https://esm.sh/htm' {
  const htm: (strings: TemplateStringsArray, ...values: any[]) => any
  export default htm
}

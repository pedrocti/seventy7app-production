/// <reference types="vite/client" />

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

// Optional — if you use other formats
declare module '*.webp' {
  const src: string;
  export default src;
}
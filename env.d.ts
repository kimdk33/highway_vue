/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare const kakao: {
  maps: {
    LatLng: new (lat: number, lng: number) => object
    Map: new (container: HTMLElement, options: object) => object
    Marker: new (options: object) => object
    MarkerImage: new (src: string, size: object) => object
    Size: new (width: number, height: number) => object
  }
}

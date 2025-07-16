// Type declarations for Three.js examples modules
declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher } from 'three';
  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);
    [key: string]: any;
  }
}

declare module 'three/examples/jsm/loaders/OBJLoader' {
  import { Object3D } from 'three';
  export class OBJLoader {
    constructor(manager?: any);
    setMaterials(materials: any): this;
    load(url: string, onLoad: (object: Object3D) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    [key: string]: any;
  }
}

declare module 'three/examples/jsm/loaders/MTLLoader' {
  export class MTLLoader {
    constructor(manager?: any);
    load(url: string, onLoad: (materials: any) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    [key: string]: any;
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  export class GLTFLoader {
    constructor(manager?: any);
    load(url: string, onLoad: (gltf: any) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    [key: string]: any;
  }
}

declare module 'three/examples/jsm/libs/lil-gui.module.min.js' {
  export class GUI {
    constructor(options?: any);
    addFolder(name: string): any;
    [key: string]: any;
  }
}

// Google Maps API type declarations
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, options: any);
      setCenter(latLng: any): void;
      addListener(eventName: string, handler: Function): void;
      [key: string]: any;
    }

    class Marker {
      constructor(options: any);
      setPosition(latLng: any): void;
      addListener(eventName: string, handler: Function): void;
      [key: string]: any;
    }

    class Geocoder {
      constructor();
      geocode(request: any, callback: Function): void;
      [key: string]: any;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface MapMouseEvent {
      latLng: LatLng;
    }
  }
}

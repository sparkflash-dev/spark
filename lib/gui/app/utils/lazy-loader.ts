/**
 * Lazy loading utilities — defer loading heavy modules until needed.
 */

type LazyModule<T> = {
  get(): T;
  isLoaded(): boolean;
  preload(): Promise<T>;
};

export function lazy<T>(factory: () => T): LazyModule<T> {
  let instance: T | undefined;
  let loaded = false;

  return {
    get(): T {
      if (!loaded) {
        instance = factory();
        loaded = true;
      }
      return instance!;
    },
    isLoaded(): boolean {
      return loaded;
    },
    async preload(): Promise<T> {
      return this.get();
    },
  };
}

export function lazyAsync<T>(factory: () => Promise<T>): {
  get(): Promise<T>;
  isLoaded(): boolean;
} {
  let instance: T | undefined;
  let loading: Promise<T> | undefined;
  let loaded = false;

  return {
    async get(): Promise<T> {
      if (loaded) return instance!;
      if (loading) return loading;
      loading = factory().then((result) => {
        instance = result;
        loaded = true;
        return result;
      });
      return loading;
    },
    isLoaded(): boolean {
      return loaded;
    },
  };
}

export const LAZY_MODULES = {
  'etcher-sdk': 'etcher-sdk',
  'sharp': 'sharp',
  'archiver': 'archiver',
  'node-usb': 'usb',
} as const;

export function getPreloadPriority(): string[] {
  return [
    'etcher-sdk',   // Always needed for flash
    'node-usb',     // Needed for drive scanning
  ];
}

export function getOnDemandModules(): string[] {
  return [
    'sharp',        // Only for image thumbnails
    'archiver',     // Only for backup compression
  ];
}

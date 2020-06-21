declare module '@callstack/async-storage' {
  namespace AsyncStorage {
    export type Callback<T = string | number | boolean> = (
      err: Error,
      value: T
    ) => any;
  }

  class AsyncStorage {
    static clear(): Promise<void>;
    static getAllKeys(cb?: AsyncStorage.Callback<string[]>): Promise<string[]>;
    static getItem<T = string | number | boolean>(
      key: string,
      cb?: AsyncStorage.Callback<T>
    ): Promise<T>;
    static removeItem(
      key: string,
      cb?: AsyncStorage.Callback<void>
    ): Promise<void>;
    static setItem<T = string | number | boolean>(
      key: string,
      value: T,
      cb?: AsyncStorage.Callback<T>
    ): Promise<void>;
  }
  export = AsyncStorage;
}

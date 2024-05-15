interface String {
  format(obj: object): string;
}

interface Map<K, V> {
  find(fn: (value: V, key: K, collection: this) => boolean): V | undefined;
}

interface Array {
  random(): any;
}

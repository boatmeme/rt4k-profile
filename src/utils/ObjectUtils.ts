export function isObject(item: unknown): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function deepMerge<T>(target: Partial<T>, ...sources: Partial<T>[]): T {
  if (!sources.length) return target as T;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as Partial<T>, source[key] as Partial<T>);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

export function addValueToObject<T>(obj: Record<string, unknown>, keys: string[], value: T): void {
  const key = keys[0];
  if (keys.length === 1) {
    obj[key] = value;
  } else {
    if (!obj[key]) {
      obj[key] = {};
    }
    addValueToObject(obj[key] as Record<string, unknown>, keys.slice(1), value);
  }
}

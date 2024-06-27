import { Primitive } from '../settings/Schema';

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

type NestedObject = {
  [key: string]: Primitive | NestedObject;
};

type FlattenedPair = {
  name: string;
  value: Primitive;
};

export function flattenObject<T extends NestedObject>(obj: T, parentKey: string = ''): FlattenedPair[] {
  let result: FlattenedPair[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (Array.isArray(value)) {
        throw new Error(`There are no array values in any settings. Found array at key: ${fullKey}`);
      } else if (typeof value === 'object' && value !== null) {
        // If it's a nested object, recurse
        result = result.concat(flattenObject(value, fullKey));
      } else {
        // If it's a primitive (string, number, or boolean), add it to the result
        result.push({ name: fullKey, value: value as Primitive });
      }
    }
  }

  return result;
}

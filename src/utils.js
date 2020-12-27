export function isObject(o) {
  return typeof o === "object" && o !== null;
}

export function isFunction(o) {
  return o && typeof o === "function";
}

export function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key];
    },
    set(newValue) {
      vm[source][key] = newValue;
    },
  });
}

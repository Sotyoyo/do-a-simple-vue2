export function isObject(o) {
  return typeof o === "object" && o !== null;
}

export function isFunction(o) {
  return o && typeof o === "function";
}

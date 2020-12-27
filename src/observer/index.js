import { isObject } from "../utils";
import { arrayMethods } from "./array";

class Observer {
  constructor(value) {
    Object.defineProperty(value, "__ob__", {
      configurable: false,
      enumerable: false,
      value: this,
    });
    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods;
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  walk(data) {
    let keys = Object.keys(data);

    keys.forEach((key) => {
      let value = data[key];
      defineReactive(data, key, value);
    });
  }

  observeArray(data) {
    data.forEach((item) => {
      observe(item);
    });
  }
}

// vue2会对对象进行遍历 每一个属性都用defineProperty重新定义 所以性能差
// 新增的属性检测不到 需要$set
function defineReactive(data, key, value) {
  observe(value);
  Object.defineProperty(data, key, {
    get() {
      return value;
    },
    set(newValue) {
      if (newValue === value) {
        return;
      }
      console.log(`- ${key} changed from ${value} to ${newValue}`);
      if (isObject(newValue)) {
        observe(newValue);
      }

      value = newValue;
    },
  });
}

export function observe(data) {
  if (!isObject(data) || data.__ob__) {
    return;
  }

  new Observer(data);
}

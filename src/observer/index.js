import { isObject } from "../utils";
import { arrayMethods } from "./array";
import Dep from "./dep";

class Observer {
  constructor(value) {
    this.dep = new Dep(); // 数据可能是数组或者对象

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

function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    let current = value[i]; // current是数组里面的数组 [[[[[]]]]]
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}

// vue2会对对象进行遍历 每一个属性都用defineProperty重新定义 所以性能差
// 新增的属性检测不到 需要$set
function defineReactive(data, key, value) {
  let dep = new Dep(); // 每个属性都有一个dep属性
  let childOb = observe(value); // 如果value是对象或者数组才会有值

  Object.defineProperty(data, key, {
    get() {
      // console.log(`- key ${key} hit in get`);
      if (Dep.target) {
        dep.depend(); // 让dep记住watcher
        if (childOb) {
          childOb.dep.depend(); // 就是让数组和对象也记录watcher，最后走到的其实是Observer类里面的那个dep
          if (Array.isArray(value)) {
            //取外层数组要将数组里面的也进行依赖收集
            dependArray(value);
          }
        }
      }
      return value;
    },
    set(newValue) {
      if (newValue === value) {
        return;
      }

      observe(newValue);
      value = newValue;
      dep.notify(); // 告诉当前的属性存放的watcher执行
    },
  });
}

export function observe(data) {
  if (!isObject(data) || data.__ob__) {
    return;
  }

  return new Observer(data);
}

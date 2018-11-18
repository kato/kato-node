const debug = require('debug')('kato:core:module');

//模块容器
export class ModuleContainer {
  load(moduleClass: any) {
    if (typeof moduleClass !== 'function') {
      debug(`企图加载一个${typeof moduleClass}被阻止`);
      throw new Error('kato:只有类才能被加载')
    }

    //模块名
    let moduleName = moduleClass.__alias || moduleClass.name;

    //获取类中的所有属性
    let props = [];
    let instance = new moduleClass();
    let tempInstance = instance;
    do {
      //遍历获取所有的属性名
      if (tempInstance.isPrototypeOf(Object))
        continue;
      props = props.concat(Object.getOwnPropertyNames(tempInstance));
    } while (tempInstance = Object.getPrototypeOf(tempInstance));

    //获取到所有的成员函数包括继承来的
    let methodNames = props
      .filter(it => typeof instance[it] === 'function') //必须是函数
      .filter(it => ![
        'constructor',
        // '__defineGetter__',
        // '__defineSetter__',
        // '__lookupGetter__',
        // '__lookupSetter__',
        'isPrototypeOf',
        'hasOwnProperty',
        'propertyIsEnumerable',
        // 'toString',
        // 'valueOf',
        // 'toLocaleString'
      ].includes(it)) //过滤掉Object或者Function上的内置函数
      .filter(it => !it.startsWith('_'))  //过滤掉_开头的函数
      .filter((it, index, arr) => arr.indexOf(it) === index); //去重

    //TODO:核心代码明天实现

    debug(`模块${moduleName}加载完成\n函数${methodNames.length}个 => [${methodNames.join(',')}]`)
  }
}

//别名注解
export function alias(name) {
  if (name) {
    return function (object, key) {
      let target = object;
      if (key)
        target = object[key];

      if (typeof target !== 'function') {
        throw new Error('kato:alias只能作用于类及其方法上')
      }
      target.__alias = name;
    }
  }
  else
    throw new Error("kato:名称不能为空");
}

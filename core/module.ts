const debug = require('debug')('kato:core:module');

export class ModuleDescriptor {
  //模块名
  name: string;

  methods: Map<string, MethodDescriptor>;

  constructor(public module) {
    this.name = module.__alias || module.name;
    if (!this.name)
      throw new Error("kato:模块类不能是匿名类");

    //开始填充函数
    this.methods = new Map<string, MethodDescriptor>();

    //获取类中的所有属性
    let props = [];
    let instance = new module();
    let tempInstance = instance;
    do {
      //遍历获取所有的属性名
      if (tempInstance.isPrototypeOf(Object))
        continue;
      props = props.concat(Object.getOwnPropertyNames(tempInstance));
    } while (tempInstance = Object.getPrototypeOf(tempInstance));

    //获取到所有的成员函数包括继承来的,并解析成为MethodDescriptor
    props
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
      .filter((it, index, arr) => arr.indexOf(it) === index) //去重
      .forEach(it => {
        let method = new MethodDescriptor(instance[it], module);
        this.methods.set(method.name, method);
      })
  }
}

export class MethodDescriptor {
  //方法名
  name: string;

  constructor(public method: Function | any, public parent: ModuleDescriptor) {
    this.name = method.__alias || method.name;
    if (!this.name)
      throw new Error("kato:不允许有匿名方法");
  }
}

//模块容器
export class ModuleContainer extends Map<string, ModuleDescriptor> {
  constructor() {
    super()
  }

  load(moduleClass: any) {
    if (typeof moduleClass !== 'function') {
      debug(`企图加载一个${typeof moduleClass}被阻止`);
      throw new Error('kato:只有类才能被加载')
    }

    //解析模块为模块描述,并添加到容器中
    let module = new ModuleDescriptor(moduleClass);
    this.set(module.name, module);

    //输出模块概要信息
    let methodNames = [];
    for (let methodName of module.methods.keys()) {
      methodNames.push(methodName)
    }
    debug(`模块${module.name}加载完成\n函数${module.methods.size}个 => [${methodNames.join(',')}]`)
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

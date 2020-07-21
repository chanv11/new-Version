// 深拷贝 浅拷贝 + 递归

function cloneDeep(source, hash = new WeakMap()) {
    function isObject(obj) {
        return typeof obj === 'object' && obj != null
    }
    //入参校验
    if(!isObject(source)) {   
        return source
    }
    // 检验哈希
    if(hash.has(source)) {   
        return hash.get(source)
    }
     // 考虑数组的兼容
    var target = Array.isArray(source) ? [] : {}
    // 设置哈希
    hash.set(source, target); 
    // 优先考虑 symbol()
    let symKeys = Object.getOwnPropertySymbols(source)
    if (symKeys.length) {
        if (isObject(source[symKey])) {
            target[symKey] = cloneDeep(source[symKey], hash); 
        } else {
            target[symKey] = source[symKey];
        }  
    }
    // =============
    for(key in source) {
        if(Object.prototype.hasOwnProperty.call(source, key)) {
            if(isObject(source[key])) {
                target[key] = cloneDeep(source[key], hash)
            } else {
                target[key] = source[key]
            }
        }
    }
    return target
}

// new

function create() {
    // 创建一个空的对象
    let obj = new Object()
    // 获得构造函数
    let Con = [].shift.call(arguments)
    // 链接到原型
    obj.__proto__ = Con.prototype
    // 绑定 this，执行构造函数
    let result = Con.apply(obj, arguments)
    // 确保 new 出来的是个对象
    return typeof result === 'object' ? result : obj
}

// call

Function.prototype.call = function(context) {
    context = context ? Object(context) : window
    context.fn = this
    let args = [...arguments].slice(1)
    let result = context.fn(...args)
    delete context.fn
    return result;
}

// apply

Function.prototype.apply = function(context, arr) {
    context = context ? Object(context) : window
    context.fn = this
    let result = null
    if(!arr) {
        result = context.fn()
    }else {
        result = context.fn(...arr)
    }
    delete context.fn
    return result;
}

// bind
Function.prototype.bind = function(context) {
    var self = this
    args = Array.prototype.slice.call(arguments);
    return function() {
        return self.apply(context, args.slice(1));
    }
}

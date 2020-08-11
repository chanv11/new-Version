// 深拷贝 浅拷贝 + 递归

function cloneDeep(source, hash = new WeakMap()) {
    function isObject(obj) {
        return typeof obj === 'object' && obj != null
    }
    //入参校验
    if (!isObject(source)) {
        return source
    }
    // 检验哈希
    if (hash.has(source)) {
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
    for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (isObject(source[key])) {
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

Function.prototype.call = function (context) {
    context = context ? Object(context) : window
    context.fn = this
    let args = [...arguments].slice(1)
    let result = context.fn(...args)
    delete context.fn
    return result;
}

// apply

Function.prototype.apply = function (context, arr) {
    context = context ? Object(context) : window
    context.fn = this
    let result = null
    if (!arr) {
        result = context.fn()
    } else {
        result = context.fn(...arr)
    }
    delete context.fn
    return result;
}

// bind

Function.prototype.bind = function (context) {
    var self = this
    args = Array.prototype.slice.call(arguments);
    return function () {
        return self.apply(context, args.slice(1));
    }
}

// instaceof

function instaceof(left, right) {
    let proptype = right.proptype
    let left = left.__proto__
    while (true) {
        if (left === null) {
            return false
        }
        if (left === proptype) {
            return true
        }
        left = left.__proto__
    }
}

// 防抖 多次高频操作优化为只在最后一次执行

function debounce(fn, wait, immediate) {
    let timer = null
    return function () {
        if (!timer && immediate) {
            fn.apply(this, arguments)
        }
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            fn.apply(this, arguments)
        }, wait)
    }
}

// 节流 每隔一段时间后执行一次

function throttle(fn, wait, immediate) {
    let timer = null
    let _immediate = immediate
    return function () {
        if (_immediate) {
            fn.apply(this, arguments)
            _immediate = false
        }
        if (!timer) {
            timer = setTimeout(() => {
                fn.apply(this, arguments)
                timer = null
            }, wait)
        }
    }
}

// Promise
// 如果可选参数不为函数时应该被忽略
// 当调用 onFulfilled 函数时，会将当前 Promise 的值作为参数传入
// 当调用 onRejected 函数时，会将当前 Promise 的失败原因作为参数传入
// then 函数的返回值为 Promise
// 三种状态
// 情况 1： x 等于 promise： 抛出一个 TypeError 错误，拒绝 promise
// 情况 2：x 为 Promise 的实例 如果 x 处于等待状态，那么 promise 继续等待至 x 执行或拒绝，否则根据 x 的状态执行/拒绝 promise。
// 情况 3：x 为对象或函数：该情况的核心是取出 x.then 并调用，在调用的时候将 this 指向 x。将 then 回调函数中得到结果 y 传入新的 Promise 解决过程中，形成一个递归调用。其中，如果执行报错，则以对应的错误为原因拒绝 promise
// 情况 4：如果 x 不为对象或函数: 以 x 作为值，执行 promise
var PENDING = 'pending'
var FULFILLED = 'fulfilled'
var REJECTED = 'rejected'

function Promise(execute) {
    var self = this;
    self.state = PENDING;
    self.onFulfilledFn = [];
    self.onRejectedFn = [];

    function resolve(value) {
        setTimeout(function () {
            if (self.state === PENDING) {
                self.state = FULFILLED;
                self.value = value;
                self.onFulfilledFn.forEach(function (f) {
                    f(self.value);
                })
            }
        })
    }

    function reject(reason) {
        setTimeout(function () {
            if (self.state === PENDING) {
                self.state = REJECTED;
                self.reason = reason;
                self.onRejectedFn.forEach(function (f) {
                    f(self.reason);
                })
            }
        })
    }
    try {
        execute(resolve, reject);
    } catch (e) {
        reject(e);
    }
}
Promise.prototype.then = function (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : function (x) {
        return x
    };
    onRejected = typeof onRejected === "function" ? onRejected : function (e) {
        throw e
    };
    var self = this;
    var promise;
    switch (self.state) {
        case FULFILLED:
            promise = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        var x = onFulfilled(self.value);
                        resolvePromise(promise, x, resolve, reject);
                    } catch (reason) {
                        reject(reason)
                    }
                })
            });
            break;
        case REJECTED:
            promise = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    try {
                        var x = onRejected(self.reason);
                        resolvePromise(promise, x, resolve, reject);
                    } catch (reason) {
                        reject(reason)
                    }
                })
            });
            break;
        case PENDING:
            promise = new Promise(function (resolve, reject) {
                self.onFulfilledFn.push(function () {
                    try {
                        var x = onFulfilled(self.value);
                        resolvePromise(promise, x, resolve, reject);
                    } catch (reason) {
                        reject(reason)
                    }
                });
                self.onRejectedFn.push(function () {
                    try {
                        var x = onRejected(self.reason);
                        resolvePromise(promise, x, resolve, reject);
                    } catch (reason) {
                        reject(reason)
                    }
                })
            });
            break;
    }
    return promise;
}

function resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
        return reject(new TypeError("x 不能与 promise 相等"));
    }
    if (x instanceof Promise) {
        if (x.state === FULFILLED) {
            resolve(x.value)
        } else if (x.state === REJECTED) {
            reject(x.reason)
        } else {
            x.then(function (y) {
                resolvePromise(promise, y, resolve, reject)
            }, reject)
        }
    } else if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
        var executed;
        try {
            var then = x.then;
            if (typeof then === "function") {
                then.call(x, function (y) {
                    if (executed) return;
                    executed = true;
                    resolvePromise(promise, y, resolve, reject)
                }, function (e) {
                    if (executed) return;
                    executed = true;
                    reject(e);
                })
            } else {
                resolve(x);
            }
        } catch (e) {
            if (executed) return;
            executed = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}
/* 为了测试，导出模块 */
module.exports = {
    deferred() {
        var resolve, reject
        var promise = new Promise(function (res, rej) {
            resolve = res
            reject = rej
        })
        return {
            promise,
            resolve,
            reject
        }
    }
}
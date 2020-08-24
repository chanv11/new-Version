# Question

### 1.介绍下 Set、Map、WeakSet 和 WeakMap 的区别

   - Set 新增的一种新的数据结构，类似于数组，但成员是唯一且无序的，没有重复的值
      
      - 数组去重 `[... new Set(arr)]`
      - Set 实例属性
         - constructor： 构造函数
         - size：元素数量

      - Set 实例方法
          - add(value)：新增，相当于 array里的push
          - delete(value)：存在即删除集合中value
          - has(value)：判断集合中是否存在 value
          - clear()：清空集合
          - Array.from 方法可以将 Set 结构转为数组

   - WeakSet
     -  WeakSet 的成员只能是对象
      - WeakSet 对象允许你将弱引用对象储存在一个集合中
      - WeakSet 与 Set 的区别：

         - WeakSet 只能储存对象引用，不能存放值，而Set都可以
         - WeakSet 对象中储存的对象值都是被弱引用的，即垃圾回收机制不考虑 WeakSet 对该对象的应用
         - WeakSet 对象是无法被遍历的

   - Map

      - Map Set的区别

         - 共同点：集合、字典 可以储存不重复的值
         - 不同点：集合 是以 [value, value]的形式储存元素，字典 是以 [key, value] 的形式储存

   - WeakMap

      - 只接受对象作为键名（null除外），不接受其他类型的值作为键名
      - 键名是弱引用，键值可以是任意的，
      ，此时键名是无效的
      - 对象是无法被遍历的

### 2.判断数组的方法

   - `Array.isArray`
   - `instanceof`
   - `Object.proptype.toString.call`

### 3.下面代码输出什么

   - ```
        var a = 10;
        (function () {
            console.log(a)
            a = 5
            console.log(window.a)
            var a = 20;
            console.log(a)
        })()

        /// undefined -> 10 -> 20
     ```

### 4.输出以下代码的执行结果并解释为什么

   - ```
        var a = {n: 1};
        var b = a;
        a.x = a = {n: 2};

        console.log(a.x) 	
        console.log(b.x)
     ```

   - a和b同时引用了{n:2}对象，接着执行到a.x = a = {n：2}语句，尽管赋值是从右到左的没错，但是.的优先级比=要高，所以这里首先执行a.x，相当于为a（或者b）所指向的{n:1}对象新增了一个属性x，即此时对象将变为{n:1;x:undefined}。之后按正常情况，从右到左进行赋值，此时执行a ={n:2}的时候，a的引用改变，指向了新对象{n：2},而b依然指向的是旧对象。之后执行a.x = {n：2}的时候，并不会重新解析一遍a，而是沿用最初解析a.x时候的a，也即旧对象，故此时旧对象的x的值为{n：2}，旧对象为 {n:1;x:{n：2}}，它被b引用着。 后面输出a.x的时候，又要解析a了，此时的a是指向新对象的a，而这个新对象是没有x属性的，故访问时输出undefined；而访问b.x的时候，将输出旧对象的x的值，即{n:2}。

### 5.箭头函数与普通函数（function）的区别是什么

   - 函数体内的 this 对象，就是定义时所在的对象，而不是使用时所在的对象。
   - 不可以使用 arguments 对象，该对象在函数体内不存在
   - 不可以使用 yield 命令，因此箭头函数不能用作 Generator 函数。
   - 不可以使用 new 命令

### 6.数组里面有10万个数据，取第一个元素和第10万个元素的时间相差多少

   - 数组可以直接根据索引取的对应的元素，所以不管取哪个位置的元素的时间复杂度都是 O(1)

### 7.`isNaN`与`Number.isNaN`的区别
   - `Number.isNaN`与`isNaN`最的区别是，`Number.isNaN`不存在类型转换的行为
   - ```
        console.log(isNaN('测试')) //true
        console.log(Number.isNaN('测试')) //false
     ```

### 8.let, const, var 的区别
   - 声明过程
      - 遇到有`var`的作用域，在任何语句执行前都已经完成了声明和初始化
      - 发现`let`关键字，变量只是先完成声明，并没有到初始化那一步.等到解析到有let那一行的时候，才会进入初始化阶段。如果let的那一行是赋值操作，则初始化和赋值同时进行`const`、`class`都是同`let`一样的道理 

   - 内存分配
      - `var`会直接在栈内存里预分配内存空间，然后等到实际语句执行的时候，再存储对应的变量，如果传的是引用类型，那么会在堆内存里开辟一个内存空间存储实际内容，栈内存会存储一个指向堆内存的指针
      - `let`是不会在栈内存里预分配内存空间，而且在栈内存分配变量时，做一个检查，如果已经有相同变量名存在就会报错
      - `const`也不会预分配内存空间，在栈内存分配变量时也会做同样的检查。不过`const`存储的变量是不可修改的，对于基本类型来说你无法修改定义的值，对于引用类型来说你无法修改栈内存里分配的指针，但是你可以修改指针指向的对象里面的属性
   - 变量提升
      - `let`只是创建过程提升，初始化过程并没有提升，所以会产生暂时性死区
      - `var`的创建和初始化过程都提升了，所以在赋值前访问会得到undefined。function 的创建、初始化、赋值都被提升了

###  null undefined
   - null
      - 表示原型链的终点
      - 作为函数的参数，表示该函数的参数不是对象
   - undefined
      - 变量被声明了，但没有赋值时，就等于undefined
      - 函数没有返回值时，默认返回undefined
      - 调用函数时，应该提供的参数没有提供，该参数等于undefined
      - 对象没有赋值的属性，该属性的值为undefined 

### 移动端1px问题的解决办法
   - 原理是把原先元素的 border 去掉，然后利用 :before 或者 :after 重做 border ，并 transform 的 scale 缩小一半，原先的元素相对定位，新做的 border 绝对定位。

### promise和async await的区别
   - async await与Promise一样，是非阻塞的
   - Promise的出现解决了传统callback函数导致的“地域回调”问题，但它的语法导致了它向纵向发展行成了一个回调链，遇到复杂的业务场景，这样的语法显然也是不美观的。而async await代码看起来会简洁些，使得异步代码看起来像同步代码，await的本质是可以提供等同于”同步效果“的等待异步返回能力的语法糖，只有这一句代码执行完，才会执行下一句

###  使用import时，webpack对node_modules里的依赖会做什么
   - 当require/import 的模块不是核心模块，或./"这样的相对路径，就会从当前package的node_modules开始找，找不到就到当前package的上一层node_modules里找。。直到找到全局的node_modules。这样找到的是一个同名的文件夹，如果文件夹下有package.json,便根据main字段找到js文件

### Object.keys与for in遍历的区别
   - for in遍历对象所有可枚举属性 包括原型链上的属性
      - hasOwnProperty 检查对象是否包含属性名，无法检查原型链上是否具有此属性名
   - Object.keys遍历对象所有可枚举属性 不包括原型链上的属性

### 数组和类数组的区别
   - 不具有数组所具有的方法
   - 拥有length属性，其它属性（索引）为非负整数

### 常用git命令
   - git init
   - git add
   - git commit
   - git rm
   - git branch -r  // 查看远程分支
   - git git branch -a   // 查看所有分支
   - git checkout -b
   - git merge
   - git branch -d  // 删除分支
   - git push origin --delete [branch-name] // 删除远程分支
   - git reset --hard   // 重置暂存区与工作区，与上一次commit保持一致

### 对象函数的区别
   - 函数可以有参数，返回值
   - 函数有prototyp属性，对象有 ——proto_
   - 函数也属于对象

### 优化策略

   - css 文件<head>中引入， js 文件<body>底部引入
   - 减少请求 
   - 减少文件体积 `tree-shaking` `UglifyJs` `code-spliting`
   - 图片优化
   - 使用缓存



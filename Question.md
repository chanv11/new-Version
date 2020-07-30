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
      - 键名是弱引用，键值可以是任意的，键名所指向的对象可以被垃圾回收，此时键名是无效的
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

### 数组里面有10万个数据，取第一个元素和第10万个元素的时间相差多少

   - 数组可以直接根据索引取的对应的元素，所以不管取哪个位置的元素的时间复杂度都是 O(1)



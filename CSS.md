# CSS

### 1.盒模型

 页面渲染时，dom 元素所采用的布局模型。可通过box-sizing进行设置。根据计算宽高的区域可分为:
 - `content-box` (W3C 标准盒模型)
 - `border-box` (IE 标准盒模型)
 
#### 区别 border-box 宽高包括padding，border

### 2.BFC

   [BFC](https://zhuanlan.zhihu.com/p/25321647)
   
### 3.层叠上下文

   [层叠上下文](https://user-gold-cdn.xitu.io/2019/2/14/168e9d9f3a1d368b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 4.居中布局

- 水平居中
   - 行内元素：`text-align: center`
   - 块级元素：`margin: 0 auto` 需要固定宽高
   - `absolute + transform` 不需要固定宽高
   - `flex + justify-content: center`
- 垂直居中
   - line-height: height
   - absolute + transform
   - flex + align-items: center

### 5.选择器优先级

- `!important` > 行内样式 > `#id` > `.class` > `tag` > * > 继承 > 默认
- 选择器 **从右往左** 解析

### 6.去除浮动影响，防止父级高度塌陷

- 通过增加尾元素清除浮动
   - `:after / <br> : clear: both`
- 创建父级 BFC
- 父级设置高度

### 7.link 与 @import 的区别

- `link`是html标签，`import` 是css样式，功能是引入css样式
- 当解析到`link`时，页面会同步加载所引的 css，而`@import`所引用的 css 会等到页面加载完才被加载

### 8.CSS动画

[CSS动画](http://www.ruanyifeng.com/blog/2014/02/css_transition_and_animation.html)

   - transition
      - ```
         transition-property: height;
         transition-duration: 1s;
         transition-delay: 1s;
         transition-timing-function: ease;
        ```，
     - 局限
        - transition需要事件触发，所以没法在网页加载时自动发生
        - transition是一次性的，不能重复发生，除非一再触发
        - transition只能定义开始状态和结束状态，不能定义中间状态，也就是说只有两个状态

   - Animation
      - ```
         div:hover {
            animation-name: rainbow;
            animation-duration: 1s;
            animation-timing-function:linear; /// 变化速度
            animation-delay: 1s;
            animation-fill-mode:forwards;
            /// 让动画保持在结束状态
            /// backwards 回到第一帧
            animation-direction: normal; // 动画播放的方向
            animation-iteration-count: 3;
         }

         @keyframes rainbow {
            0% { background: #c00 }
            50% { background: orange }
            100% { background: yellowgreen }
         }
        ```
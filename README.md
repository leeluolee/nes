#nes
nes is a javascript selector lib with incredible scalability, but still very fast


## 1. API

标准API有:

  1. [__one__](#one) 
  2. [__all__](#all)
  3. [__matches__](#matches)

分别对应[JS selector level 2](http://www.w3.org/TR/selectors-api2/)的 __querySelector__、 __querySelectorAll__ 与 __matches__ (暂时浏览器还不支持)

<a name="one"></a>
### 1.1 nes.one(selector[, context])

返回 __第一个__匹配selector(在context的subtree中)的元素

<a name="all"></a>
### 1.2 nes.all(selector[, context])

返回 __所有__满足selector(在context的subtree中)的元素, __并按文档顺序排好__

__Arguments__

  * selector - 满足css选择器语法的字符串
  * context(optional) - context限定节点查找的范围(缺省为document)

__Example__

```javascript
nes.all("tr:nth-child(even) > td:nth-child(odd)") //-> 取得所有偶数列中奇数行
```

<a name="matches"></a>
### 1.3 nes.matches(node, selector)

判断节点node是否满足特定的选择器selector

__Arguments__

  * node - 目标节点
  * selector - 满足css选择器语法的字符串

__Example__

如利用事件代理时，你不需要再去调用标准dom方法去测试节点是否满足某种条件，直接使用matches进行判断

```javascript
container.addEventListener("click", function(e){
        if(nes.matches(e.target, ".signup a.top")){//直接利用选择器判断是否是注册表单下的置顶按钮
            //_onTop() ==> 处理逻辑
        }
    }
},false)
```
--------------------------------------------------------

## 2. 使用

### 下载

[nes.js](https://raw.github.com/leeluolee/nes/master/nes.js) —— 40K(完整源码注释, 请压缩... gzip+minify 约3~4k)



### 加载

1. 直接插入
```html
<script src="async.js"></script>
<script>
  nes.one(...) //直接注册在全局
</script>
```
2. NEJ 
```javascript
// 添加选择器适配模块({lib}util/query/query.js)的依赖, then
_v._$addEvent('#home > li', 'click', fn) 
// 具体请参考http://nej.netease.com
```
3. AMD
```javascript
define(['/path/to/nes'], function(nes){
    nes.all(...) // 方便
})
```

### 选择器支持度
移步[Wiki页](https://github.com/leeluolee/nes/wiki/Selector) 

--------------------------------------

## 3. 扩展

扩展是nes真正与众不同的部分到来, 使它即使在未来浏览器对querySelector API支持较好的情况下仍有存在价值。nes没有对规范外的选择器做支持, 而采用库外扩展的方式,部分扩展请参见[extend目录](https://github.com/leeluolee/nes/tree/master/extend)


下面会以 __场景描述__>__解决__ 的形式介绍这几种扩展,这些场景都是建立在即使浏览器已经实现了querySelector的前提下, 用来证明选择器扩展的价值所在

---------------------------------------------------------------

__选择器扩展分为4类__: 

1. 对伪类的扩展([pesudos](#pesudos))
2. 对属性的扩展([operators](#operators))
3. 对连接符的扩展([combos](#combos))
4. 通过修改parser直接创建与id、pesudos这些等价的Simple Selector([parser](#parser))

<a name="pesudos"></a>
### 伪类扩展 —— nes.pesudos(name, matcher)

__Arguments__

* name - 伪类名(类似selected、nth-child等)
* matcher(node, param) - 返回boolean值
  + node - ,当前匹配到的节点，matcher返回这个节点是否满足要求
  + param - 一个字符串代表匹配到的参数, 如nth-child(3)中的 3即为匹配到的参数

__场景描述__:

你需要获取所有的ul元素,这个元素中包含有满足(li.trigger a[href])的a标签

__原始做法__:
```javascript
var lists = document.querySelectorAll("ul")
for(var i = lists.length; i--;){
    var list = lists[i]
    if(!list.querySelectorAll("li.trigger a[href]")){
        lists.splice(i, 1)
    }
}
return lists
```
__理想做法__: 
```javascript
nes.all('ul:include(li.trigger a[href])')
```

__你需要做的扩展是__:
```javascript
// 其中node表示当前遍历到的节点, param代表pesudo的参数如本例的`li.trigger a[href]`
nes.pesudos("include", function(node, param){
  return !!nes.one( param, node) // 返回bool值证明这个节点是否满足条件
})
```
-----------------------------------------------------------

<a name="combos"></a>
###属性操作符扩展 —— nes.combos(String name, Function matcher)

* name - 伪类名(类似selected、nth-child等)
* matcher(Element node, String key, String value) - 返回boolean值判断这个节点是否满足要求, 参数有:
  + node - ,当前匹配到的节点
  + key - 代表匹配到的属性键, 如[title=haha] 的title
  + value = 代表匹配到的属性值, 如[title=haha] 的haha

__场景描述__

坑爹啊，标准selector竟然不提供__不等于__操作符的支持(!=),让我们用一行代码搞定它

__理想做法__
```javascript
nes.all('div[class!=made_up]')
```

__你需要做的扩展是__
```javascript
nes.operators("!=", function(node, key, value){
  return node.getAttribute(key) !== value
})
```
### 连接符扩展 —— nes.combos(String name,Function finder)
__注意:__combo的扩展与上面两个扩展都不同，因为它是连接符而不是前两个的Simple Selector，它传入的是finder函数，目的是找到你满足的节点

__场景描述__: 你需要获得 `ul.test li.trigger`节点 前的所有li节点(即连接符`~`的相反版)

__原生方法__: 

&$*@&*$&@(*$(*!)!)##!&$*^!@#$%^&*(*&^%$#@#$%^&*()(%$!@#$% (真的很烦，你们可以私下去尝试下)

__理想做法__: 
```
nes.all ('ul.test1 li.trigger & li') // =>向上第一个满足的兄弟节点
nes.all ('ul.test1 li.trigger + li') // =>上一个满足的直接兄弟节点
```
__你需要做的扩展是__:
```javascript
// 这里直接一起扩展了~、+的相反版
nes.combos({
  // 相当于 ~ 的相反版 , match是一个动态产生的方法，它代表这个节点，是否满足选择器条件，
  // nes在match里封装了所有的递归操作，你无需考虑复杂的选择器匹配
  // 但是你仍然要告诉nes，你要找的是哪个元素，比如~要做的是: 1)找到前面中的节点 2)
  // 这个节点满足剩余的选择器，你在扩展里需要描述清楚的就是这个匹配的节点
  "&":function(node,match){
    while(node = node.nextSibling){
      if(node.nodeType ===1 && match(node)){
        return node  // 如果节点是元素节点，并且满足match匹配规则
      }
    }
    return null //如果没有则返回null，此轮匹配结束
  },
// 与 + 相反
  "%":function(node,match){
    while(node = node.nextSibling){
      if(node.nodeType ===1) return match(node)? node :null
    }
  }
})
```
这样做是为了提供给开发者最大的自由度和最小的代码开销(匹配逻辑都封装在了match这个运行时差生的函数)

----------------------------------------------------------
<a name="parser"></a>
### 扩展内部parser —— nes.parser

nes在v0.05版本抽象出了parser部分，你可以通过parser来深层次的修改nes而不需要修改源代码, 具体请见[parser的WIKI页](https://github.com/leeluolee/nes/wiki/parser)


## 4. 测试

test case大部分来自Sizzle, 但是由于sizzle的设计并不是遵循规范的css selector 所以忽视部分在速度测试中sizzle不支持的选择器

### 速度测试

[sizzle目录](https://github.com/leeluolee/nes/tree/master/sizzle)剽窃了sizzle的速度测试用例，不能本地运行, 请祭起你的Server服务,推荐使用[puer](https://github.com/leeluolee/puer)

### 单元测试

[test目录](https://github.com/leeluolee/nes/tree/master/test)剽窃了Sizzle的test case (欠Sizzle的已然太多...)

-------------------------------------------------------

## 5. 贡献代码

Push前的 __注意点__:

1. 修改前开个 __Issues__讨论下总是好的

2. `docs`文件夹中我存放了注释详尽的docco文档，请先通览一次再进行有目的的修改

3. 提交前请确认单元测试在IE6+(各种壳)以及其它现代浏览器是跑通的

4. 对于Bug Fix 请先在测试的`index.html`尾部加入你的测试节点(id为 bug issues),千万不要删改其它test case的节点


## 6. 其它

### 感谢
Q.js、Sizzle、nwmatcher等前辈...还有百度UX那篇选择器扫盲贴。


### 几个可能会用到的配置属性

1. `nes.debug`: 不使用原生querySelector
2. `nes.nthCache.length` : 控制最大nth伪类参数的parse缓存，默认100

  
### changelog

1. v0.05 - 2013/1/4 抽象出了parser部分 
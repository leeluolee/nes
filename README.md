#nes
a javascript selector with incredible scalability, but still very fast


## Support

### 框架
  1. nes在[NEJ](https://github.com/NetEase/NEJ)目前是以匿名模块的方式，只要加载nej里的选择器适配模块`{lib}util/query/query.js`,就可以直接在nej中使用选择器如:
    ```
      _v._$addEvent('#abc','click',function)
    ```
    具体适配方式请参考[NEJ](http://nej.netease.com)
  2. amd
  3. commonjs
  4. 其他注册到全全局

### browser

  1. ie6+              
  2. 其他浏览器的最新版,即我没有测试chrome、opera的低版本

### selector

移步[Wiki页](https://github.com/leeluolee/nes/wiki/Selector) 简而言之，除了部分伪类、全部伪元素没有支持外，其余都支持(其实更多选择器的支持不难如果JS是可以实现的话，关键是整个流程的逻辑不要错)

### 速度测试

  1. 剽窃了sizzle的速度测试用例，直接在sizzle目录的speed里运行,貌似不能本地运行。推荐使用[puer](https://github.com/leeluolee/puer)工具可以帮助你在当前路径下建立一个自动刷新的静态服务器。速度被querySelectorAll秒杀，但是秒杀sizzle(当然Sizzle的关键是它的稳定性)。

  2. 由于这个测试用例貌似不支持ie，所以你也可以再test目录下运行test.html检查它在IE下的兼容性，由于出来仓促、难免有违覆盖的地方，也希望大家能提供测试BUG

## API

这里你可以慢慢看到nes的真正的特别之处，不仅仅是__速度__，我从来不以为做一个最快的选择器为目标，或许一次简单的缓动动画对UI的影响就超过了你使用几千次选择器,不要牺牲了代码和接口的质量换取一点点速度评分上的提升。nes源码中除了一两个主函数刚刚超过20行，其余代码都在15行以内, 一点点速度降低换来了优秀的接口和可维护性高的源码

### 标准API

标准API有三个:(1)one、(2)all、(3)matches，分别对应[JS selector level 2](http://www.w3.org/TR/selectors-api2/#SELECTORS4)的querySelector、querySelectorAll与matches(其中matches大部分的现代浏览器都还不支持).下面做简单描述

1. `nes.one(String selector,Element context)`: 返回第一个匹配selector(在context的subtree中)的元素

2. `nes.all(String selector,Element context)`: 返回所有匹配匹配selector(在context的subtree中)的元素,如a

```javascript
nes.one("tr:nth-child(even) > td:nth-child(odd)",someTable) //-> 取得someTable下的所有偶数列中奇数行
```

3. `nes.matches(Element node,String selector)`(selector API level 2): 返回node是否匹配selector这个选择器。如利用事件代理时，你不需要再去调用标准dom方法去测试节点是否满足某种条件，直接使用matches进行判断, 如:

```
container.addEventListener("click", function(e){
        if(nes.matches(e.target, ".signup a.top")){//直接利用选择器判断是否是注册表单下的置顶按钮
            //_onTop() ==> 处理逻辑
        }
    }
},false)
```

__一般开发人员看到这里就可以结束__, 需要有更深入了解和扩展需求的继续向下。


### 私有API
这几个API主要为了测试

1. `nes.parse`: 解析选择器(字符串)使其可以方便的被find使用, `nes.all`依赖方法
  比如 `div.example[class] p:nth-child(2n)，p.content ~ span` 返回的data是:

```javascript
[
  [
    {"tag":"div","classList":["example"],"attributes":[{"key":"class"}],"combo":" "}
    {"tag":"p","pesudos":[{"name":"nth-child","param":{"start":2,"step":2}}]}
  ],
  [
    {"tag":"p","classList":["content"],"combo":"~"},
    {"tag":"span"}
  ]
]
```
2. `nes.find`: 从parse传入的parseData进行节点查找,`nes.all`依赖方法

3. `nes._get`: 相当于`nes.all`, 即不去调用原生querySelector直接用nes查找(纯测试用)


### 扩展API
扩展分为两个层级,一种为内建扩展，即在内部语法之上的扩展。另一种为语法扩展，即创建一个与Id选择符、伪类选择符等价的Simple Selector，下面会以__使用场景__的形式介绍这几种扩展,这些场景都是建立在浏览器已经实现了querySelector的前提下, 用来证明选择器扩展的必要性

__注意__:这里不会描述所有应用场景，大家可以去test目录查看扩展范例

#### 内建扩展API
内建扩展分为三类: (1) 对伪类的扩展(pesudos); (2) 对属性的扩展(operators——因为属性只有操作符这一个动点); (3) 对连接符的扩展(combos)

__注意1__:内建扩展是一种动态扩展，是安全的，它会把你的关键字添加到内部的正则式中

__注意2__:所有的扩展都可以传入一个Object, 来实现一次扩展多个

##### 内建扩展——伪类`nes.pesudos(String name,Function matcher)`
__场景描述__:你需要获取所有的ul元素,这个元素中包含有满足(li.trigger a[href])的a标签

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
__理想做法__: `nes.all('ul:include(li.trigger a[href])')`

__你需要做的扩展是__:
```javascript
// 其中node表示当前遍历到的节点, param代表pesudo的参数如本例的`li.trigger a[href]`
nes.pesudos("include", function(node, param){
  return !!nes.one( param, node) // 返回bool值证明这个节点是否
})
```

##### 内建扩展——操作符`nes.combos(String name,Function matcher)`
__场景描述__: 坑爹啊，标准selector竟然不提供__不等于__操作符的支持(!=),让我们用一行代码搞定它

__理想做法__: `nes.all('div[class!=made_up]')`

__你需要做的扩展是__:
```javascript
// 与伪类扩展一样 ,第一个参数表示当前遍历到的节点，你要决定它是否通过
// key 代表属性名(如本例的class)、value代表属性值(如本里的made_up)
nes.operators("!=", function(node, key, value){
  return node.getAttribute(key) !== value
})
```
##### 内建扩展——连接符`nes.combos(String name,Function finder)`

__注意combo的扩展与上面两个扩展都不同，因为它是连接符而不是前两个的Simple Selector，它传入的是finder函数，目的是找到你满足的元素__

__场景描述__: 你需要获得 ul.test li.trigger节点 前的所有li节点(即连接符~的相反版)

__原生方法__: &$*@&*$&@(*$(*!)!)##!&$*^!@#$%^&*(*&^%$#@#$%^&*()(%$!@#$% (真的很烦，你们可以私下去尝试下)

__理想做法__: `nes.all ('ul.test1 li.trigger & li')`

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

__注意__: 如果找到了你要求的位置的节点，并且它满足传入match函数的测试，返回它，否则返回null(或直接不return)
#### 规则扩展API
`nes.addRule(String name, Object def)`——创建一个全新[Simple Selector](http://www.w3.org/TR/2011/WD-selectors4-20110929/#structure)语法(与属性、id、class、pesudo等是等价的)

__API__介绍: 
* name: 规则名(如classList)
* def 包含三个部分 :
  1. (String || RegExp) reg : 你规则的正则定义 (必须输入)
  2. Void Function action: (可忽略) <br/>
      与parse相关的函数，参数即你正则里匹配到的子匹配，你要做的是把所有的匹配塞到应该去的地方
  3. Bool Function filter: (可忽略) <br/>
     与find相关的函数，针对单节点的过滤函数，返回Boolean

__场景描述__: 你需要获取ul.test1中所有在同级节点中所处位置大于1，但是小于9的li标签

__原生方法__: `ul.test1 > li:nth-child(n+1):not(:nth-last-child(n+10))`

__理想做法__: `ul.test1 > li{1,9}`  ===> __此语法没有定义会报解析错误__

__你需要做的扩展是__:
```javascript
// 在进行语法扩展时reg是必须的，
// action与filter至少需要需要二选其一(根据场景不同)才能完成一个自定义规则的实施, 否则虽然不会报错
// 但是只是匹配了，让解析器不报错，但是这个选择器什么都不会做
nes.addRule("range",{
  reg:/\s*\{\s*(\d*),(\-?\d*)\s*\}\s*/, 
  // action中需要注意两个部分一个是this.error()打印出解析错误信息，
  // 一个this.current()永远返回当前的Simple Selector对应的data部分这是个hash表，
  // 你往里放key value对就行
  action:function(all, a, b){ //注意这里的a,b是郑则匹配到的子匹配，all是完整匹配
    var current = this.current(), //1. this.current返回当前匹配的simple selector
      pesudos = current.pesudos || (current.pesudos = []) 
    if(!a && !b) this.error("range中的参数不能同时为空") //2. this.error
    a = a && parseInt(a) || 1
    b = b && parseInt(b) || 0
    pesudos.push({  //a 如果不存在 视为
      name:"nth-child",
      param:{start:a, step:1 }
    })
    if(b>0){
      pesudos.push({ //意思小于b
        name:"not",
        param:":nth-child(" + (b+1) + ")"
      })
    }else{
      pesudos.push({  
        name:"nth-last-child",
        param:{start:b?-b:1, step:1 }
      })
    }
  }
})

```

__注意__:扩展的语法的正则式要描述清楚，否则可能会覆盖内建的规则。

###包装器

提供几个常用的便利接口，:
__警告__: 可能会立刻被移除, 因为这不是一个纯洁的选择器该做的事

__API__:
```javascript
nes(sl).one(sl2) == nes.all(sl2, nes.all(sl))

nes(sl).all(sl2） == nes.all(sl2, nes.all(sl))

nes(sl).parent(sl2) 返回最近的满足sl2的父节点

nes(sl).filter(sl2) 返回符合sl2的节点集

nes(sl).next(sl2) 返回下一个符合sl2的兄弟节点

nes(sl).prev(sl2) 返回上一个符合sl2的兄弟节点
```

__扩展包装器__: `nes.fn.xxx= fn` 类似于jQuery，如果觉得这个有用，可以给我提意见，因为选择器跟jQuery这种包装对象不同，它必须返回节点集，而jQuery的包装对象本身就可以操作。

### 几个可能会用到的配置属性

1. `nes.parseCache.length`: 控制最大parse缓存，默认200
2. `nes.nthCache.length` : 控制最大nth伪类参数的parse缓存，默认100

## 另外的乱七八糟的东西

1. __求使用啊、求BUG啊、求Fork啊、求Push啊...__
2. docs里有注释的源码(未完成。本周抽空写完)
3. API对commonjs、amd、全局暴露的支持我已经都做了，你可以直接用。同时网易的童鞋，NEJ也是支持的......

  
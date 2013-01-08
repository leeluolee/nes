//所有api都支持字面量对象的多重赋值
//taget找出目前页面target的节点

nes.pesudos({
  // 找出子节点有指定选择器
  // 如p:include(a[href]) h2 
  // 这里主要是用作最后一个data
  "include":function(node, param){
    return !!nes.one( param, node)
  },
  //有比较多的选择器实现了这个表单类的伪类，确实比较有用
  "radio": function(node){
    return node.type === "radio"
  },
  // 很简单的去实现一个nth-match  nth-lastmatch也是一样
  "nth-match":function(node,param){
    var 
      tmp = param.split(/\s+of\s+/),
      nth = parseInt(tmp[0]),
      sl = tmp[1],
      start = node.parentNode.firstChild

      console.log(sl)
    do{
      if(start.nodeType === 1&& nes.matches(start , sl)) nth--
    }while(nth&&(start = start.nextSibling))

    return !nth&&node === start 
  }
  //其他形如:text 、:checkbox 等等都是类似的
})


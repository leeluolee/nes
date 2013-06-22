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
  "local-link": function(all, param){
     if(!param) param = 0;   
     else param = parseInt(param);
  }
  //其他形如:text 、:checkbox 等等都是类似的
})


function getHref(node) {
  return "href" in node ? node.getAttribute("href", 2) : node.getAttribute("href")
}




// 这个操作符 != 代表
nes.operators("!=", function(node, key, value){
  return node.getAttribute(key) !== value
})


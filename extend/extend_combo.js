// combo中match封装了匹配逻辑 你只要找出你的上级节点(不一定是parent 可以使sibiling 甚至是children)并返回这个节点
// match中封装了 你的目标节点是否满足选择器信息(即使不满足你返回了节点也视为寻找成功)
// 这个idea来自 zest 也是一个选择器的库， 不过它的接口中多一层闭包，其实这个不需要闭包也能实现，nes接口要好得多

// 势必会有递归，但是递归我库中帮你封装到了match函数中，
// match是每次过滤动态生成的,可能会带来一点点性能影响，但是提高了遍历的接口
// 这里我提供了接口很大的自由度，
// 相当于是。开发者你自主选择你的下一目标节点，
// 我帮你匹配这个节点是否满足后续的complex selector

nes.combos({
  // 相当于 ~ 的相反版   
  "&":function(node, match){
    while(node = node.nextSibling) if(node.nodeType === 1 && match(node)){
        return node;
    }
    return null
  },
// 与 + 相反
  "%":function(node, match){
    while(node = node.nextSibling) if(node.nodeType === 1){
      return match(node)? node : null;
    }
  }
})
//库外扩展的麻烦就是无法使用库内的遍历方法,如果能用 两个扩展都只需一两行代码


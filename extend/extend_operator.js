// 这个操作符 &= 代表 下划线相隔
nes.operators("_=", function(value, nodeValue){
  return ~("_"+nodeValue+"_").indexOf(value)
})


var f = function(){
  var _ = NEJ.P,
    _e = _('nej.e'),
    _u = _('nej.u'),
    _v = _("nej.v")
  // ## 1. 获取节点  
  var _odd =  _e._$all("tbody > tr:nth-child(even) > td:nth-child(odd)");
  // 遍历这些节点做操作
  _u._$forEach(_odd, function(_item){
    _e._$setStyle(_item, "color", "#ccaa00")
  });

  // 注:_e._$one  获取单个节点.

  // ## 2. matches, 判断节点是否满足某个选择器
  var _table = _e._$one("div.m-table table")
  // 添加事件代理, 好处有2

  _v._$delegateEvent(_table, "click  tr:nth-child(2n+1)", function(_e){
    var _target = _e.target
    // console.log(this, _target)
  })
  _v._$delegateEvent(_table, "click  tr:nth-child(3n+1) td:nth-child(even)", function(){
    console.log(this)
    _e._$setStyle(this, "color", "#00ff00")
  })

  console.log(_e._$get("body"))
  // ## 3. nej中所有传入节点ID的部分都可以使用
}
define("demo.js", ["{pro}/delegate.js","{lib}/util/query/query.js","{lib}base/element.js"], f)

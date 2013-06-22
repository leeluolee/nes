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
  // 添加事件代理

  // 直接element
  _v._$delegateEvent(_table, "click  tr:nth-child(3n+1) td:nth-child(even)", function(e){
    _e._$setStyle(this, "color", "#00ff00")
  })

  // 2. 可以侦测到父节点
  _v._$delegateEvent(_table, "click  tr:nth-child(2n+1)", function(e){
    console.log(this)
    _e._$setStyle(this, "background", "#ccc333")
  })

  console.log(_e._$get("body"))
  // ## 3. nej中所有传入节点ID的部分都可以使用

// 一层浅封装让UI事件
 this._$initEvent = function(){}

 this._$initEvent({
    "click form .top" : "__onTop",
    "click form .untop" : "__onUntop",
    "click form .submit" : "__onSubmit"
  })


}
define("demo.js", [
  "{pro}/delegate.js",
  "{lib}/util/query/query.js",
  "{lib}base/element.js"
  ], f)

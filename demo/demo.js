/**
 * ------------------------------------------
 * 摄影Demo实现文件
 * @version  1.0
 * @author   huxueliang(huxueliang@corp.netease.com)
 * ------------------------------------------
 */

 
var f = function(){
    var _  = NEJ.P,
        _g = window,
        _e = _('nej.e'),
        _v = _('nej.v'),
        _d = _('pp.d'),
        _p = _('pp.m'),
        _proDemo;
    /**
     * 主框架划区模块
     * @class   主框架划区模块
     * @extends {nm.m._$$Module}G
     * @param   {Object} _options 可选配置参数
     * 
     */
    _p._$$Demo = NEJ.C();
      _proDemo = _p._$$Demo._$extend(_p._$$Module);
      _supDemo = _p._$$Demo._$supro;
    /**
     * 构建模块
     * @return {Node} 模块节点
     */
    _proDemo.__doBuild = function(){
        var _node = this.__body = _e._$html2node(_e._$getTextTemplate('txt-mdl-common')),

        /**
         * UI事件, bind到容器中
         */
        this.__bindEvent({
            "click -> .signup select":  "__onSelect",
            "click -> button.cancel" :  "__ondeleteSelect",
            "click -> a.top":           "__onTop",
            "click -> a.untop":         "__onUntop",
            "click -> a.delete" :       "__onDelete",
            "click -> a.edit":          "__onEdit",
            "click -> a.publish" :      "__onPost",
            "click -> a.clear" :        "__onClear",
            "mouseover -> div.cover":   this.__onHoverCover._$bind(this, xxx)
        })
    };

    _proDemo.__bindEvent = function(_events){
        var _fn
        for(var _i in _events){
            _fn = _events[_i]
            if(typeof _fn === "string") _fn = this[_fn]
            _v._$delegateEvent(this.__body, _i, _fn._$bind(this)) 
        }
    }

    /**
     * 模块显示 
     * @param {Object} _options
     * @return {Void} 
     */
    _proDemo.__onShow = function(_options){
        _supDemo.__onShow.apply(this,arguments);
    };

    /**
     * 模块刷新
     * @param  {Object} _options 参数
     * @return {Void}
     */
    _proDemo.__onRefresh = function(_options){

    }
    /**
     * 置顶操作
     * @param  {Event} _e 事件对象
     * @return {Void}
     */
    _proDemo.__onTop :function(_e){
        var _target = _e.target
        // ......逻辑......
    } 
    // notify dispatcher module loaded
    _g.dispatcher._$loaded(_c._$umi('demo'),_p._$$Demo);
};
define('{pro}module/demo/demo.js',
      ['{pro}module/module.js',
       '{pro}cache/demo.js'],f);



_v._$addEvent(this.__body,"click", function(e){
    var _target = e.target
    if(_target.nodeName.toLowerCase() == "select" &&
        _e._$hasClassName(_target,"top") && 
        _e._$hasClassName(_target.parentNode, "signup")){

        //this.__onTop() ==> 处理逻辑
    }
})

container.addEventListener("click", function(e){
        if(nes.matches(e.target, ".signup a.top")){
            //_onTop() ==> 处理逻辑
        }
    }
},false)

var lists = document.querySelectorAll("ul")
for(var i = lists.length; i--;){
    var list = lists[i]
    if(!list.querySelectorAll("li.trigger a[href]")){
        lists.splice(i, 1)
    }
}
return lists
var f = function(){
    var _ = NEJ.P,
        _v = _("nej.v"),
        _e = _("nej.e"),
        _split = /\s+->\s+/

    _v._$delegateEvent = function(_node, _type, _fn, _selector){
        var _tmp = _type.split(_split)
        if(_tmp.length == 2){
            _type = _tmp[0]   // 即 click -> a.top 的_type
            _selector = _tmp[1]
        }
        var _realCb = function(e){
            if(nes.matches(e.target, _selector)){
                _fn.apply(this, arguments)
            }
        }
        _v._$addEvent(_node, _type, _realCb)
    }
};
define('{pro}delegate.js',
    ["{lib}ui/base.js"
    ,"{pro}../nes.js"
    ]
    ,f)

var reg = /^\s*([^:]*)\s*:\s*([^:;])*;/g,tmp = {}

"left:82.5px;top:69.5px;cursor:w-resize;".replce(reg,function(all, left, right){
    tmp[left] ==right
    return ""
})

console.log(tmp)

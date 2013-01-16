var f = function() {
    var _ = NEJ.P,
        _v = _("nej.v"),
        _e = _("nej.e")

    var _bubbleUp = function(_sl, _node, _container) {
        while (_node && _node !== _container) {
            if (nes.matches(_node, _sl)){
                return _node
            }
            _node = _node.parentNode
        }
        return null
    }

    _v._$delegateEvent = function(_node, _type, _fn, _selector) {
        var _tmp = _type.split(/\s+/)
        if (_tmp.length > 1) {
            _type = _tmp.shift() // 即 click -> a.top 的_type
            _selector = _tmp.join(" ")
        }
        var _realCb = function(_e) {
            var _trigger;
            if (_trigger = _bubbleUp(_selector, _e.target, _node)) {
                _fn.apply(_trigger, arguments)
            }
        }
        _v._$addEvent(_node, _type, _realCb)
    }
};
define('{pro}delegate.js', ["{lib}util/query/query.js"], f)
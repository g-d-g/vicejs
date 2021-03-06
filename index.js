define(["require", "exports", "flyd"], function (require, exports, flyd) {
    "use strict";
    if (typeof HTMLElement !== "function") {
        var _HTMLElement = function () { };
        _HTMLElement.prototype = HTMLElement.prototype;
        window["HTMLElement"] = _HTMLElement;
    }
    function vice(klass, patch, tagName) {
        var shadowDOM = true;
        var appendChild = klass.prototype.appendChild;
        klass.prototype.appendChild = function (child) {
            if (shadowDOM) {
                this.innerChildNodes.push(child);
            }
            else {
                appendChild.apply(this, arguments);
            }
            return child;
        };
        var replaceChild = klass.prototype.replaceChild;
        klass.prototype.replaceChild = function (oldChild, newChild) {
            if (shadowDOM) {
                this.innerChildNodes[this.innerChildNodes.indexOf(oldChild)] = newChild;
            }
            else {
                replaceChild.call(this, oldChild, newChild);
            }
            return oldChild;
        };
        var removeChild = klass.prototype.removeChild;
        klass.prototype.removeChild = function (child) {
            if (shadowDOM) {
                this.innerChildNodes.splice(this.innerChildNodes.indexOf(child));
            }
            else {
                removeChild.call(this, child);
            }
            return child;
        };
        var insertBefore = klass.prototype.insertBefore;
        klass.prototype.insertBefore = function (childPos, newChild) {
            if (shadowDOM) {
                this.innerChildNodes.splice(childPos, 0, newChild);
            }
            else {
                insertBefore.call(this, childPos, newChild);
            }
            return newChild;
        };
        klass.prototype.getTagName = function () {
            return tagName;
        };
        klass.prototype.update = function () {
            var _this = this;
            if (this.beforeUpdate) {
                this.beforeUpdate();
            }
            if (!this._isInitialized) {
                this.init();
                this._isInitialized = true;
            }
            if (this.runUpdate) {
                var newVnode = this.render(this.state);
                shadowDOM = false;
                var oldVnodeWrapper = {
                    sel: this.getTagName(),
                    elm: this,
                    data: {},
                    children: Array.isArray(this.oldVnode) ? this.oldVnode : [this.oldVnode]
                };
                var newVnodeWrapper = {
                    sel: this.getTagName(),
                    elm: undefined,
                    data: {},
                    children: Array.isArray(newVnode) ? newVnode : [newVnode]
                };
                patch(oldVnodeWrapper, newVnodeWrapper);
                shadowDOM = true;
                this.oldVnode = newVnode;
                var afterUpdate_1 = document.createEvent("Event");
                afterUpdate_1.initEvent("after-update", true, true);
                setTimeout(function () {
                    _this.dispatchEvent(afterUpdate_1);
                });
            }
            if (this.afterUpdate) {
                this.afterUpdate();
            }
        };
        klass.prototype.init = function () {
            this.runUpdate = this.runUpdate || this.getAttribute("instant") != null;
            this.innerChildNodes = [];
            while (this.firstChild) {
                this.innerChildNodes.push(this.firstChild);
                removeChild.call(this, this.firstChild);
            }
        };
        if (!klass.prototype["streamState"]) {
            klass.prototype["streamState"] = function (streamState) {
                var _this = this;
                this.runUpdate = true;
                if (this.state === streamState) {
                    return;
                }
                if (this.localMirror && this.localMirror.end) {
                    this.localMirror.end(true);
                }
                if (klass.prototype["beforeStreamState"]) {
                    flyd.autoOut(function () {
                        klass.prototype["beforeStreamState"].call(_this, streamState);
                    });
                }
                this.state = streamState;
                this.localMirror = flyd.autoFn(function () {
                    _this.update();
                });
                if (klass.prototype["afterStreamState"]) {
                    flyd.autoOut(function () {
                        klass.prototype["afterStreamState"].call(_this, streamState);
                    });
                }
            };
        }
        klass.prototype["hasShadow"] = function (has) {
            shadowDOM = has;
        };
        document.registerElement(tagName, klass);
        return klass;
    }
    exports.vice = vice;
    ;
});
//# sourceMappingURL=index.js.map
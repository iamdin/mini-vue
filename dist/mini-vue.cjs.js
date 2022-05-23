'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var isObject = function (val) {
    return val !== null && typeof val === 'object';
};
var isFunction = function (val) {
    return typeof val === 'function';
};
var NOOP = function () { };

function createComponentInstance(vnode) {
    var type = vnode.type;
    var instance = {
        type: type,
        vnode: vnode,
    };
    return instance;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
/* */
function setupStatefulComponent(instance) {
    var Component = instance.type;
    var setup = Component.setup;
    if (setup) {
        // setupResult is function | object
        var setupResult = setup(instance.props /* TODO context */);
        handleSetupResult(instance, setupResult);
    }
}
/* 处理 setup 返回值为函数或对象的情况 */
function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) ;
    else if (isObject(setupResult)) {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    if (!Component.render) ;
    instance.render = Component.render || NOOP;
}

function render(vnode, container) {
    // patch
    patch(vnode);
}
var patch = function (vnode, container) {
    // 处理 Element
    // 处理 Component
    processComponent(vnode);
};
var processComponent = function (vnode, container) {
    mountComponent(vnode);
};
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    // vnode -> patch
    // vnode -> element -> mount
    patch(subTree);
}

function createBaseVNode(type, props, children) {
    var vnode = { type: type, props: props, children: children };
    return vnode;
}
function createVNode(type, props, children) {
    return createBaseVNode(type, props, children);
}

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            // 先创建 vNode
            // component -> vNode
            var vnode = createVNode(rootComponent);
            // 所有的逻辑操作 都基于 vNode 处理
            render(vnode);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;

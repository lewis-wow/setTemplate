(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global = global || self, global.setTemplate = factory());
}(this, function() {
    'use strict';

    function setTemplate(file, props) {
        return new Promise((resolve, reject) => {
            fetch(file).then(res => res.text()).then(res => {
    
                const domTree = elemFromString(res);
                const ids = getIds(domTree);
                Array.from(domTree.querySelectorAll("script")).forEach(elem => {
                    runScriptAsFunction(elem, props, domTree, ids);
                });
    
                resolve(domTree);
        
            });
        });
    }
    
    function runScriptAsFunction(scriptElement, props, domTree, ids) {
        new Function(`return (function(props, currentDom, id){
            "use strict";
            ${scriptElement.textContent}
        })`)()(props, domTree, ids);
    }
    
    function elemFromString(string) {
        const el = document.createElement("template");
        el.innerHTML = string;
    
        return el.content;
    }
    
    function getIds(root) {
        const ids = {};
        Array.from(root.querySelectorAll("[id]")).forEach(idElem => {
            ids[idElem.id] = idElem;
        });
        return ids;
    }
    
    return setTemplate;
    
}));

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

                window.local = {};

                const globalScript = domTree.querySelector("script[global]");
                if(globalScript) {
                    const script = document.createElement("script");
                    script.textContent = globalScript.textContent;
                    script.dataset.global = true;
                    globalScript.replaceWith(script);
                }

                const runAsFuncScript = domTree.querySelector("script:not([data-global='true'])");
                if(runAsFuncScript) {
                    runScriptAsFunction(runAsFuncScript, props, domTree, ids, window.local);
                }
    
                resolve(domTree);
        
            });
        });
    }
    
    function runScriptAsFunction(scriptElement, props, currentDom, id, local) {
        new Function(`return (function(props, currentDom, id){
            "use strict";
            ${scriptElement.textContent}
        })`)().bind({props, currentDom, id, window, global: window, local})();
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

(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global = global || self, global.Template = factory());
}(this, function() {
    'use strict';

    class Template {
        constructor(file, props, shadow = document.currentScript.parentNode.attachShadow({mode: 'open'})) {
            //const shadow = parentNode.attachShadow({mode: 'open'});
            return new Promise((resolve, reject) => {
                setTemplate(file, props, shadow).then(el => {
                    clearNode(shadow);
                    shadow.appendChild(el);
                    resolve(shadow);
                });
            });
        }
    }

    function clearNode(node) {
        while(node.firstChild) {
            node.removeChild(node.lastChild);
        }
        return node;
    }

    function setTemplate(file, props, parentNode) {
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
                const history = {
                    push: true
                };

                let onMountCallback = () => {};

                if(runAsFuncScript) {
                    runScriptAsFunction({
                        currentScript: runAsFuncScript, 
                        props, 
                        currentDom: domTree, 
                        id: ids, 
                        local: window.local,
                        global: window,
                        async: runAsFuncScript.hasAttribute("async") ? true : false,
                        history,
                        parentNode,
                        setContent: async (page, props) => new Template(page, props, parentNode),
                        onMount: (callback) => onMountCallback = callback
                    });
                }
                    
                if(history.push) {
                    window.history.pushState({
                        file,
                        props
                    }, null, null);
                }

                resolve(domTree);
                onMountCallback();
            });
        });
    }
    
    function runScriptAsFunction(params) {
        return new Function(`return (${params.async ? "async " : ""}function(){
            "use strict";
            ${params.currentScript.textContent}
        })`)().bind(params)();
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

    window.addEventListener("popstate", (e) => {
        setTemplate(e.state.file, e.state.props);
    });
    
    return Template;
    
}));

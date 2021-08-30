(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global = global || self, global.setTemplate = factory());
}(this, function() {
    'use strict';

    function setTemplate(file, props, container) {
        const containerInit = setTemplate.prototype.container === undefined;
        setTemplate.prototype.container = container || setTemplate.prototype.container;
        const shadow = setTemplate.prototype.container.shadowRoot ? setTemplate.prototype.container.shadowRoot : setTemplate.prototype.container.attachShadow({mode: 'open'});

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
                    runScriptAsFunction({
                        script: runAsFuncScript, 
                        props, 
                        domTree, 
                        id: ids, 
                        local: window.local,
                        global: window,
                        asynchronnous: runAsFuncScript.hasAttribute("async") ? true : false
                    });
                }

                const pushHistory = (container === undefined || containerInit) && (!runAsFuncScript || runAsFuncScript.getAttribute("history") !== "ignore") ? true : false;
                    
                if(pushHistory) {
                    window.history.pushState({
                        file,
                        props
                    }, null, null);
                }

                if(shadow) {
                    while (shadow.firstChild) {
                        shadow.removeChild(shadow.lastChild);
                    }
                }

                shadow.appendChild(domTree);

                resolve();
        
            });
        });
    }
    
    function runScriptAsFunction({script, props, domTree, id, local, global, asynchronnous}) {
        return new Function(`return (${asynchronnous ? "async " : ""}function(setTemplate){
            "use strict";
            ${script.textContent}
        })`)().bind({
            currentScript: script,
            props, 
            currentDom: domTree, 
            id, 
            global, 
            local,
            asynchronnous
        })(setTemplate);
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
    
    return setTemplate;
    
}));

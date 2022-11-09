
class DOMHelper {

    // TODO extend Node itself?
    static selectLastNode(parent, selector) {
        const nodes = parent.querySelectorAll(selector);
        return nodes.length === 0 ? null : nodes[nodes.length - 1];
    }

    static insertStylesheet(href) {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.type = "text/css";
        stylesheet.href = href;
        document.head.appendChild(stylesheet);
    }

    static insertScript({src, content}, id, onload, isAsync = true) {
        const script = document.createElement("script");

        if (onload) { script.onload = onload; }
        if (id) { script.id = id; }
        if (src) { script.src = src; }
        if (content) { script.textContent = content; }
        if (isAsync) { script.setAttribute("async", ""); }

        document.head.appendChild(script);
    }

    static insertCSS(content, id) {
        const style = document.createElement("style");

        if (id) { style.id = id; }
        style.textContent = content;

        document.head.appendChild(style);
    }
}

export {DOMHelper};

const awaitEvent = (target, eventName) => new Promise(r => target.addEventListener(eventName, r, { __proto__: null, once: true }));

const { body } = document;

function innerExecutor() {
  "use strict";
  let output = "";
  const sendMessage = parent.postMessage.bind(parent), { isArray } = Array;
  const evalFunc = globalThis["eval"];
  const symbolToString = Function.prototype.call.bind(Symbol.prototype.toString);
  const numberString = Function.prototype.call.bind(Number.prototype.toString);
  const stringToString = Function.prototype.call.bind(String.prototype.toString);
  const booleanToString = Function.prototype.call.bind(Boolean.prototype.toString);
  const dateToNumber = Function.prototype.call.bind(Date.prototype.valueOf);
  const regExpPrototype = RegExp.prototype;
  const isDotAll = Function.prototype.call.bind(Reflect.getOwnPropertyDescriptor(regExpPrototype, "dotAll").get);
  const types = [
    [numberString, "Number"],
    [stringToString, "String"],
    [booleanToString, "Boolean"],
    [dateToNumber, "Date"],
    [isDotAll, "RegExp"]
  ];
  types.forEach(type => Reflect.setPrototypeOf(type, null));
  Reflect.setPrototypeOf(types, null);
  const toString = (v) => {
    switch (typeof v) {
      case "function":
        return "[object Function]";
      case "object":
        if (v === null) return "null";
        if (isArray(v)) return "[object Array]";
        if (v === regExpPrototype) return "[object Object]";
        for (let i = 0; i < types.length; i++) {
          const { 0: checker, 1: name } = types[i];
          try {
            checker(v);
            return `[object ${name}]`;
          } catch {
            ;
          }
        }
        return "[object Object]";
      case "symbol":
        return symbolToString(v);
    }
    return `${v}`;
  };
  const pushOutput = (v => {
    output += (output ? "\n" : "") + toString(v);
  }).bind(new class Console {}());
  Reflect.defineProperty(pushOutput, "name", {
    __proto__: null,
    value: "log"
  });
  Reflect.defineProperty(console, "log", {
    __proto__: null,
    configurable: false,
    enumerable: false,
    writable: false,
    value: pushOutput
  });
  Reflect.setPrototypeOf(document, EventTarget.prototype);
  delete RegExp.prototype.compile;
  window.addEventListener("message", ({ data }) => {
    try {
      evalFunc(data.script);
    } catch(e) {
      pushOutput(`${e}`);
    }
    sendMessage({ result: output }, "*");
  }, { __proto__: null, once: true });
  const allowedGlobalProp = ["console","globalThis","Infinity","NaN","undefined","eval","isFinite","isNaN","parseFloat","parseInt","URI","AggregateError","Array","ArrayBuffer","BigInt","BigInt64Array","BigUint64Array","Boolean","DataView","Date","Error","EvalError","FinalizationRegistry","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Map","Number","Object","Promise","Proxy","RangeError","ReferenceError","RegExp","Set","SharedArrayBuffer","String","Symbol","SyntaxError","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","URIError","WeakMap","WeakRef","WeakSet","Atomics","JSON","Math","Reflect"];
  Reflect.ownKeys(globalThis).forEach(k => {
    if (allowedGlobalProp.includes(k)) return;
    try {
      delete globalThis[k];
    } catch {
      // ignore errors
    }
  });
}

const execute = async (source) => {
  const iframe = document.createElement("iframe");
  const iframeStyle = iframe.style;
  iframeStyle.opacity = "0";
  iframeStyle.width = iframeStyle.left =
  iframeStyle.height = iframeStyle.top = "1px";
  iframeStyle.position = "fixed";
  iframe.sandbox = "allow-scripts";
  iframe.srcdoc = `<script type="text/javascript">(${innerExecutor})()</script>`;
  body.appendChild(iframe);
  await awaitEvent(iframe, "load");
  iframe.contentWindow.postMessage({ script: source }, "*");
  const { data } = await awaitEvent(window, "message");
  body.removeChild(iframe);
  return data.result;
};

[...document.getElementsByClassName("question")].forEach(question => {
  question.classList.remove("question");
  const output = question.getElementsByClassName("output")[0];
  const outputStyle = output.style;
  outputStyle.overflowWrap = "anywhere";
  outputStyle.boxSizing = "border-box";
  outputStyle.height = "100%";
  outputStyle.border = "1px solid #cdcdcd";
  outputStyle.padding = ".8em";
  outputStyle.borderRadius = ".3em";
  outputStyle.background = "#575659";
  outputStyle.fontFamily = "monospace";
  outputStyle.whiteSpace = "pre-wrap";
  output.classList.remove("output");
  const source = question.getElementsByClassName("source")[0];
  const sourceStyle = source.style;
  sourceStyle.whiteSpace = "nowrap";
  sourceStyle.overflow = "auto hidden";
  sourceStyle.border = "1px solid #cdcdcd";
  sourceStyle.padding = ".8em";
  sourceStyle.background = "#333";
  sourceStyle.fontFamily = "monospace";
  sourceStyle.cursor = "default";
  sourceStyle.borderRadius = ".35em";
  sourceStyle.fontSize = "16px";
  sourceStyle.lineHeight = "1.2em";
  source.classList.remove("source");
  const runButton = question.getElementsByClassName("run-button")[0];
  const runButtonStyle = runButton.style;
  runButtonStyle.cursor = "pointer";
  runButtonStyle.border = "1px solid #cdcdcd";
  runButtonStyle.padding = ".8em";
  runButtonStyle.borderRadius = ".5em";
  runButtonStyle.background = "#747479";
  runButtonStyle.fontFamily = "Sans-Serif";
  runButtonStyle.fontWeight = "bold";
  runButton.classList.remove("run-button");
  runButton.addEventListener("click", async () => {
    output.textContent = (await execute(source.innerText)).trim();
  });
});

[...document.getElementsByClassName("blank-wrap")].forEach(wrap => {
  wrap.classList.remove("blank-wrap");
  const blank = wrap.getElementsByClassName("blank")[0];
  const blankStyle = blank.style;
  blankStyle.outline = "0px";
  blankStyle.cursor = "text";
  blankStyle.padding = "0px .15em";
  blankStyle.transition = ".3s";
  blankStyle.animation = "1.3s ease blink infinite";
  blank.contentEditable = "true";
  blank.addEventListener("mouseover", () => {
    blankStyle.animation = "";
  }, { __proto__: null, once: true });
  blank.addEventListener("focus", () => {
    blankStyle.animation = "";
    blankStyle.textDecoration = "";
  }, { __proto__: null, once: true });
  wrap.addEventListener("click", e => {
    if (e.target !== wrap) return;
    if (!blank.textContent) blank.focus();
  });
  blank.addEventListener("blur", e => blank.textContent = blank.textContent);
});

const blank1 = document.getElementById("blank-1");
blank1.removeAttribute("id");
let blank1cache = "Foo";
const onInput1 = () => blank1cache = blank1.textContent;
blank1.addEventListener("beforeinput", async e => {
  const { textContent } = blank1;
  switch (e.inputType) {
    case "deleteByCut":
    case "historyUndo":
    case "historyRedo":
    case "deleteWordForward":
    case "deleteWordBackward":
    case "deleteContentForward":
    case "deleteContentBackward":
      break;
    case "insertText":
    case "insertFromPaste":
    case "insertReplacementText":
    case "insertCompositionText":
      const data = (e.data ?? "") + (e.dataTransfer?.getData("text") ?? "");
      if (!data.match(/["\\]/)) break;
    default:
      if (e.cancelable) {
        e.preventDefault();
        return;
      }
      const anchorNode = document.getSelection().anchorNode.parentNode;
      const { endOffset, startOffset } = e.getTargetRanges()[0];
      await awaitEvent(blank1, "input");
      anchorNode.focus();
      blank1.textContent = textContent;
      const selection = getSelection();
      selection.removeAllRanges();
      const range = document.createRange();
      range.setStart(anchorNode.childNodes[0], startOffset);
      range.setStart(anchorNode.childNodes[0], endOffset);
      selection.addRange(range);
      return;
  }
  blank1.addEventListener("input", onInput1, { __proto__: null, once: true });
});

const blank2 = [...document.getElementsByClassName("blank-2")];
let blank2cache = "bar";
blank2.forEach(b => {
  b.classList.remove("blank-2");
  const onInput = () => {
    blank2cache = b.textContent;
    blank2.forEach(t => {
      if (b === t) return;
      t.textContent = blank2cache;
    });
  };
  b.addEventListener("beforeinput", async e => {
    const { textContent } = b;
    switch (e.inputType) {
      case "deleteByCut":
      case "historyUndo":
      case "historyRedo":
      case "deleteWordForward":
      case "deleteWordBackward":
      case "deleteContentForward":
      case "deleteContentBackward":
        break;
      case "insertText":
      case "insertFromPaste":
      case "insertReplacementText":
      case "insertCompositionText":
        const data = (e.data ?? "") + (e.dataTransfer?.getData("text") ?? "");
        if (!data.match(/["\\]/)) break;
      default:
        if (e.cancelable) {
          e.preventDefault();
          return;
        }
        const anchorNode = document.getSelection().anchorNode.parentNode;
        const { endOffset, startOffset } = e.getTargetRanges()[0];
        await awaitEvent(b, "input");
        anchorNode.focus();
        b.textContent = textContent;
        const selection = getSelection();
        selection.removeAllRanges();
        const range = document.createRange();
        range.setStart(anchorNode.childNodes[0], startOffset);
        range.setStart(anchorNode.childNodes[0], endOffset);
        selection.addRange(range);
        return;
    }
    b.addEventListener("input", onInput, { __proto__: null, once: true });
  });
});

const blank3 = document.getElementById("blank-3");
blank3.removeAttribute("id");
let blank3cache = "BLANK03";
const onInput3 = () => blank3cache = blank3.textContent;
blank3.addEventListener("beforeinput", async e => {
  const { textContent } = blank3;
  const { startOffset, endOffset } = e.getTargetRanges()[0];
  switch (e.inputType) {
    case "deleteByCut":
    case "historyUndo":
    case "historyRedo":
    case "deleteWordForward":
    case "deleteWordBackward":
    case "deleteContentForward":
    case "deleteContentBackward":
      break;
    case "insertText":
    case "insertFromPaste":
    case "insertReplacementText":
    case "insertCompositionText":
      const data = (e.data ?? "") + (e.dataTransfer?.getData("text") ?? "");
      if (
        (15 > (textContent + data).length + startOffset - endOffset) &&
        !data.match(/["\\]/)
      ) break;
    default:
      if (e.cancelable) {
        e.preventDefault();
        return;
      }
      const anchorNode = document.getSelection().anchorNode.parentNode;
      await awaitEvent(blank3, "input");
      anchorNode.focus();
      blank3.textContent = textContent;
      const selection = getSelection();
      selection.removeAllRanges();
      const range = document.createRange();
      range.setStart(anchorNode.childNodes[0], startOffset);
      range.setStart(anchorNode.childNodes[0], endOffset);
      selection.addRange(range);
      return;
  }
  blank3.addEventListener("input", onInput3, { __proto__: null, once: true });
});


const blank4 = document.getElementById("blank-4");
blank4.removeAttribute("id");
let blank4cache = "BLANK04";
const onInput4 = () => blank4cache = blank4.textContent;
blank4.addEventListener("beforeinput", async e => {
  const { textContent } = blank4;
  const { startOffset, endOffset } = e.getTargetRanges()[0];
  switch (e.inputType) {
    case "deleteByCut":
    case "historyUndo":
    case "historyRedo":
    case "deleteWordForward":
    case "deleteWordBackward":
    case "deleteContentForward":
    case "deleteContentBackward":
      break;
    case "insertText":
    case "insertFromPaste":
    case "insertReplacementText":
    case "insertCompositionText":
      const data = (e.data ?? "") + (e.dataTransfer?.getData("text") ?? "");
      if (15 >= (textContent + data).length + startOffset - endOffset) break;
    default:
      if (e.cancelable) {
        e.preventDefault();
        return;
      }
      const anchorNode = document.getSelection().anchorNode.parentNode;
      await awaitEvent(blank4, "input");
      anchorNode.focus();
      blank4.textContent = textContent;
      const selection = getSelection();
      selection.removeAllRanges();
      const range = document.createRange();
      range.setStart(anchorNode.childNodes[0], startOffset);
      range.setStart(anchorNode.childNodes[0], endOffset);
      selection.addRange(range);
      return;
  }
  blank4.addEventListener("input", onInput4, { __proto__: null, once: true });
});

[...document.querySelectorAll("span[data-reserved]")].forEach(e => {
  e.style.color = "#c1cff1";
  delete e.dataset.reserved;
});

[...document.querySelectorAll("span[data-regex]")].forEach(e => {
  e.style.color = "#bea5fe";
  delete e.dataset.regex;
});

[...document.querySelectorAll("span[data-prop]")].forEach(e => {
  e.style.color = "#ff97a0";
  delete e.dataset.prop;
});

[...document.querySelectorAll("span[data-literal]")].forEach(e => {
  e.style.color = "#00d061";
  delete e.dataset.literal;
});

[...document.querySelectorAll("span[data-indent]")].forEach(e => {
  e.style.whiteSpace = "pre";
  delete e.dataset.indent;
});

[...document.querySelectorAll("span[data-quote]")].forEach(e => {
  const inlineStyle = e.style;
  inlineStyle.fontFamily = "monospace";
  inlineStyle.padding = ".25em";
  inlineStyle.background = "rgba(160, 160, 160, .5)";
  inlineStyle.borderRadius = ".35em";
  delete e.dataset.quote;
});

[...document.querySelectorAll("*")].forEach(e => e.className || e.removeAttribute("class"));

const bodyStyle = body.style;
bodyStyle.padding = "8px";
bodyStyle.background = "#343436";
bodyStyle.color = "#fff";
bodyStyle.display = "";

body.addEventListener('click', () => {});

const allTextNodes = [body, ...body.querySelectorAll("*")].flatMap(e => [...e.childNodes].filter(e => e.nodeType === Node.TEXT_NODE));
[...new Set(allTextNodes)].forEach(e => e.data.includes('\n') && e.replaceWith(e.data.replace(/\s+/g, ' ')));

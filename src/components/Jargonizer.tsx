import { useEffect } from "react";

// Hover-to-define jargon layer: after the article renders, walks the .prose
// text nodes and wraps known industry terms in tooltip-enabled spans.
// The tooltip itself is pure CSS (see .jargon styles in index.css).
const JARGON: [string, string][] = [
  ["LLM", "Large Language Model — an AI trained on massive text corpora to predict and generate language."],
  ["RAG", "Retrieval-Augmented Generation: the LLM searches a knowledge base before answering, so answers cite real sources."],
  ["CI/CD", "Continuous Integration / Delivery — automatically building, testing and shipping code changes."],
  ["API", "Application Programming Interface — a contract that lets programs exchange data and actions."],
  ["Kubernetes", "Orchestration that automates deploying, scaling and healing containerised applications."],
  ["fintech", "Technology built for financial services: payments, lending, savings and banking rails."],
  ["unicorn", "A privately held startup valued at over $1 billion."],
  ["machine learning", "Programs that improve at tasks by learning patterns from data instead of hand-written rules."],
  ["open source", "Software whose code is public under a licence that allows study, change and redistribution."],
  ["venture capital", "Investment funds that back early, high-growth startups in exchange for equity."],
  ["GPU", "Graphics processing unit — the parallel chips that power AI training and inference."],
  ["semiconductor", "The silicon chips at the heart of every computer, phone and data centre."],
  ["cybersecurity", "Protecting systems, networks and data from attacks and unauthorised access."],
  ["encryption", "Encoding data so only a holder of the right key can read it."],
  ["blockchain", "A shared, append-only ledger replicated across many computers."],
  ["DevOps", "Engineering culture merging development and operations to ship faster and more reliably."],
];

export default function Jargonizer() {
  useEffect(() => {
    const root = document.querySelector(".prose");
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        n.parentElement && !/^(a|button|pre|code|style|script)$/i.test(n.parentElement.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    const targets: Text[] = [];
    let cur: Node | null;
    while ((cur = walker.nextNode())) targets.push(cur as Text);
    for (const node of targets) {
      for (const [term, def] of JARGON) {
        const re = new RegExp("\\b" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
        const txt = node.nodeValue || "";
        if (!re.test(txt)) continue;
        const frag = document.createDocumentFragment();
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(txt))) {
          frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
          const w = document.createElement("span");
          w.className = "jargon";
          w.dataset.def = def;
          w.textContent = m[0];
          frag.appendChild(w);
          last = m.index + m[0].length;
        }
        frag.appendChild(document.createTextNode(txt.slice(last)));
        node.parentNode?.replaceChild(frag, node);
        break;
      }
    }
  }, []);
  return null;
}

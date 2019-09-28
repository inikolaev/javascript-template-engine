const applyTemplate = (templateElement, data) => {
  const element = templateElement.content.cloneNode(true);
  const treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, () => NodeFilter.FILTER_ACCEPT);

  const resolveValue = (data, path) => {
    const parts = path.split(".");
    let value = data;

    for (let part of parts) {
      if (part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  };

  const applyTemplateNode = (treeWalker, data, depth) => {
    let hasNext = treeWalker.nextNode();

    while (hasNext) {
      const node = treeWalker.currentNode;

      if (node.dataset.forEach && node.dataset.in) {
        hasNext = treeWalker.nextSibling();

        const context = {
          ...data
        };

        const iterable = resolveValue(data, node.dataset.in);
        const parent = node.parentNode;

        for (let item of iterable) {
          context[node.dataset.forEach] = item;

          const clonedNode = node.cloneNode(true);

          const nestedTreeWalker = document.createTreeWalker(clonedNode, NodeFilter.SHOW_ELEMENT, () => NodeFilter.FILTER_ACCEPT);
          applyTemplateNode(nestedTreeWalker, context, depth + 1);

          parent.insertBefore(clonedNode, node);
        }

        parent.removeChild(node);
      } else {
        hasNext = treeWalker.nextNode();

        const isBindInnerText = node.dataset.bindInnerText != null;

        if (isBindInnerText) {
            node.innerText = resolveValue(data, node.dataset.bindInnerText);
        }

        for (let attribute in node.dataset) {
          if (attribute.indexOf("bindAttr") === 0) {
            const name = attribute.substring(8).toLowerCase();
            node.dataset[name] = resolveValue(data, node.dataset[attribute]);
          }
        }
      }
    }
  };

  applyTemplateNode(treeWalker, data);

  return element;
};
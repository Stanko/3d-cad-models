const sources = document.querySelectorAll(".model__source");
const previews = document.querySelectorAll(".model__preview");

const sourceCache = {};
let activeDrawer = "";

const el = (tag, className, html) => {
  const element = document.createElement(tag);
  element.className = className;
  element.innerHTML = html || "";
  return element;
};

const drawer = el("div", "drawer");
const drawerButtons = el("div", "drawer__buttons");
const drawerContent = el("div", "drawer__content");
const closeButton = el("button", "", "Close");
const copyButton = el("button", "", "Copy");

drawerButtons.appendChild(copyButton);
drawerButtons.appendChild(closeButton);

drawer.appendChild(drawerButtons);
drawer.appendChild(drawerContent);

copyButton.addEventListener("click", () => {
  const text = drawerContent.innerText;
  navigator.clipboard.writeText(text).then(() => {
    copyButton.textContent = "Copied";
    setTimeout(() => {
      copyButton.textContent = "Copy";
    }, 2000);
  });
});

closeButton.addEventListener("click", () => {
  closeDrawer();
});

const closeDrawer = () => {
  drawer.parentElement.removeChild(drawer);
  activeDrawer = "";
};

const openDrawer = (id, content, model) => {
  activeDrawer = id;
  const models = model.parentElement;

  const activeIndex = parseInt(model.style.order, 10) - 1; // 0 index

  drawer.style.setProperty("--active-index", activeIndex);
  models.appendChild(drawer);
  drawerContent.innerHTML = content;
};

sources.forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const url = link.getAttribute("href");
    const model = link.parentElement.parentElement;

    if (activeDrawer === url) {
      closeDrawer();
      return;
    }

    if (sourceCache[url]) {
      openDrawer(url, sourceCache[url], model);
    } else {
      const loadingTimeout = setTimeout(() => {
        link.setAttribute("inert", "true");
        link.innerHTML = "Loading...";
      }, 200);

      const response = await fetch(url);
      const code = await response.text();
      const content = `<pre><code>${code}</code></pre>`;
      sourceCache[url] = content;
      openDrawer(url, content, model);
      clearTimeout(loadingTimeout);
      link.removeAttribute("inert");
      link.innerHTML = "Source";
    }
  });
});

previews.forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const url = link.getAttribute("href");
    const model = link.parentElement.parentElement;
    const content = `<iframe src="${url}" frameborder="0"></iframe>`;
    openDrawer(url, content, model);
  });
});

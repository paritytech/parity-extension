const body = document.body

const port = chrome.runtime.connect({ name: 'id' })

// Parse initial page
const treeWalker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
while (treeWalker.nextNode()) {
  console.log(`Visiting: `, treeWalker.currentNode)
  port.postMessage(treeWalker.currentNode.textContent)
}

port.onMessage.addListener(msg => {
  console.log('Got response: ', msg)
})

// Observe later changes
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => console.log(mutation))
})

observer.observe(body, {
  attributes: true,
  childList: true,
  characterData: true
})



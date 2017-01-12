import { extractPossibleMatches } from './extractor'

const port = chrome.runtime.connect({ name: 'id' })

// Process the page in stages.
// 0. We listen for possible changes
// 1. First we look for most likely matches <a href="mailto:..> and <a href="{user_profile}">
// 2. Then we process all text nodes

function stage1(done) {
  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT)
  while (treeWalker.nextNode()) {
    console.log('Visiting: ', treeWalker.currentNode)

    const matches = extractPossibleMatches(treeWalker.currentNode)
    if (matches.length) {
      port.postMessage({
        type: 'processLinks',
        data: matches
      })
    }
  }

  done()
}

function stage2(done) {
  const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (treeWalker.nextNode()) {
    console.log(`Text: `, treeWalker.currentNode)

    port.postMessage({
      type: 'processText',
      data: [treeWalker.currentNode.textContent]
    })
  }

  done()
}

// Listen for responses
port.onMessage.addListener(msg => {
  console.log('Got response: ', msg)
})

// Observe later changes
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => console.log(mutation))
})

observer.observe(document.body, {
  attributes: true,
  childList: true,
  characterData: true
})

// Start processing
stage1(() => {
  setTimeout(() => {
    stage2(() => {})
  }, 500)
})



browser.runtime.sendMessage('(whatever)')

browser.storage.sync.get().then(x => {
    console.log('content gotten!', x)
})


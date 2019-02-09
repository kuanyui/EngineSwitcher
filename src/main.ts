browser.pageAction.onClicked.addListener(function (tab) {
    const url = new URL(tab.url + '')
    const params = new URLSearchParams(url.search)
    console.log('hello', params.get('q'))
})


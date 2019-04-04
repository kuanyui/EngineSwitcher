import { MyStorage, SearchEngine, CurrentState, ENGINES, isCurrentUrlSupported } from "./common";


const STORAGE: MyStorage = {
    enabledEngines: [ "duckduckgo", "startpage", "bing", "google" ]   // Shit WebExtention
}

function getEnabledEngines (): SearchEngine[] {
    return ENGINES.filter(en => STORAGE.enabledEngines.includes(en.id))
}


function getCurrentState (currentUrl?: string): CurrentState | null {
    if (!currentUrl) {return null}
    const engines = getEnabledEngines()
    if (!isCurrentUrlSupported(currentUrl)) { return null }
    const urlObj = new URL(currentUrl + '')
    let curIdx = engines.findIndex(x => x.hostname === urlObj.hostname)
    if (curIdx === -1) { 
        curIdx = 0
     }
    const curEng = engines[curIdx]
    const params = new URLSearchParams(urlObj.search)
    const keyword = params.get(curEng.queryKey) || ''
    const nextEng = engines[(curIdx + 1) % engines.length]
    return {
        keyword: keyword,
        currentEngine: curEng,
        nextEngine: nextEng
    }
}


function goToNextEngine (tab: browser.tabs.Tab) {
    const state = getCurrentState(tab.url)
    if (!state) {return}
    browser.tabs.update(tab.id, {
        url: state.nextEngine.queryUrl.replace(/{}/, state.keyword)
    })
}

browser.pageAction.onClicked.addListener(function (tab) {
    goToNextEngine(tab)
})

browser.runtime.onMessage.addListener((req: any, sender: any, cb: any) => {
    if (req) {
        browser.pageAction.show(sender.tab.id)
    } else {
        browser.pageAction.hide(sender.tab.id)
    }
})


// Storage
console.log('[background] first time to get config from storage')
browser.storage.sync.get().then((obj) => {
    console.log('[background] storage gotten!', obj)
    if (obj.enabledEngines === undefined) {
        // init data
        browser.storage.sync.set({
            ...STORAGE
        })
    } else {
        STORAGE.enabledEngines = obj.enabledEngines as string[]
    }
    // STORAGE = obj
}).catch(err => {console.error(err)})

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
        console.log('[background] storage changed!', changes)
        STORAGE.enabledEngines = changes.enabledEngines.newValue
    }
})
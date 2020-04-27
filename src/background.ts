import { MyStorage, SearchEngine, CurrentState, ENGINES, isUrlSupported, TypedMsg, TypedMsg_R_String, getEngineObjOfUrl, storageManager } from "./common";


const STORAGE: MyStorage = {
    enabledEngines: [ "duckduckgo", "startpage", "bing", "google" ]
}

function getEnabledEngines (): SearchEngine[] {
    return ENGINES.filter(en => STORAGE.enabledEngines.includes(en.id))
}


async function getCurrentState (tabId: number, currentUrl?: string): Promise<CurrentState | null> {
    if (!currentUrl) {return null}
    const engines = getEnabledEngines()
    if (!isUrlSupported(currentUrl)) { return null }
    const engine = getEngineObjOfUrl(currentUrl)
    if (!engine) { console.error('[To Developer] This should not happened'); return null}
    let curIdx = engines.indexOf(engine)
    if (curIdx === -1) {
        curIdx = 0
    }
    const curEng = engines[curIdx]
    let keyword: string
    if (curEng.queryNeedContentScript) {
        const tmsg: TypedMsg = { type: 'askQueryString' }
        const sending = browser.tabs.sendMessage(tabId, tmsg)
        console.log('Send to tab...')
        try {
            const res = await sending as TypedMsg_R_String
            keyword = res.d
        } catch (err) {
            keyword = 'ERROR' // If error, it means content_script doesn't run or respond 
        }
    } else {
        const urlObj = new URL(currentUrl)
        const params = new URLSearchParams(urlObj.search)
        keyword = params.get(curEng.queryKey) || ''
    }
    const nextEng = engines[(curIdx + 1) % engines.length]
    return {
        keyword: keyword,
        currentEngine: curEng,
        nextEngine: nextEng
    }
}


async function goToNextEngine (tab: browser.tabs.Tab) {
    if (!tab.id) { console.error('ERROR: What the snap?'); return }
    const state = await getCurrentState(tab.id, tab.url)
    if (!state) {return}
    browser.tabs.update(tab.id, {
        url: state.nextEngine.queryUrl.replace(/{}/, state.keyword)
    })
}

browser.pageAction.onClicked.addListener(function (tab) {
    goToNextEngine(tab)
})

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url) {
        // console.log(tabId, changeInfo)
        if (isUrlSupported(changeInfo.url)) {
            browser.pageAction.show(tabId)
        } else {
            browser.pageAction.hide(tabId)
        }
    }
});

// Storage
console.log('[background] first time to get config from storage')
browser.storage.sync.get().then((obj) => {
    console.log('[background] storage gotten!', obj)
    if (obj.enabledEngines === undefined) {
        // init data
        storageManager.setSync({ ...STORAGE })
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

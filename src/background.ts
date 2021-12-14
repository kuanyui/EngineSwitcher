import { MyStorage, SearchEngine, CurrentState, ALL_ENGINES, isUrlSupported, TypedMsg, getEngineObjOfUrl, storageManager, search_engine_t, parseUrlToGetQuery, objectAssign } from "./common";
// =======================================
// Storage
// =======================================
const STORAGE: MyStorage = storageManager.getDefaultData()

storageManager.getData().then((obj) => {
    console.log('[EngineSwitcher][background] first time (since current firefox instance startup) to get config from storage', obj)
    objectAssign(STORAGE, obj)
})
storageManager.onDataChanged((changes) => {
    console.log('[EngineSwitcher][background] storage changed!', changes)
    STORAGE.enabledEngines = changes.enabledEngines.newValue
    STORAGE.floatButton = changes.floatButton.newValue
})


browser.runtime.onMessage.addListener((_ev: any) => {
    const ev = _ev as TypedMsg
    const reply = (r: TypedMsg) => Promise.resolve(r)
    switch (ev.type) {
        case 'getEnabledEnginesFromBg': return reply({ type: ev.type, data: getEnabledEngines()  })
    }
})


function getEnabledEngines(): SearchEngine[] {
    const fin: SearchEngine[] = []
    for (const engineId of STORAGE.enabledEngines) {
        const engine = ALL_ENGINES.find(x => x.id === engineId)
        if (engine) {
            fin.push(engine)
        }
    }
    return fin
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
    let keyword: string = 'ERROR'
    if (curEng.queryNeedContentScript) {
        console.log('Send to tab...')
        try {
            const msg: TypedMsg = { type: 'getQueryStringFromPage', data: '' }
            const res = await browser.tabs.sendMessage(tabId, msg) as TypedMsg
            if (res.type === 'getQueryStringFromPage') {
                keyword = res.data
            }
        } catch (err) {
            // If error, it means content_script doesn't run or respond
            console.error('Encounter an unexpected error, please report. Sorry!')
        }
    } else {
        keyword = parseUrlToGetQuery(curEng, currentUrl)
        console.log('keyword ===', keyword)
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
        url: state.nextEngine.queryUrl.replace(/{}/, encodeURI(state.keyword))
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


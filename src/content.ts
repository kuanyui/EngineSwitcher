import { TypedMsg, isUrlSupported, getEngineObjOfUrl, search_engine_t, SearchEngine, parseUrlToGetQuery, storageManager } from "./common";

browser.runtime.onMessage.addListener((_ev: any) => {
    const ev = _ev as TypedMsg
    const reply = (r: TypedMsg) => Promise.resolve(r)
    if (ev.type === 'getQueryStringFromPage') {
        const res: TypedMsg = { type: ev.type, data: smartGetQueryString() }
        console.log('send to background~', res)
        return Promise.resolve(res)
    }
})

function smartGetQueryString (): string {
    const engine = getEngineObjOfUrl(document.location.href)
    if (!engine) { return 'ERROR: Not supported search engine' }
    switch (engine.id) {
        case 'startpage': return startpageGetQueryString(engine)
        default: return parseUrlToGetQuery(engine, document.location.href)
    }
}

function startpageGetQueryString(engine: SearchEngine): string {
    // Startspage frequently suspect you are abusing them via bot.
    // So when #q is not found on DOM, still try to get keyword from URL
    const el = document.querySelector("#q") as HTMLInputElement
    if (!el) { return parseUrlToGetQuery(engine, document.location.href) || "ERROR: StartPage has changed its HTML structure, please open an issue on EngineSwitcher's Github" }
    return el.value
}

storageManager.getData().then((cfg) => {
    if (cfg.floatButton.enabled) {
        setupFloatBarAfterBodyReady()
    }
    if (cfg.extra.ecosiaEliminateNotifications) {
        ecosiaRemoveStupidAnnoyingNotificationBanner()
    }
})

function makeDebounceFn(fn: () => any, delay: number): () => any {
    let timeoutId = -1
    return () => {
        window.clearTimeout(timeoutId)
        timeoutId = window.setTimeout(fn, delay)
    }
}

function ecosiaRemoveStupidAnnoyingNotificationBanner() {
    console.log('ecosia hack!')
    const mutObserver = new MutationObserver((arr, observer) => {
        const body = arr.find(mut =>
            mut.type === 'childList' &&
            mut.target.nodeType === Node.ELEMENT_NODE &&
            mut.target.nodeName === 'BODY'
        )
        if (body) {
            const styleEl = document.createElement('style')
            // Donno why there are two possible CSS classes to contain this shitty notification banner...
            styleEl.innerText = `
              .main-header .banner { display: none !important; }
              .js-notifications-banner { display: none !important; }
            `
            styleEl.className='engineSwitcherEcosiaHack'
            document.body.append(styleEl)

            mutObserver.disconnect()
            return  // Remember to do this...
        }
    })
    mutObserver.observe(document, {
        childList: true,
        subtree: true,  // false (or omit) to observe only changes to the parent node
    })


    /*
    const deleteElement = makeDebounceFn(() => {
        document.querySelectorAll('.main-header .banner').forEach(el => { el.remove() })
        document.querySelectorAll('.js-notifications-banner').forEach(x => x.remove())
    }, 50)
    const mutObserver = new MutationObserver((arr, observer) => {
        for (let mut of arr) {
            if (mut.type === 'childList') {
                deleteElement()
            }
        }
    })

    mutObserver.observe(document, {
        childList: true,
        subtree: true,  // false (or omit) to observe only changes to the parent node
    })
    */
}

function genIconHtml(engine: SearchEngine, query: string): string {
    const kls = engine.hostname === location.hostname ? 'active' : ''
    const href = engine.queryUrl.replace(/{}/, encodeURI(query))
    return `
    <a href="${href}" class="${kls}">
        <img class="iconImg" src="${engine.iconUrl}">
    </a>
    `
}

async function getEnabledEngines(): Promise<SearchEngine[]> {
    const msg: TypedMsg = { type: 'getEnabledEnginesFromBg', data: [] }
    const res = await browser.runtime.sendMessage(msg) as TypedMsg
    if (res.type === 'getEnabledEnginesFromBg') {
        return res.data
    }
    return []
}

function removeFloatBar() {
    document.querySelectorAll('.engineSwitcherElem').forEach(x => x.remove() )
    const el = document.querySelector('#engineSwitcherBar')
    if (el) { el.remove() }
}

async function setupFloatBar() {
    removeFloatBar()
    const styleEl = document.createElement('style')
    styleEl.className = "engineSwitcherElem"
    const ICON_SIZE = 40
    styleEl.innerText = `
    #engineSwitcherBar {
        --bg: #ffffff;
        --bgActive: #eeeeee;
        --fg: #333333;
        --bd: #cccccc;
        display: flex;
        position: fixed;
        z-index: 99999999999;
        bottom: 0;
        left: 0;
        background: var(--bg);
        border: 1px solid var(--bd);
    }
    #engineSwitcherBar .scrollArea {
        max-width: calc(100vw - 36px);
        overflow-x: scroll;
        display: flex;
        width: 100%;
    }
    #engineSwitcherBar a {
        color: var(--fg);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 2px 10px;
    }
    #engineSwitcherBar a.closeBtn {
        width: 36px;
    }
    #engineSwitcherBar a:hover {
        background: var(--bgActive);
    }
    #engineSwitcherBar a .iconImg {
        width: ${ICON_SIZE}px;
    }
    #engineSwitcherBar a.active {
        background: var(--bgActive);
        filter: brightness(0.9) saturate(0.6);
    }
    body {
        padding-bottom: ${ICON_SIZE}px;
    }
    `
    const floatEl = document.createElement('div')
    floatEl.id = 'engineSwitcherBar'
    floatEl.className = "engineSwitcherElem"
    const enabledEngines = await getEnabledEngines()
    const query = smartGetQueryString()
    const closeIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="12" viewBox="0 0 12 12">
        <path fill="currentColor" fill-rule="nonzero" d="M7.426 6l4.285 4.284a1 1 0 0 1 0 1.415l-.012.012a1 1 0 0 1-1.415 0L6 7.426l-4.284 4.285a1 1 0 0 1-1.415 0l-.012-.012a1 1 0 0 1 0-1.415L4.574 6 .289 1.716A1 1 0 0 1 .29.3L.301.29a1 1 0 0 1 1.415 0L6 4.574 10.284.289a1 1 0 0 1 1.415 0l.012.012a1 1 0 0 1 0 1.415L7.426 6z"></path>
    </svg>`
    const closeBtn = document.createElement('a')
    closeBtn.innerHTML = closeIconSvg
    closeBtn.className = 'closeBtn'
    closeBtn.onclick = function () { removeFloatBar() }

    floatEl.innerHTML = `<div class="scrollArea">
    ${enabledEngines.map(eng => genIconHtml(eng, query)).join('')}
    </div>
    `
    floatEl.prepend(closeBtn)
    document.body.appendChild(floatEl)
    document.head.appendChild(styleEl)

}

function setupFloatBarAfterBodyReady() {
    const debounceSetupFloatBar = makeDebounceFn(() => {
        setupFloatBar()
    }, 50)
    const mutObserver = new MutationObserver((arr, observer) => {
        const body = arr.find(mut =>
            mut.type === 'childList' &&
            mut.target.nodeType === Node.ELEMENT_NODE &&
            mut.target.nodeName === 'BODY'
        )
        if (body) {
            setupFloatBar()
            mutObserver.disconnect()
            return  // Remember to do this...
        }
    })

    mutObserver.observe(document, {
        childList: true,
        subtree: true,  // false (or omit) to observe only changes to the parent node
    })
}

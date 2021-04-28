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
        case 'startpage': return startpageGetQueryString()
        default: return parseUrlToGetQuery(engine, document.location.href)
    }
}

function startpageGetQueryString(): string {
    const el = document.querySelector("#q") as HTMLInputElement
    if (!el) {return "ERROR: StartPage has changed its HTML structure, please open an issue on EngineSwitcher's Github"}
    return el.value
}

storageManager.getData().then((cfg) => {
    if (cfg.floatButton.enabled) {
        window.setTimeout(() => setupFloatBar(), 200)
        window.setTimeout(() => setupFloatBar(), 800)
        window.setTimeout(() => setupFloatBar(), 1600)
    }
})

    function genIconHtml(engine: SearchEngine, query: string): string {
    const kls = engine.hostname === location.hostname ? 'active' : ''
    return `
    <a href="${engine.queryUrl.replace(/{}/, query)}" class="${kls}">
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
    const el = document.querySelector('#ddgqFloatBar')
    if (el) { el.remove() }
}

async function setupFloatBar() {
    removeFloatBar()
    const styleEl = document.createElement('style')
    const ICON_SIZE = 40
    styleEl.innerText = `
    #ddgqFloatBar {
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
    #ddgqFloatBar a {
        color: var(--fg);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 2px 10px;
    }
    #ddgqFloatBar a.closeBtn {
        padding: 0;
    }
    #ddgqFloatBar a:hover {
        background: var(--bgActive);
    }
    #ddgqFloatBar a .iconImg {
        width: ${ICON_SIZE}px;
    }
    #ddgqFloatBar a.active {
        background: var(--bgActive);
        filter: brightness(0.9) saturate(0.6);
    }
    body {
        padding-bottom: ${ICON_SIZE}px;
    }
    `
    const floatEl = document.createElement('div')
    floatEl.id = 'ddgqFloatBar'
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

    floatEl.innerHTML = `
    ${enabledEngines.map(eng => genIconHtml(eng, query)).join('')}
    `
    floatEl.prepend(closeBtn)
    document.body.appendChild(floatEl)
    document.body.appendChild(styleEl)

}


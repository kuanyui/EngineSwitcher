import { TypedMsg, isUrlSupported, getEngineObjOfUrl, search_engine_t, SearchEngine, parseUrlToGetQuery } from "./common";

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

window.setTimeout(() => setupFloatBar(), 800)

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

async function setupFloatBar() {
    const styleEl = document.createElement('style')
    const HEIGHT = 40
    styleEl.innerText = `
    #ddgqFloatBar {
        --bg: #ffffff;
        --bgActive: #eeeeee;
        --bd: #aaaaaa;
        display: flex;
        position: fixed;
        z-index: 99999999999;
        bottom: 0;
        left: 0;
        height: ${HEIGHT}px;
        background: var(--bg);
    }
    #ddgqFloatBar a {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px 10px;
    }
    #ddgqFloatBar a .iconImg {
        width: ${HEIGHT-4}px;
    }
    #ddgqFloatBar a.active {
        background: var(--bgActive);
        filter: brightness(0.9) saturate(0.6);
    }
    body {
        padding-bottom: ${HEIGHT}px;
    }
    `
    const floatEl = document.createElement('div')
    floatEl.id = 'ddgqFloatBar'
    const enabledEngines = await getEnabledEngines()
    const query = smartGetQueryString()
    console.log('a===', enabledEngines)
    floatEl.innerHTML = `
    ${enabledEngines.map(eng => genIconHtml(eng, query)).join('')}
    `
    document.body.appendChild(floatEl)
    document.body.appendChild(styleEl)
}
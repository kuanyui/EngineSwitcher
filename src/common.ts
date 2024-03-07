export type search_engine_t =
    'duckduckgo' |
    'ecosia' |
    'brave' |
    'gibiru' |
    'metager-en' |
    'metager-de' |
    'you-com' |
    'startpage' |
    'yahoo-onesearch' |
    'bing' |
    'google' |
    'yandex-en' |
    'yandex-ru' |
    'goo' |
    'yahoo-us' |
    'yahoo-jp' |
    'enwiki'
export type search_result_source_t =
    '__unknown__' |
    '__own__' |
    'google' |
    'bing' |
    'yandex'
const DEPRECATED_SEARCH_ENGINES = ['gigablast']
export interface SearchEngine {
    /** duckduckgo */
    id: search_engine_t,
    /** DuckDuckGo */
    name: string,
    /**
     * This should be a finger print which is able to cover all conditions.
     * e.g. Sometimes, the hostname of StartPage will become to s7-us4.startpage.com
     * so its hostname should be startpage.com instead of www.startpage.com
     */
    hostname: string,
    /** `q` in ?q= */
    queryKey: string,
    /** https://duckduckgo.com/?q={} */
    queryUrl: string,
    /** Need to get query string via content.js */
    queryNeedContentScript: boolean,
    iconUrl: string,
    privacyInfo: PrivacyInfo
}

export interface PrivacyInfo {
    jurisdiction: string
    resultsSources: search_result_source_t[]
    collectData: CollectData
    since: number
    summary: string
}
export enum CollectData {
    /** Officially claimed "yes" */
    Yes,
    /** Officially claimed "no", and not suspicious so far. */
    No,
    /** Officially maybe claimed "no", but suspicious (e.g. owned by ad-tech). */
    Unknown,
}

export function fmtCollectDataAsPrivate(x: CollectData): string {
    switch (x) {
        case CollectData.Yes: return `❌ No (commercial, or explicitly track you)`
        case CollectData.No: return `☑️ Yes (at least, officially, claimed that won't track you)`
        case CollectData.Unknown: return `❓ Unknown (as far as I don't know how to judge after survey)`
    }
}

export function fmtEngineTooltipHtml(engine: SearchEngine, type: 'options_ui' | 'content'): string {
    switch (type) {
        case 'options_ui': return `
        <b>Private</b>: ${fmtCollectDataAsPrivate(engine.privacyInfo.collectData)}<br/>
        <b>Jurisdiction</b>: ${engine.privacyInfo.jurisdiction}<br/>
        <b>Founded</b>: ${engine.privacyInfo.since}<br/>
        <b>Result Sources</b>: ${fmtResultSources(engine.privacyInfo.resultsSources)}<br/>
        <b>Summary</b>: ${engine.privacyInfo.summary}<br/>
        `
        case 'content': return `
        <b>Name</b>: ${engine.name}<br/>
        <b>Private</b>: ${fmtCollectDataAsPrivate(engine.privacyInfo.collectData)}<br/>
        <b>Result Sources</b>: ${fmtResultSources(engine.privacyInfo.resultsSources)}<br/>
        <b>Summary</b>: ${engine.privacyInfo.summary}<br/>
        `
    }
}
export function fmtResultSources(xs: search_result_source_t[]): string {
    return xs.map(x => {
        switch (x) {
            case '__own__': return 'Own Crawler'
            case '__unknown__': return 'Unknown'
            case 'google': return 'Google'
            case 'bing': return 'Bing'
            case 'yandex': return 'Yandex'
        }
    }).join(' + ')
}

export interface CurrentState {
    keyword: string,
    currentEngine: SearchEngine,
    nextEngine: SearchEngine,
}

export interface MyStorage {
    apiLevel: 1,
    enabledEngines: search_engine_t[],
    floatButton: {
        enabled: boolean,
    },
    extra: {
        /** Remove annoying and useless shitty notifications on top of page in Ecosia. */
        ecosiaEliminateNotifications: boolean,
    }
}

export const ALL_ENGINES: SearchEngine[] = [
    {
        id: 'duckduckgo',
        name: 'DuckDuckGo',
        hostname: 'duckduckgo.com',
        queryKey: 'q',
        queryUrl: 'https://duckduckgo.com/?q={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/duckduckgo.svg'),
        privacyInfo: {
            collectData: CollectData.No,
            jurisdiction: '🇺🇸 United States',
            resultsSources: ['__own__', 'bing'],
            since: 2009,
            summary: "Probably the most famous privacy search engine among software developer. Quack!",
        }
    },
    {
        id: 'ecosia',
        name: 'Ecosia',
        hostname: 'www.ecosia.org',
        queryKey: 'q',
        queryUrl: 'https://www.ecosia.org/search?q={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/ecosia.svg'),
        privacyInfo: {
            collectData: CollectData.No,
            jurisdiction: '🇩🇪 Germany',
            resultsSources: ['bing'],
            since: 2009,
            summary: "Ecosia donates at least 80% of its profits from ad revenue to a tree planting program."
        }
    },
    {
        id: 'brave',
        name: 'Brave',
        hostname: 'search.brave.com',
        queryKey: 'q',
        queryUrl: 'https://search.brave.com/search?q={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/brave.svg'),
        privacyInfo: {
            collectData: CollectData.No,
            jurisdiction: '🇺🇸 United States',
            resultsSources: ['__own__'],
            since: 2021,
            summary: "Created by Brave Browser, use self-created crawler."
        }
    },
    {
        id: 'gibiru',
        name: 'Gibiru',
        hostname: 'gibiru.com',
        queryKey: 'q',
        queryUrl: 'https://gibiru.com/results.html?q={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/gibiru.png'),
        privacyInfo: {
            collectData: CollectData.No,
            jurisdiction: '🇺🇸 United States',
            resultsSources: ['__unknown__'],
            since: 2009,
            summary: "Uncensored private search. Official site provided very few information about itself. Unknown crawler. Server seems located in US according to Flagfox Geotool."
        }
    },
    {
        id: 'metager-en',
        name: 'MetaGer (English)',
        hostname: 'metager.org',
        queryKey: 'eingabe',
        queryUrl: 'https://metager.org/meta/meta.ger3?eingabe={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/metager.svg'),
        privacyInfo: {
            collectData: CollectData.No,
            jurisdiction: '🇩🇪 Germany',
            resultsSources: ['__unknown__'],
            since: 1996,
            summary: "A Germany based privacy-focused search engine, with the results from Bing. (English version)"
        }
    },
    {
        id: 'metager-de',
        name: 'MetaGer (Deutsch)',
        hostname: 'metager.de',
        queryKey: 'eingabe',
        queryUrl: 'https://metager.de/meta/meta.ger3?eingabe={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/metager.svg'),
        privacyInfo: {
            collectData: CollectData.No,
            jurisdiction: '🇩🇪 Germany',
            resultsSources: ['bing'],
            since: 1996,
            summary: "A Germany based privacy-focused search engine, with the results from Bing. (Germany version)"
        }
    },
    {
        id: 'you-com',
        name: 'You.com',
        hostname: 'you.com',
        queryKey: 'q',
        queryUrl: 'https://you.com/search?q={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/you-com.webp'),
        privacyInfo: {
            collectData: CollectData.No,
            jurisdiction: '🇺🇸 United States',
            resultsSources: ['bing'],
            since: 2021,
            summary: "A search engine with a balance of privacy and personalization, founded by former Salesforce employees and public beta on 2021. "
        }
    },
    {
        id: 'yahoo-onesearch',
        name: 'Yahoo OneSearch',
        hostname: 'www.onesearch.com',
        queryKey: 'p',
        queryUrl: 'https://www.onesearch.com/yhs/search?p={}',
        queryNeedContentScript: true,
        iconUrl: browser.runtime.getURL('img/engines/yahoo-onesearch.png'),
        privacyInfo: {
            collectData: CollectData.Unknown,
            jurisdiction: '🇮🇪 Ireland',
            resultsSources: ['__unknown__'],
            since: 2020,
            summary: "Owned by Verizon Yahoo!, claims that no cookie nor tracker are used. But the information provided by its official site is quite limited. Server seems located in Ireland according to Flagfox Geotool. <b>NOTICE THAT this OneSearch uses some unknown magic, which force all links opened with new tab, I don't know how to eliminate this effect currently; therefore, not recommended to use.</b>"
        }
    },
    {
        id: 'startpage',
        name: 'StartPage',
        hostname: 'startpage.com',
        queryKey: 'query',
        queryUrl: 'https://www.startpage.com/sp/search?query={}',
        queryNeedContentScript: true,
        iconUrl: browser.runtime.getURL('img/engines/startpage.svg'),
        privacyInfo: {
            collectData: CollectData.Unknown,
            jurisdiction: '🇳🇱 Netherlands',
            resultsSources: ['google'],
            since: 1998,
            summary: "Since 2019, Startpage has been acquired by System1, Privacy One Group, an American ad-tech company."
        }
    },
    {
        id: 'bing',
        name: 'Bing',
        hostname: 'www.bing.com',
        queryKey: 'q',
        queryUrl: 'https://www.bing.com/search?q={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/bing.svg'),
        privacyInfo: {
            collectData: CollectData.Yes,
            jurisdiction: '🇺🇸 United States',
            resultsSources: ['__own__'],
            since: 2009,
            summary: "Created by Microsoft."
        }
    },
    {
        id: 'google',
        name: 'Google',
        hostname: 'www.google.com',
        queryKey: 'q',
        queryUrl: 'https://www.google.com/search?q={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/google.svg'),
        privacyInfo: {
            collectData: CollectData.Yes,
            jurisdiction: '🇺🇸 United States',
            resultsSources: ['__own__'],
            since: 1998,
            summary: "Had removed 'Don't Be Evil' clause from its founding principle."
        }
    },
    {
        id: 'yandex-en',
        name: 'Yandex',
        hostname: 'yandex.com',
        queryKey: 'text',
        queryUrl: 'https://yandex.com/search/?text={}',  // https://yandex.ru/search/?text={}
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/yandex-en.svg'),
        privacyInfo: {
            collectData: CollectData.Yes,
            jurisdiction: '🇷🇺 Russia',
            resultsSources: ['__own__'],
            since: 1997,
            summary: "The most popular search engine across Russia and the Commonwealth of Independent States of the former Soviet Union. English UI."
        }
    },
    {
        id: 'yandex-ru',
        name: 'Яндекс',
        hostname: 'yandex.ru',
        queryKey: 'text',
        queryUrl: 'https://yandex.ru/search/?text={}',  // https://yandex.ru/search/?text={}
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/yandex-ru.svg'),
        privacyInfo: {
            collectData: CollectData.Yes,
            jurisdiction: '🇷🇺 Russia',
            resultsSources: ['__own__'],
            since: 1997,
            summary: "The most popular search engine across Russia and the Commonwealth of Independent States of the former Soviet Union. Russian UI."
        }
    },
    {
        id: 'yahoo-us',
        name: 'Yahoo!',
        hostname: 'search.yahoo.com',
        queryKey: 'p',
        queryUrl: 'https://search.yahoo.com/search?p={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/yahoo-us.svg'),
        privacyInfo: {
            collectData: CollectData.Yes,
            jurisdiction: '🇺🇸 United States',
            resultsSources: ['bing'],
            since: 1995,
            summary: "Currently, the search results are basically provided by Bing instead of own crawler."
        }
    },
    {
        id: 'yahoo-jp',
        name: 'Yahoo! JAPAN',
        hostname: 'search.yahoo.co.jp',
        queryKey: 'p',
        queryUrl: 'https://search.yahoo.co.jp/search?p={}',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/yahoo-jp.svg'),
        privacyInfo: {
            collectData: CollectData.Yes,
            jurisdiction: '🇯🇵 Japan',
            resultsSources: ['__own__'],
            since: 1996,
            summary: "Owned by SoftBank since 2018. Crawler engine is Yahoo Search Technology (YST), developed by Yahoo!"
        }
    },
    {
        id: 'goo',
        name: 'goo',
        hostname: 'search.goo.ne.jp',
        queryKey: 'MT',
        queryUrl: 'https://search.goo.ne.jp/web.jsp?MT={}&IE=UTF-8&OE=UTF-8',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/goo.svg'),
        privacyInfo: {
            collectData: CollectData.Yes,
            jurisdiction: '🇯🇵 Japan',
            resultsSources: ['__own__'],
            since: 1999,
            summary: "Owned by NTT, crawler engine technology is powered by Google, but crawl primarily Japanese websites."
        }
    },
    {
        id: 'enwiki',
        name: 'English Wikipedia',
        hostname: 'en.wikipedia.org',
        queryKey: 'search',
        queryUrl: 'https://en.wikipedia.org/w/index.php?search={}&title=Special:Search&fulltext=1&ns0=1',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/wikipedia.svg'),
        privacyInfo: {
            collectData: CollectData.No,
            jurisdiction: '🇺🇸 United States',
            resultsSources: ['__own__'],
            since: 2001,
            summary: "Open encyclopedia that anybody can edit"
        },
    },
]


export function getEngineById(engineId: search_engine_t): SearchEngine {
    return ALL_ENGINES.find(x=>x.id === engineId)!
}

export function objectAssign<N, T extends N>(target: T, newVal: N): T {
    // @ts-ignore
    return Object.assign(target, newVal)
}

export type TypedMsg =
    { type: 'getQueryStringFromPage', data: string } |
    { type: 'getEnabledEnginesFromBg', data: SearchEngine[] }
// TODO: This is actually unnecessary... browser.storage can be access in content scripts
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage

export function deepCopy<T>(x: T): T {
    return JSON.parse(JSON.stringify(x))
}

export function parseUrlToGetQuery(engine: SearchEngine, url: string): string {
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search)
    return params.get(engine.queryKey) || ''
}

export function isUrlSupported (currentUrl: string): boolean {
    const urlObj = new URL(currentUrl + '')
    return ALL_ENGINES.some(eng => urlObj.hostname.includes(eng.hostname))
}

export function getEngineObjOfUrl (currentUrl: string): SearchEngine | undefined {
    const urlObj = new URL(currentUrl + '')
    return ALL_ENGINES.find(eng => urlObj.hostname.includes(eng.hostname))
}

export function storageSetSync (d: Partial<MyStorage>): void {
    browser.storage.sync.set(d)
}

class StorageManager {
    area: browser.storage.StorageArea
    constructor() {
        // Firefox for Android (90) doesn't support `sync` area yet,
        // so write a fallback for it.
        if (browser.storage.sync) {
            this.area = browser.storage.sync
        } else {
            this.area = browser.storage.local
        }
    }
    getDefaultData(): MyStorage {
        let enabledEngines: search_engine_t[] = ["duckduckgo", "ecosia", "brave"]
        if (navigator.languages.includes('ja-JP') || navigator.languages.includes('zh-TW')) {
            enabledEngines.push("goo", "yahoo-jp")
        } else if (navigator.languages.some(x=>x.startsWith('ru-'))) {
            enabledEngines.push("yandex-ru")
        }
        if (!enabledEngines.includes("yandex-ru")) {
            enabledEngines.push("yandex-en")
        }
        // if (!enabledEngines.includes("yahoo-jp")) {
        //     enabledEngines.push("yahoo-us")
        // }
        enabledEngines.push("bing", "google")
        return {
            apiLevel: 1,
            enabledEngines: enabledEngines,
            floatButton: {
                enabled: true,
            },
            extra: {
                ecosiaEliminateNotifications: false,
            }
        }
    }
    /** Set data object (can be partial) into LocalStorage. */
    setDataPartially(d: Partial<MyStorage>): void {
        console.log('[SET] TO STORAGE', deepCopy(d))
        this.area.set(deepCopy(d))
    }
    setData(d: Partial<MyStorage>): void {
        this.area.set(deepCopy(d))
    }
    getData (): Promise<MyStorage> {
        return this.area.get().then((_d) => {
            const d = _d as unknown as MyStorage
            const defaultValue = storageManager.getDefaultData()
            // Too lazy to do migration ....
            if (
                !d ||
                d.enabledEngines === undefined ||
                d.floatButton === undefined ||
                d.floatButton.enabled === undefined
            ) {
                storageManager.setData(defaultValue)
                return defaultValue
            }
            d.enabledEngines = d.enabledEngines.filter(x => !DEPRECATED_SEARCH_ENGINES.includes(x))
            return Object.assign(defaultValue, d)
        }).catch((err) => {
            console.error('Error when getting settings from browser.storage:', err)
            return storageManager.getDefaultData()
        })
    }
    onDataChanged(cb: (changes: browser.storage.ChangeDict) => void) {
        browser.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync' || areaName === 'local') {
                cb(changes)
            }
        })
    }
}
export const storageManager = new StorageManager()

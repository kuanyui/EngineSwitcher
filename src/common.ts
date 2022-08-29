export type search_engine_t =
    'duckduckgo' |
    'ecosia' |
    'brave' |
    'startpage' |
    'bing' |
    'google' |
    'yandex-en' |
    'yandex-ru' |
    'goo' |
    'yahoo-us' |
    'yahoo-jp' |
    'enwiki'
export type search_result_source_t =
    '__own__' |
    'google' |
    'bing' |
    'yandex'
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
        case CollectData.Yes: return `❌ No (explicitly track you)`
        case CollectData.No: return `☑️ Yes (at least, officially, claimed that won't track you)`
        case CollectData.Unknown: return `❓ Suspicious (e.g. owned by ad-tech)`
    }
}
export function fmtResultSources(xs: search_result_source_t[]): string {
    return xs.map(x => {
        switch (x) {
            case '__own__': return 'Own Crawler'
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
            jurisdiction: 'US',
            resultsSources: ['__own__', 'bing'],
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
            jurisdiction: 'DE',
            resultsSources: ['bing']
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
            jurisdiction: 'US',
            resultsSources: ['__own__']
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
            jurisdiction: 'NL',
            resultsSources: ['google']
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
            jurisdiction: 'US',
            resultsSources: ['__own__']
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
            jurisdiction: 'US',
            resultsSources: ['__own__']
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
            jurisdiction: 'RU',
            resultsSources: ['__own__']
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
            jurisdiction: 'RU',
            resultsSources: ['__own__']
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
            jurisdiction: 'US',
            resultsSources: ['bing']
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
            jurisdiction: 'JP',
            resultsSources: ['__own__']
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
            jurisdiction: 'JP',
            resultsSources: ['__own__']
        }
    },
    {
        id: 'enwiki',
        name: 'English Wikipedia (Not recommended)',
        hostname: 'en.wikipedia.org',
        queryKey: 'search',
        queryUrl: 'https://en.wikipedia.org/w/index.php?search={}&title=Special:Search&fulltext=1&ns0=1',
        queryNeedContentScript: false,
        iconUrl: browser.runtime.getURL('img/engines/wikipedia.svg'),
        privacyInfo: {
            collectData: CollectData.Yes,
            jurisdiction: 'US',
            resultsSources: ['__own__']
        }
    },
]


export function countryCodeEmoji(cc: string) {
    // country code regex
    const CC_REGEX = /^[a-z]{2}$/i;
    // offset between uppercase ascii and regional indicator symbols
    const OFFSET = 127397;
    if (!CC_REGEX.test(cc)) {
      const type = typeof cc;
      throw new TypeError(
        `cc argument must be an ISO 3166-1 alpha-2 string, but got '${
          type === 'string' ? cc : type
        }' instead.`,
      );
    }

    const codePoints = [...cc.toUpperCase()].map(c => c.codePointAt(0)! + OFFSET);
    return String.fromCodePoint(...codePoints);
  }


export function getEngineById(engineId: search_engine_t): SearchEngine {
    return ALL_ENGINES.find(x=>x.id === engineId)!
}

export function objectAssign<N, T extends N>(target: T, newVal: N): T {
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
            enabledEngines = enabledEngines.concat(["goo", "yahoo-jp"])
        } else if (navigator.languages.some(x=>x.startsWith('ru-'))) {
            enabledEngines = enabledEngines.concat(["yandex-ru"])
        }
        if (!enabledEngines.includes("yandex-ru")) {
            enabledEngines.push("yandex-en")
        }
        if (!enabledEngines.includes("yahoo-jp")) {
            enabledEngines.push("yahoo-us")
        }
        enabledEngines = enabledEngines.concat(["bing", "google"])
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

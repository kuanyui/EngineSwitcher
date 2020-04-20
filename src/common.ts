export type search_engine_t = 'duckduckgo' | 'startpage' | 'bing' | 'google' | 'enwiki'
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
}

export interface CurrentState {
    keyword: string,
    currentEngine: SearchEngine,
    nextEngine: SearchEngine,
}

export interface MyStorage {
    enabledEngines: string[],
}

export const ENGINES: SearchEngine[] = [
    {
        id: 'duckduckgo',
        name: 'DuckDuckGo',
        hostname: 'duckduckgo.com',
        queryKey: 'q',
        queryUrl: 'https://duckduckgo.com/?q={}',
        queryNeedContentScript: false,
    },
    { 
        id: 'startpage',
        name: 'StartPage',
        hostname: 'startpage.com',
        queryKey: 'query',
        queryUrl: 'https://www.startpage.com/do/dsearch/?query={}',
        queryNeedContentScript: true,
    },
    { 
        id: 'bing',
        name: 'Bing',
        hostname: 'www.bing.com',
        queryKey: 'q',
        queryUrl: 'https://www.bing.com/search?q={}',
        queryNeedContentScript: false,
    },
    { 
        id: 'google',
        name: 'Google',
        hostname: 'www.google.com',
        queryKey: 'q',
        queryUrl: 'https://www.google.com/search?q={}',
        queryNeedContentScript: false,
    },
    { 
        id: 'enwiki',
        name: 'English Wikipedia',
        hostname: 'en.wikipedia.org',
        queryKey: 'search',
        queryUrl: 'https://en.wikipedia.org/wiki/Spezial:Suche?search={}',
        queryNeedContentScript: false,
    },
]

export interface TypedMsg {
    type: 'askQueryString' | 'ansQueryString'
}

export interface TypedMsg_R_String {
    d: string
}

export function isUrlSupported (currentUrl: string): boolean {
    const urlObj = new URL(currentUrl + '')
    return ENGINES.some(eng => urlObj.hostname.includes(eng.hostname))
}

export function getEngineObjOfUrl (currentUrl: string): SearchEngine | undefined {
    const urlObj = new URL(currentUrl + '')
    return ENGINES.find(eng => urlObj.hostname.includes(eng.hostname))
}

export function storageSetSync (d: Partial<MyStorage>): void {
    browser.storage.sync.set(d)
}

export class storageManager {
    static setSync (d: Partial<MyStorage>): void {
        browser.storage.sync.set(d)
    }
    static getSync (): Promise<MyStorage> {
        return browser.storage.sync.get().then((d) => {
            return d as unknown as MyStorage
        }).catch((err) => {
            console.error('Error when getting settings from browser.storage.sync:', err)
            return { enabledEngines: [] }
        })
    }
}

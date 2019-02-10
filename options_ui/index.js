// Copy & paste from background.js to here because I haven't found an easy way to use import statements in fucking JavaScript with TypeScript and its shit runtime
// Shit Extension
const ENGINES = [
    {
        id: 'duckduckgo',
        name: 'DuckDuckGo',
        hostname: 'duckduckgo.com',
        queryKey: 'q',
        queryUrl: 'https://duckduckgo.com/?q={}',
    },
    { 
        id: 'startpage',
        name: 'StartPage',
        hostname: 'www.startpage.com',
        queryKey: 'query',
        queryUrl: 'https://www.startpage.com/do/dsearch/?query={}',
    },
    { 
        id: 'bing',
        name: 'Bing',
        hostname: 'www.bing.com',
        queryKey: 'q',
        queryUrl: 'https://www.bing.com/search?q={}',
    },
    { 
        id: 'google',
        name: 'Google',
        hostname: 'www.google.com',
        queryKey: 'q',
        queryUrl: 'https://www.google.com/search?q={}',
    },
]


new Vue({
    el: "#app",
    data: {
        ENGINES: ENGINES,
        idOfEnabledEngines: [], /** string[] */
        selectedEngine: null, /** object */
    },
    computed: {
        enabledEngines () {
            return this.idOfEnabledEngines.map(id => ENGINES.find(en => en.id === id))
        },
        disabledEngines () {
            return this.ENGINES.filter(x => !this.idOfEnabledEngines.includes(x.id))
        }
    },
    methods: {
        save () {
            browser.storage.sync.set({ 
                enabledEngines: this.idOfEnabledEngines
            })
        },
        addEngine () {
            this.idOfEnabledEngines.push(this.selectedEngine.id)
            this.selectedEngine = null
            this.save()
        },
        delEngine (index) {
            if (this.idOfEnabledEngines.length === 1) {return}
            this.idOfEnabledEngines.splice(index, 1)
            this.save()
        },
        moveUp (index) {
            if (index === 0) {return}
            const a0 = this.idOfEnabledEngines[index - 1]
            const a1 = this.idOfEnabledEngines[index]
            this.idOfEnabledEngines.splice(index - 1, 2, a1, a0)
            this.save()
        },
        moveDn (index) {
            if (index === this.idOfEnabledEngines.length - 1) {return}
            const a0 = this.idOfEnabledEngines[index]
            const a1 = this.idOfEnabledEngines[index + 1]
            this.idOfEnabledEngines.splice(index, 2, a1, a0) 
            this.save()
        }
    },
    mounted () {
        browser.storage.sync.get().then((obj) => {
            this.idOfEnabledEngines = obj.enabledEngines // || [ "duckduckgo", "startpage", "bing", "google" ]   // Shit WebExtension
        }).catch((err) => {
            console.error('[Error]', err)
        })
    },
})
// Copy & paste from background.js to here because I haven't found an easy way to use import statements in fucking JavaScript and its shit runtime
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
        enabledEngines: [], /** string[] */
        selectedEngine: null, /** object */
    },
    computed: {
        disabledEngines () {
            return this.ENGINES.filter(x => !this.enabledEngines.includes(x.id))
        }
    },
    methods: {
        addEngine () {
            this.enabledEngines.push(this.selectedEngine.id)
            this.selectedEngine = null
        }
    },
    mounted () {

    }
})
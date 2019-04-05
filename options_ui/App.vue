<template lang="pug">
    
</template>

<script lang="ts">
import Vue from 'vue'
import { ENGINES, SearchEngine, storageManager } from '../src/common';
export default Vue.extend({
    data (): {
        ENGINES: typeof ENGINES,
        idOfEnabledEngines: string[],
        selectedEngine: null | SearchEngine
    } {
        return {
            ENGINES: ENGINES,
            idOfEnabledEngines: [], 
            selectedEngine: null,
        }
    },
    computed: {
        enabledEngines (): SearchEngine[] {
            return ENGINES.filter(en => this.idOfEnabledEngines.includes(en.id))
        },
        disabledEngines (): SearchEngine[] {
            return this.ENGINES.filter(x => !this.idOfEnabledEngines.includes(x.id))
        }
    },
    methods: {
        save () {
            storageManager.setSync({
                enabledEngines: this.idOfEnabledEngines
            })
        },
        addEngine () {
            if (!this.selectedEngine) {return}
            this.idOfEnabledEngines.push(this.selectedEngine.id)
            this.selectedEngine = null
            this.save()
        },
        delEngine (index: number) {
            if (this.idOfEnabledEngines.length === 1) {return}
            this.idOfEnabledEngines.splice(index, 1)
            this.save()
        },
        moveUp (index: number) {
            if (index === 0) {return}
            const a0 = this.idOfEnabledEngines[index - 1]
            const a1 = this.idOfEnabledEngines[index]
            this.idOfEnabledEngines.splice(index - 1, 2, a1, a0)
            this.save()
        },
        moveDn (index: number) {
            if (index === this.idOfEnabledEngines.length - 1) {return}
            const a0 = this.idOfEnabledEngines[index]
            const a1 = this.idOfEnabledEngines[index + 1]
            this.idOfEnabledEngines.splice(index, 2, a1, a0)
            this.save()
        }
    },
    mounted () {
        storageManager.getSync().then((d) => {
            this.idOfEnabledEngines = d.enabledEngines
        })
    },
})
</script>

<style lang="stylus">
table {
    border-collapse: collapse;
    width: 100%;
}

th, td {
    text-align: left;
    width: 33%;
    border-bottom: 1px solid #ddd;
    font-size: 14px;
    padding: 2px 12px;
    vertical-align: middle;
}

tr:hover td {
    background-color: #eee;
}

.icon-button {
    cursor: pointer;
    font-size: 24px;
}
</style>

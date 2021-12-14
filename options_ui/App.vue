<template lang="pug">
.container
  nav.navbar.navbar-light.bg-light
    a.navbar-brand(href='https://addons.mozilla.org/en-US/firefox/addon/privacy-search-engine-switcher/' target='_blank')
      img.d-inline-block.align-top(src='../img/icon.svg', width='30', height='30', alt='')
      span Engine Switcher
  .container
    p
    h5 Enabled Search Engines
    .form-row
      .col-auto
        select.form-control(v-model='selectedEngine' :disabled='disabledEngines.length === 0')
          option(v-for='en in disabledEngines' :value='en') {{ en.name }}
      .col-auto
        button.btn.btn-primary(@click='addEngine', :disabled='!selectedEngine') + Add

    table
      thead
        tr
          th Order
          th Name
          th Move
          th Delete
      tbody
        tr(v-for='(en, index) in enabledEngineObjList' :key='en.id')
          td {{ index + 1 }}
          td
            img.engine-logo(:src="en.iconUrl")
            span {{ en.name }}
          td
            span.icon-button(@click='moveUp(index)') &#x25B2;
            span.icon-button(@click='moveDn(index)') &#x25BC;
          td
            span.icon-button(@click='delEngine(index)') &#x2A09;
    label Use float buttons (Especially useful for mobile)
      input(type="checkbox" v-model="copiedModel.floatButton.enabled" @changed="save")

</template>

<script lang="ts">
import Vue from 'vue'
import { ALL_ENGINES, SearchEngine, storageManager, search_engine_t, MyStorage } from '../src/common';
export default Vue.extend({
    data (): {
        copiedModel: MyStorage,
        selectedEngine: null | SearchEngine
    } {
        return {
            copiedModel: storageManager.getDefaultData(),
            selectedEngine: null,
        }
    },
    computed: {
        enabledEngineObjList (): SearchEngine[] {
            return this.copiedModel.enabledEngines.map((id): SearchEngine => {
                const en = ALL_ENGINES.find(e => e.id === id)
                return en as SearchEngine
            })
        },
        disabledEngines (): SearchEngine[] {
            return ALL_ENGINES.filter(x => !this.copiedModel.enabledEngines.includes(x.id))
        }
    },
    methods: {
        save () {
            console.log('local storage saving => ', this.copiedModel)
            storageManager.setData(this.copiedModel)
            console.log('local storage saved!!!')
        },
        addEngine () {
            if (!this.selectedEngine) {return}
            this.copiedModel.enabledEngines.push(this.selectedEngine.id)
            this.selectedEngine = null
        },
        delEngine (index: number) {
            if (this.copiedModel.enabledEngines.length === 1) {return}
            this.copiedModel.enabledEngines.splice(index, 1)
        },
        moveUp (index: number) {
            if (index === 0) {return}
            const a0 = this.copiedModel.enabledEngines[index - 1]
            const a1 = this.copiedModel.enabledEngines[index]
            this.copiedModel.enabledEngines.splice(index - 1, 2, a1, a0)
        },
        moveDn (index: number) {
            if (index === this.copiedModel.enabledEngines.length - 1) {return}
            const a0 = this.copiedModel.enabledEngines[index]
            const a1 = this.copiedModel.enabledEngines[index + 1]
            this.copiedModel.enabledEngines.splice(index, 2, a1, a0)
        }
    },
    mounted () {
        storageManager.getData().then((d) => {
            this.copiedModel = d
            console.log('getSync =', d)
            this.$watch(
                () => this.copiedModel,
                (nv) => {
                    this.save()
                    console.log('save!!!!')
                },
                { deep: true })
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
.engine-logo {
    height: 1rem;
    margin-right: 0.5rem;
}
</style>

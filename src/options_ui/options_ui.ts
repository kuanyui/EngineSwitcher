/*!
 * Copyright (c) 2021-2022 ono ono (kuanyui) All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0 (MPL-2.0). If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * You may not remove or alter the substance of any license notices (including
 * copyright notices, patent notices, disclaimers of warranty, or limitations of
 * liability) contained within the Source Code Form of the Covered Software,
 * except that You may alter any license notices to the extent required to
 * remedy known factual inaccuracies. (Cited from MPL - 2.0, chapter 3.3)
 */

import { ALL_ENGINES, countryCodeEmoji, fmtCollectDataAsPrivate, fmtResultSources, getEngineById, SearchEngine, search_engine_t, storageManager } from "../common"
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

function getEl<T extends HTMLElement>(elementId: string): T {
    const el = document.getElementById(elementId)
    if (!el) { throw new TypeError(`[To Developer] The element id ${elementId} is not found`) }
    return el as T
}

function getSelectValue(id: string): string {
    return getEl<HTMLSelectElement>(id).value
}
function setSelectValue(id: string, value: string) {
    getEl<HTMLSelectElement>(id).value = value
}
function getRadioValue(radioGroupName: string): string {
    const radioList = document.querySelectorAll<HTMLInputElement>(`input[name="${radioGroupName}"]`)
    for (const radio of radioList) {
        if (radio.checked) {
            return radio.value
        }
    }
    return ''
}
function setRadioValue(radioGroupName: string, value: string) {
    const radioList = document.querySelectorAll<HTMLInputElement>(`input[name="${radioGroupName}"]`)
    for (const radio of radioList) {
        if (radio.value === value) {
            radio.checked = true
            return
        }
    }
}
function getCheckboxValue(id: string): boolean {
    return getEl<HTMLInputElement>(id).checked
}
function setCheckboxValue(id: string, checked: boolean) {
    getEl<HTMLInputElement>(id).checked = checked
}
function getTextAreaValue(id: string): string {
    return getEl<HTMLTextAreaElement>(id).value
}
function setTextAreaValue(id: string, value: string) {
    getEl<HTMLTextAreaElement>(id).value = value
}
function setContentEditableValue(id: string, value: string) {
    getEl<HTMLDivElement>(id).innerText =value
}

function q<T extends HTMLElement>(query: string): T {
    const el = document.querySelector(query)
    if (!el) { throw new TypeError(`[To Developer] The element id ${query} is not found`) }
    return el as T
}
function qs<T extends HTMLElement>(query: string): NodeListOf<T> {
    const res = document.querySelectorAll(query)
    if (!res) { throw new TypeError(`[To Developer] The element id ${query} is not found`) }
    return res as NodeListOf<T>
}

function swap<T>(arr: T[], i: number, j: number): void {
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
}

class OptionUIManager {
    private selectedId: search_engine_t | '' = ''
    private disabledTbody = q<HTMLTableSectionElement>('#disabledEngines')!
    private enabledTbody = q<HTMLTableSectionElement>('#enabledEngines')!
    private enabledArr: search_engine_t[] = []
    private btns = {
        enableEngine: q<HTMLButtonElement>('#enableEngine'),
        disableEngine: q<HTMLButtonElement>('#disableEngine'),
        moveTop: q<HTMLButtonElement>('#moveTop'),
        moveUp: q<HTMLButtonElement>('#moveUp'),
        moveDown: q<HTMLButtonElement>('#moveDown'),
        moveBottom: q<HTMLButtonElement>('#moveBottom'),
    }
    public onchange: (newVal: search_engine_t[]) => any = (newVal: search_engine_t[]) => undefined
    constructor() {
        this.buildTable()
        this.buildButtons()
    }
    public setModel(newArr: search_engine_t[]) {
        console.log('setModel', newArr)
        this.enabledArr = newArr
        this.buildTable()
    }
    private selectEngine(id: search_engine_t) {
        this.selectedId = this.selectedId === id ? '' : id
        console.log('click on tr:', id)
        this.rerender()
    }
    private rerender() {
        this.renderTable()
        this.renderButtons()
    }
    private renderTable() {
        const allRows = document.querySelectorAll('tr.engineRow')
        allRows.forEach(x => x.classList.remove('active'))
        if (this.selectedId) {
            for (const x of allRows) {
                const value = x.getAttribute('value')
                if (value === this.selectedId) {
                    x.classList.add('active')
                    return
                }
            }
        }
    }
    private renderButtons() {
        if (!this.selectedId) {
            qs<HTMLButtonElement>('.actBtn').forEach(x => x.setAttribute('disabled', 'true'))
        } else {
            const selectedIdIsEnabled = this.enabledArr.includes(this.selectedId as any)
            if (selectedIdIsEnabled) {
                qs<HTMLButtonElement>('.actBtn').forEach(x => x.removeAttribute('disabled'))
                this.btns.enableEngine.setAttribute('disabled', 'true')
                const i = this.enabledArr.indexOf(this.selectedId)
                const isFirst = i === 0
                const isLast = i === this.enabledArr.length - 1
                if (isFirst) {
                    this.btns.moveUp.setAttribute('disabled', 'true')
                    this.btns.moveTop.setAttribute('disabled', 'true')
                } else if (isLast) {
                    this.btns.moveDown.setAttribute('disabled', 'true')
                    this.btns.moveBottom.setAttribute('disabled', 'true')
                }
            } else {
                qs<HTMLButtonElement>('.actBtn').forEach(x => x.setAttribute('disabled', 'true'))
                this.btns.enableEngine.removeAttribute('disabled')
            }
        }
    }
    private buildButtons() {
        this.btns.enableEngine.onclick = () => this.actEnableEngine()
        this.btns.disableEngine.onclick = () => this.actDisableEngine()
        this.btns.moveTop.onclick = () => this.actMoveTop()
        this.btns.moveUp.onclick = () => this.actMoveUp()
        this.btns.moveDown.onclick = () => this.actMoveDown()
        this.btns.moveBottom.onclick = () => this.actMoveBottom()
    }
    private emitChanges() {
        this.onchange(this.enabledArr)
    }
    private actEnableEngine() {
        console.log('[button] clicked on enableEngine')
        if (!this.selectedId) { return }
        this.enabledArr.push(this.selectedId)
        this.buildTable()
        this.emitChanges()
    }
    private actDisableEngine() {
        console.log('[button] clicked on enableEngine')
        if (!this.selectedId) { return }
        const i = this.enabledArr.indexOf(this.selectedId)
        this.enabledArr.splice(i, 1)
        this.buildTable()
        this.emitChanges()
    }
    private actMoveTop () {
        if (!this.selectedId) { return }
        const i = this.enabledArr.indexOf(this.selectedId)
        this.enabledArr.splice(i, 1)
        this.enabledArr.unshift(this.selectedId)
        this.buildTable()
        this.emitChanges()
    }
    private actMoveUp () {
        if (!this.selectedId) { return }
        const i = this.enabledArr.indexOf(this.selectedId)
        swap(this.enabledArr, i, i-1)
        this.buildTable()
        this.emitChanges()
    }
    private actMoveDown () {
        if (!this.selectedId) { return }
        const i = this.enabledArr.indexOf(this.selectedId)
        swap(this.enabledArr, i, i+1)
        this.buildTable()
        this.emitChanges()
    }
    private actMoveBottom () {
        if (!this.selectedId) { return }
        const i = this.enabledArr.indexOf(this.selectedId)
        this.enabledArr.splice(i, 1)
        this.enabledArr.push(this.selectedId)
        this.buildTable()
        this.emitChanges()
    }
    private setupEngineTooltip(el: Element, engine: SearchEngine): void {
        el.setAttribute('data-tippy-content', `
        <b>Private</b>: ${fmtCollectDataAsPrivate(engine.privacyInfo.collectData)}<br/>
        <b>Jurisdiction</b>: ${countryCodeEmoji(engine.privacyInfo.jurisdiction)}<br/>
        <b>Founded</b>: ${engine.privacyInfo.since}<br/>
        <b>Result Sources</b>: ${fmtResultSources(engine.privacyInfo.resultsSources)}<br/>
        <b>Summary</b>: ${engine.privacyInfo.summary}<br/>
        `)
    }
    private buildTable() {
        console.log('buildTable()')
        this.disabledTbody.innerHTML = ''
        this.enabledTbody.innerHTML = ''
        for (const x of ALL_ENGINES) {
            const tr = document.createElement('TR')
            this.setupEngineTooltip(tr, x)
            tr.setAttribute("value", x.id)
            tr.classList.add('engineRow')
            if (!this.enabledArr.includes(x.id)) {
                tr.innerHTML = `
                <td class="name"><img class="engineLogo" src="${x.iconUrl}"/> ${x.name}</td>
                `
                tr.onclick = () => this.selectEngine(x.id)
                this.disabledTbody.appendChild(tr)
            }
        }
        for (let i = 0;i < this.enabledArr.length; i++) {
            const tr = document.createElement('TR')
            const engineId = this.enabledArr[i]
            const engine = getEngineById(engineId)
            this.setupEngineTooltip(tr, engine)
            tr.setAttribute("value", engineId)
            tr.classList.add('engineRow')
            tr.innerHTML = `
            <td class="orderNo">${i+1}</td>
            <td class="name"><img class="engineLogo" src="${engine.iconUrl}"/> ${engine.name}</td>
            `
            tr.onclick = () => this.selectEngine(engine.id)
            this.enabledTbody.appendChild(tr)

        }
        tippy('[data-tippy-content]', {
            allowHTML: true,
            maxWidth: 500,
        })
        this.rerender()
    }
}

const oum = new OptionUIManager()
oum.onchange = (newVal) => {
    storageManager.setDataPartially({
        enabledEngines: newVal
    })
}
async function loadFromLocalStorage() {
    const d = await storageManager.getData()
    setCheckboxValue('floatButton_enabled', d.floatButton.enabled)
    setCheckboxValue('extra_ecosiaEliminateNotifications', d.extra.ecosiaEliminateNotifications)
    oum.setModel(d.enabledEngines)
}

// NOTE: async function seems cannot be assign to <button onclick="...">... Donno why.
async function resetToDefaults() {
    console.log('click reset')
    storageManager.setData(storageManager.getDefaultData())
    const d = await storageManager.getData()
    oum.setModel(d.enabledEngines)
    await loadFromLocalStorage()
}

function resetToDefaults1() {
    console.log('click reset')
    const d = storageManager.getDefaultData()
    storageManager.setData(d)
    oum.setModel(d.enabledEngines)
    loadFromLocalStorage()
}

const resetBtn = q<HTMLButtonElement>('#resetToDefaultBtn')
resetBtn.onclick = resetToDefaults1

async function saveFormToLocalStorage() {
    storageManager.setDataPartially({
        floatButton: {
            enabled: getCheckboxValue('floatButton_enabled'),
        },
        extra: {
            ecosiaEliminateNotifications: getCheckboxValue('extra_ecosiaEliminateNotifications'),
        },
    })
}


function watchForm() {
    const form = document.querySelector('form')!
    form.addEventListener('change', (ev) => {
        console.log(ev)
        saveFormToLocalStorage()
    })
}


async function main() {
    await loadFromLocalStorage()
    watchForm()
}

main()
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

import { ALL_ENGINES, getEngineById, search_engine_t, storageManager } from "../common"


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


class OptionUIManager {
    selectedId: search_engine_t | '' = ''
    disabledTbody = q<HTMLTableSectionElement>('#disabledEngines')!
    enabledTbody = q<HTMLTableSectionElement>('#enabledEngines')!
    enabledArr: search_engine_t[] = []
    btns = {
        enableEngine: q<HTMLButtonElement>('#enableEngine'),
        disableEngine: q<HTMLButtonElement>('#disableEngine'),
        moveTop: q<HTMLButtonElement>('#moveTop'),
        moveUp: q<HTMLButtonElement>('#moveUp'),
        moveDown: q<HTMLButtonElement>('#moveDown'),
        moveBottom: q<HTMLButtonElement>('#moveBottom'),
    }
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
        const tr = document.querySelector('tr.engineRow.active')
        if (!tr) {
            qs<HTMLButtonElement>('.actBtn').forEach(x => x.setAttribute('disabled', 'true'))
            console.log('renderButtons', tr)
        } else {
            const engineId = tr.getAttribute('value') || ''
            const enabled = this.enabledArr.includes(engineId as any)
            if (enabled) {
                qs<HTMLButtonElement>('.actBtn').forEach(x => x.removeAttribute('disabled'))
                this.btns.enableEngine.setAttribute('disabled', 'true')
            } else {
                qs<HTMLButtonElement>('.actBtn').forEach(x => x.setAttribute('disabled', 'true'))
                this.btns.enableEngine.removeAttribute('disabled')
            }
        }
    }
    private buildButtons() {
        this.btns.enableEngine.onclick = () => this.actEnableEngine()
    }
    private actEnableEngine() {
        if (this.selectedId) {
            this.enabledArr.push(this.selectedId)
        }
        this.buildTable()
    }
    private buildTable() {
        this.disabledTbody.innerHTML = ''
        this.enabledTbody.innerHTML = ''
        for (const x of ALL_ENGINES) {
            const tr = document.createElement('TR')
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
            tr.setAttribute("value", engineId)
            tr.classList.add('engineRow')
            tr.innerHTML = `
            <td class="orderNo">${i+1}</td>
            <td class="name"><img class="engineLogo" src="${engine.iconUrl}"/> ${engine.name}</td>
            `
            tr.onclick = () => this.selectEngine(engine.id)
            this.enabledTbody.appendChild(tr)

        }
        this.rerender()
    }
}

const oum = new OptionUIManager()

async function loadFromLocalStorage() {
    const d = await storageManager.getData()
    setCheckboxValue('floatButton_enabled', d.floatButton.enabled)
    setCheckboxValue('extra_ecosiaEliminateNotifications', d.extra.ecosiaEliminateNotifications)
    oum.setModel(d.enabledEngines)
}

async function resetToDefault() {
    storageManager.setDataPartially(storageManager.getDefaultData())
    await loadFromLocalStorage()
}

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
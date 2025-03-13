import { ReadableAtom } from 'nanostores'
import { ElementEvents, EventHandler } from './interface.ts'

function setProperty(element: HTMLElement, key: string, value: any) {
    if (key.includes('-') || !(key in element)) {
        element[value ? 'setAttribute' : 'removeAttribute'](key, value)
    } else {
        ;(element as any)[key] = value;
    }
}
function bindAllProperties(
  element: HTMLElement,
  properties: Record<string, ReadableAtom>
) {
    let cleanup = []
    for (const [property, value] of Object.entries(properties)) {
        cleanup.push(value.subscribe((next) => setProperty(element, property, next)))
    }
    return cleanup
}

function attachEvents(this: any, events: ElementEvents<any>): typeof this
function attachEvents(this: any, event: string, listener: EventHandler<any, any>): typeof this
function attachEvents(this: any, events: ElementEvents<any> | string, listener?: EventHandler<any, any>) {
    if (typeof events === 'string') {
        bindEvent(this, events, listener!)
        return this
    }

    for (const [name, listener] of Object.entries(events)) {
        bindEvent(this, name, listener!)
    }
    return this
}
function bindEvent(target: HTMLElement, name: string, listener: EventHandler<any, any>) {
    if (typeof listener === 'function') {
        target.addEventListener(name, listener);
    }
    else if (Array.isArray(listener)) {
        target.addEventListener(name, listener[0], listener[1]);
    }
}
export const setup = {
    bindEvent,
    bindAllProperties,
    setProperty,
    attachEvents,
};

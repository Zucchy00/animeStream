import { writable } from 'svelte/store';


export const inputZone = writable({
    value: ""
});

export function updateInput(value:string) {
    // Use the `update` function to modify the existing object in the store
    inputZone.update(() => {
        return {
            value: value
        };
    });
}

export const fade = writable({
    value: false
});

export function updateFade(value:boolean) {
    // Use the `update` function to modify the existing object in the store
    fade.update(() => {
        return {
            value: value
        };
    });
}
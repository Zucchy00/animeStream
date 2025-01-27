<script lang="ts">
	import { onMount } from "svelte";
    import { Sun } from "svelte-bootstrap-icons";
    import { Moon } from "svelte-bootstrap-icons"

    export var extended:boolean
    export let mobile:boolean

    function change_theme_color() {
        if (localStorage.theme === 'dark') {
            document.documentElement.classList.remove('dark')
            localStorage.setItem("theme", "light");
        } else{
            localStorage.setItem("theme", "dark");
            document.documentElement.classList.add('dark')
        }
    }
</script>

<button class={`${extended ? 'rounded-lg mt-2' : 'rounded-full'} text-white flex lg:flex-1 transition ease-in duration-600 hover:cursor-pointer dark:text-white dark:hover:text-black ${mobile ? "" : "w-full"} hover:bg-white hover:text-steelblue dark:hover:bg-white p-3.5`} on:click={change_theme_color}>
    <div class="flex justify-start items-center">
        <div class={`flex-shrink-0 ${extended ? 'fixed opacity-0' : 'block opacity-100 rounded-lg'}`}>
            <Sun class="h-5 w-auto dark:hidden"/>
            <Moon class="h-5 hidden dark:block w-auto"/>
        </div>
        <div class={`transition-opacity duration-1000 ${extended ? 'ease-in block opacity-100' : 'ease-out fixed opacity-0'} ml-1`}>
            {#if extended}
                <div class="flex w-full relative">
                    <Sun class="h-5 mt-1 w-auto dark:hidden"/>
                    <Moon class="h-5 mt-1 hidden dark:block w-auto"/>
                    <div class="ml-3 text-xl">Tema</div>
                </div>
            {/if}
        </div>
    </div>
</button>


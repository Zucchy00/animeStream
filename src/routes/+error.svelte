<script lang="ts">
	import { onMount } from "svelte";
    import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
    import "../app.css"
    let isMobile: boolean = false;

    $: if (browser) {
        goto("/");
    }

    // Function to check if the device is mobile
    function checkIfMobile() {
        isMobile = window.matchMedia("(max-width: 1024px)").matches; // Adjust the max-width as per your requirements
    }

    onMount(async ()=> {
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
    })
</script>

<div class="flex w-screen h-screen items-center justify-center">
    <div class="w-[95%] h-[95%] flex relative rounded-3xl from-steelblue dark:from-black-gray bg-gradient-to-br to-light-slate-gray dark:to-dark-slate-gray">
        <div class={`${isMobile ? "w-full" : 'w-full'} h-full p-2 transition-width duration-700 will-change-transform`}>
            <div class="w-full h-full flex items-center dark:text-white duration-1000 ease-out-in transition justify-center">
            </div>
        </div>
    </div>
</div>

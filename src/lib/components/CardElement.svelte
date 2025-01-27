<script lang="ts">
    import { transitTo } from "$lib/logic/main";
    import { fade } from 'svelte/transition';
    export let anime
    let hover:boolean = false
</script>

<style>
    .rotation:hover{
        transform: perspective(500px) rotateX(25deg);
    }
</style>

<div class={`w-full h-full relative transition-all duration-1000`}>
    <button on:click={()=>{transitTo(`/anime?id=${anime.id}`)}} on:mouseenter={()=>{hover = true}} on:mouseleave={()=>{hover = false}} class="w-full h-full rounded-2xl bg-white overflow-hidden rotation transform-gpu transition-all duration-700 hover:opacity-60">
        <img alt="" src={anime.coverImage} class="w-full h-full">
    </button>
    <div class={`w-[50%] h-fit absolute left-1/2 -translate-x-1/2 pointer-events-none rounded-2xl overflow-hidden transition-all duration-700 ${hover ? "opacity-90 bottom-[30%]" : "opacity-0 bottom-[10%]"}`}>
        <img alt="" src={anime.mainCharacterImage} class="w-full h-full">
    </div>
    <div class={`w-full h-[25%] absolute left-0 flex items-center justify-center text-center text-2xl font-bold pointer-events-none transition-all duration-700 text-white opacity-90 ${hover ? "bottom-[10%]" : "bottom-0"}`}>
        <div class={`w-fit h-fit bg-black p-2 rounded-full transition-all duration-700 ${hover ? "bg-opacity-0" : "bg-opacity-30"}`}>
            {anime.title}
        </div>
    </div>
</div>
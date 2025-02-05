<script lang="ts">
    import { page } from "$app/stores";
    import { fetchAnimeById, removeHtmlTags, transitTo } from "$lib/logic/main";
    import { onMount } from "svelte";
    import { PlayFill } from "svelte-bootstrap-icons";
    import { fetchAnime } from "$lib/logic/main";
    import { fade } from 'svelte/transition';
    import { v4 } from "uuid";
    import { load } from "cheerio";

    let anime:any
    let id:number
    let showImage:boolean = false
    let showTexts:boolean = false
    let showPlayButton:boolean = false
    let showCharacters:boolean = false
    let totalEpisodes:number = 0
    let episodeGroups: number[][] = [];
    let choosenGroupEpisodes:number = 0
    let displayedEpisodes: Array<{ number: number; id: string }>  = [];

    let loaded:boolean = false
    onMount(() => {
        // Example usage:
        id = parseInt($page.url.searchParams.get("id") ?? "0", 10);
        fetchAnimeById(id).then((data) => {
            console.log(data)
            anime = data
            if((anime.isFinished && anime.episodes) || anime.nextAiringEpisode) {
                totalEpisodes = anime.isFinished
                ? anime.episodes
                : anime.nextAiringEpisode.episode - 1;
                console.log(anime.nextAiringEpisode)
            }

            generateEpisodeGroups(); // Generate episode groups dynamically
        });
        setTimeout(()=>{
            if(!loaded) {
                anime = false
                loaded = true
            }
        }, 3000)
    });

    function showPage() {
        loaded = true
        setTimeout(()=>{showImage = true}, 500)
        setTimeout(()=>{showTexts = true}, 1000)
        setTimeout(()=>{showPlayButton = true}, 1300)
        setTimeout(()=>{showCharacters = true}, 2000)
    }

    function updateDisplayedEpisodes() {
        const [start, end] = episodeGroups[choosenGroupEpisodes];
        displayedEpisodes = Array.from(
            { length: end - start + 1 },
            (_, i) => ({
                number: start + i,
                id: v4(), // Assign unique ID
            })
        );
    }

    function generateEpisodeGroups() {
        episodeGroups = [];
        if(totalEpisodes >=1) {
            for (let i = 1; i <= totalEpisodes; i += 100) {
                const start = i;
                const end = Math.min(i + 99, totalEpisodes);
                episodeGroups.push([start, end]);
            }
            updateDisplayedEpisodes();
        }
    }
</script>

<style>
    .vignette {
        background-size: cover;
        background-position: center center;
        padding: 30px 20px;
        box-sizing: border-box;
        box-shadow: inset 0 0 85px 15px black;
    }
</style>

<div class="w-full h-full flex flex-col">
    {#if anime}
        <div class="w-full max-h-[40%] overflow-hidden relative group">
            <!-- Banner Image -->
            <img on:load={showPage} class={`w-full h-fit object-cover brightness-50 transition-all duration-1000 ${showImage ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} alt="" src={anime.bannerImage}>
             <div class={`absolute w-full h-full top-0 left-0 vignette transition-all duration-1000 ${showImage ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>

             </div>
            <div class="absolute w-full h-full top-0 left-0">
                <div class="w-full h-full relative flex flex-col space-y-10 items-start justify-end ring-2 p-2">
                    <div class={`flex-row-reverse flex overflow-hidden w-fit h-[20%] text-7xl font-bold text-red-purple transition-all duration-1000 ${showTexts ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                        {anime.title}
                    </div>
                    <button class={`flex-row-reverse flex overflow-hidden hover:ring-2 ring-black w-[10%] max-w-64 h-[10%] max-h-14 rounded-full bg-black transition-all duration-1000 ${showPlayButton ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                        <div class="w-fit h-full aspect-square flex items-center justify-center">
                            <PlayFill class="w-[70%] h-[70%] text-white"/>
                        </div>
                        {#if (anime.isFinished && anime.episodes) || anime.nextAiringEpisode}
                            <div class="h-full w-full flex items-center justify-start pl-5 text-white font-semibold text-sm">
                                Play Episode {anime.isFinished ? anime.episodes : anime.nextAiringEpisode.episode - 1}
                            </div>
                        {/if}
                    </button>
                </div>
            </div>
        </div>
        <div class={`w-full h-[60%] overflow-scroll transition-all duration-1000 flex ${showTexts ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
            <div class="w-[80%] h-full flex">
                <div class="w-[50%] h-full flex flex-col">
                    <div class="w-full h-[10%] flex items-center justify-start px-[5%] font-semibold text-2xl text-white">
                        Description
                    </div>
                    <div class="w-full h-[40%] text-white overflow-x-hidden overflow-y-scroll pl-[5%]">
                        {removeHtmlTags(anime.description)}
                    </div>
                    <div class="w-full h-[10%] flex space-x-2 items-center justify-start px-[5%] text-white">
                        <div class="font-semibold text-2xl flex items-center justify-center h-full">
                            Status:
                        </div>
                        <div class="flex items-center justify-center h-full text-xl mt-1">
                            {anime.isFinished ? "Finished" : "On going"}
                        </div>
                    </div>
                    <div class="w-full h-[10%] flex space-x-2 items-center justify-start px-[5%] text-white">
                        <div class="font-semibold text-2xl flex items-center justify-center h-full">
                            Started:
                        </div>
                        <div class="flex items-center justify-center h-full text-xl mt-1">
                            {anime.startDate}
                        </div>
                        <div class="font-semibold text-2xl flex items-center justify-center h-full">
                            Ended:
                        </div>
                        <div class="flex items-center justify-center h-full text-xl mt-1">
                            {anime.isFinished ? anime.endDate : "Not yet"}
                        </div>
                    </div>
                    {#if !anime.isFinished}
                        {#if anime.nextAiringEpisode}
                            <div class="w-full h-[10%] flex space-x-2 items-center justify-start px-[5%] text-white">
                                <div class="font-semibold text-2xl flex items-center justify-center h-full">
                                    Next episode:
                                </div>
                                <div class="flex items-center justify-center h-full text-xl mt-1">
                                    {anime.nextAiringEpisode.episode}
                                </div>
                                <div class="font-semibold text-2xl flex items-center justify-center h-full">
                                    Date:
                                </div>
                                <div class="flex items-center justify-center h-full text-xl mt-1">
                                    {anime.nextAiringEpisode.airingAt}
                                </div>
                            </div>
                        {/if}
                    {/if}
                </div>
                <div class="w-[50%] h-full">
                    <div class="w-full h-[10%] flex items-center px-[5%] justify-start font-semibold text-2xl text-white">
                        Episodes
                    </div>
                    <div class="w-full h-[20%] px-[5%] flex flex-wrap items-center justify-evenly relative">
                        {#each episodeGroups as group, index}
                            <button
                                on:click={() => {
                                    choosenGroupEpisodes = index;
                                    updateDisplayedEpisodes()
                                }}
                                class={`h-[40%] w-[15%] rounded-2xl bg-pure-black hover:ring transition-all duration-500 text-white ${index == choosenGroupEpisodes ? "ring-white ring-2" : "ring-pure-black"}`}
                            >
                                {group[0]}-{group[1]}
                            </button>
                        {/each}
                    </div>
                    <div class="w-full h-[70%] px-[5%] py-[3%]">
                        <div class="w-full h-full bg-bright-pure-black rounded-3xl p-4 text-white overflow-y-scroll space-y-2">
                            {#each displayedEpisodes as episode (episode.id)}
                                <div transition:fade={{ duration: 700 }} class="flex items-center justify-between px-4 py-2 bg-pure-black rounded-lg hover:ring hover:ring-white transition-all duration-500">
                                    <div>Episode {episode.number}</div>
                                    <button on:click={()=>{
                                        transitTo(`/video?id=${id}&anime=${anime.title}&episode=${episode.number}`)
                                    }} class="bg-white text-black px-3 py-1 rounded-lg text-sm">
                                        Watch
                                    </button>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
            <div class={`w-[20%] h-full p-[1%] transition-all duration-1000 ${showCharacters ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div class="w-full h-full rounded-3xl flex flex-col bg-bright-pure-black">
                    <div class="w-full h-[15%] flex items-center justify-center text-white text-2xl font-bold">
                        Main Characters
                    </div>
                    <div class="w-full h-[85%] relative p-[5%] overflow-y-scroll space-y-[5%] overflow-x-hidden">
                        {#each anime.characters as character}
                            <div class="w-full h-[60%] flex justify-center">
                                <div class="w-[50%] h-full rounded-3xl overflow-hidden group relative">
                                    <img src={character.image} class="w-full h-full object-cover">
                                    <div class="group-hover:opacity-100 opacity-0 text-center transition-all duration-1000 absolute w-full h-full bg-black top-0 bg-opacity-60 flex items-center justify-center text-white font-bold">
                                        {character.name}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    {:else if loaded}
        <div class="w-full h-full flex items-center justify-center text-center text-4xl font-bold text-white">
            Anime Not fully uploaded or Visible
        </div>
    {/if}
</div>
<script lang="ts">
    import { page } from "$app/stores";
    import { fetchAnimeById, transitTo } from "$lib/logic/main";
    import { onMount } from "svelte";

    let videoElement: HTMLVideoElement | null = null;
    let id: number;
    let episode: number;
    let animeRequested: string;
    let anime: any;
    let videoUrl: string = "";
    let totalEpisodes:number = 0

    let loaded:boolean = false

    onMount(()=>{
        loaded = true
    })

    $:{
        if(loaded) {
            videoUrl = ""
            episode = 0
            id = 0
            totalEpisodes = 0
            id = parseInt($page.url.searchParams.get("id") ?? "0", 10);
            episode = parseInt($page.url.searchParams.get("episode") ?? "1", 10);
            animeRequested = $page.url.searchParams.get("anime") ?? "";
            animeRequested = animeRequested.replaceAll("-", " ")
            fetchAnimeData();
        }
    }

    // Function to fetch anime data based on the current episode
    const fetchAnimeData = async () => {
        try {
            if (!animeRequested || !episode || !id) {
                throw new Error("Anime and episode parameters are required");
            }

            // Fetch anime data
            const data = await fetchAnimeById(id);
            anime = data;

            // Fetch video URL
            const response = await fetch(`/api?anime=${animeRequested}&episode=${episode}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch from API: ${response.statusText}`);
            }

            const videoData = (await response.json());
            console.log(videoData)
            videoUrl = videoData.result.mp4Link;
            totalEpisodes = videoData.result.animeEpisodes
        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        }
    };

    // Handle previous episode
    const goToPreviousEpisode = () => {
        if (episode > 1) {
            episode--;
            updateEpisodeInURL();
        }
    };

    // Handle next episode
    const goToNextEpisode = () => {
        episode++;
        updateEpisodeInURL();
    };

    // Update the URL without reloading the page
    const updateEpisodeInURL = () => {
        transitTo(`?id=${id}&anime=${animeRequested}&episode=${episode}`);
    };
</script>

<div class={`w-full h-full flex flex-col items-center justify-start p-4 transition-all duration-1000 ${videoUrl !== "" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
    {#if videoUrl !== ""}
        <div class="w-full h-[10%] text-center flex flex-col justify-center items-center text-white text-3xl font-bold">
            <div>
                {animeRequested}
            </div>
            <div class="text-lg">
                Episode: {episode}
            </div>
        </div>
        <!-- svelte-ignore a11y-media-has-caption -->
        <video
            bind:this={videoElement}
            src={videoUrl}
            class="h-[80%] aspect-video bg-pure-black"
            controls
        ></video>

        <div class="w-full h-[10%] flex items-center justify-center space-x-4">
            {#if episode > 1}
                <button
                    on:click={goToPreviousEpisode}
                    class="h-[60%] aspect-21/9 rounded-full hover:ring-4 bg-pure-black ring-pure-black transition-all duration-700 text-white"
                >
                    Previous
                </button>
            {/if}

            {#if episode < totalEpisodes}
                <button
                    on:click={goToNextEpisode}
                    class="h-[60%] aspect-21/9 rounded-full hover:ring-4 bg-pure-black ring-pure-black transition-all duration-700 text-white"
                >
                    Next
                </button>
            {/if}
        </div>
    {/if}
</div>

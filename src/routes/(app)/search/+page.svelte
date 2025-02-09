<script lang="ts">
    import CardElement from "$lib/components/CardElement.svelte";
    import { onMount } from "svelte";
    import { inputZone } from "../../../shared/sharedStore";
    import { fetchAnime } from "$lib/logic/main";
    import { fade } from 'svelte/transition';

    let searchTerm = "";
    let lastSearchTerm: string = "";
    let searchTimeout: any;
    let updateSearch: boolean = true;
    let value: string;

    let scrollContainer: HTMLElement | null = null; // Reference to the scroll container

    $: ({ value } = $inputZone);

    $: if (value != null || undefined) {
        if (value === "") searchTerm = "";
        else searchTerm = value;
    }

    $: if (searchTerm !== lastSearchTerm) {
        lastSearchTerm = searchTerm;

        if (updateSearch) {
            updateSearch = false;
            clearTimeout(searchTimeout); // Clear any existing timeout
            searchTimeout = setTimeout(() => {
                updateSearch = true;
                currentPage = 1; // Reset to first page for new search
                fetchAnime(currentPage, 50, searchTerm).then((data) => {
                    animeList = data;
                    scrollToTop(); // Scroll to the top after fetching new results
                });
            }, 2000);
        }
    }

    // Scroll to the top of the scroll container
    const scrollToTop = () => {
        if (scrollContainer) {
            scrollContainer.scrollTop = 0; // Reset the scroll position to the top
        }
    };

    // Fetch on component mount
    onMount(() => {
        fetchAnime(currentPage, 50, searchTerm).then((data) => {
            animeList = data;
        });
    });

    let animeList: any[] = [];
    let currentPage = 1; // Keep track of the current page
    let isFetching = false; // Prevent duplicate fetches

    // Handle infinite scroll
    const handleScroll = (event: Event) => {
        const target = event.target as HTMLElement;
        const scrollHeight = target.scrollHeight; // Total height of the scrollable content
        const scrollTop = target.scrollTop; // Current scroll position from the top
        const clientHeight = target.clientHeight; // Visible height of the container

        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        if (scrollPercentage >= 0.8 && !isFetching) { // Trigger when 80% is reached
            isFetching = true; // Prevent duplicate fetches

            currentPage += 1;
            fetchAnime(currentPage, 50, searchTerm).then((data) => {
                animeList = [...animeList, ...data]; // Append new data to the list
                isFetching = false; // Allow further fetches
            }).catch(() => {
                isFetching = false; // Reset in case of an error
            });
        }
    };
</script>

<div class="w-full h-full p-[1%] overflow-hidden">
    <div
        bind:this={scrollContainer}
        on:scroll={handleScroll}
        class="w-full h-full overflow-scroll flex flex-wrap items-start justify-center"
    >
        {#each animeList as anime (anime.id)} <!-- Keyed each block for better transitions -->
            <div class="w-[14%] aspect-12/16 m-[1%] mb-[1%]" transition:fade={{ duration: 1000 }}>
                <CardElement {anime} />
            </div>
        {/each}
    </div>
</div>

<script lang="ts">
    import { page } from "$app/stores";
    import "../app.css";
    import { Search } from "svelte-bootstrap-icons";
    import { fade, updateFade, updateInput } from "../shared/sharedStore";
    import { goto } from "$app/navigation";
    import { navigating } from '$app/stores';
    import { transitTo } from "$lib/logic/main";
    import { onMount } from "svelte";

    let inputValue:string | null= $page.url.searchParams.get('input') // Receive from load

    let urlOfGif = "/images/WaitingChibi.gif";
    let typingTimeout: any;
    let value:boolean

    $:({value} = $fade)

    function UpdateResearch() {
        updateInput(inputValue ?? "")
        goto("/")
        clearTimeout(typingTimeout);
        urlOfGif = "/images/OkChibi.gif";
        typingTimeout = setTimeout(() => {
            urlOfGif = "/images/WaitingChibi.gif";
        }, 4000);
    }

    $: if($navigating) {
        value = false
    }

    onMount(()=>{
        value = false
    })

    function handleEnterKey(event: any) {
        if (event.key != "Enter") {
            if(inputValue != null) updateInput(inputValue)
            urlOfGif = "/images/TypingChibi.gif";
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                urlOfGif = "/images/OkChibi.gif";
                typingTimeout = setTimeout(() => {
                    urlOfGif = "/images/WaitingChibi.gif";
                }, 4000);
            }, 2000);
        }else {
            goto("/")
        }
    }
</script>

<div class={`w-screen h-screen flex flex-col`}>
    <div class="w-full h-[8%] border-b border-white flex">
        <div class="w-[20%] h-full flex items-center justify-center">
            <button on:click={()=>{
                inputValue = ""
                updateInput(inputValue)
                transitTo("/")
            }} class="h-[80%] aspect-square">
                <img src="/images/jollyRoger.svg" class="w-full h-full">
            </button>
        </div>
        <div class="w-[60%] h-full flex items-center justify-center">
            <div class="w-[60%] h-[50%] relative">
                <input 
                    on:keyup={handleEnterKey} 
                    bind:value={inputValue} 
                    on:input={(event) => handleEnterKey(event)} 
                    class="w-full h-full rounded-full focus:outline-none px-[2%] text-lg" 
                    placeholder="Title..."
                >
                <button on:click={UpdateResearch} class="h-full w-fit aspect-square absolute top-0 right-0 flex items-center justify-center">
                    <Search class="w-[50%] h-[50%]"/>
                </button>
            </div>
        </div>
        <div class="w-[20%] h-full">
            <img src={urlOfGif} class="h-full w-fit transition-all duration-500">
        </div>
    </div>
    <div class={`w-full h-[92%] transition-opacity duration-1000 ${value ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}>
        <slot></slot>
    </div>
</div>

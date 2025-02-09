<script lang="ts">
    import "../../app.css";
    import { onMount } from 'svelte';
    import { page } from '$app/stores';  // Access the current page's URL
    import { generateRandomState, getCookie } from "$lib/logic/main";
    import axios from 'axios'
    let url:string = ""
    let show_button:boolean = false
    onMount(async () => {
        let code = $page.url.searchParams.get("code");
        if(code == "" || !code) code = getCookie("code") ?? ""
        // const state = $page.url.searchParams.get("state");
        // const scope = $page.url.searchParams.get("scope");
        // const authuser = $page.url.searchParams.get("authuser");
        // const prompt = $page.url.searchParams.get("prompt");

        // Save the variables to cookies
        if (code != "" && code) {
            document.cookie = `code=${code}; path=/; max-age=3600`;  // Expires in 1 hour
            if(!getCookie("id_token") && !getCookie("access_token")) await exchangeCodeForToken(code)
        }else {
            try{
                const response = await axios.get(`/api/auth/getLoginInfo`);

                // Log the tokens (for debugging purposes)
                console.log(response.data);

                // Destructure the tokens from the response
                const { googleUrl } = response.data;
                url = googleUrl
                window.location.href = url
            }catch(error:any) {
                console.error('Error getting login info:', error);
                throw new Error('Failed to get login info');
            }
        }
        // if (state) {
        //     document.cookie = `state=${state}; path=/; max-age=3600`;
        // }
        // if (scope) {
        //     document.cookie = `scope=${scope}; path=/; max-age=3600`;
        // }
        // if (authuser) {
        //     document.cookie = `authuser=${authuser}; path=/; max-age=3600`;
        // }
        // if (prompt) {
        //     document.cookie = `prompt=${prompt}; path=/; max-age=3600`;
        // }
        setTimeout(()=>{show_button = true}, 4000)
    });

    async function exchangeCodeForToken(code: string) {
        try {
            // Ensure the code is properly URL-encoded
            console.log(code)
            const encodedCode = encodeURIComponent(code);

            // Exchange authorization code for tokens
            const response = await axios.get(`/api/auth/getToken?code=${encodedCode}`);

            // Log the tokens (for debugging purposes)
            console.log(response.data);

            // Destructure the tokens from the response
            const { access_token, id_token, expires_in } = response.data;

            // Save tokens in cookies
            document.cookie = `access_token=${access_token}; path=/; max-age=${expires_in}; Secure; SameSite=Strict`;
            document.cookie = `id_token=${id_token}; path=/; max-age=${expires_in}; Secure; SameSite=Strict`;

            console.log('Tokens have been saved to cookies.');
            window.location.reload()
            return response.data;
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            throw new Error('Failed to exchange authorization code for tokens');
        }
    }
</script>

<div class="w-full h-full flex items-center justify-center">
    <button class="w-fit h-fit p-4 hover:ring-4 ring-white transition-all duration-1000 text-2xl bg-white font-bold rounded-full">
        Login with Google
    </button>
</div>

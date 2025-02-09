import type { RequestHandler } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET , DNS_URL} from '$env/static/private';
import axios from 'axios';

export const GET: RequestHandler = async ({ url }) => {
    const code = url.searchParams.get('code');
    console.log(code)
    const tokenRequestData = {
        code: code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: DNS_URL+"/login",
        grant_type: 'authorization_code'
    };
    try {

        const response = await axios.post('https://oauth2.googleapis.com/token', tokenRequestData);
        // Destructure the tokens from the response
        const { access_token, id_token, expires_in } = response.data;
        return new Response(
            JSON.stringify({ access_token, id_token, expires_in }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error: any) {
        console.error('Error fetching the page:', error.message);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch page content', details: error.message }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
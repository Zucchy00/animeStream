import type { RequestHandler } from '@sveltejs/kit';
import { GOOGLE_CLIENT_ID, DNS_URL} from '$env/static/private';
import { generateRandomState } from '$lib/logic/main';

export const GET: RequestHandler = async ({ url }) => {
    let scope = "email profile";

    // Constructing the Google OAuth URL
    let googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(DNS_URL+"/login")}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${generateRandomState()}`;
    try {
        return new Response(
            JSON.stringify({googleUrl}),
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
import type { Handle } from '@sveltejs/kit';
import { Agent, setGlobalDispatcher } from 'undici'
import jwt from 'jsonwebtoken'; 
import { parseJwtWithoutValidation } from '$lib/logic/main';
import jwkToPem from 'jwk-to-pem'
import 'console-success';
import {  } from '$env/static/private';
import console from 'console';

let keyDictionary:any = {}

const logJwtData = (token:any, key:any) => {
    try {
        const decoded = jwt.verify(token, key);
        let Console2:any = console
        Console2.success("Valid JWT")
        if(decoded) return true
    } catch (error:any) {
        // Handle any errors (e.g., token expiration, invalid signature)
        console.error('Invalid or expired token', error.message);
    }
};

async function getDataForKey() {
    const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
    try {
        const response = await fetch(GOOGLE_CERTS_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch Google public keys');
        }
        const data = await response.json();
        return data.keys; // Returns the public keys
    } catch (error) {
        console.error('Error fetching Google public keys:', error);
        throw error;
    }
}

async function parsedKeys() {
    let data = await getDataForKey()
        data.forEach((key:any) => {
            if(key.kid) {
                keyDictionary[(key.kid).toString()] = key
            }
        });
}

export const handle = (async ({ event, resolve }) => {
    const { request, url } = event;
    const currentUrl = new URL(request.url);
    const rootPath = currentUrl.origin;
    let logged:boolean | undefined = false
    const token = event.cookies.get('id_token') || event.request.headers.get('Authorization')?.replace('Bearer ', '');
    if(token) {
        if(token != undefined) {
            if(parseJwtWithoutValidation(token)) {
                let parsedToken:any = parseJwtWithoutValidation(token);
                let attempts = 0
                do{
                    let keyAttempts = 0
                    do{
                        if(Object.keys(keyDictionary).length == 0) await parsedKeys()
                        keyAttempts +=1
                    }while(Object.keys(keyDictionary).length == 0 && keyAttempts< 3)
                    if(typeof(keyDictionary[(parsedToken?.header.kid).toString()]) == "undefined") {
                        logged = false
                    }
                    else logged = logJwtData(token, jwkToPem(keyDictionary[(parsedToken?.header.kid).toString()]))
                    attempts += 1
                    if(!logged && attempts >1) {
                        keyDictionary = {}
                    }
                }while(!logged && attempts<=3)
            }
        }
        else logged = rootPath.includes('localhost') || rootPath.includes('127.0.0.1');
        if (!event.route.id?.startsWith("/login") && !logged && !event.route.id?.startsWith("/api/auth") && !(rootPath.includes('localhost') || rootPath.includes('127.0.0.1'))) {
            const redirectUrl = `${rootPath}/login`;
            return new Response(null, {
                status: 302,
                headers: { Location: redirectUrl }
            });
        }
        else if(logged) {
            if (event.route.id?.startsWith("/login")) {
                return new Response(null, {
                    status: 302,
                    headers: { Location: `${rootPath}/` }
                });
            }
        }
    }else if (!event.route.id?.startsWith("/login") && !logged && !event.route.id?.startsWith("/api/auth") && !(rootPath.includes('localhost') || rootPath.includes('127.0.0.1'))) {
        const redirectUrl = `${rootPath}/login`;
        return new Response(null, {
            status: 302,
            headers: { Location: redirectUrl }
        });
    }
    const response = await resolve(event, {
            filterSerializedResponseHeaders: name => name === 'content-type',
        });
    return response;
}) satisfies Handle;


const agent = new Agent({
  connect: {
    rejectUnauthorized: false
  }
})

setGlobalDispatcher(agent)

function getIdToken(cookies:string) {
    if(cookies) {
        const match = cookies.match(/idToken=([^;]+)/);
        return match ? match[1] : null; // Return the token or null if not found
    }else return ""
}
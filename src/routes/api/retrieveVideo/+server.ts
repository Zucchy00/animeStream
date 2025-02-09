import type { RequestHandler } from '@sveltejs/kit';
import { load } from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { ANIME_URL } from '$env/static/private';

puppeteer.use(StealthPlugin());

export const GET: RequestHandler = async ({ url }) => {
    try {
        // Get the anime and episode query parameters
        const anime = url.searchParams.get('anime');
        const episode = url.searchParams.get('episode');  // Added episode parameter
        if (!anime || !episode) {
            return new Response(
                JSON.stringify({ error: 'Anime and episode query parameters are required' }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Construct the search URL
        const searchUrl = `${ANIME_URL}/search?keyword=${anime.replace(/\s+/g, '+')}`;
        console.log("Search URL:", searchUrl);

        // Parse the HTML with Cheerio
        const pageContent = await fetchHtmlWithWget(searchUrl);
        const response = load(pageContent);

        const results: any[] = [];
        let exactMatchFound = false;
        let haveItalian = false; 
        
        response('a.name').each((_, element) => {
            const href = response(element).attr('href');
            const title = response(element).attr('data-jtitle');
            const text = response(element).text().trim();

            if (!href || !title || !text) {
                return; // Skip elements with missing data
            }


            const lowerTitleStrict = title.toLowerCase().replace(/[-_:\s]/g, "") ?? ""; // Removes "-", "_" and spaces
            const lowerTitleKeepSymbols = title.toLowerCase().replace(/\s+/g, "") ?? ""; // Removes only spaces, keeps "-" and "_"

            const lowerAnimeStrict = anime.toLowerCase().replace(/[-_:\s]/g, ""); // Removes "-", "_" and spaces
            const lowerAnimeKeepSymbols = anime.toLowerCase().replace(/\s+/g, ""); // Removes only spaces, keeps "-" and "_"

            // Check if either variation matches
            const compatible =
                lowerTitleStrict.includes(lowerAnimeStrict) || // First check: strict match (no "-", "_", spaces)
                lowerTitleKeepSymbols.includes(lowerAnimeKeepSymbols); // Second check: keeps "-" and "_", only removes spaces

            console.log("LowerTitleStrict: " + lowerTitleStrict);
            console.log("LowerTitleKeepSymbols: " + lowerTitleKeepSymbols);
            console.log("LowerAnimeStrict: " + lowerAnimeStrict);
            console.log("LowerAnimeKeepSymbols: " + lowerAnimeKeepSymbols);


            if (href && title && text && compatible) {
                console.log({ href: `${ANIME_URL}${href}`, title, text })
                results.push({ href: `${ANIME_URL}${href}`, title, text });

                // Check if the title is an exact match
                if (lowerTitleStrict == lowerAnimeStrict || lowerTitleKeepSymbols == lowerAnimeKeepSymbols) {
                    exactMatchFound = true;
                }

                if (text.includes("(ITA)") || title.includes("(ITA)")) {
                    haveItalian = true;
                }
            }
        });

        console.log(results)

        // If no results, return an error
        if (results.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No matching anime found' }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Now we choose the best match (preferring exact match, otherwise most relevant)
        let bestMatch = results[0];  // Initialize with the first result
        // Prioritize exact matches first
        if (exactMatchFound) {
            console.log("FOUND")
            bestMatch = results.find(result => result.title?.toLowerCase().replace(/[-_:\s]/g, "") ?? "" === anime.toLowerCase().replace(/[-_:\s]/g, ""))!;
        } else {
            // If no exact match, choose the one most relevant to the search term
            bestMatch = results.sort((a, b) => {
                const aTitle = a.title.toLowerCase();
                const bTitle = b.title.toLowerCase();
                // Check if the search term exists in the title and give it a higher rank
                return bTitle.indexOf(anime.toLowerCase()) - aTitle.indexOf(anime.toLowerCase());
            })[0]; // Take the first result after sorting
        }
        // Fetch the episode links for the best match
        const detailedResult = await getEpisodeDetails(bestMatch.href, episode);

        // Return the result with the requested episode details
        if(exactMatchFound) {
            return new Response(
                JSON.stringify({ result: detailedResult, haveItalian }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }else {
            return new Response(
                JSON.stringify({ result: detailedResult, haveItalian, results }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
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

// Function to fetch HTML using wget and save it to a file
async function fetchHtmlWithWget(url: string): Promise<string> {
    let browser;
    try {
        // Launch Puppeteer with stealth settings
        browser = await puppeteer.launch({
            headless: true, // Run in headless mode
            executablePath: '/home/Daniele/.cache/puppeteer/chrome/linux-132.0.6834.83/chrome-linux64/chrome',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage', // Use /tmp for shared memory, reducing bottlenecks
                '--disable-gpu', // No GPU is needed for HTML scraping
            ],
        });

        const page = await browser.newPage();

        // Use stealth plugin to evade detection
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
        );

        // Set viewport for the page
        await page.setViewport({ width: 1366, height: 768 });

        // Intercept and block unnecessary requests (like images or stylesheets) for faster loading
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        // Navigate to the target URL with a timeout and wait until the page is fully loaded
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000, // Timeout after 60 seconds
        });

        // Extract and return the page content
        const content = await page.content();
        return content;
    } catch (error: any) {
        console.error(`Error fetching HTML: ${error.message}`);
        throw new Error(`Failed to fetch HTML content: ${error.message}`);
    } finally {
        // Ensure the browser is closed in all cases
        if (browser) {
            await browser.close();
        }
    }
}

// Function to get episode details for a given anime URL and episode number
async function getEpisodeDetails(animeUrl: string, episode: string) {
    try {
        const pageContent = await fetchHtmlWithWget(animeUrl);
        const page$ = load(pageContent);
        const episodeLinks: any[] = [];
        let highestEpisodeNum = 0;
        
        page$('li.episode a').each((_, episodeElement) => {
            const episodeHref = page$(episodeElement).attr('href');
            const episodeNum = page$(episodeElement).text().trim();

            if (episodeHref && episodeNum) {
                const episodeNumber = parseInt(episodeNum, 10);
                highestEpisodeNum = Math.max(highestEpisodeNum, episodeNumber);

                episodeLinks.push({
                    episodeNum,
                    episodeLink: `${ANIME_URL}${episodeHref}`
                });
            }
        });

        const requestedEpisodeNum = parseInt(episode, 10);
        if (requestedEpisodeNum > highestEpisodeNum) {
            return {
                animeEpisodes: highestEpisodeNum,
                error: `Requested episode ${requestedEpisodeNum} exceeds the available episodes (${highestEpisodeNum})`
            };
        }

        const requestedEpisode = episodeLinks.find(ep => ep.episodeNum === episode);
        if (requestedEpisode) {
            const episodePageContent = await fetchHtmlWithWget(requestedEpisode.episodeLink);
            const episode$ = load(episodePageContent);
            const mp4Link = episode$('#alternativeDownloadLink').attr('href');
            console.log("ANIME FOUNDED")
            return {
                episodeNum: requestedEpisode.episodeNum,
                animeEpisodes: highestEpisodeNum,
                mp4Link: mp4Link || null
            };
        } else {
            console.log("ANIME NOT FOUNDED")
            return { error: 'Episode not found' };
        }
    } catch (error: any) {
        console.error(`Error fetching episode details: ${error.message}`);
        return { error: 'Failed to fetch episode details' };
    }
}

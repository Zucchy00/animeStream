import { goto } from "$app/navigation";
import { updateFade } from "../../shared/sharedStore";
import base64url from 'base64url';

export function sleep(ms:any) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function checkIfMobile() {
    return window.matchMedia("(max-width: 1024px)").matches; // Adjust the max-width as per your requirements 
}

export function getCookie(name:string) {
    const value = `; ${document.cookie}`;
    const parts= value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export function generateRandomState(length:number = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    for (let i = 0; i < length; i++) {
        state += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return state;
}

export function parseJwtWithoutValidation (token:string) {
    try {
        // Split the JWT into its components (header, payload, signature)
        const [header, payload] = token.split('.');

        // Base64-decode the header and payload (these are base64url-encoded)
        const decodedHeader = JSON.parse(base64url.decode(header));
        const decodedPayload = JSON.parse(base64url.decode(payload));

        return {
            header: decodedHeader,
            payload: decodedPayload
        }
    } catch (error:any) {
        console.error('Error decoding token:', error.message);
        return false
    }
};

export async function fetchAnime(page = 1, perPage = 50, searchTerm = '') {
    const query = `
        query ($page: Int, $perPage: Int, $search: String) {
            Page(page: $page, perPage: $perPage) {
                pageInfo {
                    hasNextPage
                }
                media(type: ANIME, sort: POPULARITY_DESC, search: $search) {
                    id
                    title {
                        romaji
                        english
                    }
                    coverImage {
                        large
                        medium
                    }
                    bannerImage
                    relations {
                        edges {
                            node {
                                id
                            }
                            relationType
                        }
                    }
                    characters(role: MAIN, perPage: 1) {
                        edges {
                            node {
                                id
                                name {
                                    full
                                }
                                image {
                                    large
                                    medium
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    const variables = { page, perPage, search: searchTerm || undefined };

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();

        console.log(result)

        if (result.errors) {
            console.error('GraphQL Errors:', result.errors);
            return [];
        }

        if (!result.data) {
            throw new Error('No data in GraphQL response');
        }

        const media = result.data.Page.media;

        // Process each anime individually
        return media.map((anime:any) => {
            const mainCharacterImage = anime.characters.edges.length > 0
                ? anime.characters.edges[0].node.image.large
                : null;

            return {
                title: anime.title.english || anime.title.romaji,
                id: anime.id,
                coverImage: anime.coverImage.large,
                bannerImage: anime.bannerImage,
                relations: anime.relations,
                mainCharacterImage: mainCharacterImage,
            };
        });
    } catch (error) {
        console.error('Error fetching anime:', error);
        return [];
    }
}

export async function fetchAnimeById(id: number) {
    const query = `
        query ($id: Int) {
            Media(id: $id, type: ANIME) {
                id
                title {
                    romaji
                    english
                }
                coverImage {
                    large
                    medium
                }
                bannerImage
                description
                episodes
                status
                startDate {
                    year
                    month
                    day
                }
                endDate {
                    year
                    month
                    day
                }
                airingSchedule(notYetAired: true, perPage: 1) {
                    nodes {
                        episode
                        airingAt
                    }
                }
                relations {
                    edges {
                        node {
                            id
                        }
                        relationType
                    }
                }
                characters(perPage: 50, role: MAIN) {
                    edges {
                        node {
                            id
                            name {
                                full
                            }
                            image {
                                large
                                medium
                            }
                        }
                    }
                }
            }
        }
    `;

    const variables = { id };

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
        });

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL Errors:', result.errors);
            return null;
        }

        if (!result.data || !result.data.Media) {
            throw new Error('No data in GraphQL response');
        }

        const anime = result.data.Media;

        // Safely extract start and end dates with checks for null values
        const formatDate = (dateObj: any) => {
            if (dateObj && dateObj.year && dateObj.month && dateObj.day) {
                return `${String(dateObj.day).padStart(2, '0')}/${String(dateObj.month).padStart(2, '0')}/${dateObj.year}`;
            }
            return 'Unknown'; // 'Unknown' in Italian
        };

        const startDate = formatDate(anime.startDate);
        const endDate = formatDate(anime.endDate);

        // Extract main character image if exists
        const mainCharacterImage = anime.characters.edges.length > 0
            ? anime.characters.edges[0].node.image.large
            : null;

        // Extract characters array
        const characters = anime.characters.edges.map((edge: any) => ({
            name: edge.node.name.full,
            image: edge.node.image.large,
        }));

        // Determine if anime is finished and the number of episodes
        const isFinished = anime.status === 'FINISHED';
        const episodeCount = anime.episodes || 'Sconosciuto (in corso)'; // 'Unknown (ongoing)' in Italian

        // Determine the airing episode details
        const nextAiringEpisode = anime.airingSchedule.nodes.length > 0
            ? anime.airingSchedule.nodes[0]
            : null;

        return {
            title: anime.title.english || anime.title.romaji,
            id: anime.id,
            coverImage: anime.coverImage.large,
            bannerImage: anime.bannerImage,
            description: anime.description,
            episodes: episodeCount,
            isFinished,
            startDate,
            endDate,
            nextAiringEpisode: nextAiringEpisode
                ? {
                      episode: nextAiringEpisode.episode,
                      airingAt: new Date(nextAiringEpisode.airingAt * 1000).toLocaleString('it-IT'),
                  }
                : null,
            relations: anime.relations.edges.map((edge: any) => ({
                id: edge.node.id,
                relationType: edge.relationType,
            })),
            mainCharacterImage,
            characters, // Return characters array
        };
    } catch (error) {
        console.error('Error fetching anime by ID:', error);
        return null;
    }
}

export function transitTo(route: string) {
    updateFade(true)
    setTimeout(()=>{goto(route)}, 1100)
}

export function removeHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '').trim();
}
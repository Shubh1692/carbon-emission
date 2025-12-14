import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const incomingUrl = new URL(request.url);
    const carbonProjectsUrl = new URL(`${(process.env.CARBONMARK_BASE_URL as string)}carbonProjects`);
    try {
        incomingUrl.searchParams.forEach((value, key) => {
            carbonProjectsUrl.searchParams.set(key, value);
        });
        carbonProjectsUrl.searchParams.set('minSupply', '1'); 
        const carbonProjectsRes = await fetch(carbonProjectsUrl.toString(), {
            method: 'GET',
            headers: {
                
            },
            cache: 'no-store',
        })
        
        if (!carbonProjectsRes.ok) {
                const errorBody = await carbonProjectsRes.text();
                return NextResponse.json(
                    {
                        error: 'Failed to fetch from Carbonmark',
                        details: errorBody,
                    },
                    { status: carbonProjectsRes.status },
                );
            }
        
        const carbonProjects = await carbonProjectsRes.json();
        return NextResponse.json(carbonProjects);
    } catch (err) {
        console.error('Climatiq unit-types error:', err);
        return NextResponse.json(
            { error: 'Unexpected error while talking to Climatiq' },
            { status: 500 },
        );
    }
}

import { NextResponse } from 'next/server';

export async function GET(request: Request, ctx: RouteContext<"/api/carbon-projects/[carbonKey]">) {
    const { carbonKey } = await ctx.params;
    let prices = null;
    const carbonProjectUrl = new URL(`${(process.env.CARBONMARK_BASE_URL as string)}carbonProjects/${carbonKey}`);
    const carbonProjectPriceUrl = new URL(`${(process.env.CARBONMARK_BASE_URL as string)}prices`);
    carbonProjectPriceUrl.searchParams.set('projectIds', carbonKey);
    carbonProjectPriceUrl.searchParams.set('minSupply', String(1));
    carbonProjectPriceUrl.searchParams.set('expiresAfter', (Date.now() / 1000).toString());
    try {
        const [carbonProjectRes, carbonProjectPriceRes] = await Promise.allSettled([fetch(carbonProjectUrl.toString(), {
            method: 'GET',
            headers: {
            },
            cache: 'no-store',
        }),
        fetch(carbonProjectPriceUrl.toString(), {
            method: 'GET',
            headers: {
            },
            cache: 'no-store',
        })])
        if (carbonProjectRes.status === 'rejected') {
            const errorBody = await carbonProjectRes.reason;
            return NextResponse.json(
                {
                    error: 'Failed to fetch carbon project detail from Carbonmark',
                    details: errorBody,
                },
                { status: 400 },
            );
        }

        if (carbonProjectPriceRes.status !== 'rejected') {
            prices = await carbonProjectPriceRes.value.json();
        }

        const carbonProject = await carbonProjectRes.value.json();
        carbonProject.prices = prices ?? [];
        return NextResponse.json(carbonProject);
    } catch (err) {
        console.error('Climatiq unit-types error:', err);
        return NextResponse.json(
            { error: 'Unexpected error while talking to Climatiq' },
            { status: 500 },
        );
    }
}

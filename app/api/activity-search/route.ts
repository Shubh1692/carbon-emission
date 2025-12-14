import { NextResponse } from 'next/server';
import fs from 'node:fs';
export async function GET(request: Request) {
    const activitySearchUrl = new URL(`${(process.env.CLIMATIQ_BASE_URL as string)}search`);
    try {
        let activities: { activity_id: string, name: string }[] = [];
        let page = 1;
        let totalPage = 1;
        let totalResults = 0;
        const incomingUrl = new URL(request.url);
        incomingUrl.searchParams.forEach((value, key) => {
            activitySearchUrl.searchParams.set(key, value);
        });
        activitySearchUrl.searchParams.set('results_per_page', String(500));
        while (page <= totalPage) {
            activitySearchUrl.searchParams.set('page', String(page));
            const activitySearchRes = await fetch(activitySearchUrl.toString(), {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`,
                },
                cache: 'no-store',
            });
            if (!activitySearchRes.ok) {
                const errorBody = await activitySearchRes.text();
                return NextResponse.json(
                    {
                        error: 'Failed to fetch from Climatiq',
                        details: errorBody,
                    },
                    { status: activitySearchRes.status },
                );
            }
            const activityRes = await activitySearchRes.json();
            totalPage = activityRes.last_page ?? 1;
            page = page + 1;
            totalResults = activityRes.total_results;
            activityRes.results.forEach((activity: { activity_id: string, name: string }) => {
                activities.push(activity);
            }, {})
        }
        fs.writeFileSync('./activities.json', JSON.stringify(activities, null, 4));
        return NextResponse.json(activities);
    } catch (err) {
        console.error('Climatiq activities error:', err);
        return NextResponse.json(
            { error: 'Unexpected error while talking activities to Climatiq' },
            { status: 500 },
        );
    }
}

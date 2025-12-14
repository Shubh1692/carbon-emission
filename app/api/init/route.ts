import { NextResponse } from 'next/server';

const CACHE_TTL = 10 * 60 * 1000;

let cachedInitData: any | null = null;
let cachedAt: number | null = null;

export async function GET(request: Request) {
  const now = Date.now();
  if (cachedInitData && cachedAt && now - cachedAt < CACHE_TTL) {
    return NextResponse.json(cachedInitData);
  }
  const unitTypesUrl = new URL(`${(process.env.CLIMATIQ_BASE_URL as string)}unit-types`);
  const dataVersionsUrl = new URL(`${(process.env.CLIMATIQ_BASE_URL as string)}data-versions`);
  try {
    const [unitTypesRes, dataVersionsRes] = await Promise.allSettled([fetch(unitTypesUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`,
      },
      cache: 'no-store',
    }),
    fetch(dataVersionsUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`,
      },
      cache: 'no-store',
    })]);
    if (unitTypesRes.status === 'rejected') {
      const errorBody = await unitTypesRes.reason;
      return NextResponse.json(
        {
          error: 'Failed to fetch unit types from Climatiq ',
          details: errorBody,
        },
        { status: 400 },
      );
    }
    if (dataVersionsRes.status === 'rejected') {
      const errorBody = await dataVersionsRes.reason;
      return NextResponse.json(
        {
          error: 'Failed to fetch data versions from Climatiq',
          details: errorBody,
        },
        { status: 400 },
      );
    }
    const unitTypes = await unitTypesRes.value.json();
    const dataVersion = await dataVersionsRes.value.json();
    cachedInitData = {
      unitTypes, dataVersion
    };
    cachedAt = now;
    return NextResponse.json(cachedInitData);
  } catch (err) {
    console.error('Climatiq unit-types error:', err);
    return NextResponse.json(
      { error: 'Unexpected error while talking to Climatiq' },
      { status: 500 },
    );
  }
}

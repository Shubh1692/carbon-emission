import countries from '@/lib/utils/countries';
import { NextResponse } from 'next/server';

export async function GET() {
        return NextResponse.json(countries);
}

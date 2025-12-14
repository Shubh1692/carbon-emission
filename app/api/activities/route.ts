import { NextResponse } from 'next/server';
import fs from 'node:fs';
export async function GET() {
    try {
        const activities = fs.readFileSync('./activities.json', 'utf-8');
        return NextResponse.json(JSON.parse(activities));
    } catch (err) {
        console.error('Climatiq activities error:', err);
        return NextResponse.json(
            { error: 'Unexpected error while talking activities to Climatiq' },
            { status: 500 },
        );
    }
}

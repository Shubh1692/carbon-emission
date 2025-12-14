import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/sqlite";
import { carbonmarkFetch } from "@/lib/carbonmark";
import { OrderRes, QuoteRes, RetirementOrderPayload, } from "@/lib/types/carbon-emission";
import { createOrder, updateOrderStatus, getOrders } from "@/lib/ordersStore";
export const runtime = "nodejs";

const QuerySchema = z.object({
    limit: z.coerce.number().min(1).max(200).optional(),
    offset: z.coerce.number().min(0).optional(),
    projectKey: z.string().optional(),
});
export async function POST(req: Request) {
    try {
        const body = (await req.json()) as RetirementOrderPayload;
        const quote = await carbonmarkFetch<QuoteRes>("/quotes", {
            method: "POST",
            body: JSON.stringify({
                asset_price_source_id: body.sourceId,
                quantity_tonnes: body.tonnes,
            }),
        });
        const order = await carbonmarkFetch<OrderRes>("/orders", {
            method: "POST",
            body: JSON.stringify({
                quote_uuid: quote.uuid,
                beneficiary_name: body.beneficiaryName,
                retirement_message: body.publicMessage,
                ...(body.consumptionMetadata ? { consumption_metadata: body.consumptionMetadata } : {}),
            }),
        });
        await createOrder(body, quote, order);
        const confirmRes = await carbonmarkFetch<{ data: OrderRes[] }>(`/orders?quote_uuid=${encodeURIComponent(quote.uuid)}`, {
            method: "GET",
        });
        const latest = Array.isArray(confirmRes) ? confirmRes[0] : confirmRes?.data?.[0] ?? confirmRes;
        await updateOrderStatus(quote, latest);
        return NextResponse.json({ ok: true, quote });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 400 });
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const q = QuerySchema.parse({
            limit: url.searchParams.get("limit") ?? undefined,
            offset: url.searchParams.get("offset") ?? undefined,
            projectKey: url.searchParams.get("projectKey") ?? undefined,
        });
        const limit = q.limit ?? 50;
        const offset = q.offset ?? 0;
        const where: string[] = [];
        const params: string[] = [];
        if (q.projectKey) {
            where.push(`project_id = ?`);
            params.push(q.projectKey);
        }

        const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
        const { totalRow, rows } = await getOrders(whereSql, params, limit, offset);
        for (let rowKey in rows) {
            if (rows[rowKey].status === 'COMPLETED') {
                const confirmRes = await carbonmarkFetch<{ data: OrderRes[] }>(`/orders?quote_uuid=${encodeURIComponent(rows[rowKey].raw_quote_json.uuid)}`, {
                    method: "GET",
                });
                const latest = Array.isArray(confirmRes) ? confirmRes[0] : confirmRes?.data?.[0] ?? confirmRes;
                await updateOrderStatus(rows[rowKey].raw_quote_json, latest);
                rows[rowKey].raw_order_json = latest;
                rows[rowKey].status = latest.status;
                rows[rowKey].polygonscan_url = latest.polygonscan_url;
                rows[rowKey].view_retirement_url = latest.view_retirement_url;
            }
        }

        return NextResponse.json({
            ok: true,
            meta: { total: totalRow.total, limit, offset },
            data: rows,
        });
    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message || "Unknown error" },
            { status: 400 }
        );
    }
}

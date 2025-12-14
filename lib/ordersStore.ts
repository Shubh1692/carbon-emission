import {
    Order,
    OrderRes,
    QuoteRes,
    RetirementOrderPayload,
} from "@/lib/types/carbon-emission";

type OrdersMemory = {
    byQuoteUuid: Map<string, Order>;
    seq: number;
};

declare global {

    var __ordersMemory: OrdersMemory | undefined;
}


function store(): OrdersMemory {
    if (!globalThis.__ordersMemory) {
        globalThis.__ordersMemory = { byQuoteUuid: new Map(), seq: 0 };
    }
    return globalThis.__ordersMemory;
}

function nextId(): number {
    const s = store();
    s.seq += 1;
    return s.seq;
}

/**
 * Very small WHERE parser to keep your existing getOrders(...) calls working.
 * Supports "field = ?" joined by AND for common fields.
 */
function filterByWhereSql(rows: Order[], whereSql: string, params: string[]) {
    if (!whereSql?.trim() || params.length === 0) return rows;

    const sql = whereSql.toLowerCase();
    const matches: Array<{ field: keyof Order }> = [];

    const patterns: Array<[RegExp, keyof Order]> = [
        [/project_id\s*=\s*\?/g, "project_id"],
        [/quote_uuid\s*=\s*\?/g, "quote_uuid"],
        [/status\s*=\s*\?/g, "status"],
        [/asset_price_source_id\s*=\s*\?/g, "asset_price_source_id"],
    ];


    const found: Array<{ idx: number; field: keyof Order }> = [];
    for (const [re, field] of patterns) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(sql))) found.push({ idx: m.index, field });
    }
    found.sort((a, b) => a.idx - b.idx);
    for (const f of found) matches.push({ field: f.field });

    if (matches.length === 0) return rows;

    return rows.filter((r) => {
        let ok = true;
        for (let i = 0; i < matches.length; i++) {
            const field = matches[i].field;
            const expected = params[i];
            if ((r[field] ?? null) != expected) ok = false;
        }
        return ok;
    });
}

export function createOrder(
    body: RetirementOrderPayload,
    quote: QuoteRes,
    order: OrderRes
) {
    const s = store();
    const now = new Date().toISOString();

    const quoteUuid = (quote?.uuid ?? null) as string | null;
    if (!quoteUuid) return;

    const existing = s.byQuoteUuid.get(quoteUuid);

    const row: Order = {
        id: existing?.id ?? nextId(),
        project_id: body.projectKey ?? null,
        asset_price_source_id: body.sourceId ?? null,
        quote_uuid: quoteUuid,
        quantity_tonnes: body.tonnes ?? null,
        raw_quote_json: quote as QuoteRes,
        raw_order_json: order as OrderRes,
        status: (order?.status ?? "PENDING") as string,
        beneficiary_name: body.beneficiaryName ?? null,
        retirement_message: body.publicMessage ?? null,
        polygonscan_url: order?.polygonscan_url ?? null,
        view_retirement_url: order?.view_retirement_url ?? null,
        unit_price: String((body as RetirementOrderPayload).unitPrice ?? 0),
        total_cost: String((body as RetirementOrderPayload).totalCost ?? 0),
        created_at: existing?.created_at ?? now,
        updated_at: now,
    };

    s.byQuoteUuid.set(quoteUuid, row);
}

export function updateOrderStatus(quote: QuoteRes, latestOrder: OrderRes) {
    const s = store();
    const now = new Date().toISOString();

    const q =
        (latestOrder as OrderRes)?.quote?.uuid ??
        quote?.uuid;

    if (!q) return;

    const existing = s.byQuoteUuid.get(q);
    if (!existing) return;

    const updated: Order = {
        ...existing,
        status: (latestOrder?.status ?? "UNKNOWN") as string,
        polygonscan_url: latestOrder?.polygonscan_url ?? existing.polygonscan_url,
        view_retirement_url:
            latestOrder?.view_retirement_url ?? existing.view_retirement_url,
        raw_order_json: latestOrder as OrderRes,
        updated_at: now,
    };

    s.byQuoteUuid.set(q, updated);
}

export async function getOrders(
    whereSql: string = "",
    params: string[] = [],
    limit: number = 50,
    offset: number = 0
) {
    const s = store();

    let rows = Array.from(s.byQuoteUuid.values());

    rows = filterByWhereSql(rows, whereSql, params);
    rows.sort(
        (a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
    );

    const totalRow = { total: rows.length };
    const paged = rows.slice(offset, offset + limit);

    return { totalRow, rows: paged };
}


export function deleteOrderByQuoteUuid(quoteUuid: string): boolean {
    return store().byQuoteUuid.delete(quoteUuid);
}


export function deleteAllOrders(): void {
    const s = store();
    s.byQuoteUuid.clear();
    s.seq = 0;
}

import { db } from "./sqlite";
import { Order, OrderRes, QuoteRes, RetirementOrderPayload } from "@/lib/types/carbon-emission";

export function createOrder(body: RetirementOrderPayload, quote: QuoteRes, order: OrderRes) {
    const now = new Date().toISOString();
   const stmt = db.prepare(`
  INSERT INTO retirement_orders (
    project_id, 
    asset_price_source_id,
    quote_uuid,
    quantity_tonnes,
    raw_quote_json,
    raw_order_json,
    status,
    beneficiary_name,
    retirement_message,
    polygonscan_url,
    view_retirement_url,
    unit_price,
    total_cost,
    created_at,
    updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(quote_uuid) DO UPDATE SET
    project_id = excluded.project_id,
    asset_price_source_id = excluded.asset_price_source_id,
    quantity_tonnes = excluded.quantity_tonnes,
    raw_quote_json = excluded.raw_quote_json,
    raw_order_json = excluded.raw_order_json,
    status = excluded.status,
    beneficiary_name = excluded.beneficiary_name,
    retirement_message = excluded.retirement_message,
    polygonscan_url = COALESCE(excluded.polygonscan_url, retirement_orders.polygonscan_url),
    view_retirement_url = COALESCE(excluded.view_retirement_url, retirement_orders.view_retirement_url),
    unit_price = excluded.unit_price,
    total_cost = excluded.total_cost,
    updated_at = excluded.updated_at
`);

    stmt.run(
        body.projectKey ?? null,
        body.sourceId ?? null,
        quote.uuid ?? null,
        body.tonnes ?? null,
        JSON.stringify(quote),
        JSON.stringify(order),
        order.status ?? "PENDING",
        body.beneficiaryName ?? null,
        body.publicMessage ?? null,
        order.polygonscan_url ?? null,
        order.view_retirement_url ?? null,
        body.unitPrice ?? null,
        body.totalCost ?? null,
        now,
        now
    );
}

export function updateOrderStatus(quote: QuoteRes, latestOrder: OrderRes) {
    const now = new Date().toISOString();
    db.prepare(`
               UPDATE retirement_orders
               SET
                   status = ?,
                   polygonscan_url = COALESCE(?, polygonscan_url),
                   view_retirement_url = COALESCE(?, view_retirement_url),
                   raw_order_json = ?,
                   updated_at = ?
               WHERE quote_uuid = ?
           `).run(
        latestOrder.status ?? "UNKNOWN",
        latestOrder.polygonscan_url ?? null,
        latestOrder.view_retirement_url ?? null,
        JSON.stringify(latestOrder),
        now,
        latestOrder.quote.uuid ?? quote.uuid
    );
}
function safeJsonParse<T = any>(value: string | null): T | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

export async function getOrders(
    whereSql: string = "",
    params: string[] = [],
    limit: number = 50,
    offset: number = 0
) {
    const totalRow = db
        .prepare(`SELECT COUNT(*) as total FROM retirement_orders ${whereSql}`)
        .get(...params) as { total: number };

    const rows = db
        .prepare(
            `
      SELECT
        id,
        project_id,
        asset_price_source_id,
        quote_uuid,
        status,
        quantity_tonnes,
        beneficiary_name,
        retirement_message,
        polygonscan_url,
        view_retirement_url,
        raw_quote_json,
        raw_order_json,
        unit_price,
        total_cost,
        created_at,
        updated_at
      FROM retirement_orders
      ${whereSql}
      ORDER BY datetime(created_at) DESC
      LIMIT ? OFFSET ?
    `
        )
        .all(...params, limit, offset) as Order[];

    const parsedRows = rows.map((r) => ({
        ...r,
        raw_quote_json: safeJsonParse(r.raw_quote_json as unknown as string),
        raw_order_json: safeJsonParse(r.raw_order_json as unknown as string),
    }));

    return { totalRow, rows: parsedRows };
}
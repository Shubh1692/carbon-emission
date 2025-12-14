import { number } from "framer-motion";

export type SelectedOption = SelectOption | undefined;

export interface ActivitySearchOptionI {
    activity_id: string;
    id: string;
    name: string;
    category: string;
    sector: string;
    source: string;
    scopes: string[];
    source_link: string;
    source_dataset: string;
    uncertainty: string;
    year: string;
    year_released: string;
    region: string;
    region_name: string;
    description: string;
    unit_type: string;
    unit: string;
    source_lca_activity: string;
    data_quality_flags: string[];
    access_type: string;
    supported_calculation_methods: string[];
    factor: string | null;
    factor_calculation_method: string | null;
    factor_calculation_origin: string | null;
    constituent_gases: {
        co2e_total: string | null;
        co2e_other: string | null;
        co2: string | null;
        ch4: string | null;
        n2o: string | null;
    };
    data_version: {
        status: string | null;
    };
    data_version_information: {
        status: string | null;
    }
};

export interface ActivityOptionI {
    label: string;
    value: string;
};

export interface CarbonFormI {
    submittedBatchId?: string | null;
    activities: CarbonActivityI[];
    isUpdating: boolean;
};

export type SelectOption = {
    value: string | number;
    label: string;
};

export interface FilterOptionsI {
    year: SelectOption[];
    source: SelectOption[];
    region: SelectOption[];
    category: SelectOption[];
    scope: SelectOption[];
    sector: SelectOption[];
    unitType: SelectOption[];
    unit: SelectOption[];
};

export type UnitByType = Record<string, {
    units: {
        name: string;
        values: SelectOption[];
    }[]
}>;

interface EmissionFactor {
    name: string;
    activity_id: string;
    id: string;
    access_type: "public" | "private" | string;
    source: string;
    source_dataset: string;
    year: number;
    region: string;
    category: string;
    source_lca_activity: string;
    data_quality_flags: unknown[];
}

interface ConstituentGases {
    co2e_total: number | null;
    co2e_other: number | null;
    co2: number;
    ch4: number;
    n2o: number;
}

interface ActivityData {
    activity_value: number;
    activity_unit: string;
}

export interface ClimatiqEstimateResponse {
    co2e: number;
    co2e_unit: "kg" | string;
    co2e_calculation_method: "ar6" | string;
    co2e_calculation_origin: "climatiq" | string;
    emission_factor: EmissionFactor;
    constituent_gases: ConstituentGases;
    activity_data: ActivityData;
    audit_trail: string;
    notices: unknown[];
}

export type ClimatiqEstimatePayloadI = {
    emission_factor: {
        activity_id: string;
        data_version: string;
        region: string;
    };
    parameters: Record<string, string | number>;
}
export type ActivityBI = {
    activity: string;
    region: string;
    source: string;
    unitType: string;
    unit: Record<string, string>;
    unitValue: number;
    date: string;
    estimatePayload?: ClimatiqEstimatePayloadI | null;
    estimateResult?: ClimatiqEstimateResponse | null;
};

export interface CarbonActivityI {
    activity: SelectedOption | null;
    region: SelectedOption | null;
    source: SelectedOption | null;
    unitType: SelectedOption | null;
    unitValue: number | null;
    unit: Record<string, SelectedOption | null> | null;
    date: Date | null;
    estimatePayload?: ClimatiqEstimatePayloadI | null;
    estimateResult?: ClimatiqEstimateResponse | null;
}

export type QuoteRes = {
    uuid: string;
    created_at: string;
    updated_at: string;
    credential_id: number;
    asset_price_source_id: string;
    quantity_tonnes: number;
    cost_usdc: number;
    consumed: number;
};

export type OrderRes = {
    id: string | number;
    created_at: string;
    updated_at: string;
    status: string;
    consumption_metadata: Record<string, string | number | null>;
    registry_specific_data: Record<string, string | number | null>;
    quote: QuoteRes;
    completed_at: string;
    transaction_hash: string;
    retirement_message: string;
    retirement_index: 50,
    beneficiary_name: string;
    beneficiary_address: string;
    polygonscan_url: string;
    view_retirement_url: string;

};

export type RetirementOrderPayload = {
    projectKey: string;
    sourceId: string;
    listingId: string;
    priceType: "listing";
    unitPrice: number;
    tonnes: number;
    totalCost: number;
    beneficiaryName: string;
    publicMessage: string;
    consumptionMetadata?: Record<string, string | number> | null;
    token: {
        id: string;
        address: string;
        decimals: number;
        tokenStandard: "erc20";
        name: string;
        isExAnte: boolean;
        symbol: string;
        tokenId: number;
    };
    creditId: {
        vintage: number;
        projectId: string;
    };
};


export type Order = {
    id: number;
    project_id: string;
    asset_price_source_id: string;
    quote_uuid: string;
    status: string;
    quantity_tonnes: number;
    beneficiary_name: string | null;
    retirement_message: string | null;
    polygonscan_url: string | null;
    view_retirement_url: string | null;
    raw_quote_json: QuoteRes | null;
    raw_order_json: OrderRes | null;
    unit_price: string | null;
    total_cost: string | null;
    created_at: string;
    updated_at: string;
};

export type OrdersApiResponse = {
    meta: {
        total: number;
        limit: number;
        offset: number;
    },
    data: Order[];
};
import {
    Currency,
    GuestsAndOrderDataType,
    MultiSelectValue,
    VoucherDetailsInput,
    WeekdaysSelect,
} from "./coreInterfaces";

export interface GetResponse<T> {
    total: number;
    entries: T[];
}

export interface Category {
    name: string;
    value: number;
    children?: {
        value: number;
        name: string;
    }[];
}

export interface CategoryDTO {
    id: number;
    name: string;
    "parent-category"?: MultiSelectValue;
}

export interface ClosedDatesDTO {
    date: string;
    reason: string;
}
export interface ServicesExceptions {
    start: string;
    end: string;
    closed?: boolean;
    services: MultiSelectValue;
}

export interface PublicHolidaysDTO {
    date: string;
    "holiday-name": string;
}

export interface AvailabilityDTO {
    dateString: string;
    isAvailable?: boolean;
    isTuesOrWed?: boolean;
    allServiceStartTimes: Array<Array<string>>;
    allExcludedServicesStartTimes: Array<Array<string>>;
    allExcludedServicesStartTimesFinal: Array<Array<string>>;
    diningServices: number[];
    requiredFirstServiceStartTimes: string[];
    serviceDuration: number[];
    services: [number, string][];
    startTimesRoomAvailability: string[][][];
    excludedServicesDuration: number[];
    excludedServices: [number, string][];
    serviceDetails: { name: string; id: number }[];
    excludedServicesDetails: { name: string; id: number }[];
    postCleaningDuration: number[];
    excludedServicesPostCleaningDuration: number[];
}

export interface ExperienceDTO {
    id: number;
    name: string;
    duration: string;
    categories: MultiSelectValue;
    description: string;
    image: string;
    price: Currency;
    publicHolidayPrice?: Currency;
    isPerPersonPrice: boolean;
    isPackage: boolean;
    allow2AvailabilityOptions?: boolean;
    isVoucher?: boolean;
    ignoreFromAvailabilityCalculation?: boolean;
    requiresRoom?: boolean;
    servicesList?: {
        id: number;
        order: string;
        service: MultiSelectValue;
        parent: string;
        serviceDetails?: {
            id: number;
            image: string;
            "available-online": boolean;
            "per-guest-amount": Currency;
            description: string;
            categories: MultiSelectValue;
            "post-cleaning-duration": string;
            "service-duration": string;
            "total-duration": string;
            available: MultiSelectValue;
            type: MultiSelectValue;
            isvoucher: boolean;
            "requires-room"?: boolean;
            "ignore-from-availability-calculation"?: boolean;
            "service-code": string;
            "unavailable-days"?: WeekdaysSelect[];
            name: string;
        };
    }[];
}

export interface Experience extends ExperienceDTO {}

export interface CreateGuestsAndOrderDTO extends GuestsAndOrderDataType {}

export interface CreateVoucherInputs extends VoucherDetailsInput {
    serviceIds: string[];
    packageIds: string[];
    voucherTotalPrice: number;
    metadata?: { [key: string]: any };
}

export interface VoucherImageDetails {
    toName: string;
    message: string;
    fromName: string;
    experiences: { id: number; value: string }[];
    redeemCode: string;
    expiryDate?: string;
}
export interface CreateVoucherDTO {
    guestsData: {
        entry: {
            email: string;
        };
    }[];
    orderResponse: {
        entry: {
            id: number;
            amount: Currency;
        };
    };
}

type EntryResponse = {
    [key: string]: any;
};

export interface OrderDTO extends EntryResponse {
    metadata: {
        cart: EntryResponse[];
        guests: EntryResponse[];
    };
}

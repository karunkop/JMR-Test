export type Currency = string | number;

export interface SelectValue {
    id: number;
    value: string;
}
export type Weekdays =
    | "Sunday"
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";
export interface WeekdaysSelect {
    id: number;
    value: Weekdays;
}

export type MultiSelectValue = SelectValue[];

export interface ExperienceListService {
    /* "service-code": String; */
    imageSrc: string;
    id: number;
    name: string;
    description?: string;
    features?: string[];
    price: Currency;
    isPackage: boolean;
    categories: MultiSelectValue;
    /* image: String; */
}

export interface CartItem {
    id: number;
    name: string;
    price: Currency;
    publicHolidayPrice?: Currency;
    requiresRoom: boolean;
    categories: MultiSelectValue;
    isDining: boolean;
    ignoreFromAvailabilityCalculation: boolean;
    servicesContent?: {
        id: number;
        name: string;
        requiresRoom: boolean;
        ignoreFromAvailabilityCalculation: boolean;
        unavailableDays: WeekdaysSelect[];
    }[];
    isPackage: boolean;
    needs2Options: boolean;
    isVoucher?: boolean;

    adults: number;
}

export type ChoosenAvailabilityTypeMetadata = {
    index: number;
    servicesStartTimes: Array<Array<string>>;
    servicesDuration: number[];
    servicesCleanupDuration: number[];
    servicesEndTimes: string[];
    servicesNames: string[];
    servicesIds: number[];
};
export type ChoosenAvailabilityType = {
    isPublicHolidayPrice: boolean;
    startTimes: string[];
    diningServices: number[];
    duration: number[];
    services: [number, string][];
    arrivalDate: string;
    startTimesRoomAvailable: string[][];
    excludedServicesDuration: number[];
    excludedServices: [number, string][];
    metadata: ChoosenAvailabilityTypeMetadata;
};
export type OnChooseAvailability = (
    availability: ChoosenAvailabilityType
) => void;

export type GuestsAndOrderDataType = {
    orderResponse: {
        entry: {
            id: number;
            amount: Currency;
        };
    };
    guestsData: {
        entry: {
            id: number;
            "full-name": string;
            email: string;
        };
    }[];
};

export type OnGuestsAndOrderData = (
    data: GuestsAndOrderDataType
) => void;

export type OnGuestsAndOrderBody = (body: any) => void;

export type GuestsDetailsInput = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    // street: string;
    // town: string;
    // state: string;
    // postCode: string;
    // country: { label: string; value: string };
    subscribe: { label: string; value: boolean };
    isPrimaryGuestInGuestList: boolean;
    dietaryRequirements?: string;
    guestDetails: {
        firstName: string;
        lastName: string;
        mobile: string;
        email: string;
        dietaryRequirements?: string;
    }[];
    packages: string[];
    services: string[];
    packagesGuests: number[];
    servicesGuests: number[];
    arrivalDate: string;
    metadata: {
        choosenAvailabilityData: ChoosenAvailabilityType;
        cart: CartItem[];
    };
};

export type VoucherDetailsInput = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subscribe: { label: string; value: boolean };
    guestDetails: {
        fromName: string;
        toName: string;
        message: string;
        email: string;
    }[];
};

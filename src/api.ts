import axios from "axios";
import _ from "lodash";
import { useMutation, useQuery, UseQueryOptions } from "react-query";
import {
    AvailabilityDTO,
    Category,
    CategoryDTO,
    CreateGuestsAndOrderDTO,
    CreateVoucherDTO,
    CreateVoucherInputs,
    ExperienceDTO,
    GetResponse,
    VoucherImageDetails,
    ClosedDatesDTO,
    PublicHolidaysDTO,
    ServicesExceptions,
    OrderDTO,
} from "./types/apiInterfaces";
import { GuestsDetailsInput } from "./types/coreInterfaces";

const instance = axios.create({
    baseURL: "https://avbyt7kij1.execute-api.ap-southeast-2.amazonaws.com/dev",
});

const getClosedDates = async () => {
    const res = await instance.get<{
        closedDates: GetResponse<ClosedDatesDTO>;
        publicHolidays: GetResponse<PublicHolidaysDTO>;
    }>("/getBusinessClosedDates");
    return {
        closedDates: res.data.closedDates.entries,
        publicHolidays: res.data.publicHolidays.entries,
    };
};

export const useGetClosedDates = (
    options?: UseQueryOptions<{
        closedDates: ClosedDatesDTO[];
        publicHolidays: PublicHolidaysDTO[];
    }>
) => {
    return useQuery<{
        closedDates: ClosedDatesDTO[];
        publicHolidays: PublicHolidaysDTO[];
    }>("closed-dates", () => getClosedDates(), {
        ...options,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
};

const getServicesExceptions = async (
    serviceIds: number[],
    selectedDate: string
) => {
    const res = await instance.get<GetResponse<ServicesExceptions>>(
        "/getServicesExceptions",
        {
            params: {
                serviceIds: JSON.stringify(serviceIds),
                selectedDate,
            },
        }
    );
    return res.data.entries;
};

export const useGetServicesExceptions = (
    serviceIds: number[],
    selectedDate: string,
    options?: UseQueryOptions<ServicesExceptions[]>
) => {
    return useQuery<ServicesExceptions[]>(
        ["services-exceptions", serviceIds, selectedDate],
        () => getServicesExceptions(serviceIds, selectedDate),
        {
            ...options,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        }
    );
};

const getSpecificExperience = async (entries: number[], fromCart: boolean) => {
    return (
        await instance.get<GetResponse<ExperienceDTO>>(
            "/getExperiences" +
                `?entryIds=${entries.join(",")}&fromCart=${fromCart}`
        )
    ).data.entries;
};
export const useGetSpecificExperiences = (
    entryId: number[],
    fromCart: boolean,
    options?: UseQueryOptions<ExperienceDTO[]>
) => {
    return useQuery<ExperienceDTO[]>(
        ["specific-experience-list", entryId, fromCart],
        () => getSpecificExperience(entryId, fromCart),
        {
            ...options,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
        }
    );
};

const getExperience = async () => {
    return (await instance.get<GetResponse<ExperienceDTO>>("/getExperiences"))
        .data.entries;
};

export const useGetExperience = (
    options?: UseQueryOptions<ExperienceDTO[]>
) => {
    return useQuery<ExperienceDTO[]>("experience-list", () => getExperience(), {
        ...options,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
};

const getCategories = async () => {
    const categoriesRes = (
        await instance.get<GetResponse<CategoryDTO>>("/getCategories")
    ).data.entries;
    const categories: { [key: string]: Category } = {};
    categoriesRes.forEach((c) => {
        if (_.has(c, ["parent-category", 0])) {
            const { id, value } = _.get(c, ["parent-category", 0]);
            if (_.has(categories, [id])) {
                categories[id] = {
                    ...categories[id],
                    children: [
                        ..._.get(categories, [id, "children"], []),
                        {
                            value: c.id,
                            name: c.name,
                        },
                    ],
                };
            } else {
                categories[id] = {
                    name: value,
                    value: id,
                    children: [{ value: c.id, name: c.name }],
                };
            }
        } else {
            if (!_.has(categories, [c.id])) {
                categories[c.id] = {
                    value: c.id,
                    name: c.name,
                };
            }
        }
    });
    return Object.values(categories);
};

export const useGetCategories = (options?: UseQueryOptions<Category[]>) => {
    return useQuery<Category[]>("categories-list", () => getCategories(), {
        ...options,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
};

const getOrder = async (id: number) => {
    return (await instance.get<OrderDTO>(`/getOrder/${id}`)).data;
};

export const useGetOrder = (
    id: number,
    options?: UseQueryOptions<OrderDTO>
) => {
    return useQuery<OrderDTO>("order", () => getOrder(id), {
        ...options,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
};

const getAvailability = async (
    serviceIds: number[],
    singleServiceTest: boolean[],
    guests: number[],
    dateString: string,
    orderExcludedServiceIds: number[],
    packageIds?: number[],
    packagesWithDinnerRelatedCategories?: number[]
) =>
    (
        await instance.get<AvailabilityDTO>("/getAvailability", {
            params: {
                servicesIds: JSON.stringify(serviceIds),
                packageIds: JSON.stringify(packageIds || []),
                packagesWithDinnerRelatedCategories: JSON.stringify(
                    packagesWithDinnerRelatedCategories || []
                ),
                singleServiceTest: JSON.stringify(singleServiceTest),
                guests: JSON.stringify(guests),
                dateString,
                orderExcludedServiceIds: JSON.stringify(
                    orderExcludedServiceIds
                ),
            },
        })
    ).data;

export const useGetAvailability = (
    options?: UseQueryOptions<AvailabilityDTO>
) => {
    return useMutation<
        AvailabilityDTO,
        Error,
        {
            serviceIds: number[];
            singleServiceTest: boolean[];
            guests: number[];
            dateString: string;
            orderExcludedServiceIds: number[];
            packageIds?: number[];
            packagesWithDinnerRelatedCategories?: number[];
        }
    >(
        ({
            serviceIds,
            singleServiceTest,
            guests,
            dateString,
            orderExcludedServiceIds,
            packageIds,
            packagesWithDinnerRelatedCategories,
        }: {
            serviceIds: number[];
            singleServiceTest: boolean[];
            guests: number[];
            dateString: string;
            orderExcludedServiceIds: number[];
            packageIds?: number[];
            packagesWithDinnerRelatedCategories?: number[];
        }) =>
            getAvailability(
                serviceIds,
                singleServiceTest,
                guests,
                dateString,
                orderExcludedServiceIds,
                packageIds,
                packagesWithDinnerRelatedCategories
            ),
        {
            ...options,
        }
    );
};

const createGuestsAndOrder = async (guestsInfo: GuestsDetailsInput) =>
    (
        await instance.post<CreateGuestsAndOrderDTO>(
            "/createGuestsAndOrder",
            guestsInfo
        )
    ).data;

export const useCreateGuestsAndOrder = (
    options?: UseQueryOptions<CreateGuestsAndOrderDTO>
) => {
    return useMutation<CreateGuestsAndOrderDTO, Error, GuestsDetailsInput>(
        (guestsInfo) => createGuestsAndOrder(guestsInfo),
        {
            ...options,
        }
    );
};

const createBooking = async ({
    orderId,
    token,
    isVoucher,
}: {
    orderId: string;
    token?: string;
    isVoucher: boolean;
}) =>
    (
        await instance.post<any>("/createBooking", {
            orderId,
            token,
            isVoucher,
        })
    ).data;

export const useCreateBooking = (options?: UseQueryOptions<any>) => {
    return useMutation<
        any,
        Error,
        {
            orderId: string;
            token?: string;
            isVoucher: boolean;
        }
    >((d) => createBooking(d), {
        ...options,
    });
};

const createVoucher = async (voucherInputs: CreateVoucherInputs) =>
    (await instance.post<CreateVoucherDTO>("/createVoucher", voucherInputs))
        .data;

export const useCreateVoucher = (
    options?: UseQueryOptions<CreateVoucherDTO>
) => {
    return useMutation<CreateVoucherDTO, Error, CreateVoucherInputs>(
        (voucherInputs) => createVoucher(voucherInputs),
        {
            ...options,
        }
    );
};

const getVoucherImageDetails = async ({ redeemCode }: { redeemCode: string }) =>
    (
        await instance.get<VoucherImageDetails>("/voucherDetails", {
            params: {
                redeemCode,
            },
        })
    ).data;

export const useGetVoucherImageDetails = (
    redeemCode: string,
    options?: UseQueryOptions<VoucherImageDetails>
) => {
    return useQuery<VoucherImageDetails>(
        ["getVoucherImageDetails", redeemCode],
        () => getVoucherImageDetails({ redeemCode }),
        {
            ...options,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            retry: 0,
        }
    );
};

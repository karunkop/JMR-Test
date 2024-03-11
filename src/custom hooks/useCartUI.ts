import { useHistory } from "react-router-dom";
import _ from "lodash";
import queryString from "query-string";

import {
  AccordionTitleProps,
  SemanticWIDTHSNUMBER,
} from "semantic-ui-react";
import { useState } from "react";
import { CartItem } from "../types/coreInterfaces";
import { useCartItemContext } from "../context/cartContext";
import { fromPairs, get, reduce } from "lodash";
import {
  NestedValue,
  UnpackNestedValue,
  useForm,
} from "react-hook-form";
import { useGetExperience, useGetSpecificExperiences } from "../api";

const useCartUI = () => {
  const { cart, updateItemServiceContents, removeItem, addItem, updateIdsCount } =
    useCartItemContext();
  const data = useGetSpecificExperiences(cart.map(e=>e.id), true, {
        onSuccess: (data)=>{
            updateItemServiceContents(data)
        }
    });
  const history = useHistory();
  const [openPackages, setOpenPackages] = useState<
    number[]
  >([]);
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<{ guestsCount: NestedValue<number[]> }>({
    mode: "onChange",
    defaultValues: {
      guestsCount: cart.map((c) => c.adults),
    },
  });
  const { isLoading, isError } = useGetExperience({
    onSuccess: (data) => {
      const { id } = queryString.parse(
        history.location.search
      );
      if (id) {
        const experience = data.filter(
          (e) => +e.id === +id
        );
        const cartItem = cart.filter((c) => +c.id === +id);
        if (
          experience.length > 0 &&
          cartItem.length === 0
        ) {
          // add experience
          const item = experience[0];
          addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            publicHolidayPrice: item.publicHolidayPrice,
            isPackage: item.isPackage,
            isVoucher: item.isVoucher,
            needs2Options: item.allow2AvailabilityOptions || false,
            adults: item.isVoucher ? 1 : 2,
            categories: item.categories,
            isDining: item.categories.filter(({value})=>value === "Dining" || value === "Six Course Omakase Dinner" || value === "Japanese Lunch").length > 0,
            ignoreFromAvailabilityCalculation:
              item.ignoreFromAvailabilityCalculation ||
              false,
            requiresRoom: item.requiresRoom || false,
            servicesContent: _.sortBy(
              item.servicesList
                ?.filter((s) => s.service[0])
                .map((s) => ({
                    unavailableDays:
                        s.serviceDetails?.["unavailable-days"] || [],
                  order: +(s.order || 0),
                  ignoreFromAvailabilityCalculation:
                    s.serviceDetails?.[
                      "ignore-from-availability-calculation"
                    ] || false,
                  requiresRoom:
                    s.serviceDetails?.["requires-room"] ||
                    false,
                  rooms:
                      s.serviceDetails?.available.map(
                          (a) => a.id
                      ) || [],
                  id: s.service[0].id,
                  name: s.service[0].value,
                })) || [],
              (s) => s.order
            ),
          });
          setTimeout(
            () =>
              setValue("guestsCount", [
                item.isVoucher ? 1 : 2,
              ]),
            0
          );
        }
      }
    },
  });

  const hasErrors = Object.keys(errors).length > 0;

  const handleAddExperienceClick = () => {
    runUpdateIds(getValues());
    history.push("/");
  };

  const handleCollapsableClick: (
    event: React.MouseEvent<HTMLDivElement>,
    data: AccordionTitleProps
  ) => void = (_, titleProps) => {
    const { index } = titleProps;
    if (index === undefined) {
      return;
    }
    if (openPackages.includes(+index)) {
      setOpenPackages(
        openPackages.filter(
          (openIndex) => openIndex !== index
        )
      );
      return;
    }
    setOpenPackages([...openPackages, +index]);
  };

  const handleDeleteItemClick = (item: CartItem) => {
    removeItem(item.id);
  };

  const runUpdateIds = (data: {
    guestsCount: UnpackNestedValue<number[]>;
  }) => {
    updateIdsCount(
      fromPairs(
        cart.map((s, i) => {
          const guestsCount = get(
            errors,
            `guestsCount.${i}`,
            false
          )
            ? s.adults
            : data.guestsCount[i];
          return [s.id, guestsCount];
        })
      )
    );
  };

  const onSubmit = (data: {
    guestsCount: UnpackNestedValue<number[]>;
  }) => {
    runUpdateIds(data);
  };

  const countValue = watch(`guestsCount`);

  const total = reduce(
    cart,
    (acc, s, index) => {
      const count = Object.keys(_.get(errors, [index], {}))
        .length
        ? 0
        : +countValue[index];
      return acc + +s.price * count;
    },
    0
  );
  const handleVoucherButtonClick = () => {
    history.push("/voucher");
  };

  const isVoucher = cart.reduce(
    (agg, c) => agg && _.get(c, "isVoucher", false),
    true
  );
  const widths: SemanticWIDTHSNUMBER[] = isVoucher
    ? [1, 7, 8]
    : [1, 7, 6, 2];
  return {
    cart,
    openPackages,
    errors,
    countValue,
    widths,
    handleDeleteItemClick,
    handleCollapsableClick,
    control,
    hasErrors,
    handleSubmit,
    onSubmit,
    isLoading: isLoading || data.isLoading,
    isError,
    handleAddExperienceClick,
    handleVoucherButtonClick,
    total,
    isVoucher,
  };
};

export default useCartUI;

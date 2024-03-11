import { useCallback, useEffect, useState } from "react";
import { Range } from "react-input-range";
import {
  OnCategoryClick,
  OnSubCategoryClick,
} from "../components/categoryUI";
import { FilterUIType } from "../components/filterUI";
import useCategoryState from "./useCategoryState";
import usePriceState from "./usePriceState";

const useFilterUI = ({ data, onChange }: FilterUIType) => {
  const { price, dispatchPrice } = usePriceState();
  const {
    categoriesState,
    dispatchCategoryState,
    getSelectedCategoriesFrom,
    isLoadingCategories,
    isErrorCategories,
    categories,
  } = useCategoryState();

  const [filterOpen, setFilterOpen] =
    useState<boolean>(false);

  useEffect(() => {
    dispatchPrice({
      key: "setExtremes",
      payload: {
        experiences: data,
      },
    });
  }, [data, dispatchPrice]);

  useEffect(() => {
    onChange(
      getSelectedCategoriesFrom(categoriesState),
      price.value
    );
  }, [
    categoriesState,
    getSelectedCategoriesFrom,
    onChange,
    price.value,
  ]);

  const toggleFilterOpen = () => setFilterOpen(!filterOpen);

  const handlePriceChange: (range: Range | number) => void =
    useCallback(
      (range) => {
        dispatchPrice({
          key: "setValue",
          payload: range as Range,
        });
      },
      [dispatchPrice]
    );

  const handleCategoryClick: OnCategoryClick = useCallback(
    (path, children) =>
      dispatchCategoryState({
        key: "toggleCategory",
        payload: { path, children },
      }),
    [dispatchCategoryState]
  );

  const handleSubCategoryClick: OnSubCategoryClick =
    useCallback(
      (path, key) =>
        dispatchCategoryState({
          key: "toggleSubCategory",
          payload: {
            path,
            key,
          },
        }),
      [dispatchCategoryState]
    );

  return {
    price,
    handlePriceChange,

    filterOpen,
    toggleFilterOpen,

    categoriesState,
    categories,
    handleCategoryClick,
    handleSubCategoryClick,
    isLoadingCategories,
    isErrorCategories,
  };
};

export default useFilterUI;

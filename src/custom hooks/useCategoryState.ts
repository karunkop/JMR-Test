import _ from "lodash";
import { useCallback, useEffect, useReducer } from "react";
import { useGetCategories } from "../api";
import { Category } from "../types/apiInterfaces";
import { CategoriesState } from "../components/categoryUI";

const useCategoryState = () => {
  const [categoriesState, dispatchCategoryState] =
    useReducer(
      (
        state: CategoriesState,
        action:
          | {
              key: "initializeCategoryState";
              payload: {
                categories: Category[];
              };
            }
          | {
              key: "toggleCategory";
              payload: {
                path: number;
                children?: {
                  value: number;
                }[];
              };
            }
          | {
              key: "toggleSubCategory";
              payload: {
                path: number;
                key: number;
              };
            }
      ) => {
        switch (action.key) {
          case "initializeCategoryState": {
            const { categories } = action.payload;
            return categories.reduce(
              (acc, category) => ({
                ...acc,
                [category.value]: {
                  value: false,
                  ...(category.children?.reduce(
                    (a, c) => ({
                      ...a,
                      [c.value]: false,
                    }),
                    {}
                  ) || {}),
                },
              }),
              {} as CategoriesState
            );
          }
          case "toggleCategory": {
            const { path, children } = action.payload;
            return {
              ...state,
              [path]: {
                ...state[path],
                value: !state[path].value,
                ...children?.reduce(
                  (a, c) => ({
                    ...a,
                    [c.value]: !state[path].value,
                  }),
                  {}
                ),
              },
            };
          }
          case "toggleSubCategory": {
            const { path, key } = action.payload;
            return {
              ...state,
              [path]: {
                ...state[path],
                [key]: !state[path][key] || false,
              },
            };
          }
          default:
            return state;
        }
      },
      {}
    );

  const {
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    data: categories,
  } = useGetCategories({});

  useEffect(() => {
    if (categories) {
      dispatchCategoryState({
        key: "initializeCategoryState",
        payload: { categories },
      });
    }
  }, [categories]);

  const getSelectedCategoriesFrom = useCallback(
    (categoriesState: CategoriesState) =>
      _.flatten(
        _.map(
          categoriesState,
          ({ value, ...childIds }, key) =>
            value
              ? [
                  +key,
                  ...Object.keys(childIds || {}).map(
                    (k) => +k
                  ),
                ]
              : Object.entries(childIds || {})
                  .filter(([_, v]) => v)
                  .map(([id, _]) => +id)
        )
      ),
    []
  );

  return {
    categoriesState,
    dispatchCategoryState,
    getSelectedCategoriesFrom,
    isLoadingCategories,
    isErrorCategories,
    categories,
  };
};

export default useCategoryState;

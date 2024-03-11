import _ from "lodash";
import { useReducer } from "react";
import { Range } from "react-input-range";
import { ExperienceDTO } from "../types/apiInterfaces";

type PriceType = {
  extremes: Range;
  value: Range;
};

const usePriceState = () => {
  const defaultExtremes = { min: 0, max: 1000 };
  const [price, dispatchPrice] = useReducer(
    (
      state: PriceType,
      action:
        | {
            key: "setValue";
            payload: Range;
          }
        | {
            key: "setExtremes";
            payload: {
              experiences?: ExperienceDTO[];
            };
          }
    ) => {
      switch (action.key) {
        case "setExtremes":
          const { experiences = [] } = action.payload;
          let min: number = _.reduce(
            experiences,
            (acc, d) =>
              +d.price < acc ? +d.price : acc,
            defaultExtremes.min
          );
          let max: number = _.reduce(
            experiences,
            (acc, d) =>
              +d.price > acc ? +d.price : acc,
            defaultExtremes.max
          );
          return {
            extremes: {
              min,
              max,
            },
            value: {
              min:
                state.value.min === defaultExtremes.min
                  ? min
                  : state.value.min,
              max:
                state.value.max === defaultExtremes.max
                  ? max
                  : state.value.max,
            },
          };
        case "setValue":
          return {
            ...state,
            value: action.payload,
          };
        default:
          return state;
      }
    },
    {
      extremes: {
        min: defaultExtremes.min,
        max: defaultExtremes.max,
      },
      value: {
        min: defaultExtremes.min,
        max: defaultExtremes.max,
      },
    }
  );

  return {
    price,
    dispatchPrice,
  };
};

export default usePriceState;

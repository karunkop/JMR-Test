import { useCallback, useEffect, useState } from "react";
import {
  Message,
  Button,
  Segment,
  Loader,
} from "semantic-ui-react";
import { Range } from "react-input-range";
import { useGetExperience } from "../api";
import CardsUI from "../components/experiencesCard";
import _ from "lodash";
import { ExperienceDTO } from "../types/apiInterfaces";
import FilterUI from "../components/filterUI";
import { useCartItemContext } from "../context/cartContext";

const ExperienceList = () => {
  const [experiences, setExperiences] = useState<
    ExperienceDTO[]
  >([]);

  const { cart } = useCartItemContext();

  const applyVoucherFilter = useCallback(
    (data: ExperienceDTO[]) => {
      if (cart.length) {
        const isVoucher = cart.reduce(
          (agg, c) => agg && _.get(c, "isVoucher", false),
          true
        );
        return data.filter((d) => {
          return isVoucher ? d.isVoucher : !d.isVoucher;
        });
      }
      return data;
    },
    [cart]
  );

  const { isLoading, isError, data } = useGetExperience({
    onSuccess: (data) => {
      setExperiences(applyVoucherFilter(data));
    },
  });

  useEffect(() => {
    if (data) {
      setExperiences(applyVoucherFilter(data));
    }
  }, [applyVoucherFilter, data]);

  // handlers
  const handleFilterChange = useCallback(
    (selectedCategories: number[], price: Range) => {
      if (selectedCategories.length > 0) {
        setExperiences(
          applyVoucherFilter(
            data
              ?.filter(
                (d) =>
                  d.categories.filter((c) =>
                    selectedCategories.includes(c.id)
                  ).length > 0
              )
              .filter(
                (e) =>
                  price.min <= +e.price&&
                  +e.price<= price.max
              ) || []
          )
        );
      } else {
        setExperiences(
          applyVoucherFilter(
            data?.filter(
              (e) =>
                price.min <= +e.price&&
                +e.price<= price.max
            ) || []
          )
        );
      }
    },
    [applyVoucherFilter, data]
  );

  return (
    <section className="cart-wrapper center">
      <Segment>
        <FilterUI
          data={data}
          onChange={handleFilterChange}
        />
        {isError ? (
          <Message
            error
            header="There was some error getting experiences"
            list={[
              "We are retrying in the background.",
              <Button negative content="Retry" />,
            ]}
          />
        ) : isLoading || experiences === undefined ? (
          <Loader active />
        ) : (
          <CardsUI experiences={experiences} />
        )}
      </Segment>
    </section>
  );
};

export default ExperienceList;

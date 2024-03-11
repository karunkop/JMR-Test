import Collapse from "@kunukn/react-collapse";
import InputRange from "react-input-range";
import { Button, Header, Segment } from "semantic-ui-react";
import { ExperienceDTO } from "../types/apiInterfaces";
import CategoryUI from "./categoryUI";
import useFilterUI from "../custom hooks/useFilterUI";

export type FilterUIType = {
  data?: ExperienceDTO[];
  onChange: (
    selectedCategories: number[],
    price: { min: number; max: number }
  ) => void;
};

const FilterUI = ({ data, onChange }: FilterUIType) => {
  const {
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
  } = useFilterUI({ data, onChange });

  return (
    <div style={{ paddingBottom: "14px" }}>
      <div>
        <Button
          onClick={toggleFilterOpen}
          icon="filter"
          content="Filter"
          basic
        />
      </div>
      <Collapse isOpen={filterOpen}>
        <Segment style={{ marginTop: "14px" }}>
          <label>
            <Header as="h4">Price</Header>
          </label>
          <div
            style={{
              padding: "15px 10px 20px 10px",
            }}
          >
            <InputRange
              maxValue={price.extremes.max}
              minValue={price.extremes.min}
              value={price.value}
              onChange={handlePriceChange}
            />
          </div>
          <label>
            <Header as="h4">Categories</Header>
          </label>
          <div style={{ padding: "10px 5px 20px 5px" }}>
            <CategoryUI
              categoriesState={categoriesState}
              categories={categories}
              isLoading={isLoadingCategories}
              isError={isErrorCategories}
              handleCategoryClick={handleCategoryClick}
              handleSubCategoryClick={
                handleSubCategoryClick
              }
            />
          </div>
        </Segment>
      </Collapse>
    </div>
  );
};

export default FilterUI;

import {
  Message,
  Checkbox,
  Loader,
} from "semantic-ui-react";
import { Category } from "../types/apiInterfaces";

export type CategoriesState = {
  [key: string]: { value: boolean; [key: string]: boolean };
};

export type OnSubCategoryClick = (
  path: number,
  key: number
) => void;
export type OnCategoryClick = (
  path: number,
  children?: { name: string; value: number }[]
) => void;

type CategoryUIType = {
  categoriesState: CategoriesState;
  categories?: Category[];
  isLoading: boolean;
  isError: boolean;
  handleCategoryClick: OnCategoryClick;
  handleSubCategoryClick: OnSubCategoryClick;
};
const CategoryUI = ({
  categoriesState,
  categories,
  isLoading,
  isError,
  handleCategoryClick,
  handleSubCategoryClick,
}: CategoryUIType) => {
  if (isLoading) {
    return <Loader active />;
  }

  if (isError) {
    return (
      <Message
        error
        header="There was some error getting categories"
      />
    );
  }

  if (!categories) {
    return null;
  }

  return (
    <>
      {categories.map((category) => (
        <div
          key={`category_cover_${category.value}`}
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Checkbox
            style={{ padding: "5px 0" }}
            label={category.name}
            checked={
              categoriesState[category.value]?.value ||
              false
            }
            onChange={() =>
              handleCategoryClick(
                category.value,
                category.children
              )
            }
          />
          {category.children &&
            category.children.map((c) => (
              <Checkbox
                key={`category_checkbox_${c.value}`}
                style={{
                  padding: "5px 26px",
                }}
                label={c.name}
                checked={
                  (categoriesState[category.value] &&
                    categoriesState[category.value][
                      c.value
                    ]) ||
                  false
                }
                onChange={() =>
                  handleSubCategoryClick(
                    category.value,
                    c.value
                  )
                }
              />
            ))}
        </div>
      ))}
    </>
  );
};

export default CategoryUI;

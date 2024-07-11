import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "./store/store";
import RecipesContainer from "./discoverPageComponents/RecipesContainer";

export default function SearchFavorites() {
  const [sort, setSort] = useState("");
  const [direction, setDirection] = useState("");
  const [sortedResults, setSortedResults] = useState([]);

  const searchResults = useStore((state) => state.searchResults);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchResults.length === 0) {
      navigate("/favorites");
    } else {
      setSortedResults([...searchResults]);
    }
  }, [searchResults, navigate]);

  useEffect(() => {
    const sortResults = () => {
      let sorted = [...searchResults];
      if (sort && direction) {
        sorted.sort((a, b) => {
          let comparison = 0;

          if (sort === "difficulty") {
            const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
            const difficultyA =
              difficultyOrder[a.difficulty.toLowerCase()] || 4;
            const difficultyB =
              difficultyOrder[b.difficulty.toLowerCase()] || 4;
            comparison = difficultyA - difficultyB;
          } else if (sort === "time") {
            const timeA =
              parseInt(a.time_consuming.replace("mins", "").trim()) || 0;
            const timeB =
              parseInt(b.time_consuming.replace("mins", "").trim()) || 0;
            comparison = timeA - timeB;
          } else if (sort === "rate") {
            const rateA = parseFloat(a.rate) || 0;
            const rateB = parseFloat(b.rate) || 0;
            comparison = rateA - rateB;
          } else if (sort === "popularity") {
            const popularityA = parseInt(a.popularity) || 0;
            const popularityB = parseInt(b.popularity) || 0;
            comparison = popularityA - popularityB;
          } else {
            if (a[sort] > b[sort]) {
              comparison = 1;
            } else if (a[sort] < b[sort]) {
              comparison = -1;
            }
          }

          return direction === "asc" ? comparison : -comparison;
        });
      }
      setSortedResults(sorted);
    };

    sortResults();
  }, [sort, direction, searchResults]);

  const sortMethod = (sortOption, newDirection) => {
    setSort(sortOption);
    setDirection(newDirection);
    console.log(`sort: ${sortOption}, direction: ${newDirection}`);
  };

  return (
    <div className="flex flex-col w-full hide-scrollbar">
      <div className="mt-10 mb-10">
        <div className="flex justify-center items-center mb-10">
          <h1 className="title">Search Result</h1>
        </div>
        {searchResults.message ? (
          <div className="flex flex-col items-center justify-center">
            <p className="text-gray-600 text-xl">{searchResults.message}</p>
          </div>
        ) : (
          <RecipesContainer recipes={sortedResults} onSortChange={sortMethod} />
        )}
      </div>
    </div>
  );
}

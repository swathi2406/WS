import React, { useState, useEffect } from "react";
import SearchTwoToneIcon from "@material-ui/icons/SearchTwoTone";
import { list, getCurrentUser } from "../user/apiUser";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { listprojects } from "./../project/apiProject";
import { Redirect, Link } from "react-router-dom";
const SearchUserBar = () => {
  const [query, setQuery] = useState([]);
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [url, setUrl] = useState("");
  useEffect(() => {
    let suggestions = [];
    list()
      .then((data) => {
        setUsers(data);
        data.map((user) => {
          suggestions.push({
            id: user._id,
            name: user.name + `(@${user.username})`,
            url: `/user/${user._id}`,
            type: user,
          });
        });
      })
      .then(() => {
        setSuggestions(suggestions);
      });
  }, []);

  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    // console.log(string, results);
  };
  const handleOnHover = (result) => {
    // the item hovered
    // console.log(result);
  };

  const handleOnSelect = (item) => {
    // the item selected
    console.log(item);
    setUrl(item.url);
  };

  const handleOnFocus = () => {
    // console.log("Focused");
  };
  console.log(suggestions);
  if (url !== "") {
    return <Redirect to={url} />;
  }
  return (
    <span>
      <div
        className="quick-search quick-search-inline ml-4 w-250px"
        id="kt_quick_search_inline"
      >
        <ReactSearchAutocomplete
          items={suggestions}
          onSearch={handleOnSearch}
          onHover={handleOnHover}
          onSelect={handleOnSelect}
          onFocus={handleOnFocus}
          autoFocus
          styling={{ zIndex: 100 }}
        />
      </div>
    </span>
  );
};

export default SearchUserBar;

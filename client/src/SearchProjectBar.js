import React, { useState, useEffect } from "react";
import SearchTwoToneIcon from "@material-ui/icons/SearchTwoTone";
import { list, getCurrentUser } from "./user/apiUser";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { listprojects } from "./project/apiProject";
import { Redirect, Link } from "react-router-dom";
const SearchProjectBar = () => {
  const [query, setQuery] = useState([]);
  //   const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [myProjectState, setMyProjectState] = useState({});
  const [url, setUrl] = useState("");
  useEffect(() => {
    let suggestions = [];
    // list()
    //   .then((data) => {
    //     setUsers(data);
    //     data.map((user) => {
    //       suggestions.push({
    //         id: user._id,
    //         name: user.name,
    //         url: `/user/${user._id}`,
    //         type: user,
    //       });
    //     });
    //   })
    //   .then(() => {
    listprojects()
      .then((data) => {
        //   setMyProjects(data.userProjects);
        //   data.userProjects.map((project) => {
        //   suggestions.push({
        //     id: project._id,
        //     name: project.title,
        //     url: `/`,
        //   });
        //   });
        setProjects(data);
        data.map((project) => {
          if (project.team.includes(getCurrentUser()._id)) {
            suggestions.push({
              id: project._id,
              name: project.title,
              url: `/myprojects/dashboard/${project._id}`,
              type: "myproject",
              data: project,
            });
          } else {
            suggestions.push({
              id: project._id,
              name: project.title,
              url: `/joinproject`,
              type: "project",
            });
          }
        });
      })
      .then(() => {
        setSuggestions(suggestions);
      });
    //   });
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
    if (item.type === "myproject") {
      console.log(item);
      setUrl(item.url);
      setMyProjectState(item.data);
    }
    if (item.type === "project") {
      window.location.reload();
    }
  };

  const handleOnFocus = () => {
    // console.log("Focused");
  };
  //   const suggestions = [...users];
  console.log(suggestions);
  console.log("myProjectState", myProjectState);
  //   if (url !== "" && myProjectState !== {})
  //     return <Redirect to={{ url: url, state: { project: myProjectState } }} />;
  if (url !== "") {
    if (myProjectState !== {}) {
      return (
        <Redirect to={{ pathname: url, state: { project: myProjectState } }} />
      );
    }
    // window.location.reload();
    // return <Redirect to={url} />;
    // if not his project redirected to join project, so nothing done
  }
  return (
    // <Redirect>
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
        {/* <form className="quick-search-form">
          <div className="input-group rounded">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <SearchTwoToneIcon />
              </span>
            </div>
          </div>
        </form> */}
      </div>
    </span>
    // </Redirect>
  );
};

export default SearchProjectBar;

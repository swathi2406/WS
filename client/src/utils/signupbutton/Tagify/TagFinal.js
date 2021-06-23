import React, { useEffect } from "react";
import Tags from "@yaireo/tagify/dist/react.tagify";
import "@yaireo/tagify/dist/tagify.css";
// Tagify settings object
const baseTagifySettings = {
  blacklist: [],
  enforceWhitelist: true,
  dropdown: {
    enabled: 0,
  },
  callbacks: {},
};

function TagFinal({ label, name, value, suggestions, setSkills }) {
  const handleChange = (e) => {
    // console.log(e.detail.tagify.value);
    let arr = [];
    e.detail.tagify.value.map((val) => {
      arr.push(val.value);
    });
    // console.log(arr, setSkills);
    setSkills(arr);
  };
  const settings = {
    ...baseTagifySettings,
    whitelist: suggestions,
    callbacks: {
      add: handleChange,
      remove: handleChange,
      blur: handleChange,
      edit: handleChange,
      invalid: handleChange,
      click: handleChange,
      focus: handleChange,
      "edit:updated": handleChange,
      "edit:start": handleChange,
    },
  };
  //   console.log("words:");
  //   console.log(suggestions);
  if (suggestions.length === 0) return null;
  // console.log(initialValue);
  return (
    <div className="form-group">
      <label htmlFor={"field-" + name}>{label}</label>
      <Tags settings={settings} value={value} />
    </div>
  );
}

export default TagFinal;

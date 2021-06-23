import React from "react";
import { isAuthenticated } from "./../auth";

const NavBar = () => {
  return (
    <>
      {isAuthenticated() && (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <span className="navbar-brand mb-0 h1">Workshake</span>
        </nav>
      )}
    </>
  );
};

export default NavBar;

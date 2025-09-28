import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBox() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const submitHandler = (e) => {
    e.preventDefault();
    if (name.trim()) {
      navigate(`/search/name/${name}`);
    }
  };
  return (
    <form className="search-form" onSubmit={submitHandler}>
      <div className="search-input-group">
        <input
          type="text"
          name="q"
          id="q"
          placeholder="Search products..."
          className="search-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="search-button" type="submit">
          <i className="fa fa-search"></i>
        </button>
      </div>
    </form>
  );
}

import React from "react";

export function Component() {
  var count = 1;
  return (
    <div id="app" className="container" >
      <button onClick={() => alert("clicked")} >
        Click me
      </button>
      <img src="profile.png" />
      <a href="https://example.com" />
    </div>
  );
}

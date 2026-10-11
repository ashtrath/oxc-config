import React from "react";

export function Component() {
	const count = 1;
	return (
		<div className="container" id="app">
			<button onClick={() => alert("clicked")}>Click me</button>
			<img src="profile.png" />
			<a href="https://example.com" />
		</div>
	);
}

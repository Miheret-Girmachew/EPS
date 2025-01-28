import React from "react";
import { Link } from "react-router-dom";
import './NotFound.css'
function NotFound() {
	return (
		<div className="notFound">
			<div className=" text-left">
				<h2>Sorry, the page you are looking for couldn't be found.</h2>
				<br />
				<p>
					Please go back to the <Link to={"/"}>home page</Link> and
					try again. If it still doesn't work for you, please reach
					out to our team at{" "}
					<span style={{ color: "#f6912b" }}>
						contact@evangadiSupport.com
					</span>
				</p>
			</div>
		</div>
	);
}



export default NotFound;

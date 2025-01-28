import React from "react";
import './Loading.css'
import loadingGif from "../assets/preloader.gif";
function Loading() {
	return (
		<div className="loadingMain">
			<img src={loadingGif} alt="" />
		</div>
	);
}


export default Loading;

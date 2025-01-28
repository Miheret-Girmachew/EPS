import React, { useState } from "react";
import './LoginPage.css'
import Auth from "../components/logInSignUp/LogInSignUp";

function LoginPage() {
	const [buttonText, setbuttonText] = useState(true)
	
	let textChanger=()=>{
		buttonText? setbuttonText(false):setbuttonText(true)
	}
	return (
		<div className="mainSection">
			<div className="container px-md-5">
				<div className="d-flex">
					<div className="col-12 col-md-6 shadow auth mx-md-4 ">
						{/* <p className="text-danger">{state.alert}</p> */}
						<div className="">
							<Auth />
						</div>
					</div>
					<div className="d-sm-col d-md-block col-12 col-md-6 explained">
						<p>About</p>
						<h1 className="text-gradient">Evangadi Networks</h1>
						<p>
							No matter what stage of life you are in, whether
							you’re just starting elementary school or being
							promoted to CEO of a Fortune 500 company, you have
							much to offer to those who are trying to follow in
							your footsteps.
						</p>
						<p>
							Weather you are willing to share your knowledge or
							you are just looking to meet mentors of your own,
							please start by joining the network here.
						</p>
						<button
						onClick={textChanger}
						type="button"
						className="CreateNewAcc"
						data-bs-target="#carouselExample"
						data-bs-slide="next"
						>
									{buttonText?'CREATE A NEW ACCOUNT': 'SIGN IN TO YOUR ACCOUNT'}
									
						</button>
						
					</div>
				</div>
			</div>
		</div>
	);
}
export default LoginPage; 
import React from "react";
import logo from "../../assets/evangadi-logo-footer.png";
import './Footer.css'
import { BiLogoFacebook } from "react-icons/bi";
import { AiFillInstagram } from "react-icons/ai";
import { AiFillYoutube } from "react-icons/ai";
function Footer() {
	return (
		<div className="footerMain">
			<div className="container px-sm-4">
				<div className="row">
					<div className="col-12 col-md-4 ">
						<div className="logo">
							<img src={logo} alt="" />
						</div>
						<div className="d-flex ">
							<div className="social">
								<a href="https://www.facebook.com/evangaditech">
									<BiLogoFacebook />
								</a>
							</div>
							<div className="social">
								<a href="https://www.instagram.com/evangaditech">
									<AiFillInstagram />
								</a>
							</div>
							<div className="social">
								<a href="https://www.youtube.com/@EvangadiTech">
									<AiFillYoutube />
								</a>
							</div>
						</div>
					</div>
					<div className="col-12 col-md-4 footer-links">
						<h5>Contact Info</h5>
						<ul className="row">
							<li>Evangadi Networks</li>
							<li>support@evangadi.com</li>
							<li>+1-202-386-2702</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}


export default Footer;

import { Link } from "@fluxonjs/router";

export default function Home(){
	return (
		<nav>
			<Link to="/about">About</Link>
		</nav>
	)
}
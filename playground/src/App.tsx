import { Link, Router } from "@fluxonjs/router";
import { routes } from "./routes/routes";

export default function App(){
  return (
    <>
      <nav>
        
      </nav>

      <Router routes={routes}/>
    </>
  )
}
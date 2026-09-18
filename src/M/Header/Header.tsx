import Left from "./Component/Left";
// import Middel from "./Component/Middel";
import MyIcon from "../../assets/logo.svg?react";
import "./Header.css";
// import MobileLinks from "./Component/MobileLinks";
// import { useState } from "react";
import { Link } from "react-router-dom";
function Header() {
  // const [isClicked, setIsClicked] = useState(false);
  // function handelOpenMobileBar() {
  //   setIsClicked(!isClicked);
  //   // window.scrollTo({ top: 0, behavior: "smooth" });
  //   window.addEventListener("click", handelCloseMobileBar);
  // }
  // function handelCloseMobileBar() {
  //   setIsClicked(false);
  //   window.removeEventListener("click", handelCloseMobileBar);
  // }
  return (
    <header className="App-header fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-lg">
      <div className="min-h-17.5 container p-0.5 flex items-center justify-between px-2 ">
        <div className="text-2xl font-bold tracking-widest shadow-logo bg-transparent cursor-pointer">
          <Link to="/" className="flex items-center gap-1">
            <MyIcon className="inline-block mr-1 my-logo w-11 h-11" />
            HEP
          </Link>
        </div>
        {/* <Middel /> */}
        <Left
        // isClicked={isClicked}
        // openMobileBar={handelOpenMobileBar}
        // closeMobileBar={handelCloseMobileBar}
        />
      </div>
      {/* <MobileLinks
        isClicked={isClicked}
        closeMobileBar={handelCloseMobileBar}
      /> */}
    </header>
  );
}

export default Header;

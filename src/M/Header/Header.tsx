import Left from "./Component/Left";
import Middel from "./Component/Middel";
import MyIcon from "../../assets/logo.svg?react";
import "./Header.css";
import MobileLinks from "./Component/MobileLinks";
import { useState } from "react";
function Header() {
  const [isClicked, setIsClicked] = useState(false);
  return (
    <header className="App-header relative">
      <div className="min-h-17.5 container border p-0.5 flex items-center justify-around">
        <div className="text-2xl font-bold tracking-widest flex items-center gap-1 shadow-logo bg-transparent cursor-pointer">
          <MyIcon
            className="inline-block mr-1 my-logo w-11 h-11"
            style={{ fill: "red" }}
          />
          HEP
        </div>
        <Middel />
        <Left isClicked={isClicked} setIsClicked={setIsClicked} />
      </div>
      <MobileLinks isClicked={isClicked} setIsClicked={setIsClicked} />
    </header>
  );
}

export default Header;

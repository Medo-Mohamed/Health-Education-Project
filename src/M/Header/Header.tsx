import Left from "./Component/Left";
import Middel from "./Component/Middel";

function Header() {
  return (
    <header className="App-header">
      <div className="min-h-17.5 container border p-0.5 flex items-center justify-around">
        <div className="text-2xl font-bold tracking-widest">HEP</div>
        <Middel />
        <Left />
      </div>
    </header>
  );
}

export default Header;

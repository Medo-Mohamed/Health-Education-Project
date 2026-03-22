import { Link } from "react-router-dom";
import { links } from "./Middel.tsx";

function MobileLinks({
  isClicked,
  closeMobileBar,
}: {
  isClicked: boolean;
  closeMobileBar: () => void;
}) {
  return (
    <div
      className={`absolute top-full left-0 w-full overflow-hidden transition-all duration-400 ease-in-out ${
        isClicked ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div
        className="container bg-gray-500 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {" "}
        {/* أضفت خلفية ليظهر التأثير */}
        <div className="border p-4 flex flex-col gap-4 text-center">
          {links.map((link) => {
            if ("path" in link) {
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="border p-3 rounded-full hoverAction"
                  onClick={closeMobileBar}
                >
                  {link.name}
                </Link>
              );
            }
            return link.Children.map((child) => {
              if ("path" in child) {
                return (
                  <Link
                    key={child.name}
                    to={child.path!}
                    className="border p-3 rounded-full hoverAction"
                    onClick={closeMobileBar}
                  >
                    {child.name}
                  </Link>
                );
              }
              return (
                <span
                  key={child.name}
                  className="border p-3 rounded-full hoverAction cursor-pointer"
                  onClick={closeMobileBar}
                >
                  {child.name}
                </span>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}

export default MobileLinks;

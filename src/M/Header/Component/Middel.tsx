/* eslint-disable react-refresh/only-export-components */
import { Link } from "react-router-dom";

type Link =
  | {
      name: string;
      path: string;
    }
  | {
      name: string;
      Children: Link[];
    };

export const links: Link[] = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "About",
    Children: [
      {
        name: "Team",
        path: "team",
      },
      {
        name: "Company",
        path: "company",
      },
    ],
  },
  {
    name: "Contact",
    path: "contact",
  },
];
const ListFunction = (link: Link) => {
  if ("path" in link) {
    return (
      <Link
        key={link.name}
        to={link.path}
        className="border p-3 rounded-full hoverAction"
      >
        {link.name}
      </Link>
    );
  }
  return (
    <div
      key={link.name}
      className="relative group cursor-pointer parentHoverAction"
    >
      <span className="border p-3 rounded-full">{link.name}</span>
      {link.Children && (
        <div className="absolute top-full left-[50%] translate-x-[-50%] mt-1 hidden group-hover:block border rounded ">
          {link.Children.map((child) => {
            if ("path" in child) {
              return (
                <Link
                  key={child.name}
                  to={child.path!}
                  className="block px-4 py-2 hoverAction border-b"
                >
                  {child.name}
                </Link>
              );
            }
            return ListFunction(child);
          })}
        </div>
      )}
    </div>
  );
};

function Middel() {
  return (
    <div className="gap-4 p-0.5 hidden lg:flex items-center">
      {links.map((link) => ListFunction(link))}
    </div>
  );
}

export default Middel;

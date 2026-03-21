import { Link } from "react-router-dom";
import "./Middel.css";
type Link = {
  name: string;
  path?: string;
  Children?: Link[];
};

const links: Link[] = [
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
// const
function Middel() {
  return (
    <div className="gap-4 p-0.5 hidden lg:flex items-center">
      {links.map((link) =>
        link.path ? (
          <Link
            key={link.name}
            to={link.path}
            className="border p-3 rounded-full hoverAction"
          >
            {link.name}
          </Link>
        ) : (
          <div
            key={link.name}
            className="relative group cursor-pointer parentHoverAction"
          >
            <span className="border p-3 rounded-full">{link.name}</span>
            {link.Children && (
              <div className="absolute top-full left-[50%] translate-x-[-50%] mt-1 hidden group-hover:block border rounded ">
                {link.Children.map((child) => (
                  <Link
                    key={child.name}
                    to={child.path!}
                    className="block px-4 py-2 hoverAction border-b"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}

export default Middel;

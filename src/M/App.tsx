import { Outlet } from "react-router-dom";
import "./App.css";

import Header from "./Header/Header";
import Footer from "./Footer/Footer";


function App() {
  return (
    <div>
      <Header />
      {/* <Check /> */}
      <Outlet />
      <Footer />
      {/* <div>
        <button
          onClick={async () => {
            try {
              const response = await AxiosApi.post("/auth/isloggedin");
              console.log("Is logged in response:", response.data);
            } catch (error) {
              console.error("Error checking login status:", error);
            }
          }}
        >
          Is loggined in
        </button>
      </div> */}
    </div>
  );
}

export default App;

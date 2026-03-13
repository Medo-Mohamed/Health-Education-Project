import { Provider } from "react-redux";
import store from "./Redux-Store/store";
import Routers from "./Routers";

function App() {
  return (
    <Provider store={store}>
      <Routers>
        <div>App</div>
      </Routers>
    </Provider>
  );
}

export default App;

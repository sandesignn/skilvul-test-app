import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ListTrackPlaylist from "./ListTrackPlaylist";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
const code = new URLSearchParams(window.location.search).get("code");

function App() {
  return (
    <>
      {code ? <Dashboard code={code} /> : <Router />}
      <Router>
        <Switch>
          <Route path="/" exact component={Login}></Route>
          <Route
            path="/playlist/:id"
            exact
            component={ListTrackPlaylist}
          ></Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;

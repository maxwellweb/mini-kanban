import React from "react";
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

const App = () => {
    return <Router>
        <div>
          <Routes>
            <Route exact path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
  </Router>;
};
export default App;

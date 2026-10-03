import Dashboard from "./pages/Dashboard";
import SharedBrain from "./pages/SharedBrain";
import SharedItem from "./pages/SharedItem";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<Dashboard initialAuthMode="signup" />} />
        <Route path="/signin" element={<Dashboard initialAuthMode="signin" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Public share links - no login needed */}
        <Route path="/share/:hash" element={<SharedBrain />} />
        <Route path="/share/item/:hash" element={<SharedItem />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

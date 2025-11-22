import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Devs from "./pages/Devs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PredictionSelect from "./pages/PredictionSelect";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/devs" element={<Devs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/prediction-select" element={<PredictionSelect />} />
        <Route path="/diabetic" element={<div style={{ padding: '120px 20px', textAlign: 'center' }}><h1>Diabetic Retinopathy Detection</h1><p>This page will integrate with your diabetic detection model at <code>Diabetic_Retinopathy_Detection/app.py</code></p><a href="/prediction-select">← Back to Selection</a></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
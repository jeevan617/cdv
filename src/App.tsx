import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Devs from "./pages/Devs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PredictionSelect from "./pages/PredictionSelect";
import DoctorConsultation from "./pages/DoctorConsultation";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorDashboard from "./pages/DoctorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<div className="page-transition"><Home /></div>} />
        <Route path="/about" element={<div className="page-transition"><About /></div>} />
        <Route path="/devs" element={<div className="page-transition"><Devs /></div>} />
        <Route path="/login" element={<div className="page-transition"><Login /></div>} />
        <Route path="/signup" element={<div className="page-transition"><Signup /></div>} />
        <Route path="/prediction-select" element={<div className="page-transition"><PredictionSelect /></div>} />
        <Route path="/consultation" element={<div className="page-transition"><DoctorConsultation /></div>} />
        <Route path="/doctor-login" element={<div className="page-transition"><DoctorLogin /></div>} />
        <Route path="/doctor-dashboard" element={<div className="page-transition"><DoctorDashboard /></div>} />
        <Route path="/diabetic" element={<div className="page-transition" style={{ padding: '120px 20px', textAlign: 'center' }}><h1>Diabetic Retinopathy Detection</h1><p>This page will integrate with your diabetic detection model at <code>Diabetic_Retinopathy_Detection/app.py</code></p><a href="/prediction-select">← Back to Selection</a></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
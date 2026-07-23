import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import InterviewPage from "./pages/InterviewPage";
import FeedbackPage from "./pages/FeedbackPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/upload"     element={<UploadPage />} />
        <Route path="/interview"  element={<InterviewPage />} />
        <Route path="/feedback"   element={<FeedbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

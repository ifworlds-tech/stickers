import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StickerPackPage from './pages/StickerPack';
import './App.css';

function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pack/:id" element={<StickerPackPage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;

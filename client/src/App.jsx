import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FeedProvider } from './context/FeedContext'; 
import Home from './pages/Home';
import Report from './pages/Report';
import ItemDetails from './pages/ItemDetails'; 
import LoginModal from './components/LoginModal';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <FeedProvider> 
        <BrowserRouter>
          <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <LoginModal />
            <Navbar />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<Report />} />
                <Route path="/item/:id" element={<ItemDetails />} /> 
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </FeedProvider>
    </AuthProvider>
  );
}

export default App;
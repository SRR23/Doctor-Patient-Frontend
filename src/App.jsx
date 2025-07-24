import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoctorForm from './components/DoctorForm';
import PatientSearch from './components/PatientSearch';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-blue-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-center">Doctor-Patient Platform</h1>
          </div>
        </header>
        <main className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">
          <Routes>
            <Route path="/doctor" element={<DoctorForm />} />
            <Route path="/patient" element={<PatientSearch />} />
            <Route path="/" element={
              <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Welcome! Choose a role:</h2>
                <div className="flex justify-center gap-4">
                  <a
                    href="/doctor"
                    className="inline-block bg-blue-500 text-white font-medium py-2 px-6 rounded-md hover:bg-blue-600 transition duration-200"
                  >
                    Doctor
                  </a>
                  <a
                    href="/patient"
                    className="inline-block bg-green-500 text-white font-medium py-2 px-6 rounded-md hover:bg-green-600 transition duration-200"
                  >
                    Patient
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </main>
        {/* <footer className="bg-gray-800 text-white text-center py-4">
          <p className="text-sm">&copy; 2025 Doctor-Patient Platform. All rights reserved.</p>
        </footer> */}
      </div>
    </Router>
  );
}

export default App;
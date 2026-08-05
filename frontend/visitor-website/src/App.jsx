import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Notifications from './pages/Notifications';
import Apply from './pages/Apply';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/apply" element={<Apply />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
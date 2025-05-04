import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, CSSReset, Box } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AlertsList from './pages/AlertsList';
import AlertDetail from './pages/AlertDetail';
import Settings from './pages/Settings';
import Predictions from './pages/Predictions';

function App() {
  return (
    <ChakraProvider>
      <CSSReset />
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Navbar />
          <Box as="main" p={4}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/alerts" element={<AlertsList />} />
              <Route path="/alerts/:id" element={<AlertDetail />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;

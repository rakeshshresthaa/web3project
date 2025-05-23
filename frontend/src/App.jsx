import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';
import Home from '@pages/Home';
import Destinations from '@pages/Destinations';
import Gallery from '@pages/Gallery';
import Upload from '@pages/Upload';
import DestinationDetails from '@pages/DestinationDetails';
import { useTheme } from '@hooks/useTheme';

const queryClient = new QueryClient();

function App() {
  const { isDarkMode } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <Router>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:id" element={<DestinationDetails />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/upload" element={<Upload />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider, ToastProvider } from './contexts';
import { Layout } from './components';
import { Home, Marketplace, MyNFTs, CreateNFT, NFTDetail, Profile } from './pages';

function App() {
  return (
    <WalletProvider>
      <ToastProvider>
        <Router>
          <div className="App min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/my-nfts" element={<MyNFTs />} />
                <Route path="/create" element={<CreateNFT />} />
                <Route path="/nft/:id" element={<NFTDetail />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </ToastProvider>
    </WalletProvider>
  );
}

export default App;

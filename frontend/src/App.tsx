import React from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';

const App: React.FC = () => {
    return (
        <div className="app">
            <Navbar />
            <Home />
        </div>
    );
}

export default App;

import React from 'react';
import Navbar from './components/navbar';
import Home from './pages/home';

const App: React.FC = () => {
    return (
        <div className="app">
            <Navbar />
            <Home />
        </div>
    );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

interface AppProps {}

function App({}: AppProps) {
  // Create the count state.
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  // Create the counter (+1 every second).
  useEffect(() => {
    axios.get('http://localhost:5000/api/v1/posts').then((response: any) => {
      console.log(response);
      setData(response);
      setLoading(false);
    });
  }, []);
  // Return the App component.
  return (
    <div className="App">
      {loading ? (
        <p>Loading...</p>
      ) : (
        data.data.data.post.map((el: any) => (
          <div
            key={el.id}
            dangerouslySetInnerHTML={{ __html: el.description }}
          />
        ))
      )}
    </div>
  );
}

export default App;

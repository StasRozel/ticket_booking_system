import React, { useState } from "react";
import Login from "./features/Auth/components/Login";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from "./features/Auth/context/AuthContext";
import Register from "./features/Auth/components/Register";
import Dashboard from "./features/Dashboard/components/Dashboard";

const App: React.FC = () => {
  const [fetchedData, setFetchedData] = useState<string>("");

  const route = {
    name: "asd",
    price: 65,
    distance: 1234,
    starting_point: "sfd",
    ending_point: "xvc",
    stops: "b, a, b i",
  };

  // Функция для отправки POST-запроса
  const sendData = async () => {
    try {
      const response = await fetch("http://localhost:3001/routes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(route)
      });

      if (response.ok) {
        alert("Data sent successfully!");
      } else {
        alert("Failed to send data.");
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  // Функция для получения данных через GET-запрос
  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3001/routes/");
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setFetchedData(JSON.stringify(data, null, 2)); // Сохраняем данные в читаемом формате
      } else {
        alert("Failed to fetch data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    // <div className="p-4">
    //   <h1 className="text-xl font-bold mb-4">React + TypeScript HTTP Requests</h1>
    //   <div className="space-y-4">
    //     <button
    //       onClick={sendData}
    //       className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    //     >
    //       Send Data (POST)
    //     </button>
    //     <button
    //       onClick={fetchData}
    //       className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    //     >
    //       Fetch Data (GET)
    //     </button>
    //   </div>
    //   <div className="mt-4">
    //     <h2 className="text-lg font-semibold">Fetched Data:</h2>
    //     <pre className="bg-gray-100 p-4 rounded">{fetchedData || "No data fetched yet."}</pre>
    //   </div>
    // </div>

    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
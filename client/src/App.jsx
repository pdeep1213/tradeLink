import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";
import Auth from "./Pages/Auth.jsx";
import UserDashboard from "./Pages/UserDashboard.jsx";
import ListItem from "./Pages/ListItem.jsx";
import MainPage from "./Pages/MainPage.jsx";
import Wishlist from "./Pages/Wishlist.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, 
      retry: 1,
      staleTime: 1000 * 60 * 5, 
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" exact Component={Home} />
            <Route path="/login" exact Component={Login} />
            <Route path="/register" exact Component={Register} />
            <Route path="/Auth" exact Component={Auth} />
            <Route path="/userDashboard" exact Component={UserDashboard} />
            <Route path="/MainPage" exact Component={MainPage} />
            <Route path="/listItem" exact Component={ListItem} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </Router>
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;


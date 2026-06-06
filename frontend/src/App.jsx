import { Navigate, Route, Routes } from 'react-router-dom'

import Footer from './components/Footer'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Cart from './pages/Cart'
import Home from './pages/Home'
import Login from './pages/Login'
import Menu from './pages/Menu'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Register from './pages/Register'
import TableDetails from './pages/TableDetails'
import Tables from './pages/Tables'
import TournamentDetails from './pages/TournamentDetails'
import Tournaments from './pages/Tournaments'

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/tables/:id" element={<TableDetails />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

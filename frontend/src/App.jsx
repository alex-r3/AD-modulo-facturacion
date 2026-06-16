import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3500} newestOnTop closeOnClick pauseOnHover draggable theme="colored" toastClassName="!rounded-2xl !shadow-2xl" progressClassName="!bg-white/80" />
    </BrowserRouter>
  )
}


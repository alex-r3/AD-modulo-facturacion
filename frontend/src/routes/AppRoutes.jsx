import { Navigate, Route, Routes } from 'react-router-dom'
import ClientesView from '../pages/facturacion/ClientesView'
import FacturacionPage from '../pages/FacturacionPage'
import FacturasView from '../pages/facturacion/FacturasView'
import ResumenView from '../pages/facturacion/ResumenView'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/facturacion/resumen" replace />} />
      <Route path="/facturacion" element={<FacturacionPage />}>
        <Route index element={<Navigate to="resumen" replace />} />
        <Route path="resumen" element={<ResumenView />} />
        <Route path="clientes" element={<ClientesView />} />
        <Route path="facturas" element={<FacturasView />} />
      </Route>
      <Route path="*" element={<Navigate to="/facturacion/resumen" replace />} />
    </Routes>
  )
}

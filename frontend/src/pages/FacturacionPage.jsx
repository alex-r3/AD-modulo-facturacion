import { Outlet } from 'react-router-dom'
import FacturacionLayout from '../components/facturacion/FacturacionLayout'
import { useFacturacion } from '../hooks/useFacturacion'
import ConfirmDialog from '../components/facturacion/ConfirmDialog'

export default function FacturacionPage() {
  const facturacion = useFacturacion()

  return (
    <>
    <FacturacionLayout
      currentSection={facturacion.currentSection}
      sidebarOpen={facturacion.sidebarOpen}
      onToggleSidebar={() => facturacion.setSidebarOpen((currentValue) => !currentValue)}
      themeMode={facturacion.themeMode}
      onToggleTheme={facturacion.toggleTheme}
      userMenuOpen={facturacion.userMenuOpen}
      onToggleUserMenu={() => facturacion.setUserMenuOpen((currentValue) => !currentValue)}
      onLogout={facturacion.handleLogout}
    >
      <Outlet context={facturacion} />
    </FacturacionLayout>
    <ConfirmDialog
        isOpen={facturacion.confirmDialog.isOpen}
        title={facturacion.confirmDialog.title}
        message={facturacion.confirmDialog.message}
        onConfirm={facturacion.confirmDialog.onConfirm}
        onCancel={facturacion.closeConfirmDialog}
      />
    </>
  )
}

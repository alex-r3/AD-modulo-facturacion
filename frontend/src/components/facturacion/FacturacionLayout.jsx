import { ChevronDown, ChevronRight, FileText, LogOut, Menu, Moon, Sun, BarChart3, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Resumen', to: '/facturacion/resumen', icon: BarChart3 },
  { label: 'Clientes', to: '/facturacion/clientes', icon: Users },
  { label: 'Facturas', to: '/facturacion/facturas', icon: FileText },
]

export default function FacturacionLayout({ currentSection, sidebarOpen, onToggleSidebar, themeMode, onToggleTheme, userMenuOpen, onToggleUserMenu, onLogout, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className={`flex shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 dark:border-slate-800">
            {sidebarOpen ? <p className="text-base font-black tracking-[0.24em] text-slate-900 dark:text-slate-100">FACTURACION</p> : <p className="text-sm font-black tracking-[0.24em] text-slate-900 dark:text-slate-100">F</p>}
          </div>

          <nav className="flex-1 px-3 py-4">
            {sidebarOpen ? <p className="px-3 pb-3 text-[10px] font-extrabold uppercase tracking-[0.28em] text-slate-400">Módulos</p> : null}
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink key={item.to} to={item.to} end className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors ${sidebarOpen ? '' : 'justify-center'} ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'}`} title={!sidebarOpen ? item.label : undefined}>
                    <Icon className="h-5 w-5 shrink-0" />
                    {sidebarOpen ? <span>{item.label}</span> : null}
                  </NavLink>
                )
              })}
            </div>
          </nav>

        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <button type="button" onClick={onToggleSidebar} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Alternar menú lateral"><Menu className="h-5 w-5" /></button>
                <div><h1 className="flex items-center gap-2 text-lg font-black tracking-tight sm:text-xl"><span>Facturación</span><ChevronRight className="h-4 w-4 text-slate-400" /><span className="text-indigo-600 dark:text-indigo-400">{currentSection}</span></h1></div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={onToggleTheme} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Cambiar tema">{themeMode === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}</button>
                <div className="relative">
                  <button type="button" onClick={onToggleUserMenu} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-black text-white">AJ</div><div className="hidden text-left md:block"><p className="text-sm font-bold leading-tight">Angel Josein Alegre</p><p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Administrador Corporativo<ChevronDown className="h-3 w-3" /></p></div></button>
                  {userMenuOpen ? (<><button type="button" aria-label="Cerrar menú de usuario" className="fixed inset-0 z-10 cursor-default" onClick={onToggleUserMenu} /><div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"><div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800"><p className="text-sm font-bold">Sesión activa</p><p className="text-xs text-slate-400">angel.alegre@sakad.com</p></div><button type="button" onClick={onLogout} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-slate-50 dark:text-red-400 dark:hover:bg-slate-800/70"><LogOut className="h-4 w-4" />Cerrar sesión</button></div></>) : null}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6"><div className="mx-auto w-full max-w-7xl">{children}</div></div>
        </main>
      </div>
    </div>
  )
}

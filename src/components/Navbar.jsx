import logo from "../assets/logo.png";

function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <img src={logo} alt="VUE Logo" className="h-10 w-auto" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900">
                Sistema de Tickets
              </h1>
              <p className="text-xs text-slate-500">
                Gestión de soporte técnico
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

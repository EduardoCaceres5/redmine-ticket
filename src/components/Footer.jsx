export default function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-slate-200 bg-white">
      <div className="container mx-auto px-4 text-center text-sm text-slate-600">
        Sistema Integrado con{" "}
        <a
          href="https://www.redmine.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Redmine
        </a>
      </div>
    </footer>
  );
}

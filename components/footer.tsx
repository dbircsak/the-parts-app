export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
        <p>&copy; {currentYear} Anthony Duque. The Parts App v0.1.0</p>
      </div>
    </footer>
  );
}

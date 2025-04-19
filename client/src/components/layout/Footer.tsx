import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-4 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
        <div className="flex flex-col items-center md:items-start">
          <div>© {new Date().getFullYear()} Early Warning & Early Response System</div>
          <div className="mt-1 text-xs">
            Designed by <a href="https://afrinict.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light">afrinict.com</a>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="#">
            <a className="text-primary hover:text-primary-light mr-4">Privacy Policy</a>
          </Link>
          <Link href="#">
            <a className="text-primary hover:text-primary-light mr-4">Terms of Service</a>
          </Link>
          <Link href="#">
            <a className="text-primary hover:text-primary-light">Help Center</a>
          </Link>
        </div>
      </div>
    </footer>
  );
}

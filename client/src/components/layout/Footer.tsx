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
            <div className="text-primary hover:text-primary-light mr-4 inline">Privacy Policy</div>
          </Link>
          <Link href="#">
            <div className="text-primary hover:text-primary-light mr-4 inline">Terms of Service</div>
          </Link>
          <Link href="#">
            <div className="text-primary hover:text-primary-light inline">Help Center</div>
          </Link>
        </div>
      </div>
    </footer>
  );
}

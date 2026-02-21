//Frontend/src/components/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/lead2.png"; // adjust the path according to your folder structure


function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const refCode = localStorage.getItem("referralCode");

  // const appendRef = (path) => (refCode ? `${path}?ref=${refCode}` : path);
  // const appendRef = (path) => {
  //   const generatedPath = refCode ? `${path}?ref=${refCode}` : path;
  // console.log("refCode:", refCode);
  // console.log("Generated path:", generatedPath);
  //   return generatedPath;
  // };


  // const appendRef = (path) => {
  //   if (!refCode || refCode.trim() === '') return path;
  //   return `${path}?ref=${refCode.trim()}`;
  // };

  const appendRef = (path) => {
    if (!refCode || refCode.trim() === '') return path;
    return `${path}?ref=${encodeURIComponent(refCode.trim())}`;
  };
  return (
    <header className="bg-white shadow-md py-4 px-4 md:px-10">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        {/* <div className="text-2xl font-bold text-gray-900">
          <Link to={appendRef("/")}>leadsgurukul</Link>
        </div> */}

        <div className="flex items-center">
          <Link to={appendRef("/")}>
            <img
              src={Logo}
              alt="lead2"
              className="h-10 sm:h-12" // height adjust karo apne design ke hisaab se
            />
          </Link>
        </div>


        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to={appendRef("/courses")}
            className="text-gray-600 hover:text-orange-500 transition"
          >
            Our Courses ▼
          </Link>
          <Link
            to={appendRef("/auth/about-us")}
            className="text-gray-600 hover:text-orange-500 transition"
          >
            About Us
          </Link>
          <Link
            to={appendRef("/auth/contact-us")}
            className="text-gray-600 hover:text-orange-500 transition"
          >
            Contact Us
          </Link>

          <Link
            to={appendRef("/auth/login")}
            className="text-gray-800 font-medium underline underline-offset-2 hover:text-orange-500 transition"
          >
            Log in
          </Link>

          <Link
            to={appendRef("/auth/signup")}
            className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-5 py-2 rounded-md font-semibold shadow hover:from-orange-500 hover:to-orange-600 transition"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md bg-gray-100"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {/* {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg z-50 md:hidden">
          <div className="flex flex-col space-y-4 p-4">
            <Link
              to={appendRef("/auth/login")}
              className="text-gray-800 font-medium underline underline-offset-2 hover:text-orange-500 transition"
              onClick={() => setIsOpen(false)}
            >
              Log in
            </Link>


            <Link
              to={appendRef("/auth/signup")}
              className="text-gray-800 font-medium underline underline-offset-2 hover:text-orange-500 transition"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Link>



            <Link
              to={appendRef("/")}
              className="text-gray-600 hover:text-orange-500 transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            <Link
              to={appendRef("/courses")}
              className="text-gray-600 hover:text-orange-500 transition"
              onClick={() => setIsOpen(false)}
            >
              Our Courses ▼
            </Link>

            <Link
              to={appendRef("/auth/about-us")}
              className="text-gray-600 hover:text-orange-500 transition"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>

            <Link
              to={appendRef("/auth/contact-us")}
              className="text-gray-600 hover:text-orange-500 transition"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )} */}


      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white rounded-b-2xl shadow-xl z-50 md:hidden animate-slide-down">
          <div className="flex flex-col divide-y divide-gray-200">

            <Link
              to={appendRef("/auth/login")}
              className="px-6 py-4 text-gray-800 font-semibold hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Log in
            </Link>

            <Link
              to={appendRef("/auth/signup")}
              className="px-6 py-4 text-gray-800 font-semibold hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Sign Up
            </Link>

            <Link
              to={appendRef("/")}
              className="px-6 py-4 text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            {/* <Link
              to={appendRef("/courses")}
              className="px-6 py-4 text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200 flex justify-between items-center"
              onClick={() => setIsOpen(false)}
            >
              Our Courses <span className="text-gray-400">▼</span>
            </Link> */}

            <Link
              to={appendRef("/auth/about-us")}
              className="px-6 py-4 text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>

            <Link
              to={appendRef("/auth/contact-us")}
              className="px-6 py-4 text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}

    </header>
  );
}

export default Header;

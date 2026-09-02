"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Youtube, Phone, Mail, MapPin, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#1C1C1E] text-gray-300 pt-10 pb-3 sm:pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1 - Company */}
          <div>
            <h3 className="text-white text-base font-bold mb-4">Company</h3>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="/about-us" className="hover:text-white transition-colors text-gray-300">About Us</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors text-gray-300">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors text-gray-300">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-white transition-colors text-gray-300">Contact Us</Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors text-gray-300">Careers</Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Consumers */}
          <div>
            <h3 className="text-white text-base font-bold mb-4">Consumers</h3>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="/cancellation-refund" className="hover:text-white transition-colors text-gray-300">Cancellation & Refund Policy</Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="hover:text-white transition-colors text-gray-300">Terms of Use</Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-white transition-colors text-gray-300">FAQs</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors text-gray-300">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Social Media Links */}
          <div>
            <h3 className="text-white text-base font-bold mb-4">Social Media Links</h3>
            <div className="flex space-x-3 items-center">
              <a href="#" className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Facebook">
                <Facebook className="w-4 h-4 fill-white text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Instagram">
                <Instagram className="w-4 h-4 text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="LinkedIn">
                <Linkedin className="w-4 h-4 fill-white text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="YouTube">
                <Youtube className="w-4 h-4 fill-white text-white" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="WhatsApp">
                <MessageCircle className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>

          {/* Column 4 - Company Registered Address */}
          <div>
            <h3 className="text-white text-base font-bold mb-4">Company Registered Address</h3>
            <div className="space-y-3 text-xs text-gray-300">
              <p className="font-bold text-white uppercase">TASPRO SERVICE INDIA PVT.LTD.</p>
              
              <p className="leading-relaxed">
                Office No. 201, Atlantis Corporate Park Ring Road No.1, Telebandha, Raipur Chhattisgarh (22) 492001
              </p>
              
              <p>
                Email: <a href="mailto:info@tascompany.in" className="hover:underline text-gray-300">info@tascompany.in</a>
              </p>
              
              <p>
                Contact: <a href="tel:7447000045" className="hover:underline text-gray-300">7447-0000-45</a>
              </p>
              
              <div className="pt-1">
                <p className="text-gray-400">
                  CIN: USIR0000024655604948
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/60 pt-5 pb-1 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left - Logo */}
            <div className="flex items-center gap-2 w-40 sm:w-44 relative shrink-0">
              <Link href="/" className="block">
                <img src="/tas.logo.png" alt="TASPro Company" className="w-full h-auto object-contain" />
              </Link>
            </div>

            {/* Center */}
            <p className="text-gray-400 text-xs sm:text-sm text-center">
              © Copyright. 2024 TASPro Company All Right Reserved
            </p>

            {/* Right - Payment Icons */}
            <div className="flex items-center gap-3">
              <div className="bg-white px-2.5 py-1 rounded-md h-7 flex items-center shadow-sm">
                <img src="/icons/visa.svg" alt="Visa" className="h-3.5 w-auto" />
              </div>
              <div className="bg-white px-2.5 py-1 rounded-md h-7 flex items-center shadow-sm">
                <img src="/icons/mastercard.svg" alt="Mastercard" className="h-4 w-auto" />
              </div>
              <div className="bg-white px-2.5 py-1 rounded-md h-7 flex items-center shadow-sm">
                <img src="/icons/rupay.svg" alt="RuPay" className="h-3.5 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
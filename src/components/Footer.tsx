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
                <Link href="/rework-policy" className="hover:text-white transition-colors text-gray-300">Rework Policy</Link>
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
                <svg className="w-4 h-4 fill-current" viewBox="0 0 576 512" aria-hidden="true">
                  <path d="M549.7 124.1C543.5 100.4 524.9 81.8 501.4 75.5 458.9 64 288.1 64 288.1 64S117.3 64 74.7 75.5C51.2 81.8 32.7 100.4 26.4 124.1 15 167 15 256.4 15 256.4s0 89.4 11.4 132.3c6.3 23.6 24.8 41.5 48.3 47.8 42.6 11.5 213.4 11.5 213.4 11.5s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zM232.2 337.6l0-162.4 142.7 81.2-142.7 81.2z" />
                </svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="WhatsApp">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 448 512" aria-hidden="true">
                  <path d="M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480 117.7 449.1c32.4 17.7 68.9 27 106.1 27l.1 0c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1s56.2 81.2 56.1 130.5c0 101.8-84.9 184.6-186.6 184.6zM325.1 300.5c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6z"/>
                </svg>
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
                <img src="/white-bg.png" alt="TASpro Company" className="w-full h-auto object-contain" />
              </Link>
            </div>

            {/* Center */}
            <p className="text-gray-400 text-xs sm:text-sm text-center">
              © Copyright 2026 TASPRO SERVICE INDIA PVT. LTD. (formerly known as TASPRO COMPANY) All rights reserved.
            </p>

            {/* Right - Payment Icons */}
            <div className="flex items-center gap-3">
              <div className="bg-white px-2.5 py-1 rounded-md h-7 flex items-center justify-center shadow-sm">
                <img src="/icons/visa.svg" alt="Visa" className="h-3.5 w-auto object-contain" />
              </div>
              <div className="bg-white px-2.5 py-1 rounded-md h-7 flex items-center justify-center shadow-sm">
                <img src="/icons/mastercard.svg" alt="Mastercard" className="h-4 w-auto object-contain" />
              </div>
              <div className="bg-white px-2.5 py-1 rounded-md h-7 flex items-center justify-center shadow-sm">
                <img src="/icons/rupay.svg" alt="RuPay" className="h-3.5 w-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
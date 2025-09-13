'use client'
import React, { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu, X } from "lucide-react"; // icons

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src="/Logo.png" alt="ShoreHelp" className="w-8 h-8" />
            <div className="text-2xl font-bold">{t('app.title')}</div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-gray-300">{t('app.home')}</a>
            <a href="#" className="hover:text-gray-300">{t('app.about')}</a>
            <a href="#" className="hover:text-gray-300">{t('app.services')}</a>
            <a href="#" className="hover:text-gray-300">{t('app.contact')}</a>
            <LanguageSwitcher className="bg-gray-800 rounded px-2 py-1" />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 px-4 pb-4 space-y-2">
          <a href="#" className="block hover:text-gray-300">{t('app.home')}</a>
          <a href="#" className="block hover:text-gray-300">{t('app.about')}</a>
          <a href="#" className="block hover:text-gray-300">{t('app.services')}</a>
          <a href="#" className="block hover:text-gray-300">{t('app.contact')}</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

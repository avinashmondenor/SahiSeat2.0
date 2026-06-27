"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const SelectContext = createContext(null);

export function Select({ children, value, onValueChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [labels, setLabels] = useState({});
  const containerRef = useRef(null);

  const registerLabel = (val, label) => {
    setLabels((prev) => {
      if (prev[val] === label) return prev;
      return { ...prev, [val]: label };
    });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, labels, registerLabel }}>
      <div ref={containerRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = "" }) {
  const { isOpen, setIsOpen } = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex w-full items-center justify-between text-left focus:outline-none transition cursor-pointer select-none ${className}`}
    >
      {children}
      <svg
        className={`h-4 w-4 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const { value, labels } = useContext(SelectContext);
  const displayValue = value && labels[value] ? labels[value] : placeholder;
  return <span className="truncate text-white">{displayValue}</span>;
}

export function SelectContent({ children, className = "" }) {
  const { isOpen } = useContext(SelectContext);
  if (!isOpen) return null;
  return (
    <div className={`absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-border-custom bg-card p-1.5 shadow-2xl backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

export function SelectItem({ children, value }) {
  const { value: selectedValue, onValueChange, setIsOpen, registerLabel } = useContext(SelectContext);
  
  const label = typeof children === "string" ? children : value;
  useEffect(() => {
    if (value !== undefined) {
      registerLabel(value, label);
    }
  }, [value, label]);

  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className={`flex w-full items-center justify-between px-4 py-2.5 text-sm rounded-xl text-left transition select-none cursor-pointer hover:bg-white/[0.04] ${
        isSelected ? "bg-primary-purple text-white font-semibold hover:bg-primary-purple" : "text-secondary-text"
      }`}
    >
      <span>{children}</span>
      {isSelected && (
        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
// INTENTIONAL BUG: Broken Modal Component
// This component has multiple styling and functional issues that need fixing
// Issues: Missing className, improper event handling, broken styling, accessibility issues

'use client';

import { useState } from 'react';

interface BrokenModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function BrokenModal({ isOpen, title, children, onClose }: BrokenModalProps) {
  // BUG: Modal is always shown, isOpen state is ignored
  return (
    <>
      {/* BUG: Missing className for backdrop - no styling applied */}
      <div onClick={onClose}>
        {/* BUG: Incorrect modal styling - classes are wrong or missing */}
        <div style={{ position: 'absolute', width: '400px', background: 'white' }}>
          {/* BUG: No close button or proper header */}
          <h2>{title}</h2>
          
          {/* BUG: Children not properly styled or wrapped */}
          <div>
            {children}
          </div>
          
          {/* BUG: Button styling is broken - inline styles causing issues */}
          <button 
            onClick={onClose}
            style={{ 
              background: 'blue', 
              color: 'blue',  // Same color as background - button text invisible!
              padding: '10000px'  // Padding way too large
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

export function BrokenModalDemo() {
  const [isOpen, setIsOpen] = useState(false);
  
  // BUG: No proper error handling
  const handleOpen = () => {
    // BUG: Incorrect state update logic
    setIsOpen(!isOpen);
    setIsOpen(!isOpen);  // Negates the first one!
  };

  return (
    <div>
      <button onClick={handleOpen}>Open Modal</button>
      <BrokenModal
        isOpen={isOpen}
        title="Test Modal"
        onClose={() => setIsOpen(false)}
      >
        <p>This is broken content</p>
      </BrokenModal>
    </div>
  );
}

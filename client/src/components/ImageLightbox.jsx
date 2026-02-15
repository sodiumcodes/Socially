import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react';

const ImageLightbox = ({ isOpen, images, initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex, isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!isOpen || !images || images.length === 0) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                    onClick={onClose}
                />

                {/* Header Controls */}
                <div className="absolute top-0 right-0 left-0 p-4 flex justify-between items-center z-10">
                    <div className="text-white/60 text-xs font-bold tracking-widest uppercase ml-4">
                        {currentIndex + 1} / {images.length}
                    </div>
                    <div className="flex gap-4 mr-4">
                        <button
                            onClick={() => window.open(images[currentIndex], '_blank')}
                            className="p-2 text-white/70 hover:text-white transition-colors"
                            title="View Original"
                        >
                            <ZoomIn size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/70 hover:text-white transition-colors text-xl"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Main Image Container */}
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    <motion.img
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1}`}
                        className="max-w-full max-h-[90vh] object-contain shadow-2xl pointer-events-none select-none rounded-xl"
                    />

                    {/* Navigation Controls */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-4 p-4 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all backdrop-blur-sm"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 p-4 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all backdrop-blur-sm"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </AnimatePresence>
    );
};

export default ImageLightbox;

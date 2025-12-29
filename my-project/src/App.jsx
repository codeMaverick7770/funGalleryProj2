import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const App = () => {
  const [imagesData, setImagesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const galleryContainerRef = useRef(null);
  // Fetch images from API
  const loadImages = async (page) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`https://picsum.photos/v2/list?page=${page}&limit=30`);
      setImagesData(response.data);
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load images. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // Load images when page changes
  useEffect(() => {
    loadImages(currentPage);
  }, [currentPage]);
  // Handle page navigation
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleGoToPage = (e) => {
    e.preventDefault();
    const pageInput = e.target.querySelector('input[type="number"]');
    const page = parseInt(pageInput?.value);
    if (page && page > 0) {
      setCurrentPage(page);
    }
  };
  // Handle image modal
  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };
  // Handle image download
  const downloadImage = (image) => {
    const link = document.createElement('a');
    link.href = image.download_url;
    link.download = `photo-by-${image.author.replace(/\s+/g, '-').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeImageModal();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isModalOpen]);
  // Mouse move effect for gallery items
  useEffect(() => {
    const handleMouseMove = (e) => {
      const cards = document.querySelectorAll('.gallery-item');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateY = (x - centerX) / 25;
          const rotateX = (centerY - y) / 25;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        } else {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        }
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [imagesData]);
  // Render loading state
  const renderLoadingState = () => (
    <div className="col-span-full text-center py-16">
      <div className="inline-block loading-spinner text-amber-400 text-4xl mb-4">
        <i className="fas fa-spinner"></i>
      </div>
      <p className="text-slate-300">Loading beautiful images...</p>
    </div>
  );
  // Render error state
  const renderErrorState = () => (
    <div className="col-span-full text-center py-16">
      <div className="text-red-400 text-5xl mb-4">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <p className="text-slate-300 text-xl mb-2">Failed to load images</p>
      <p className="text-slate-500 mb-6">{error}</p>
      <button 
        onClick={() => loadImages(currentPage)}
        className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium py-2 px-6 rounded-lg transition-colors"
      >
        Retry
      </button>
    </div>
  );
  // Render empty state
  const renderEmptyState = () => (
    <div className="col-span-full text-center py-16">
      <div className="text-amber-400 text-5xl mb-4">
        <i className="fas fa-image"></i>
      </div>
      <p className="text-slate-300 text-xl mb-2">No images found</p>
      <p className="text-slate-500">Try loading a different page</p>
    </div>
  );
  // Render gallery items
  const renderGalleryItems = () => {
    return imagesData.map((image, index) => {
      const delay = index * 0.05;
      const dimensions = image.width && image.height ? `${image.width} × ${image.height}` : 'Unknown dimensions';
      
      return (
        <div 
          key={image.id}
          className="gallery-item rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-700/50"
          style={{
            animationDelay: `${delay}s`,
            animation: `slideUp 0.5s ease-out ${delay}s forwards`,
            opacity: 0,
            transform: 'translateY(20px)'
          }}
        >
          <div 
            className="image-container h-56 overflow-hidden cursor-pointer"
            onClick={() => openImageModal(image)}
          >
            <img 
              src={image.download_url} 
              alt={`Photo by ${image.author}`}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              loading="lazy"
            />
          </div>
          <div className="p-4">
            <div className="author-name">
              <h3 className="font-bold text-white text-lg truncate">{image.author}</h3>
              <p className="text-slate-300 text-sm mt-1">{dimensions}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-slate-400 text-sm">
                <i className="fas fa-image mr-1"></i>
                ID: {image.id}
              </span>
              <button 
                onClick={() => openImageModal(image)}
                className="view-details-btn text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium"
              >
                View Details <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      );
    });
  };
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Modern Image Gallery
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Browse stunning images from talented photographers around the world. 
            Each image is a unique piece of art captured by creative minds.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-300">Live API</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-slate-300">High Quality</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-slate-300">Responsive</span>
            </div>
          </div>
        </header>
        {/* Stats Bar */}
        <div className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{currentPage}</div>
              <div className="text-slate-400 mt-2">Current Page</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">{imagesData.length}</div>
              <div className="text-slate-400 mt-2">Images Loaded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                <i className="fas fa-circle text-emerald-500 text-sm mr-2"></i>
                {error ? 'Offline' : 'Online'}
              </div>
              <div className="text-slate-400 mt-2">API Status</div>
            </div>
          </div>
        </div>
        {/* Gallery Grid */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6 fade-in">
            <h2 className="text-2xl font-semibold text-slate-200">Featured Images</h2>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Page</span>
              <span className="px-3 py-1 bg-slate-800 rounded-lg font-medium">{currentPage}</span>
            </div>
          </div>
          
          <div 
            ref={galleryContainerRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {isLoading ? renderLoadingState() : 
             error ? renderErrorState() : 
             imagesData.length === 0 ? renderEmptyState() : 
             renderGalleryItems()}
          </div>
        </div>
        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 fade-in">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || isLoading}
              className="page-btn flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <i className="fas fa-chevron-left"></i>
              <span>Previous</span>
            </button>
            
            <button 
              onClick={handleNextPage}
              disabled={isLoading}
              className="page-btn flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleGoToPage} className="flex items-center space-x-2">
              <span className="text-slate-400">Go to page:</span>
              <div className="relative">
                <input 
                  type="number" 
                  min="1" 
                  defaultValue={currentPage}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Go
              </button>
            </form>
          </div>
        </div>
        {/* Footer */}
        <footer className="text-center text-slate-500 pt-8 border-t border-slate-800/50 fade-in">
          <p className="mb-4">
            Powered by{' '}
            <a 
              href="https://picsum.photos" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              Lorem Picsum
            </a>
            {' '}• Images from talented photographers worldwide
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
              <i className="fab fa-github text-xl"></i>
            </a>
            <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
              <i className="fab fa-codepen text-xl"></i>
            </a>
            <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">
              <i className="fab fa-twitter text-xl"></i>
            </a>
          </div>
        </footer>
      </div>
      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeImageModal()}
        >
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white text-2xl z-10 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="bg-slate-900 rounded-2xl overflow-hidden">
              <img 
                src={selectedImage.download_url} 
                alt={`Photo by ${selectedImage.author}`}
                className="w-full max-h-[70vh] object-contain"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.author}</h3>
                <p className="text-slate-400 mb-4">
                  {selectedImage.width} × {selectedImage.height} pixels
                </p>
                <div className="flex justify-between items-center">
                  <a 
                    href={selectedImage.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-external-link-alt"></i>
                    <span>View Original</span>
                  </a>
                  <button 
                    onClick={() => downloadImage(selectedImage)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-download"></i>
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Inline Styles for animations and effects */}
      <style jsx>{`
        .gallery-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .gallery-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .gallery-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.7) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        
        .gallery-item:hover::before {
          opacity: 1;
        }
        
        .author-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          transform: translateY(100%);
          transition: transform 0.3s ease;
          z-index: 2;
        }
        
        .gallery-item:hover .author-name {
          transform: translateY(0);
        }
        
        .image-container {
          position: relative;
          overflow: hidden;
        }
        
        .image-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .gallery-item:hover .image-container::after {
          opacity: 1;
        }
        
        .page-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .page-btn::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5px;
          height: 5px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 0;
          border-radius: 100%;
          transform: scale(1, 1) translate(-50%);
          transform-origin: 50% 50%;
        }
        
        .page-btn:active::after {
          animation: ripple 1s ease-out;
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0, 0);
            opacity: 0.5;
          }
          100% {
            transform: scale(40, 40);
            opacity: 0;
          }
        }
        
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
export default App;
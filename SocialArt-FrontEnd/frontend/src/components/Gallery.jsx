import React from "react";

const Gallery = () => {
  const artworks = [
    {
      id: 1,
      title: "Blooming Elegance",
      artist: "Jan Davidsz de Heem",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119",
      likes: 324,
      category: "Classical",
    },
    {
      id: 2,
      title: "Divine Ceiling",
      artist: "Michelangelo Style",
      image:
        "https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457",
      likes: 256,
      category: "Renaissance",
    },
    {
      id: 3,
      title: "The Cannon Shot",
      artist: "Maritime Master",
      image: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa",
      likes: 189,
      category: "Historical",
    },
    {
      id: 4,
      title: "Vibrant Energy",
      artist: "Modern Artist",
      image:
        "https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg",
      likes: 412,
      category: "Abstract",
    },
    {
      id: 5,
      title: "Monochrome Dreams",
      artist: "Contemporary Creator",
      image:
        "https://images.pexels.com/photos/1573434/pexels-photo-1573434.jpeg",
      likes: 298,
      category: "Contemporary",
    },
    {
      id: 6,
      title: "Watercolor Flow",
      artist: "Fluid Artist",
      image: "https://images.unsplash.com/photo-1573221566340-81bdde00e00b",
      likes: 367,
      category: "Watercolor",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Artwork
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing artwork from our talented community of artists.
            From classical masterpieces to modern expressions.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <button className="bg-white bg-opacity-90 text-gray-800 px-4 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    View Details
                  </button>
                </div>
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    {artwork.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {artwork.title}
                </h3>
                <p className="text-gray-600 mb-4">by {artwork.artist}</p>

                {/* Likes and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">
                      {artwork.likes}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button className="text-gray-500 hover:text-red-500 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                    <button className="text-gray-500 hover:text-blue-500 transition-colors">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <button className="bg-[#FFA726] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-400 transform hover:scale-105 transition-all duration-200 shadow-lg">
            View More Artwork
          </button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;

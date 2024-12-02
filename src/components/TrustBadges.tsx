import React from 'react';

export default function TrustBadges() {
  const badges = [
    { name: "BBB A+ Rating" },
    { name: "Featured on Fox News" },
    { name: "5 Star Google Reviews" },
    { name: "NREIA Member" }
  ];

  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {badges.map((badge) => (
            <div 
              key={badge.name}
              className="px-6 py-3 bg-gray-100 rounded-lg text-gray-600 text-sm font-medium"
            >
              {badge.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
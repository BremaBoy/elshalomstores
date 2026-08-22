'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ProductGalleryProps {
  name: string
  mainImage: string
  galleryImages?: string[]
}

export function ProductGallery({ name, mainImage, galleryImages = [] }: ProductGalleryProps) {
  const images = [mainImage, ...galleryImages.filter(image => image !== mainImage)].slice(0, 5)
  const [selectedImage, setSelectedImage] = useState(images[0])

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-blue-soft/45 rounded-[2rem] overflow-hidden border border-border shadow-xl shadow-primary/10">
        <Image src={selectedImage} alt={name} fill className="object-cover" priority />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`relative aspect-square bg-blue-soft/45 rounded-xl overflow-hidden transition-all ${selectedImage === image ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/50'}`}
              aria-label={`View ${name} image ${index + 1}`}
            >
              <Image src={image} alt={`${name} view ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

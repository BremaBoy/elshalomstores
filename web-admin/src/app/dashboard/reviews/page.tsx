'use client'

import { useState, useEffect } from 'react'
import { Star, StarHalf, Search, Filter, Loader2, Quote, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, products(name), users(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (err) {
      console.error('Reviews Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Reviews</h1>
          <p className="text-neutral-400 text-sm">Monitor and manage customer feedback</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between border-l-4 border-l-yellow-500">
           <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Average Store Rating</p>
              <p className="text-3xl font-bold text-white">{averageRating.toFixed(1)} / 5.0</p>
           </div>
           <div className="flex gap-0.5 text-yellow-500">
             {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'fill-yellow-500' : ''}`} />
             ))}
           </div>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between border-l-4 border-l-primary">
           <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-white">{reviews.length}</p>
           </div>
           <Quote className="w-8 h-8 text-primary/20" />
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between border-l-4 border-l-green-500">
           <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Response Rate</p>
              <p className="text-3xl font-bold text-white">94%</p>
           </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Feedback Feed</h2>
        </div>

        <div className="divide-y divide-neutral-800">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : reviews.map(review => (
            <div key={review.id} className="p-6 hover:bg-neutral-950 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-400">
                     {review.users?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{review.users?.name || 'Anonymous User'}</h4>
                    <div className="flex gap-0.5 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-700'}`} />
                      ))}
                    </div>
                    <p className="text-neutral-500 text-[11px] mb-3">Reviewed <span className="text-primary font-medium">{review.products?.name}</span> · {format(new Date(review.created_at), 'MMM dd, yyyy')}</p>
                    <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl italic">"{review.comment}"</p>
                  </div>
                </div>
                <button className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && !isLoading && (
             <div className="p-20 text-center text-neutral-500">
                <p>No reviews yet.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

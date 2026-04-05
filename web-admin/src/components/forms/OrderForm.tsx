'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, Trash2, UserPlus, X, Search, Check } from 'lucide-react'
import { fetchProductsForOrder } from '@/app/actions/productActions'
import { fetchCustomers, createCustomer } from '@/app/actions/customerActions'
import { createOrder } from '@/app/actions/orderActions'

interface OrderFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function OrderForm({ onClose, onSuccess }: OrderFormProps) {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [searchProduct, setSearchProduct] = useState('')
  const [searchCustomer, setSearchCustomer] = useState('')

  // Form State
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ full_name: '', email: '' })
  const [shippingDetails, setShippingDetails] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('Transfer')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [pRes, cRes] = await Promise.all([
      fetchProductsForOrder(),
      fetchCustomers()
    ])
    if (pRes.success) setProducts(pRes.data)
    if (cRes.success) setCustomers(cRes.data)
  }

  const addItem = (product: any) => {
    const existing = selectedItems.find(item => item.id === product.id)
    if (existing) {
      setSelectedItems(prev => prev.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      setSelectedItems(prev => [...prev, { ...product, quantity: 1 }])
    }
  }

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, delta: number) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItems.length === 0) return alert('Add at least one item')
    
    setLoading(true)
    try {
      let userId = selectedCustomerId

      if (isNewCustomer) {
        const cRes = await createCustomer(newCustomer)
        if (!cRes.success) throw new Error(cRes.error)
        userId = cRes.data.id
      }

      if (!userId) throw new Error('Please select or create a customer')

      const orderData = {
        user_id: userId,
        items: selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total_amount: totalAmount,
        shipping_details: shippingDetails,
        payment_method: paymentMethod,
        status: 'Pending'
      }

      const oRes = await createOrder(orderData)
      if (!oRes.success) throw new Error(oRes.error)

      onSuccess()
      onClose()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchCustomer.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h2 className="text-xl font-bold">Create New Order</h2>
            <p className="text-sm text-muted-foreground">Manual order entry for customers</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Customer & Shipping */}
            <div className="space-y-6">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Customer Details</h3>
                  <button 
                    type="button"
                    onClick={() => setIsNewCustomer(!isNewCustomer)}
                    className="text-xs flex items-center gap-1.5 text-primary hover:underline font-semibold"
                  >
                    <UserPlus className="w-3 h-3" />
                    {isNewCustomer ? 'Select Existing' : 'Create New'}
                  </button>
                </div>

                {!isNewCustomer ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Search existing customers..."
                        className="w-full pl-9 pr-4 py-2 bg-muted/40 border border-border rounded-lg text-sm"
                        value={searchCustomer}
                        onChange={(e) => setSearchCustomer(e.target.value)}
                      />
                    </div>
                    <div className="max-h-32 overflow-y-auto border border-border rounded-lg divide-y divide-border bg-muted/10">
                      {filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCustomerId(c.id)}
                          className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-primary/5 transition-colors ${selectedCustomerId === c.id ? 'bg-primary/10 text-primary font-bold' : ''}`}
                        >
                          <span>{c.full_name} ({c.email})</span>
                          {selectedCustomerId === c.id && <Check className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <input 
                      type="text" 
                      placeholder="Customer Full Name"
                      required
                      className="w-full px-4 py-2 bg-muted/40 border border-border rounded-lg text-sm"
                      value={newCustomer.full_name}
                      onChange={e => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
                    />
                    <input 
                      type="email" 
                      placeholder="Customer Email"
                      required
                      className="w-full px-4 py-2 bg-muted/40 border border-border rounded-lg text-sm"
                      value={newCustomer.email}
                      onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    />
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Shipping Address</h3>
                <div className="grid grid-cols-1 gap-3">
                  <input 
                    type="text" 
                    placeholder="Street Address"
                    required
                    className="w-full px-4 py-2 bg-muted/40 border border-border rounded-lg text-sm"
                    value={shippingDetails.address}
                    onChange={e => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="City"
                      required
                      className="px-4 py-2 bg-muted/40 border border-border rounded-lg text-sm"
                      value={shippingDetails.city}
                      onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                    />
                    <input 
                      type="text" 
                      placeholder="State"
                      required
                      className="px-4 py-2 bg-muted/40 border border-border rounded-lg text-sm"
                      value={shippingDetails.state}
                      onChange={e => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Phone Number"
                    required
                    className="w-full px-4 py-2 bg-muted/40 border border-border rounded-lg text-sm"
                    value={shippingDetails.phone}
                    onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Payment</h3>
                <select 
                  className="w-full px-4 py-2 bg-muted/40 border border-border rounded-lg text-sm"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value="Transfer">Bank Transfer</option>
                  <option value="Cash">Cash on Delivery</option>
                  <option value="Card">Card Payment</option>
                </select>
              </section>
            </div>

            {/* Right Column: Items Selection */}
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Add Items</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2 bg-muted/40 border border-border rounded-lg text-sm"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border bg-muted/10">
                  {filteredProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addItem(p)}
                      className="w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-primary/5 transition-colors"
                    >
                      <span>{p.name}</span>
                      <span className="font-bold">₦{p.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Selected Items</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedItems.length === 0 && (
                    <p className="text-xs text-muted-foreground italic text-center py-8">No items selected yet</p>
                  )}
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">₦{item.price.toLocaleString()} each</p>
                      </div>
                      <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-2 py-1">
                        <button type="button" onClick={() => updateQuantity(item.id, -1)}><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold min-w-[20px] text-center">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, 1)}><Plus className="w-3 h-3" /></button>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="pt-4 border-t border-border mt-auto">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Order Total</span>
                    <span className="text-2xl font-black text-primary">₦{totalAmount.toLocaleString()}</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {loading ? 'Creating Order...' : 'Confirm Order & Payout'}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

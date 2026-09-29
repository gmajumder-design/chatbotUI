import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  { value: "housing", label: "Housing & Rent" },
  { value: "food", label: "Food & Groceries" },
  { value: "transportation", label: "Transportation" },
  { value: "utilities", label: "Utilities & Bills" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Healthcare" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" }
];

export default function GenerativeBudgetFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("utilities");
  const [frequency, setFrequency] = useState("monthly");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !amount || !category) return;
    
    setIsSubmitting(true);
    
    try {
      // Get auth tokens from the app state/url
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token') || localStorage.getItem('token');
      const userId = urlParams.get('userId') || urlParams.get('user_id') || urlParams.get('employeeId') || localStorage.getItem('user_id') || 'f49183e7-08f4-46db-9a8e-4069b0ee1850';

      const date = new Date();
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

      const payload = {
        name,
        amount: Number(amount),
        category,
        frequency,
        startDate,
        endDate,
        threshold: 100,
        currency: "USD"
      };

      const response = await fetch(`https://api.aiseservices.com/budget/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create budget');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setName("");
        setAmount("");
      }, 2500);

    } catch (err) {
      console.error(err);
      alert("Failed to create budget. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.button 
        className="gen-action-button mt-4"
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus size={16} />
        <span>Create New Budget</span>
      </motion.button>
    );
  }

  return (
    <motion.div 
      className="gen-chart-card mt-4"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="gen-section-header">
        <div className="gen-section-header-left">
           <Plus size={16} style={{ color: 'var(--accent-green)' }} />
           <span className="gen-section-title">Configure Budget</span>
        </div>
      </div>
      
      <div className="gen-chart-body">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="text-green-400 mb-3"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h3 className="text-white font-medium text-lg">Budget Created!</h3>
            <p className="text-gray-400 text-sm mt-1">Your new budget has been synced to True Harbor.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Budget Name</label>
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dining Out"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1.5">Amount ($)</label>
                <input 
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg flex justify-center items-center transition-colors shadow-lg shadow-indigo-900/20"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Budget"}
              </button>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}

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
      className="gen-chart-card budget-flow-card"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="gen-section-header">
        <div className="gen-section-header-left">
           <Plus size={16} style={{ color: 'var(--accent-emerald)' }} />
           <span className="gen-section-title">Configure Budget</span>
        </div>
      </div>
      
      <div className="gen-chart-body">
        {isSuccess ? (
          <div className="budget-success-view">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="budget-success-icon"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h3 className="budget-success-title">Budget Created!</h3>
            <p className="budget-success-desc">Your new budget has been synced to True Harbor.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="budget-form">
            <div className="budget-form-group">
              <label className="budget-label">Budget Name</label>
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dining Out"
                required
                className="budget-input"
              />
            </div>
            
            <div className="budget-form-row">
              <div className="budget-form-group">
                <label className="budget-label">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="budget-select"
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              
              <div className="budget-form-group">
                <label className="budget-label">Amount ($)</label>
                <input 
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="budget-input"
                />
              </div>
            </div>

            <div className="budget-actions">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="budget-btn budget-btn-primary"
              >
                {isSubmitting ? <Loader2 className="btn-spinner" size={16} /> : "Save Budget"}
              </button>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="budget-btn budget-btn-secondary"
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

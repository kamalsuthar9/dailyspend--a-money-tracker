
import React, { useState, useEffect, useMemo } from 'react';
import { Expense, Category } from './types';
import { INITIAL_EXPENSES, CATEGORY_COLORS } from './constants';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import LeakInsights from './components/LeakInsights';
import SmartAlerts from './components/SmartAlerts';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('leakfinder_expenses');
    if (saved === null) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('leakfinder_budget');
    return saved ? parseFloat(saved) : 0;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('dailyspend_theme');
    return saved === 'dark';
  });
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);    
  const handleThemeToggle = () => {
    setIsDarkMode(prev => !prev);
  }
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dailyspend_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dailyspend_theme', 'light');
    }
  }, [isDarkMode]);

  // Auto-wipe logic for new month
  useEffect(() => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const lastMonthKey = localStorage.getItem('leakfinder_last_month');

    if (lastMonthKey && lastMonthKey !== currentMonthKey) {
      setExpenses([]);
      setMonthlyBudget(0);
      localStorage.setItem('leakfinder_expenses', JSON.stringify([]));
      localStorage.setItem('leakfinder_budget', '0');
    }
    localStorage.setItem('leakfinder_last_month', currentMonthKey);
  }, []);

  useEffect(() => {
    localStorage.setItem('leakfinder_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('leakfinder_budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const expense: Expense = { ...newExpense, id };
    setExpenses(prev => [...prev, expense]);
    setLastAddedId(id);
    setTimeout(() => setLastAddedId(null), 3000);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleWipeData = () => {
    if (window.confirm('WARNING: This will permanently delete ALL transactions and reset your budget to ₹0. This cannot be undone. Proceed?')) {
      setExpenses([]);
      setMonthlyBudget(0);
      localStorage.setItem('leakfinder_expenses', JSON.stringify([]));
      localStorage.setItem('leakfinder_budget', '0');
    }
  };

  const daysInMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }, []);

  const dailyLimit = useMemo(() => monthlyBudget / daysInMonth, [monthlyBudget, daysInMonth]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none ring-4 ring-indigo-50 dark:ring-indigo-900/20">
              <i className="fa-solid fa-wallet text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none">DailySpend<span className="text-indigo-600">.</span></h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Smart Monthly Expense Planner</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              aria-label="Toggle Theme"
            >
              <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>
            <div className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl transition-colors">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md translate-y-[-1px]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <i className="fa-solid fa-chart-pie mr-2"></i> Overview
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md translate-y-[-1px]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                <i className="fa-solid fa-clock-rotate-left mr-2"></i> History ({expenses.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-2 z-50 flex space-x-2 transition-colors">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 px-6 py-4 rounded-2xl font-black text-xs uppercase transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-chart-pie"></i> <span>Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-6 py-4 rounded-2xl font-black text-xs uppercase transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-clock-rotate-left"></i> <span>History</span>
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-4 space-y-8">
              <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border-2 border-indigo-50 dark:border-slate-800 relative overflow-hidden group transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity">
                  <i className="fa-solid fa-calendar-days text-8xl -rotate-12 dark:text-white"></i>
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center">
                    <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center mr-3 text-xs">
                      <i className="fa-solid fa-bullseye"></i>
                    </span>
                    Monthly Planner
                  </h2>
                  <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md uppercase tracking-wider">
                    {new Date().toLocaleString('default', { month: 'long' })}
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Total Monthly Budget (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 font-black">₹</span>
                      <input 
                        type="number" 
                        value={monthlyBudget === 0 ? '' : monthlyBudget} 
                        onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                        placeholder="Enter budget..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-4 font-black text-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                      <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1">Daily Limit</p>
                      <p className="text-2xl font-black text-white">₹{dailyLimit.toFixed(0)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors">
                      <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Days Left</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{daysInMonth - new Date().getDate() + 1}</p>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center italic">
                    Spend no more than <span className="text-indigo-600 dark:text-indigo-400 font-bold">₹{dailyLimit.toFixed(0)}</span> per day to stay on track.
                  </p>
                </div>
              </section>

              <section id="entry-form">
                <ExpenseForm onAdd={handleAddExpense} />
              </section>
              
              <section id="alerts">
                <SmartAlerts expenses={expenses} />
              </section>

              <section id="ai-insights">
                <LeakInsights expenses={expenses} />
              </section>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <Dashboard expenses={expenses} />
              
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Activity</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Reviewing your last 10 transactions</p>
                  </div>
                  <button onClick={() => setActiveTab('history')} className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all flex items-center">
                    Full Archive <i className="fa-solid fa-chevron-right ml-2 text-[10px]"></i>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {expenses.slice(-10).reverse().map((e) => (
                    <div key={e.id} className={`flex items-center justify-between p-5 bg-white dark:bg-slate-800 border rounded-2xl transition-all ${lastAddedId === e.id ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-xl scale-[1.02] z-10' : 'border-slate-50 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-md'}`}>
                      <div className="flex items-center space-x-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-slate-100 dark:border-slate-600 transition-colors">
                          <i className={`fa-solid text-xl ${
                            e.category === Category.Food ? 'fa-utensils' : 
                            e.category === Category.Travel ? 'fa-car' : 
                            e.category === Category.Online ? 'fa-cart-shopping' :
                            e.category === Category.Subscription ? 'fa-rotate' : 'fa-receipt'
                          }`}></i>
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1">{e.description}</p>
                          <div className="flex items-center space-x-4">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date: {formatDate(e.date)}</span>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cat: {e.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">₹{e.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                      <i className="fa-solid fa-receipt text-slate-300 dark:text-slate-600 text-4xl mb-3 block"></i>
                      <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">No transactions this month</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
               <div>
                 <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Transaction Archive</h2>
                 <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2">All records for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
               </div>
               <button 
                 onClick={handleWipeData} 
                 className="flex items-center text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-8 py-5 rounded-3xl font-black transition-all shadow-sm border border-rose-100 dark:border-rose-900/30"
               >
                 <i className="fa-solid fa-trash-can mr-2"></i> Reset All Data
               </button>
             </div>

             <div className="overflow-x-auto -mx-2">
               <table className="w-full text-left border-separate border-spacing-y-4">
                 <thead>
                   <tr className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                     <th className="pb-4 px-8">Date</th>
                     <th className="pb-4 px-8">Description</th>
                     <th className="pb-4 px-8">Category</th>
                     <th className="pb-4 px-8 text-right">Amount</th>
                     <th className="pb-4 px-8 text-center">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {expenses.slice().reverse().map((e) => (
                     <tr key={e.id} className="group bg-slate-50/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all">
                       <td className="py-7 px-8 text-sm font-black text-slate-600 dark:text-slate-400 rounded-l-[2rem] border-y border-l border-slate-100 dark:border-slate-700">
                         {formatDate(e.date)}
                       </td>
                       <td className="py-7 px-8 font-black text-slate-900 dark:text-white text-xl border-y border-slate-100 dark:border-slate-700">
                         {e.description}
                       </td>
                       <td className="py-7 px-8 border-y border-slate-100 dark:border-slate-700">
                         <span className="text-[10px] px-4 py-2 rounded-2xl font-black uppercase tracking-widest border bg-white dark:bg-slate-700 shadow-sm" style={{ color: CATEGORY_COLORS[e.category], borderColor: `${CATEGORY_COLORS[e.category]}44` }}>
                           {e.category}
                         </span>
                       </td>
                       <td className="py-7 px-8 text-right font-black text-slate-900 dark:text-white text-3xl border-y border-slate-100 dark:border-slate-700">
                         ₹{e.amount.toLocaleString()}
                       </td>
                       <td className="py-7 px-8 text-center rounded-r-[2rem] border-y border-r border-slate-100 dark:border-slate-700">
                         <button 
                           onClick={() => handleDeleteExpense(e.id)} 
                           className="w-12 h-12 rounded-2xl text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center mx-auto"
                           title="Delete record"
                         >
                           <i className="fa-solid fa-trash-can text-lg"></i>
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {expenses.length === 0 && (
                 <div className="text-center py-32 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                    <p className="text-slate-400 dark:text-slate-500 font-black text-lg">The archive is currently empty.</p>
                 </div>
               )}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

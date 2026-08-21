import { create } from 'zustand';
import { Storage } from '../utils/storage';

export interface Transaction {
  id: string;
  userId: string;
  type: 'receita' | 'despesa';
  title: string;
  amount: number;
  category: string;
  date: string;
  location?: string;
  receiptImageUri?: string;
  receiptStoragePath?: string;
}

interface FinanceState {
  transactions: Transaction[];
  isLoading: boolean;
  loadTransactions: (userId?: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updatedData: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  isLoading: false,
  
  loadTransactions: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await Storage.getItem('@transactions');
      if (data) {
        const parsed = JSON.parse(data);
        const transactions = Array.isArray(parsed) ? parsed : [];
        set({ transactions: transactions });
      } else {
        set({ transactions: [] });
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      set({ transactions: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (tx) => {
    set({ isLoading: true });
    try {
      const newTx: Transaction = { ...tx, id: Date.now().toString() };
      const currentTransactions = get().transactions;
      const updated = [newTx, ...currentTransactions];
      set({ transactions: updated });
      await Storage.setItem('@transactions', JSON.stringify(updated));
      return Promise.resolve();
    } catch (error: any) {
      console.error('[FinanceStore] Erro ao adicionar transação:', error);
      return Promise.reject(error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: async (id, updatedData) => {
    set({ isLoading: true });
    try {
      const currentTransactions = get().transactions;
      const updatedTransactions = currentTransactions.map((transaction) =>
        transaction.id === id ? { ...transaction, ...updatedData } : transaction
      );
      set({ transactions: updatedTransactions });
      await Storage.setItem('@transactions', JSON.stringify(updatedTransactions));
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return Promise.reject(error);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true });
    try {
      const currentTransactions = get().transactions;
      const updated = currentTransactions.filter(t => t.id !== id);
      set({ transactions: updated });
      await Storage.setItem('@transactions', JSON.stringify(updated));
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      return Promise.reject(error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
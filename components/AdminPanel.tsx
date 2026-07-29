import React, { useState } from 'react';
import { addSpecialAuramons } from '../services/adminService';

interface AdminPanelProps {
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ userEmail, isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleAddAuramons = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const result = await addSpecialAuramons();
      setMessageType('success');
      setMessage(`✨ Successfully added ${result.added} Auramons: ${result.auramons.join(', ')}`);
    } catch (error: any) {
      setMessageType('error');
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Only show for admin
  if (userEmail !== 'maxidea2008@gmail.com') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-primary">Admin Panel</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-text-dim mb-2">Add Special Auramon Collection</p>
            <button
              onClick={handleAddAuramons}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 active:scale-95"
            >
              {isLoading ? 'Adding...' : 'Add 6 Max-Level Auramons'}
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              messageType === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
            }`}>
              {message}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-text-dim/20 hover:bg-text-dim/30 rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;

/**
 * Email Preferences Settings Component
 *
 * Allows users to manage their email notification settings:
 * - Enable/disable all notifications
 * - Choose specific time slots (8 AM, 2 PM, 8 PM)
 * - Set timezone
 * - View email statistics
 */

import React, { useState, useEffect } from 'react';
import { updateEmailPreferences } from '../../services/gameDataService';
import { AuthService } from '../../services/authService';
import { GUARDIAN_PERSONALITIES } from '../../shared/guardianPersonalities';

interface EmailPreferencesProps {
  onClose: () => void;
  onSave?: () => void;
}

const TIMEZONES = [
  { label: 'Eastern Time (EST/EDT)', value: 'America/New_York' },
  { label: 'Central Time (CST/CDT)', value: 'America/Chicago' },
  { label: 'Mountain Time (MST/MDT)', value: 'America/Denver' },
  { label: 'Pacific Time (PST/PDT)', value: 'America/Los_Angeles' },
  { label: 'Alaska Time', value: 'America/Anchorage' },
  { label: 'Hawaii Time', value: 'America/Honolulu' },
  { label: 'GMT/UTC', value: 'UTC' },
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'Central Europe (CET/CEST)', value: 'Europe/Paris' },
  { label: 'Moscow (MSK)', value: 'Europe/Moscow' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'India (IST)', value: 'Asia/Kolkata' },
  { label: 'Bangkok (ICT)', value: 'Asia/Bangkok' },
  { label: 'Shanghai (CST)', value: 'Asia/Shanghai' },
  { label: 'Hong Kong (HKT)', value: 'Asia/Hong_Kong' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Seoul (KST)', value: 'Asia/Seoul' },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
  { label: 'Auckland (NZST)', value: 'Pacific/Auckland' }
];

const EmailPreferences: React.FC<EmailPreferencesProps> = ({ onClose, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Notification settings
  const [emailsEnabled, setEmailsEnabled] = useState(true);
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [afternoonEnabled, setAfternoonEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [timezone, setTimezone] = useState('America/New_York');

  // Stats
  const [emailsSent, setEmailsSent] = useState(0);
  const [emailsOpened, setEmailsOpened] = useState(0);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        const token = await AuthService.getAuthToken();
        if (!token) {
          setError('Authentication required');
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/game-data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load preferences');
        }

        const data = await response.json();

        // Update state with loaded preferences
        if (data.emailNotifications) {
          setEmailsEnabled(data.emailNotifications.enabled);
          setMorningEnabled(data.emailNotifications.morning);
          setAfternoonEnabled(data.emailNotifications.afternoon);
          setEveningEnabled(data.emailNotifications.evening);
        }

        if (data.timezone) {
          setTimezone(data.timezone);
        }

        if (data.metrics) {
          setEmailsSent(data.metrics.emailsSent);
          setEmailsOpened(data.metrics.emailsOpened);
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
        setError('Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const token = await AuthService.getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      await updateEmailPreferences(
        {
          enabled: emailsEnabled,
          morning: morningEnabled,
          afternoon: afternoonEnabled,
          evening: eveningEnabled
        },
        timezone,
        token
      );

      setSuccess(true);
      setTimeout(() => {
        if (onSave) onSave();
      }, 1500);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-surface border-4 border-highlight rounded-2xl p-8">
          <p className="text-text-main">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border-4 border-highlight rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <h1 className="text-3xl font-serif text-highlight mb-6">Email Preferences</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6 text-green-100">
            ✓ Preferences saved successfully!
          </div>
        )}

        {/* Email Notifications Toggle */}
        <div className="mb-8 p-4 bg-background rounded-xl">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={emailsEnabled}
              onChange={(e) => setEmailsEnabled(e.target.checked)}
              className="w-6 h-6"
            />
            <div>
              <p className="text-lg font-bold text-text-main">Enable Email Notifications</p>
              <p className="text-sm text-text-dim">Get Guardian nudges to help you stay on track</p>
            </div>
          </label>
        </div>

        {emailsEnabled && (
          <>
            {/* Nudge Time Preferences */}
            <div className="mb-8 p-4 bg-background rounded-xl">
              <h2 className="text-lg font-bold text-text-main mb-4">📧 Email Times</h2>
              <p className="text-sm text-text-dim mb-4">Choose which nudges to receive:</p>

              <div className="space-y-3">
                <label className="flex items-center gap-4 cursor-pointer p-3 bg-surface rounded-lg hover:bg-surface/80">
                  <input
                    type="checkbox"
                    checked={morningEnabled}
                    onChange={(e) => setMorningEnabled(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-bold text-text-main">8:00 AM - Morning Nudge 🌅</p>
                    <p className="text-xs text-text-dim">Motivational & encouraging</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 cursor-pointer p-3 bg-surface rounded-lg hover:bg-surface/80">
                  <input
                    type="checkbox"
                    checked={afternoonEnabled}
                    onChange={(e) => setAfternoonEnabled(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-bold text-text-main">2:00 PM - Afternoon Nudge ☀️</p>
                    <p className="text-xs text-text-dim">Checking in on your progress</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 cursor-pointer p-3 bg-surface rounded-lg hover:bg-surface/80">
                  <input
                    type="checkbox"
                    checked={eveningEnabled}
                    onChange={(e) => setEveningEnabled(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-bold text-text-main">8:00 PM - Evening Nudge 🌙</p>
                    <p className="text-xs text-text-dim">Last chance to complete your mission!</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Timezone Selector */}
            <div className="mb-8 p-4 bg-background rounded-xl">
              <h2 className="text-lg font-bold text-text-main mb-2">🌍 Your Timezone</h2>
              <p className="text-sm text-text-dim mb-3">We'll send emails at the right time for your location</p>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-3 bg-surface border-2 border-secondary rounded-lg text-text-main focus:border-highlight focus:outline-none"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Stats */}
        <div className="mb-8 p-4 bg-background rounded-xl">
          <h2 className="text-lg font-bold text-text-main mb-4">📊 Your Email Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface rounded-lg">
              <p className="text-2xl font-bold text-highlight">{emailsSent}</p>
              <p className="text-xs text-text-dim">Emails sent</p>
            </div>
            <div className="p-3 bg-surface rounded-lg">
              <p className="text-2xl font-bold text-primary">{emailsSent > 0 ? Math.round((emailsOpened / emailsSent) * 100) : 0}%</p>
              <p className="text-xs text-text-dim">Open rate</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-8 p-4 bg-primary/10 border border-primary rounded-lg">
          <p className="text-sm text-text-main">
            💡 <strong>Tip:</strong> Your Guardian will get increasingly desperate if you miss your daily missions! The evening nudge is the most aggressive.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-text-dim hover:bg-text-dim/80 text-white font-bold py-3 px-6 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="flex-1 bg-highlight hover:brightness-110 text-white font-bold py-3 px-6 rounded-lg border-b-4 border-yellow-800 active:border-b-2 active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Unsubscribe Info */}
        <p className="text-xs text-text-dim text-center mt-6">
          Need a break? You can disable all notifications above and re-enable them anytime.
        </p>
      </div>
    </div>
  );
};

export default EmailPreferences;

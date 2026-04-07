'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Config {
  id: string;
  config_key: string;
  config_value: string;
  config_type: string;
  description: string;
  category: string;
  is_editable: boolean;
  updated_at: string;
  updated_by: string;
}

export default function SettingsPage() {
  const [configs, setConfigs] = useState<Record<string, Config[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      if (data.success) {
        setConfigs(data.configs);
        // Initialize edited values
        const initialValues: Record<string, string> = {};
        data.allConfigs.forEach((config: Config) => {
          initialValues[config.config_key] = config.config_value;
        });
        setEditedValues(initialValues);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
      setMessage({ type: 'error', text: 'Failed to load configurations' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSave = async (configKey: string) => {
    setSaving(configKey);
    setMessage(null);

    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config_key: configKey,
          config_value: editedValues[configKey],
          updated_by: 'admin',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Configuration saved successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (configKey: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [configKey]: value }));
  };

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      general: 'General Information',
      capacity: 'Capacity Settings',
      schedule: 'Schedule Settings',
      content: 'UI Content',
      instructions: 'Important Instructions',
      admin: 'Admin Settings',
    };
    return titles[category] || category;
  };

  const renderInput = (config: Config) => {
    const value = editedValues[config.config_key] || '';
    const hasChanged = value !== config.config_value;

    switch (config.config_type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => handleChange(config.config_key, e.target.checked ? 'true' : 'false')}
              disabled={!config.is_editable}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">{value === 'true' ? 'Enabled' : 'Disabled'}</span>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(config.config_key, e.target.value)}
            disabled={!config.is_editable}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => handleChange(config.config_key, e.target.value)}
            disabled={!config.is_editable}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(config.config_key, e.target.value)}
            disabled={!config.is_editable}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        );

      default:
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(config.config_key, e.target.value)}
            disabled={!config.is_editable}
            rows={value.length > 100 ? 3 : 1}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-8 h-8" />
              System Settings
            </h1>
            <p className="text-gray-600 mt-2">Configure exhibition settings without code changes</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={fetchConfigs}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Configuration Sections */}
        <div className="space-y-6">
          {Object.entries(configs).map(([category, categoryConfigs]) => (
            <div key={category} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
                {getCategoryTitle(category)}
              </h2>
              <div className="space-y-4">
                {categoryConfigs.map((config) => {
                  const hasChanged = editedValues[config.config_key] !== config.config_value;
                  return (
                    <div key={config.config_key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block font-medium text-gray-900 mb-1">
                          {config.config_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <p className="text-sm text-gray-600">{config.description}</p>
                        {config.updated_by && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last updated by {config.updated_by}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            {renderInput(config)}
                          </div>
                          {config.is_editable && (
                            <button
                              onClick={() => handleSave(config.config_key)}
                              disabled={!hasChanged || saving === config.config_key}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                hasChanged
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {saving === config.config_key ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Save
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Changes to schedule settings require regenerating time slots</li>
                <li>Capacity changes only affect new registrations</li>
                <li>Content changes appear immediately on the website</li>
                <li>Always test changes in a non-production environment first</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob

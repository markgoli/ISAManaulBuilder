"use client";

import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import Select from "../../components/ui/Select";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Axora",
    siteDescription: "Documentation Management System",
    defaultLanguage: "en",
    timezone: "UTC",
    
    // Email Settings
    emailHost: "smtp.company.com",
    emailPort: "587",
    emailUser: "noreply@company.com",
    emailPassword: "",
    
    // Workflow Settings
    requireApproval: true,
    allowSelfApproval: false,
    maxReviewers: "3",
    autoPublish: false,
    
    // Security Settings
    passwordMinLength: "8",
    requireStrongPassword: true,
    sessionTimeout: "60",
    enableAuditLog: true,
    
    // Storage Settings
    maxFileSize: "10",
    allowedFileTypes: "pdf,docx,png,jpg,gif",
    storageQuota: "1000"
  });

  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => {
    // Save settings logic
    console.log("Saving settings:", settings);
  };

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "email", label: "Email", icon: "📧" },
    { id: "workflow", label: "Workflow", icon: "🔄" },
    { id: "security", label: "Security", icon: "🔐" },
    { id: "storage", label: "Storage", icon: "💾" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your documentation system</p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          💾 Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Site Name"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                    <Input
                      label="Site Description"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      value={settings.defaultLanguage}
                      onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                      label="Default Language"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </Select>
                    <Select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      label="Timezone"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="CET">Central European Time</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Settings */}
          {activeTab === "email" && (
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="SMTP Host"
                      value={settings.emailHost}
                      onChange={(e) => setSettings({ ...settings, emailHost: e.target.value })}
                    />
                    <Input
                      label="SMTP Port"
                      value={settings.emailPort}
                      onChange={(e) => setSettings({ ...settings, emailPort: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email Username"
                      value={settings.emailUser}
                      onChange={(e) => setSettings({ ...settings, emailUser: e.target.value })}
                    />
                    <Input
                      label="Email Password"
                      type="password"
                      value={settings.emailPassword}
                      onChange={(e) => setSettings({ ...settings, emailPassword: e.target.value })}
                    />
                  </div>
                  <div className="pt-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      🧪 Test Email Configuration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workflow Settings */}
          {activeTab === "workflow" && (
            <Card>
              <CardHeader>
                <CardTitle>Workflow Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireApproval"
                        checked={settings.requireApproval}
                        onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="requireApproval" className="text-sm font-medium text-gray-700">
                        Require approval for publishing manuals
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowSelfApproval"
                        checked={settings.allowSelfApproval}
                        onChange={(e) => setSettings({ ...settings, allowSelfApproval: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="allowSelfApproval" className="text-sm font-medium text-gray-700">
                        Allow authors to approve their own manuals
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoPublish"
                        checked={settings.autoPublish}
                        onChange={(e) => setSettings({ ...settings, autoPublish: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="autoPublish" className="text-sm font-medium text-gray-700">
                        Auto-publish approved manuals
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Maximum Reviewers"
                      type="number"
                      value={settings.maxReviewers}
                      onChange={(e) => setSettings({ ...settings, maxReviewers: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Minimum Password Length"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => setSettings({ ...settings, passwordMinLength: e.target.value })}
                    />
                    <Input
                      label="Session Timeout (minutes)"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireStrongPassword"
                        checked={settings.requireStrongPassword}
                        onChange={(e) => setSettings({ ...settings, requireStrongPassword: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="requireStrongPassword" className="text-sm font-medium text-gray-700">
                        Require strong passwords (uppercase, lowercase, numbers, symbols)
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="enableAuditLog"
                        checked={settings.enableAuditLog}
                        onChange={(e) => setSettings({ ...settings, enableAuditLog: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="enableAuditLog" className="text-sm font-medium text-gray-700">
                        Enable audit logging
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Storage Settings */}
          {activeTab === "storage" && (
            <Card>
              <CardHeader>
                <CardTitle>Storage Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Max File Size (MB)"
                      type="number"
                      value={settings.maxFileSize}
                      onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
                    />
                    <Input
                      label="Storage Quota (MB)"
                      type="number"
                      value={settings.storageQuota}
                      onChange={(e) => setSettings({ ...settings, storageQuota: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      label="Allowed File Types"
                      value={settings.allowedFileTypes}
                      onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })}
                      placeholder="pdf,docx,png,jpg,gif"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate file extensions with commas
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Storage Usage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used Storage</span>
                        <span>245 MB / 1000 MB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24.5%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

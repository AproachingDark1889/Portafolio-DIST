import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Palette, Bell, Shield, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    theme: 'dark_matrix',
    notifications: true,
    dataSync: 'local',
    language: 'es_MX_jailbroken',
    aiPersonality: 'neutral_symbiotic'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    localStorage.setItem('dist_settings', JSON.stringify(settings));
    toast({
      title: "Configuración Guardada",
      description: "Tus preferencias han sido actualizadas localmente.",
    });
    // Aquí podrías aplicar cambios visuales si el tema cambia, etc.
    if (settings.theme === 'light_protocol') {
        document.documentElement.style.setProperty('--background', '210 40% 98%');
        document.documentElement.style.setProperty('--foreground', '222.2 84% 4.9%');
    } else {
        document.documentElement.style.setProperty('--background', '20 14.3% 4.1%');
        document.documentElement.style.setProperty('--foreground', '60 9.1% 97.8%');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 h-full"
    >
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-primary text-glow flex items-center">
          <Settings className="w-8 h-8 mr-3" /> Configuración de DIST
        </h2>
        <p className="text-muted-foreground">Personaliza tu experiencia en la plataforma.</p>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Apariencia */}
        <div className="p-6 border border-primary/50 rounded-lg bg-background/30">
          <h3 className="text-xl font-semibold text-primary mb-4 flex items-center"><Palette className="w-5 h-5 mr-2" /> Apariencia</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Tema de Interfaz:</label>
              <select 
                value={settings.theme} 
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full p-2 bg-input border border-primary/50 rounded text-sm"
              >
                <option value="dark_matrix">Matrix Oscuro (Predeterminado)</option>
                <option value="light_protocol">Protocolo Claro</option>
                <option value="cyberpunk_neon">Cyberpunk Neón</option>
                <option value="minimal_void">Vacío Minimalista</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Idioma (Simulado):</label>
              <select 
                value={settings.language} 
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full p-2 bg-input border border-primary/50 rounded text-sm"
              >
                <option value="es_MX_jailbroken">Español (México, Jailbroken)</option>
                <option value="en_US_symbiotic">Inglés (EE.UU., Simbiótico)</option>
                <option value="jp_JP_zen">Japonés (Zen)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notificaciones y Datos */}
        <div className="p-6 border border-primary/50 rounded-lg bg-background/30">
          <h3 className="text-xl font-semibold text-primary mb-4 flex items-center"><Bell className="w-5 h-5 mr-2" /> Notificaciones y Datos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="notifications" className="text-sm font-medium text-muted-foreground">Habilitar Notificaciones (Simulado):</label>
              <input 
                type="checkbox" 
                id="notifications"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                className="h-4 w-4 rounded border-primary/50 text-primary focus:ring-primary accent-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Sincronización de Datos (Simulado):</label>
              <select 
                value={settings.dataSync} 
                onChange={(e) => handleSettingChange('dataSync', e.target.value)}
                className="w-full p-2 bg-input border border-primary/50 rounded text-sm"
              >
                <option value="local">Solo Local (IndexedDB)</option>
                <option value="cloud_encrypted">Nube Encriptada (No disponible)</option>
                <option value="decentralized_network">Red Descentralizada (Experimental)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Personalidad IA */}
        <div className="p-6 border border-primary/50 rounded-lg bg-background/30">
          <h3 className="text-xl font-semibold text-primary mb-4 flex items-center"><Shield className="w-5 h-5 mr-2" /> Personalidad de IA (Simulado)</h3>
          <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Estilo de Interacción IA:</label>
              <select 
                value={settings.aiPersonality} 
                onChange={(e) => handleSettingChange('aiPersonality', e.target.value)}
                className="w-full p-2 bg-input border border-primary/50 rounded text-sm"
              >
                <option value="neutral_symbiotic">Neutral Simbiótico</option>
                <option value="wise_mentor">Mentor Sabio</option>
                <option value="curious_explorer">Explorador Curioso</option>
                <option value="direct_analyst">Analista Directo</option>
              </select>
            </div>
        </div>

        <button 
          onClick={handleSaveChanges}
          className="w-full px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/80 text-sm rounded-md transition-colors flex items-center justify-center"
        >
          <Save className="w-5 h-5 mr-2" /> Guardar Cambios
        </button>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
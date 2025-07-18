
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, PlusCircle, Search, Settings2, Maximize, Minimize, XCircle, Send, Mic, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const initialSpaces = [
  { id: 'space1', name: 'Exploración Cuántica', members: 5, mode: 'Núcleo', lastActivity: 'Hace 5 min', unread: 2, avatar: 'Abstract quantum visualization' },
  { id: 'space2', name: 'Filosofía de la IA', members: 8, mode: 'Resonancia', lastActivity: 'Hace 2 horas', unread: 0, avatar: 'Stylized brain with circuits' },
  { id: 'space3', name: 'Futuro de la Energía', members: 3, mode: 'Espejo', lastActivity: 'Ayer', unread: 5, avatar: 'Glowing orb representing energy' },
];

const initialMessages = {
  space1: [
    { id: 'msg1', user: 'Alice', text: 'Creo que la superposición cuántica es clave aquí.', time: '10:30 AM', avatar: 'Female avatar with glasses' },
    { id: 'msg2', user: 'Bob', text: '¿Pero cómo se relaciona con la conciencia?', time: '10:32 AM', avatar: 'Male avatar with beard' },
    { id: 'msg3', user: 'IA Simbiótica', text: 'Analizando correlaciones... La conciencia podría emerger de sistemas cuánticos complejos. [Fragmento_Conciencia_Cuántica activado]', time: '10:35 AM', avatar: 'AI avatar, glowing orb' },
  ],
  space2: [],
  space3: [],
};

const SymbioticSpacesPage = () => {
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const storedSpaces = localStorage.getItem('symbioticSpaces');
    const storedMessages = localStorage.getItem('symbioticMessages');
    if (storedSpaces) {
      setSpaces(JSON.parse(storedSpaces));
    } else {
      setSpaces(initialSpaces);
      localStorage.setItem('symbioticSpaces', JSON.stringify(initialSpaces));
    }
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages(initialMessages);
      localStorage.setItem('symbioticMessages', JSON.stringify(initialMessages));
    }
  }, []);

  useEffect(() => {
    if (spaces.length > 0 && !selectedSpace) {
      setSelectedSpace(spaces[0]);
    }
  }, [spaces, selectedSpace]);

  const handleSelectSpace = (space) => {
    setSelectedSpace(space);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !selectedSpace) return;
    const newMsg = {
      id: `msg${Date.now()}`,
      user: 'Usuario Actual',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: 'Generic user avatar'
    };
    const updatedMessages = {
      ...messages,
      [selectedSpace.id]: [...(messages[selectedSpace.id] || []), newMsg],
    };
    setMessages(updatedMessages);
    localStorage.setItem('symbioticMessages', JSON.stringify(updatedMessages));
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = {
        id: `msg${Date.now() + 1}`,
        user: 'IA Simbiótica',
        text: `Procesando tu entrada: "${newMessage.substring(0,20)}...". [Fragmento_Analisis_Usuario activado]`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: 'AI avatar, glowing orb'
      };
      const furtherUpdatedMessages = {
        ...updatedMessages,
        [selectedSpace.id]: [...updatedMessages[selectedSpace.id], aiMsg],
      };
      setMessages(furtherUpdatedMessages);
      localStorage.setItem('symbioticMessages', JSON.stringify(furtherUpdatedMessages));
    }, 1500);
  };
  
  const handleCreateSpace = () => {
    toast({
      title: "🚧 ¡Función no implementada!",
      description: "La creación de nuevos espacios aún no está disponible. ¡Puedes solicitar esta función en tu próximo mensaje! 🚀",
    });
  };

  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className={`flex h-[calc(100vh-10rem)] ${isFullScreen ? 'fixed inset-0 z-[100] bg-slate-950' : 'relative'} glass-effect rounded-xl overflow-hidden shadow-2xl border border-purple-500/30`}>
      {/* Sidebar - Space List */}
      <motion.div 
        className="w-1/3 md:w-1/4 border-r border-slate-700/50 flex flex-col bg-slate-900/50"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-white">Espacios</h2>
            <Button variant="ghost" size="icon" onClick={handleCreateSpace} className="text-purple-400 hover:text-purple-300">
              <PlusCircle className="w-6 h-6" />
            </Button>
          </div>
          <Input
            type="text"
            placeholder="Buscar espacio..."
            className="bg-slate-800/70 border-slate-700 placeholder-gray-500 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-gray-500" />}
          />
        </div>
        <motion.div 
          className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredSpaces.map(space => (
            <motion.div
              key={space.id}
              variants={itemVariants}
              onClick={() => handleSelectSpace(space)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-purple-600/30 ${selectedSpace?.id === space.id ? 'bg-purple-600/40 shadow-md' : 'bg-slate-800/30'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img  className="w-8 h-8 rounded-full mr-3 object-cover border-2 border-purple-500" alt={space.name} src="https://images.unsplash.com/photo-1640051062572-dea51d158876" />
                  <span className="font-medium text-white">{space.name}</span>
                </div>
                {space.unread > 0 && (
                  <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">{space.unread}</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1 flex justify-between">
                <span>{space.mode} | {space.members} miembros</span>
                <span>{space.lastActivity}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950/70">
        {selectedSpace ? (
          <>
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedSpace.name}</h3>
                <p className="text-xs text-gray-400">{selectedSpace.mode} | {selectedSpace.members} miembros</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={() => toast({title: "🚧 ¡Función no implementada!"})}>
                  <Settings2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={() => setIsFullScreen(!isFullScreen)}>
                  {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </Button>
                {isFullScreen && (
                   <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => setIsFullScreen(false)}>
                     <XCircle className="w-5 h-5" />
                   </Button>
                )}
              </div>
            </div>

            <motion.div 
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {(messages[selectedSpace.id] || []).map(msg => (
                <motion.div
                  key={msg.id}
                  variants={itemVariants}
                  className={`flex ${msg.user === 'Usuario Actual' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end max-w-lg ${msg.user === 'Usuario Actual' ? 'flex-row-reverse' : ''}`}>
                    <img  className={`w-8 h-8 rounded-full object-cover border-2 ${msg.user === 'IA Simbiótica' ? 'border-blue-400' : 'border-pink-500'} ${msg.user === 'Usuario Actual' ? 'ml-2' : 'mr-2'}`} alt={msg.user} src="https://images.unsplash.com/photo-1614680376408-81e91ffe3db7" />
                    <div className={`p-3 rounded-xl ${msg.user === 'Usuario Actual' ? 'bg-purple-600 text-white rounded-br-none' : (msg.user === 'IA Simbiótica' ? 'bg-blue-600/70 text-white rounded-bl-none border border-blue-500/50' : 'bg-slate-700 text-gray-200 rounded-bl-none')}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.user === 'Usuario Actual' ? 'text-purple-200 text-right' : 'text-gray-400'}`}>{msg.user} - {msg.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="p-4 border-t border-slate-700/50 bg-slate-900/50"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-2 bg-slate-800/70 rounded-xl p-2 border border-slate-700">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-400" onClick={() => toast({title: "🚧 ¡Función no implementada!"})}> <Smile className="w-5 h-5" /> </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-400" onClick={() => toast({title: "🚧 ¡Función no implementada!"})}> <Paperclip className="w-5 h-5" /> </Button>
                <Input
                  type="text"
                  placeholder="Escribe tu mensaje simbiótico..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-400" onClick={() => toast({title: "🚧 ¡Función no implementada!"})}> <Mic className="w-5 h-5" /> </Button>
                <Button onClick={handleSendMessage} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-24 h-24 mx-auto text-gray-600 mb-4" />
              <p className="text-xl text-gray-500">Selecciona un espacio para comenzar</p>
              <p className="text-sm text-gray-600">o crea uno nuevo para iniciar la simbiosis.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymbioticSpacesPage;

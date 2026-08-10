const syncStatus = async (req, res) => {
  try {
    // Aquí se conectará a la BDD para obtener las configuraciones del usuario o tokens oauth en un futuro
    res.json({
      googleConnected: false,
      goldieConnected: false,
      lastSync: null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const syncGoogle = async (req, res) => {
  try {
    // Stub: aquí redirigiremos a OAuth Google o procesaremos un webhook de Google Calendar
    res.json({ message: 'Sincronización con Google Calendar estará disponible próximamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const syncGoldie = async (req, res) => {
  try {
    // Stub: aquí conectaremos la API o webhook de Goldie App
    res.json({ message: 'Sincronización con Goldie App estará disponible próximamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  syncStatus,
  syncGoogle,
  syncGoldie
};

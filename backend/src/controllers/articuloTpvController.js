const ArticuloTpv = require('../models/articuloTpv');

const articuloTpvController = {
  obtenerTodos: async (req, res) => {
    try {
      const articulos = await ArticuloTpv.buscarTodos(req.usuario.estudio_id);
      res.json(articulos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener los artículos del TPV' });
    }
  },

  obtenerPorId: async (req, res) => {
    try {
      const articulo = await ArticuloTpv.buscarPorId(req.params.id, req.usuario.estudio_id);
      if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado' });
      res.json(articulo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener el artículo' });
    }
  },

  crear: async (req, res) => {
    try {
      const articulo = await ArticuloTpv.crear(req.body, req.usuario.estudio_id);
      res.status(201).json(articulo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear el artículo TPV' });
    }
  },

  actualizar: async (req, res) => {
    try {
      const articulo = await ArticuloTpv.actualizar(req.params.id, req.body, req.usuario.estudio_id);
      res.json(articulo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar el artículo TPV' });
    }
  },

  borrar: async (req, res) => {
    try {
      await ArticuloTpv.borrar(req.params.id, req.usuario.estudio_id);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al borrar el artículo TPV' });
    }
  }
};

module.exports = articuloTpvController;

import { usuariosService } from '../services/usuarios.service.js';

export const usuariosController = {
  async list(req, res) {
    const users = await usuariosService.listUsers();
    res.status(200).json({ data: users });
  },

  async create(req, res) {
    const { nombre, email, password, rol } = req.body || {};

    if (!nombre || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }

    const user = await usuariosService.createUser({ nombre, email, password, rol });
    res.status(201).json({ data: user });
  },
};

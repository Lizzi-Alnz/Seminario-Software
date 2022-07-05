const express = require('express');
const nodemailer = require('nodemailer');
let router = express.Router();
const Usuario = require('../../../../libs/usuarios');
const UsuarioDao = require('../../../../dao/mongodb/models/UsuarioDao');
const userDao = new UsuarioDao();
const user = new Usuario(userDao);
user.init();

const { jwtSign } = require('../../../../libs/security');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await user.getUsuarioByEmail({ email });
    if (!user.comparePasswords(password, userData.password)) {
      console.error('security login: ', { error: `Credenciales para usuario ${userData._id} ${userData.email} incorrectas.` });
      return res.status(403).json({ "error": "Credenciales no Válidas" });
    }
    const { password: passwordDb, created, updated, ...jwtUser } = userData;
    const jwtToken = await jwtSign({ jwtUser, generated: new Date().getTime() });
    return res.status(200).json({ token: jwtToken });
  } catch (ex) {
    console.error('security login: ', { ex });
    return res.status(500).json({ "error": "No es posible procesar la solicitud." });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email = '',
      password = ''
    } = req.body;
    if (/^\s*$/.test(email)) {
      return res.status(400).json({
        error: 'Se espera valor de correo'
      });
    }

    if (/^\s*$/.test(password)) {
      return res.status(400).json({
        error: 'Se espera valor de contraseña correcta'
      });
    }
    const newUsuario = await user.addUsuarios({
      email,
      nombre: 'Lizzi Doe',
      avatar: '',
      password,
      estado: 'ACT'
    });
    return res.status(200).json(newUsuario);
  } catch (ex) {
    console.error('security signIn: ', ex);
    return res.status(502).json({ error: 'Error al procesar solicitud' });
  }
});

router.put('/sendemail', async (req, res) => {
  const { email } = req.body;
  if (/^\s*$/.test(email)) {
    return res.status(400).json({
      error: 'Se espera valor de correo'
    });
  };

  const userData = await user.getUsuarioByEmail({ email });
  console.log(userData);

  if (userData === null) {
    console.error('password reset: ', { error: `El correo de no se encuentra registrado` });
    return res.status(403).json({ "error": "El correo no se encuentra registrado" });
  } else {
    console.log("El correo de sí se encuentra registrado ☺");
    const codigo = userData._id;
    console.log("ID usuario: "+codigo);
    var password = contrasenia();
    console.log("Nueva contraseña: " + password);
    const configurarCorreo = {
      from: process.env.APP_CORREO,
      to: email,
      subject: "Recuperación de Contraseña",
      text: 'Su contrasena temporal es:' + password +', Por favor cambiale inmediatamente al ingresar.',

    };

    const transporte = nodemailer.createTransport({
      host: process.env.CORREO_SERVICIO,
      port: process.env.CORREO_PORT,
      secure: true,
      auth:
      {
        user: process.env.APP_CORREO,
        pass: process.env.CORREO_CONTRASENA,

      },
    });

    transporte.verify(function (error, success) {
      if (error) {
        console.log("El servidor NO puede enviar mensajes");
        console.log(error);
        return false;
      } else {
        console.log("El servidor puede enviar mensajes ☺");
      }
    });

    // try {
    //   const updateResult = await user.updateUsuarioPass({ password, codigo });
    //   if (!updateResult) { return res.status(404).json({ error: 'Usuario no encontrado.' }); } return res.status(200).json({ updateUsuarioPass: updateResult });
    // } catch (ex) {
    //   console.error(ex);
    //   res.status(500).json({ error: 'Error al procesar solicitud.' });
    // }

    return transporte.sendMail(configurarCorreo, (error, info) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        console.log("Email enviado");
        res.status(200).json(req.body);
      }
    });
  }
});

function contrasenia() {
  var contrasenia = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
  return contrasenia;
}

module.exports = router;

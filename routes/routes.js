
const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require('fs');

// Configuração de upload de imagem
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

// Rota para inserir um usuário no banco de dados
router.post('/add', upload, async (req, res) => {
  try {
    const user = new User({
      categoria: req.body.categoria,
      secao: req.body.secao,
      supervisor: req.body.supervisor,
      image: req.file ? req.file.filename : null,  // Garantir que o campo da imagem esteja disponível
    });

    await user.save(); // Salva o usuário usando async/await

    req.session.message = {
      type: 'success',
      message: "Incident added successfully!"
    };
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ message: error.message, type: "danger" });
  }
});

// Rota para renderizar a página inicial
router.get("/", async (req, res) => {
  try {
    const users = await User.find(); // Usando async/await sem callback
    res.render("index", {
      title: "Home Page",
      users: users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para renderizar a página de adicionar usuários
router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

// Rota para renderizar a página de editar usuários
router.get("/edit/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findById(id); // Usando async/await
  
      if (!user) {
        return res.redirect('/'); // Redireciona se o usuário não for encontrado
      }
  
      res.render("edit_users", {
        title: "Edit User",
        user: user,
      });
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  });

  // Rota para atualizar um usuário
router.post('/update/:id', upload, async (req, res) => {
  let id = req.params.id;
  let new_image = '';

  if (req.file) {
    new_image = req.file.filename;
    try {
      // Remover imagem antiga de forma síncrona (opcionalmente, use `await fs.promises.unlink`)
      fs.unlinkSync('./uploads/' + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  try {
    await User.findByIdAndUpdate(id, {
      categoria: req.body.categoria,
      secao: req.body.secao,
      supervisor: req.body.supervisor,
      image: new_image,
    });

    req.session.message = {
      type: 'success',
      message: 'Incident updated successfully!',
    };
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ message: err.message, type: 'danger' });
  }
});

// Rota para deletar um usuário
router.get('/delete/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const result = await User.findByIdAndDelete(id); // Usando async/await

    // Verificar se o usuário possui uma imagem e excluí-la
    if (result && result.image) {
      try {
        fs.unlinkSync('./uploads/' + result.image);
      } catch (err) {
        console.log("Erro ao deletar a imagem: ", err);
      }
    }

    req.session.message = {
      type: 'success',
      message: 'Incident deleted successfully!'
    };
    res.redirect('/');
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    categoria: {
        type: String,
        required: true,
        enum: [
            "Incidente com dano material",
            "Incidente com dano ambiental",
            "Near Miss",
            "NIF",
            "RIF",
            "LTCF"
        ]
    },
    secao: {
        type: String,
        required: true,
    },
    supervisor: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    }, 
    created: {
        type: Date,
        required: true,
        default: Date.now,
    }
});

module.exports = mongoose.model('User', userSchema);
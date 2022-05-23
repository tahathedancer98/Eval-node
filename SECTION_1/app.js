// Validation 
const Joi = require("joi");

const express = require('express');
const app = express() 
app.use(express.json());

const CollectionDB = require('./CollectionDB');
const Taches = new CollectionDB("Taches")
const Users = new CollectionDB("Users")
Taches.maBD.set(1, {id : 1, description: "Finir l'eval", faite :true});
Taches.maBD.set(2, {id : 2, description: "Changer d'entrerprie", faite :false});

// GET ALL
app.get('/taches', (req, res) => {
	const taches = Taches.getAll()
    res.status(200).json(taches);
})
// GET WITH ID
app.get('/taches/:id', (req, res) => {
    const id = parseInt(req.params.id);
	const tache = Taches.getOne(id)
    res.status(200).json(tache);
})






app.listen(3000, ()=>{
    console.log('listening to 3000')
});
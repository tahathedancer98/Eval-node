// Validation 
const Joi = require("joi");

const express = require('express');
const app = express() 
const bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.json());

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
// POST
app.post('/taches', (req, res) => {
    const payload = req.body;
	const schema = Joi.object({
        id: Joi.number().required(),
        description: Joi.string().min(3).max(50).required(),
        faite: Joi.boolean().required()
    });
    const { value: newData, error } = schema.validate(payload);
    if (error) return res.status(400).send({ erreur: error.details[0].message });
    const inserted = Taches.insertOne(newData);
    res.status(201).json(inserted);
})

// DELETE
app.delete('/taches/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const deleted = Taches.deleteOne(id)
    res.status(201).json(deleted);
})
// UPDATE
app.put('/taches/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const payload = req.body;
	const schema = Joi.object({
        description: Joi.string().min(3).max(50).required(),
        faite: Joi.boolean().required()
    });
    const { value: newData, error } = schema.validate(payload);
    if (error) return res.status(400).send({ erreur: error.details[0].message });

    const updated = Taches.updateOne(id, newData)
    res.status(201).json(updated);
})

module.exports = app;


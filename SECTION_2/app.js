/*
npm install joi
npm install bcrypt
npm install express
npm install express-async-errors
npm install jsonwebtoken
npm install --save httpie
npm install mongoose
* */
const express = require('express')
const app = express();
app.use(express.json()); // Pour utiliser du JSON dans notre api
app.use(express.urlencoded()) // Pour utiliser les PARAMS 

// Validation 
const Joi = require("joi");

const bcrypt = require("bcrypt");
require("express-async-errors"); // bcrypt est asynchrone

/*
 *           JWT TOKEN
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();
if (!process.env.JWT_SECRET_KEY) {
    console.log("ERREUR: vous devez créer une variable d'env JWT_SECRET_KEY");
    process.exit(1);
}
// Get JWT SECRECT KEY FROM .env
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

/*
 *           B D D
 */
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Eval-express')
    .then(() => console.log('Connected to mongo'))
    .catch((err) => console.log('Pas pu se connecter', err))

const userSchema = new mongoose.Schema({
    id:Number,
    email : String,
    motdepasse: String
})
const tacheSchema = new mongoose.Schema({
    id:Number,
    description : String,
    faite: Boolean,
    creePar : Number
})
    
const User = mongoose.model('User', userSchema);
const Tache = mongoose.model('Tache', tacheSchema);

async function createUser(doc){
    const user = new User(doc)
    try {
        const result = user.save()
        // const result2 = await User.remove({})// normalement ca va tout supprimé et c'est utils pour JEST
    } catch (error) {
        // ici on peut gérer les exc les cas où la promesse échoue
    }
}
async function createTache(doc){
    const tache = new Tache(doc)
    try {
        const result = tache.save()
        // const result2 = await User.remove({})// normalement ca va tout supprimé et c'est utils pour JEST
    } catch (error) {
        // ici on peut gérer les exc les cas où la promesse échoue
    }
}
// Route d'accueil => [ / ] Hello World
app.get('/', (req , res) => {
    res.status(200).json({"Hello": "World"});
})

// INSCRIPTION
app.post("/signup", async (req, res) => {
    const payload = req.body;
    const schema = Joi.object({
      name: Joi.string().min(3).max(50).required(),
      email: Joi.string().max(255).required().email(),
      motdepasse: Joi.string().min(3).max(50).required(),
    });
  
    const { value: account, error } = schema.validate(payload);
    if (error) return res.status(400).send({ erreur: error.details[0].message });
    // AVANT D'INSCRIRE ON VERIFIE DANS MONGO QUE LE COMPTE EST UNIQUE.
    const check_user = await User.findOne({ email: account.email }).exec();
    
    if (check_user) return res.status(400).send("Please signin instead of signup");
    // WE NEED TO HASH THE PASSWORD
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(account.motdepasse, salt);
    account.motdepasse = passwordHashed;
    
    // Inserer dans mongo db
    const newUser = createUser(account);
    console.log(newUser);
    res.status(201).json(account)
  });



app.listen(3000, ()=>{
    console.log("Listenning to 3000");
})
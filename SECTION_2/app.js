/*
npm install joi
npm install bcrypt
npm install express
npm install express-async-errors
npm install jsonwebtoken
npm install --save httpie
npm install mongoose
npm install mongoose-auto-increment
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
const autoIncrementModelID = require('./counterModel');
const { join } = require('path');

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to mongo'))
    .catch((err) => console.log('Pas pu se connecter', err))

const userSchema = new mongoose.Schema({
    id: { type: Number, unique: true, min: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    email : String,
    motdepasse: String
})
userSchema.pre('save', function (next) {
    if (!this.isNew) {
      next();
      return;
    }
  
    autoIncrementModelID('activities', this, next);
});
const tacheSchema = new mongoose.Schema({
    id: { type: Number, unique: true, min: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    description : String,
    faite: Boolean,
    creePar : Number
})
tacheSchema.pre('save', function (next) {
    if (!this.isNew) {
      next();
      return;
    }
    autoIncrementModelID('activities', this, next);
}); 
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
    const last = await User.findOne().sort({id: -1}).exec();
    if(!last) account.id = 1;
    else account.id = last.id + 1;
    const u = createUser(account);
    //ON RETOURNE UN JWT
    const token = jwt.sign({ name: account.name }, "" + JWT_SECRET_KEY);
    res.header("x-auth-token", token).status(200).send({ name: account.name });
  });

app.post("/user/creerTache",[authGuard], async (req, res) => {
    const payload = req.body;
    const schema = Joi.object({
        description: Joi.string().max(255).required(),
        faite: Joi.boolean().required(),
      });
    
    const { value: tache, error } = schema.validate(payload);
    if (error) return res.status(400).send({ erreur: error.details[0].message });
    tache.creePar = user.id;
    const u = createTache(tache);
    res.status(201).json({"Tache créée" : true})
})
// CONNEXION
app.post("/signin", async (req, res) => {
    const payload = req.body;
    const schema = Joi.object({
      email: Joi.string().max(255).required().email(),
      password: Joi.string().min(3).max(50).required()
    });
  
    const { value: connexion, error } = schema.validate(payload);
  
    if (error) return res.status(400).send({ erreur: error.details[0].message });
  
    // ON CHERCHE LE COMPTE DANS LA DB
    const check_user = await User.findOne({ email: account.email }).exec();
    if (!check_user) return res.status(400).send({ erreur: "Email Invalide" });
  
    // ON DOIT COMPARER LES HASH
    const passwordIsValid = await bcrypt.compare(req.body.password, account.password);
    if (!passwordIsValid)
      return res.status(400).send({ erreur: "Mot de Passe Invalide" });
  
    //ON RETOURNE UN JWT
    const token = jwt.sign({ name: account.name }, "" + JWT_SECRET_KEY);
    res.header("x-auth-token", token).status(200).send({ name: account.name });
    console.log(token);
  });
/* Logique d'authentification */
function authGuard(req, res, next) {
    const token = req.header('x-auth-token');
    
    if (!token) return res.status(401).json({erreur: "Vous devez vous connecter"})
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET_KEY); 
      req.user = decoded;

      // Le middleware a fait son boulot et peut laisser la place au suivant.
      next();
    } catch (exc) {
      return res.status(400).json({erreur: "Token Invalide"})
    }
}

if (process.env.NODE_ENV !== "test") {
    app.listen(3000, () => {
        console.log("listening...");
    });
}
app.listen(3000, ()=>{
    console.log("Listenning to 3000");
})
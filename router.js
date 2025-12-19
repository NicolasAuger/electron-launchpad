const express = require("express");
const router = express.Router();

const sounds = [
  {
    id: 0,
    name: 'Sardoche',
    audio: 'sardoche.mp3',
    note: 11,
  }, {
    id: 1,
    name: 'Vous connaissez ma femme?',
    audio: 'vous-connaissez-ma-femme_.mp3',
    note: 18,
  }
];

router
   .get("/", (req, res) => {
       res.json("Hello world!!");
   })
   .get("/sounds", (req, res) => {
       res.json({ sounds: sounds });
   });

module.exports = router;
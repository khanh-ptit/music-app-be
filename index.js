const express = require('express')
const database = require("./config/database")
require("dotenv").config()
database.connect()
const app = express()
const port = 8888

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
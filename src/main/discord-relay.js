const fs = require('fs')
const path = require('path')
const multer = require('multer')
const express = require('express')
const cors = require('cors')
const { Client: DiscordClient, MessageAttachment } = require('discord.js')

const discordClient = new DiscordClient()
discordClient.login(`ODM0ODg5NDQwMTQ0NTIzMzk2.YIHdYg.j9P3gXSxGzDp5lNzKq8aBUaN9tE`)

const upload = multer({ dest: __dirname + '/uploads' })

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.post('/shill', (req, res) => {
  const {token} = req.body
  const discordChannel = discordClient.channels.cache.find(channel => `${channel.id}` === `842480118643294209`)
  discordChannel.send(`${token.name}/${token.symbol}`)
  discordChannel.send(`${token.address}`)
  discordChannel.send(`<https://dxsale.app/app/pages/dxlockview?id=0&add=${token.address}&type=tokenlock&chain=BSC>`)
  // discordChannel.send(`<https://dxsale.app/app/pages/dxlockview?id=0&add=${token.address}&type=lplock&chain=BSC>`)
  discordChannel.send(`<https://poocoin.app/tokens/${token.address}>`)
  discordChannel.send(`<https://tokensniffer.com/token/${token.address}>`)
  discordChannel.send(`<https://bscscan.com/token/${token.address}>`)
  console.log('shilled', token)
  res.end()
})

app.listen(7001, () => console.log('alive'))
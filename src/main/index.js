import { app, ipcMain, BrowserWindow } from 'electron'
import '../renderer/store'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, pancakeWindow, tokenSnifferWindow, bscScanInfoWindows = {}, bscScanTopHoldersWindows = {}, poocoinChartWindows = {}
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createWindowPancakeSwap (tokenAddress) {

  pancakeWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 800,
    show: false
  })

  pancakeWindow.loadURL(`https://exchange.pancakeswap.finance/#/swap?outputCurrency=${tokenAddress}`)

  pancakeWindow.webContents.once('dom-ready', () => {
    pancakeWindow.webContents.executeJavaScript(`

      const { ipcRenderer } = require('electron')
      let prevTokenUsdWorth = 0, onDiscover_tokenUsdWorth = 0

      const getElement = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelector(selector)
            if (e) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const getElements = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelectorAll(selector)
            if (e && e.length > 0) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const getTokenUsdWorth = (outputDecimalPlaces) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(async () => {
            let [tokenAmountInput, tokenAmountOutput] = await getElements('.token-amount-input')
            let tokenUsdWorth = parseFloat((parseFloat(tokenAmountOutput.getAttribute('value'))).toFixed(outputDecimalPlaces))
            if (tokenUsdWorth) {
              clearInterval(i)
              resolve(tokenUsdWorth)
            }
          }, 250)
        })
      }

      const onInterval = async () => {
        let address = ${tokenAddress}
        let outputDecimalPlaces = 16
        let tokenUsdWorth = await getTokenUsdWorth(outputDecimalPlaces)
        let [currencyInput, currencyOutput] = await getElements('.open-currency-select-button')
        let [span] = currencyInput.childNodes
        let [svg,div] = span.childNodes
        let tokenName = div.textContent
        let diff = parseFloat((tokenUsdWorth - prevTokenUsdWorth).toFixed(outputDecimalPlaces))
        let onDiscover_diff = parseFloat((tokenUsdWorth - onDiscover_tokenUsdWorth).toFixed(outputDecimalPlaces))
        prevTokenUsdWorth = tokenUsdWorth
        if (onDiscover_tokenUsdWorth === 0) {
            onDiscover_tokenUsdWorth = tokenUsdWorth
        }
        let headers = {
            'Content-Type': 'application/json'
        }
        let body = JSON.stringify({
            tokenName,
            tokenUsdWorth: parseFloat(tokenUsdWorth).toFixed(outputDecimalPlaces),
            diff: parseFloat(diff).toFixed(outputDecimalPlaces),
            discovery: {
                tokenUsdWorth: parseFloat(onDiscover_tokenUsdWorth).toFixed(outputDecimalPlaces),
                diff: parseFloat(onDiscover_diff).toFixed(outputDecimalPlaces)
            },
            address 
        })
        ipcRenderer.send('quick-worth', body)
      }

      const f = async () => {
        const understandButton = await getElement('input#understand-checkbox')
        understandButton.click()
        const continueButton = await getElement('button.token-dismiss-button')
        continueButton.click()

        const swapCurrencyButton = await getElement('div#swap-currency-input')
        swapCurrencyButton.parentElement.childNodes[1].childNodes[0].childNodes[0].childNodes[0].click()

        const [pairInputButton, pairOutputButton] = await getElements('button.open-currency-select-button')
        pairOutputButton.click()

        const inputTokenSearchElement = await getElement('input#token-search-input')
        inputTokenSearchElement.value = 'busd'
        const eventTokenSearch = new Event('input', { bubbles: true })
        eventTokenSearch.simulated = true
        const trackerTokenSearch = inputTokenSearchElement._valueTracker
        if (trackerTokenSearch) {
          trackerTokenSearch.setValue(0)
        }
        inputTokenSearchElement.dispatchEvent(eventTokenSearch)

        const busdTokenSelectElement = await getElement('div[title="BUSD Token"]')
        busdTokenSelectElement.click()

        const inputTokenAmountElement = await getElement('input.token-amount-input')
        inputTokenAmountElement.value = 1
        const event = new Event('input', { bubbles: true })
        event.simulated = true
        const tracker = inputTokenAmountElement._valueTracker
        if (tracker) {
          tracker.setValue(0)
        }
        inputTokenAmountElement.dispatchEvent(event)

        let i = setInterval(() => {
          onInterval()
        }, 60000)

        onInterval()

      }

      f()

    `)
  })

  pancakeWindow.on('closed', () => {
    pancakeWindow = null
  })
}

function createWindowBscScanInfo (tokenAddress) {

  bscScanInfoWindows[tokenAddress] = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: '/Users/bgoodson/Desktop/web-apps/crypto-horse-electron/src/main/bscscan-preload.js',
    }
  })

  bscScanInfoWindows[tokenAddress].loadURL(`https://bscscan.com/token/${tokenAddress}`)

  bscScanInfoWindows[tokenAddress].webContents.once('dom-ready', () => {
    bscScanInfoWindows[tokenAddress].webContents.executeJavaScript(`

      const { ipcRenderer } = window.electron

      const getElement = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelector(selector)
            if (e) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const getElements = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelectorAll(selector)
            if (e && e.length > 0) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const f = async () => {
        const numHoldersElement = await getElement('#ContentPlaceHolder1_tr_tokenHolders > div > div > div > div')
        const numHolders = numHoldersElement.textContent.split('\\n').join('')
        const supplyElement = await getElement('div > span.hash-tag')
        const supply = supplyElement.textContent
        const decPlacesElement = await getElement('#ContentPlaceHolder1_trDecimals')
        const decPlaces = decPlacesElement.childNodes[1].childNodes[3].textContent.split('\\n').join('')
        const numTransactionsElement = await getElement('#ContentPlaceHolder1_trNoOfTxns')
        const numTransactions = numTransactionsElement.childNodes[3].childNodes[3].childNodes[0].textContent
        const holdersElement = await getElement('#ContentPlaceHolder1_tabHolders')
        holdersElement.click()
        const topHoldersFrameElement = await getElement('iframe#tokeholdersiframe')
        const holdersLink = topHoldersFrameElement.src
        const scan = {
          address: '${tokenAddress}',
          numTransactions,
          numHolders,
          supply,
          decPlaces,
          holdersLink
        }
        console.log('scan', scan)
        ipcRenderer.send('bscscan:info', scan)
      }

      f()

    `)
  })

  bscScanInfoWindows[tokenAddress].on('closed', () => {
    bscScanInfoWindows[tokenAddress] = null
  })
}

function createWindowBscScanTopHolders (scan) {

  bscScanTopHoldersWindows[scan.address] = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: '/Users/bgoodson/Desktop/web-apps/crypto-horse-electron/src/main/bscscan-preload.js',
    }
  })

  bscScanTopHoldersWindows[scan.address].loadURL(scan.holdersLink)

  bscScanTopHoldersWindows[scan.address].webContents.once('dom-ready', () => {
    bscScanTopHoldersWindows[scan.address].webContents.executeJavaScript(`

      const { ipcRenderer } = window.electron

      const getElement = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelector(selector)
            if (e) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const getElements = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelectorAll(selector)
            if (e && e.length > 0) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const f = async () => {
        const topHoldersElements = await getElements('tbody > tr')
        const top5Holders = [ ...topHoldersElements ]
          .filter((holder, h) => h < 5)
          .map((holder) => {
            const addressElements = holder.childNodes[1].childNodes[0].childNodes
            const address = (addressElements.length === 3 ? addressElements[2] : addressElements[0]).textContent
            const isContract = addressElements.length === 3
            const quantity = holder.childNodes[2].textContent
            const percentage = holder.childNodes[3].textContent.split(' ').join('')
            return {
              address,
              isContract,
              quantity,
              percentage
            }
          })
        ipcRenderer.send('bscscan:info:top5holders', { top5Holders, address: '${scan.address}' })
      }

      f()

    `)
  })

  bscScanTopHoldersWindows[scan.address].on('closed', () => {
    bscScanTopHoldersWindows[scan.address] = null
  })
}

function createWindowTokenSnifferWindow() {

  tokenSnifferWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 800,
    show: false
  })

  tokenSnifferWindow.loadURL(`https://tokensniffer.com/tokens/new`)

  tokenSnifferWindow.webContents.once('dom-ready', () => {
    tokenSnifferWindow.webContents.executeJavaScript(`

      const { ipcRenderer } = require('electron')

      const getElement = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelector(selector)
            if (e) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const getElements = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelectorAll(selector)
            if (e && e.length > 0) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const f = async () => {
        //
        const bscTokensLink = await getElement('main > div > div > span > a')
        bscTokensLink.click()
        const newTokenElements = await getElements('tbody > tr')
        const newTokens = [ ...newTokenElements ]
          .map((newTokenElement) => {
            const address = newTokenElement.childNodes[2].childNodes[0].childNodes[0].textContent
            const name = newTokenElement.childNodes[0].childNodes[1].childNodes[0].textContent
            const symbol = newTokenElement.childNodes[1].childNodes[0].textContent
            const age = newTokenElement.childNodes[3].textContent
            return {
                address,
                name,
                symbol,
                age
            }
          })
        for (let i = 0; i <= 4; i++) {
          const newToken = newTokens[i]
          ipcRenderer.send('sniffer:new-token', newToken)
          await new Promise((resolve, reject) => {
            setTimeout(() => { resolve() }, 5000)
          })
        }
        ipcRenderer.send('sniffer:done')
      }

      f()

    `)
  })

  tokenSnifferWindow.on('closed', () => {
    tokenSnifferWindow = null
  })
}

function createWindowPoocoinChartWindow(tokenAddress) {

  poocoinChartWindows[tokenAddress] = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 800,
    show: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      preload: '/Users/bgoodson/Desktop/web-apps/crypto-horse-electron/src/main/bscscan-preload.js',
    }
  })

  poocoinChartWindows[tokenAddress].loadURL(`https://poocoin.app/tokens/${tokenAddress}`)

  poocoinChartWindows[tokenAddress].webContents.once('dom-ready', () => {
    poocoinChartWindows[tokenAddress].webContents.executeJavaScript(`

      const { ipcRenderer } = window.electron

      const getElement = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelector(selector)
            if (e) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const getElements = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelectorAll(selector)
            if (e && e.length > 0) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const f = async () => {
        const nav = await getElement('nav')
        nav.remove()
        console.log('ok')
        const a = await getElement('div.d-flex.flex-wrap')
        a.remove()
        const b = await getElement('div.d-block.bg-dark-1.shadow.pt-3.text-small')
        b.remove()
        const c = await getElement('div.bg-dark-1.shadow.d-flex.d-lg-flex.flex-column.flex-grow-1.flex-md-grow-0')
        c.remove()
        const d = await getElement('div.d-flex.align-items-start.flex-wrap')
        d.remove()
        const e = await getElement('div.bg-dark-1.shadow')
        e.remove()
      }

      f()

    `)
  })

  poocoinChartWindows[tokenAddress].on('closed', () => {
    poocoinChartWindows[tokenAddress] = null
  })
}

function createWindowBoggedChartWindow(tokenAddress) {

  poocoinChartWindows[tokenAddress] = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 600,
    show: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      preload: '/Users/bgoodson/Desktop/web-apps/crypto-horse-electron/src/main/bscscan-preload.js',
    }
  })

  poocoinChartWindows[tokenAddress].loadURL(`https://charts.bogged.finance/?token=${tokenAddress}`)

  poocoinChartWindows[tokenAddress].webContents.once('dom-ready', () => {
    poocoinChartWindows[tokenAddress].webContents.executeJavaScript(`

      const { ipcRenderer } = window.electron

      const getElement = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelector(selector)
            if (e) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const getElements = (selector) => {
        return new Promise((resolve, reject) => {
          const i = setInterval(() => {
            const e = document.querySelectorAll(selector)
            if (e && e.length > 0) {
              clearInterval(i)
              resolve(e)
            }
          }, 250)
        })
      }

      const f = async () => {
        const nav = await getElement('div.left-0.absolute.w-screen.z-40.h-20')
        nav.remove()
        console.log('ok')
        const a = await getElement('div.flex.pt-20.h-full.relative')
        a.remove()
        const b = await getElement('div.row-span-1.order-4')
        b.remove()
        const c = await getElement('div.p-4.row-span-1.order-2')
        c.remove()
      }

      f()

    `)
  })

  poocoinChartWindows[tokenAddress].on('closed', () => {
    poocoinChartWindows[tokenAddress] = null
  })
}

ipcMain.on('spawn:pancakeswap', (event, arg) => {
  createWindowPancakeSwap(arg)
})

ipcMain.on('spawn:bscscan:info', (event, arg) => {
  createWindowBscScanInfo(arg)
})

ipcMain.on('spawn:bscscan:top5holders', (event, arg) => {
  createWindowBscScanTopHolders(arg)
})

ipcMain.on('spawn:token-sniffer', (event, arg) => {
  createWindowTokenSnifferWindow()
})

ipcMain.on('spawn:poocoin:chart', (event, arg) => {
  createWindowPoocoinChartWindow(arg)
})

ipcMain.on('spawn:bogged:chart', (event, arg) => {
  createWindowBoggedChartWindow(arg)
})

ipcMain.on('quick-worth', (event, arg) => {
  console.log('quick-worth', event, arg)
  mainWindow.webContents.send('quick-worth', arg)
})

ipcMain.on('sniffer:new-token', (event, arg) => {
  console.log('sniffer:new-token', event, arg)
  mainWindow.webContents.send('sniffer:new-token', arg)
})

ipcMain.on('sniffer:done', (event, arg) => {
  tokenSnifferWindow.close()
})

ipcMain.on('bscscan:info', (event, arg) => {
  console.log('bscscan:info', event, arg)
  mainWindow.webContents.send(`bscscan:info:${arg.address}`, arg)
  bscScanInfoWindows[arg.address].close()
})

ipcMain.on('bscscan:info:top5holders', (event, arg) => {
  console.log('bscscan:info:top5holders', event, arg)
  mainWindow.webContents.send(`bscscan:info:top5holders:${arg.address}`, arg)
  bscScanTopHoldersWindows[arg.address].close()
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


// REST

const express = require('express')
const cors = require('cors')

const api = express()
api.use(express.urlencoded({ extended: true }))
api.use(express.json())
api.use(cors())

api.get('/ping', (req, res) => {
  res.send('pong')
  res.end()
})

api.post('/new-token', (req, res) => {
  console.log(req.body)
  const token = req.body
  mainWindow.webContents.send('sniffer:new-token', token)
  res.end()
})

api.listen(7002, () => console.log('alive'))
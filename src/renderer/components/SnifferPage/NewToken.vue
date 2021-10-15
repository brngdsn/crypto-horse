<template>
  <div id="new-token-wrapper" :class="busy ? 'busy' : ''">
    <h2>{{token.name}}/<span>{{token.symbol}}</span> - <span>{{getAge(token.age)}}</span>&nbsp;<span class="poocoin-chart-link" style="font-size:10px;color:aqua;" @click="onShill">shill</span>&nbsp;<span class="poocoin-chart-link" style="font-size:10px;color:magenta;" @click="onBuy">buy</span></h2>
    <span style="font-family:monospace;">{{token.address}}</span>&nbsp;
    <!-- <span class="poocoin-chart-link" @click="onPoocoin">poocoin</span>&nbsp; -->
    <span class="poocoin-chart-link" @click="onPoocoinAlt">poocoin-alt</span>&nbsp;
    <!-- <span class="poocoin-chart-link" @click="onBogged">bogged</span>&nbsp; -->
    <span class="poocoin-chart-link" @click="onTokenSniffer">token-sniffer</span>&nbsp;
    <!-- <span class="poocoin-chart-link" @click="onTokenLock">token-lock</span>&nbsp; -->
    <!-- <span class="poocoin-chart-link" @click="onLpLock">lp-lock</span>&nbsp; -->
    <br />
    <span><span style="text-decoration: underline;">{{scan.numTransactions}} txn</span> with <span style="text-decoration: underline;">{{scan.numHolders}}</span> for {{scan.decPlaces}} decimals @ {{scan.supply}} tokens</span>
    <div class="top5holders-table">
      <div v-for="(holder, h) in top5Holders" :key="h" class="top5holders-row"  :style="{
          'color': isBurn(holder) ? '#888' : (holder.isContract ? 'yellow' : 'inherit'),
        }">
        <div v-if="getHolderPercentage(holder, top5Holders[0], scan.supply).length === 9">{{getHolderPercentage(holder, top5Holders[0], scan.supply)}}</div>
        <div v-if="getHolderPercentage(holder, top5Holders[0], scan.supply).length === 8">&nbsp;{{getHolderPercentage(holder, top5Holders[0], scan.supply)}}</div>
        <div v-if="getHolderPercentage(holder, top5Holders[0], scan.supply).length === 7">&nbsp;&nbsp;{{getHolderPercentage(holder, top5Holders[0], scan.supply)}}</div>
        <div style="margin-left:10px;">{{holder.address}}</div>
        <div style="margin-left:10px;">{{holder.quantity}}</div>&nbsp;
        <div v-if="!isBurn(holder) && holder.isContract" @click="onLpLock(holder)" style="cursor:pointer;color:orange;">lp</div>
      </div>
    </div>
    <!-- <pre>top5Holders={{top5Holders}}</pre>
    <pre>scan={{scan}}</pre> -->
    <!-- <pre>token={{token}}</pre> -->
  </div>
</template>

<script>
  // const discordClient = new window.DiscordClient()
  // discordClient.login(`ODM0ODg5NDQwMTQ0NTIzMzk2.YIHdYg.j9P3gXSxGzDp5lNzKq8aBUaN9tE`)
  export default {
    props: ['token'],
    data () {
      return {
        busy: false,
        top5Holders: null,
        scan: null
      }
    },
    methods: {
      getAge (age) {
        const dif = new Date().getTime() - age
        return `${dif/60000}m`
      },
      isBurn (holder) {
        return holder.address.match(/0000dead/g) || holder.address.match(/0x0000000000000000000000000000000000000001/g) || holder.address.match(/0x0000000000000000000000000000000000000000/g)
      },
      getHolderPercentage (holder, topHolder, supply) {
        if (this.isBurn(topHolder) && !this.isBurn(holder)) {
          const burned = parseInt(topHolder.quantity.split(',').join(''))
          const holderPercentage = parseFloat(holder.quantity.split(',').join(''))
          const _supply = parseFloat(supply.split(',').join(''))
            console.log(burned, holderPercentage, _supply)
          return `${((holderPercentage / (_supply - burned)) * 100).toFixed(4)}%`
        } else {
            return holder.percentage
        }
      },
      onPoocoin () {
        this.$electron.ipcRenderer.send('spawn:poocoin:chart', this.token.address)
      },
      onPoocoinAlt () {
        this.$electron.shell.openExternal(`https://poocoin.app/tokens/${this.token.address}`)
      },
      onTokenSniffer () {
        this.$electron.shell.openExternal(`https://tokensniffer.com/token/${this.token.address}`)
      },
      onBogged () {
        this.$electron.ipcRenderer.send('spawn:bogged:chart', this.token.address)
      },
      onLpLock (holder) {
        this.$electron.shell.openExternal(`https://app.unicrypt.network/amm/pancake-v2/pair/${holder.address}`)
      },
      onTokenLock () {
        this.$electron.shell.openExternal(`https://dxsale.app/app/pages/dxlockview?id=0&add=${this.token.address}&type=tokenlock&chain=BSC`)
      },
      // https://dxsale.app/app/pages/dxlockview?id=0&add=0x75673a95ec6851cf686b9fe8d99e886ca830157e&type=tokenlock&chain=BSC
      // https://dxsale.app/app/pages/dxlockview?id=0&add=0x9d623c56C6705b906dad817c1B3e41019aAe44B0&type=lplock&chain=BSC
      onBuy () {
        this.$electron.shell.openExternal(`https://exchange.pancakeswap.finance/#/swap?outputCurrency=${this.token.address}`)
      },
      async onShill () {
        const token = this.token
        console.log('onShill', token)
        const headers = {
          'Content-Type': 'application/json'
        }
        const body = JSON.stringify({
          token
        })
        await fetch('http://localhost:7001/shill', {
          method: 'POST',
          headers,
          body
        })
        console.log('shilled')
      }
    },
    mounted () {
      this.$electron.ipcRenderer.send('spawn:bscscan:info', this.token.address)
      this.$electron.ipcRenderer.on(`bscscan:info:${this.token.address}`, (event, arg) => {
        console.log('bscscan:info', event, arg)
        const scan = arg
        this.scan = scan
        this.busy = true
        this.$forceUpdate()
        this.$electron.ipcRenderer.send('spawn:bscscan:top5holders', scan)
      })
      this.$electron.ipcRenderer.on(`bscscan:info:top5holders:${this.token.address}`, (event, arg) => {
        console.log('bscscan:info:top5holders', event, arg)
        const top5Holders = arg.top5Holders
        this.top5Holders = top5Holders
        this.busy = false
        this.$forceUpdate()
      })
      this.$electron.ipcRenderer.on('sniffer:new-token', (event, arg) => {
        this.$forceUpdate()
      })
    }
  }
</script>

<style scoped>
  #new-token-wrapper {
    margin-bottom: 10px;
    border-left: 1px solid #666;
    padding-left: 10px;
    border-bottom: 1px solid #666;
    padding-bottom: 10px;
    box-shadow: 0px 0px 8px #656565;
    padding-top: 4px;
  }
  #new-token-wrapper.busy {
    box-shadow: 0px 0px 8px #ac51ff;
  }
  pre {
    margin-top:10px;
    padding: 10px;
    border: 1px solid #aaa;
    background-color: black;
  }
  h2 {
    font-size:28px;
  }
  h2 > span {
    color:#aaa;
    font-weight: 100;
    font-size: 15px;
  }
  h2 > span:first-child {
    font-weight:bold;
    font-size: 20px;
  }
  .top5holders-table {
    margin-top:5px;
    display:flex;
    flex-direction:column;
    font-family:monospace;
  }
  .top5holders-row {
    display:flex;
    flex-direction:row;
  }
  .poocoin-chart-link {
    cursor: pointer;
    text-decoration: underline;
  }
  .poocoin-chart-link:active {
    color:magenta;
  }
</style>

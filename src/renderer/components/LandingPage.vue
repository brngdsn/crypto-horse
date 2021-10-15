<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <div style="font-size:64px;margin-bottom:35px;font-weight:bold;">
      <span style="color:#666;">Crypto</span>&nbsp;<span style="color:#42b983;">Horse</span>
    </div>
    <main>
      <!-- <div class="left-side">
        <span class="title">
          Welcome to your new project!
        </span>
        <system-information></system-information>
      </div> -->

      <div class="right-side" style="padding-left: 6px;">
        <div class="doc">
          <div class="title">Quick Worth</div>
          <p>
            Enter a token address to get its BUSD value.
          </p>
          <input class="token-input" v-model="tokenAddress" placeholder="0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3" />
          <button @click="onGetQuickWorth">OK</button>
          <br><br>
        </div>
        <div class="doc" v-for="(token, i) in tokens" :key="i" style="margin-bottom:15px;">
          <button class="alt" style="text-align:left;" :style="{
            'border-color': diff(token) ? 'lime' : 'red'
          }" :disabled="true">
            <span style="color:#333;font-weight:bold;font-size:20px;">{{token.tokenName}}</span> {{token.version}}
            <pre style="margin-top:5px;color:black;font-weight:bold;background-color:white;padding:3px;border:1px solid #eee;">{{getTokenDiff(token)}}</pre>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'

  export default {
    name: 'landing-page',
    components: { SystemInformation },
    data () {
      return {
        tokens: {},
        tokenAddress: `0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3`
      }
    },
    methods: {
      diff ({ tokenName, tokenUsdWorth, diff, who, address, discovery, version: tokenVersion }) {
        if (parseFloat(diff) > 0) {
          return true
        }
        if (parseFloat(diff) < 0) {
          return false
        }
      },
      getTokenDiff ({ tokenName, tokenUsdWorth, diff, who, address, discovery, version: tokenVersion }) {
        let diffIcon, diffIndicator, diffIndicatorDiscovery = ``
        if (parseFloat(diff) > 0) {
          diffIndicator = `+`
        }
        if (parseFloat(diff) < 0) {
          diffIndicator = ``
        }
        if (discovery && parseFloat(discovery.diff) > 0) {
          diffIndicatorDiscovery = `+`
        }
        if ((parseFloat(diff) > 0) || (parseFloat(diff) < 0)) {
          const message = [
            `$  ${tokenUsdWorth} (current)\n`,
            `$ ${diffIndicator}${diff} (diff)\n`,
            discovery ? `$  ${discovery.tokenUsdWorth} (disc)\n` : ``,
            discovery ? `$ ${diffIndicatorDiscovery}${discovery.diff} (ddiff)\n` : ``
          ].join('')
          return message
        }
        return ``
      },
      onGetQuickWorth () {
        console.log(this.tokenAddress)
        this.$electron.ipcRenderer.send('spawn:pancakeswap', this.tokenAddress)
      },
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    },
    mounted () {
      this.$electron.ipcRenderer.on('quick-worth', (event, arg) => {
        console.log('quick-worth', event, arg)
        const token = JSON.parse(arg)
        this.tokens[token.address] = token
        this.$forceUpdate()
      })
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 6px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .doc p {
    color: black;
    margin-bottom: 10px;
  }

  .doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }

  .doc button.alt.down {
    color: #d83a3a;
  }

  .doc input.token-input {
    width: 615px;
    font-size: 25px;
    border-radius: 11px;
    padding-left: 9px;
    padding-top: 5px;
    padding-bottom: 5px;
    margin-bottom: 13px;
    border: 1px solid #42b983;
    outline: none;
  }

  .doc input.token-input:focus {
    /* border: 1px solid rgb(245, 188, 255); */
    box-shadow: 0px 0px 15px #42b983;
  }

  pre {
    font-size: 18px;
  }

</style>

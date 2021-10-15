<template>
  <div id="sniffer-wrapper">
    <h1>vet</h1>
    <button class="sniffer-button" @click="onSniff" :style="{
      'background-color': busy ? 'lime' : 'inherit'
    }">
      <span v-if="!busy">run</span>
      <span v-if="busy">running</span>
    </button>
    <!-- <input v-model="newToken" /> <button @click="addToken(newToken)">add</button> <span>{{newToken}}</span> -->
    <new-token v-for="newToken in getNewTokens()" :key="newToken.address" :token="newToken" />
    <!-- <pre>newTokens={{newTokens}}</pre> -->
  </div>
</template>

<script>
  import _ from 'lodash'
  import NewToken from './SnifferPage/NewToken'

  export default {
    name: 'sniffer',
    components: {
      NewToken
    },
    data () {
      return {
        newToken: ``,
        busy: false,
        newTokens: {}
      }
    },
    methods: {
      addToken (address) {
        console.log(address)
        this.newTokens[address] = {
          age: `now`,
          name: `new`,
          symbol: `new`,
          address
        }
        this.$forceUpdate()
      },
      getNewTokens () {
        const tokens = Object.keys(this.newTokens)
          .map(key => this.newTokens[key])
          tokens.reverse()
        return tokens
      },
      onSniff () {
        this.busy = true
        this.$electron.ipcRenderer.send('spawn:token-sniffer')
        setInterval(() => {
          this.$electron.ipcRenderer.send('spawn:token-sniffer')
        }, 150000)
      }
    },
    mounted () {
      this.$electron.ipcRenderer.on('sniffer:new-token', (event, arg) => {
        console.log('sniffer:new-token', event, arg)
        const newToken = arg
        this.newTokens[newToken.address] = newToken
        this.$forceUpdate()
      })
      this.$electron.ipcRenderer.on('sniffer:done', (event, arg) => {
        // this.busy = false
      })
    }
  }
</script>

<style>
  #sniffer-wrapper {
    padding: 15px;
  }
  h1 {
    font-size:100px;
  }
  pre {
    margin-top:10px;
    padding: 10px;
    border: 1px solid #eee;
    background-color: white;
  }
  .sniffer-button {
    background-color: rgba(255, 0, 0, 0);
    border: 1px solid #00ffc4;
    color: #eee;
    padding: 10px 15px 10px 15px;
    border-radius: 5px;
    font-size: 20px;
    margin-bottom: 20px;
    cursor:pointer;
    width:175px;
  }
  .sniffer-button:hover {
    background-color: rgba(0, 255, 195, 0.24);;
  }
  button.sniffer-button:active {
    background-color: #00ffc4;
    color: black;
  }
  button.sniffer-button[disabled] {
    background-color: #676767;
    border: 1px solid #9c9c9c;
    opacity: .5;
    cursor: not-allowed;
  }
</style>

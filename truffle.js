var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "badge dizzy genius apology unhappy cancel december more decade bomb mango dinosaur";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/155b4cc430834774937bff90e321a64e")
      },
      network_id: 4
    } 
  }
};

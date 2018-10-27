App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  }, 

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },
  initContract: function() {
    $.getJSON("Bidding.json", function(bidding) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Bidding = TruffleContract(bidding);
      // Connect provider to interact with contract
      App.contracts.Bidding.setProvider(App.web3Provider);

      // App.listenForEvents();

      return App.render();
    });
  },

  render: function() {
    var biddingInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();
    
    console.log("showing loader");

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    console.log("starting data load ");

    // Load contract data
    App.contracts.Bidding.deployed().then(function(instance) {
      console.log("found the contract");
      biddingInstance = instance;
      return biddingInstance.numOfCandidates();
    }).then(function(numOfCandidates) {
      console.log("found the numOfCandidates");
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      // var candidatesSelect = $('#candidatesSelect');
      // candidatesSelect.empty();
      console.log("iterate");
      for (var candidateId = 1; i <= numOfCandidates; i++) {
        biddingInstance.candidates(candidateId).then(function(candidate) {
          var hasWithDrawn = candidate[0];
          var hasDeposited = candidate[1];
          var depositer = candidate[2];
          // var balance = web3.eth.getBalance(depositer)

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + candidateId + "</th><td>" + depositer + "</td><td>" + hasWithDrawn + "</td></tr>"
          candidatesResults.append(candidateTemplate);
          console.log("got users");

          // // Render candidate ballot option
          // var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          // candidatesSelect.append(candidateOption);
        });
      }
      // return biddingInstance.voters(App.account);
      console.log("going to display");
      loader.hide();
      content.show();
    // }).then(function(hasVoted) {
    //   // Do not allow a user to vote
    //   if(hasVoted) {
    //     $('form').hide();
    //   }
    //   loader.hide();
    //   content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

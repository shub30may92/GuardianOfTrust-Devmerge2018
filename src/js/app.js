App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  refresh: false,


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

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Bidding.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.depositEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("depositEvent triggered", event)
        // Reload when a new vote is recorded
        App.refresh = true;
        App.render();
      });
      instance.withdrawEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("withdrawEvent triggered", event)
        // Reload when a new vote is recorded
        App.refresh = true;
        App.render();
      });
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
      // $("#candidatesResults").empty();
      biddingInstance = instance;
      biddingInstance.cycleNumber().then(function(cycle) {
        $('#contractCycle').html("Contract Cycle: " + cycle);
      });
      var contractBalance = $('#contractBalance');
      // contractBalance.empty();
      var contractBalanceTemplate;
      web3.eth.getBalance(biddingInstance.address, function(error, result) {
        if(error) {
          $('#contractBalance').html("Contract Balance: -" );
        } else {
          $('#contractBalance').html("Contract Balance: " + web3.fromWei(result));
        }
        $('#contractAddress').html("Contract Address: " + biddingInstance.address);
      });
      return biddingInstance.numOfCandidates();
    }).then(function(numOfCandidates) {
      console.log("found the numOfCandidates: " + numOfCandidates);
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
      console.log("iterate");
      var hasWithDrawn;
      var hasDeposited;
      var depositer;
      if(App.refresh) {
      for (var candidateId = 1; candidateId <= numOfCandidates; candidateId++) {
        console.log("Candidate-ID: " + candidateId);
        biddingInstance.candidates(candidateId).then(function(candidate) {
          var id = candidateId;
          hasWithDrawn = candidate[0];
          hasDeposited = candidate[1];
          depositer = candidate[2];
          var candidateTemplate;
          web3.eth.getBalance(candidate[2], function(error, balance) {
            if(error) {
              candidateTemplate = "<tr><td>" + candidate[2] + "</td><td> - </td></tr>"
            } else {
              balance = web3.fromWei(balance);
              // Render candidate Result
              candidateTemplate = "<tr><td>" + candidate[2] + "</td><td>" + balance + "</td></tr>"
            }
            candidatesResults.append(candidateTemplate);
            console.log("got users");
            
          });
        });
      }
      App.refresh = false;
    }
      console.log("going to display");
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  deposit: function() {
    var depositButton = $('#depositButton');
    App.contracts.Bidding.deployed().then(function(instance) {
      var app = instance;
      app.deposit({from: App.account,value: web3.toWei(5, 'ether')})
    }).then(function(result) {
      console.log("Deposited your amount");
    });
  },

  withdraw: function() {
    var withdrawButton = $('#withdrawButton');
    App.contracts.Bidding.deployed().then(function(instance) {
      var app = instance;
      // Take input from user
      app.withdraw(10, {from: App.account})
    }).then(function(result) {
      console.log("Amount Withdrawn");
    });
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
